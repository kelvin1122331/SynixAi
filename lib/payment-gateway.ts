import { createHash, createHmac, randomUUID } from "node:crypto";

/**
 * ============================================================================
 *  Payment Gateway — mesin pembayaran otomatis (khusus server)
 * ============================================================================
 *  Tujuan: customer membayar tanpa perlu kirim bukti transfer manual. Setelah
 *  gateway mengirim webhook "PAID", sistem otomatis:
 *      quote → status "dibayar" → (opsional) langsung dikirim ke panel SMM.
 *
 *  Provider yang didukung:
 *      manual   → tidak ada gateway; instruksi QRIS/transfer/e-wallet manual
 *      mock     → SIMULASI lokal (untuk uji alur tanpa akun gateway)
 *      tripay   → QRIS/VA/e-wallet, HMAC callback signature (paling umum di ID)
 *      midtrans → Snap (QRIS/VA/e-wallet), signature SHA-512 status webhook
 *      doku     → Jokul Checkout, signature HMAC-SHA256 + digest SHA-256
 *      duitku   → Inquiry v2, signature MD5 merchantCode+orderId+amount+apiKey
 *      xendit   → QR Codes API, verifikasi header x-callback-token
 *      ipaymu   → Payment v2, signature SHA-256 berjenjang
 *
 *  Catatan: setiap provider punya detail kecil yang bisa berubah. Sebelum
 *  go-live, uji dulu di mode sandbox provider masing-masing (PAYMENT_MODE=sandbox)
 *  dan cocokkan halaman dokumentasi resmi provider tersebut.
 * ============================================================================
 */

export type PaymentProvider =
  | "manual"
  | "mock"
  | "tripay"
  | "midtrans"
  | "doku"
  | "duitku"
  | "xendit"
  | "ipaymu";

export const KNOWN_PROVIDERS: PaymentProvider[] = [
  "manual",
  "mock",
  "tripay",
  "midtrans",
  "doku",
  "duitku",
  "xendit",
  "ipaymu",
];

export interface GatewayConfig {
  provider: PaymentProvider;
  /** Kredensial inti (nama variabelnya beda-beda per provider, lihat README). */
  apiKey: string;
  privateKey: string;
  merchantCode: string;
  /** base URL tambahan untuk provider yang butuh (mis. domain iPaymu khusus). */
  overrideUrl: string;
  mode: "sandbox" | "production";
  /** Kanal yang dipakai (Tripay: QRIS/BRIVA, Duitku: DQ/VC, dll). */
  methods: string[];
  feePercent: number;
  feeFlat: number;
  feeBearer: "customer" | "merchant";
  webhookToken: string;
  expiresMinutes: number;
  /** Kirim otomatis ke panel begitu pembayaran terverifikasi. */
  autoSubmitAfterPaid: boolean;
  /** Konfigurasi terisi? (mock selalu siap) */
  ready: boolean;
  /** Gateway dipakai? (provider bukan "manual") */
  enabled: boolean;
}

const DEFAULTS: Record<string, { url: string; sandboxUrl: string; methods: string[] }> = {
  tripay: { url: "https://tripay.co.id/api", sandboxUrl: "https://tripay.co.id/api-sandbox", methods: ["QRIS"] },
  midtrans: { url: "https://app.midtrans.com", sandboxUrl: "https://app.sandbox.midtrans.com", methods: ["snap"] },
  doku: { url: "https://api.doku.com", sandboxUrl: "https://api-sandbox.doku.com", methods: ["JOKUL_CHECKOUT"] },
  duitku: { url: "https://passport.duitku.com", sandboxUrl: "https://sandbox.duitku.com", methods: ["DQ"] },
  xendit: { url: "https://api.xendit.co", sandboxUrl: "https://api.xendit.co", methods: ["QRIS"] },
  ipaymu: { url: "https://my.ipaymu.com", sandboxUrl: "https://my.sandbox.ipaymu.com", methods: ["qris"] },
};

function number(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getGatewayConfig(): GatewayConfig {
  const raw = (process.env.PAYMENT_PROVIDER || "manual").trim().toLowerCase();
  const provider = (KNOWN_PROVIDERS as string[]).includes(raw) ? (raw as PaymentProvider) : "manual";
  const mode = (process.env.PAYMENT_MODE || "sandbox").trim().toLowerCase() === "production" ? "production" : "sandbox";

  const apiKey = (process.env.PAYMENT_API_KEY || "").trim();
  const privateKey = (process.env.PAYMENT_PRIVATE_KEY || "").trim();
  const merchantCode = (process.env.PAYMENT_MERCHANT_CODE || "").trim();

  const methods = (process.env.PAYMENT_METHODS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  /* Provider butuh kredensial apa saja → tentukan syarat "ready". */
  let ready = false;
  switch (provider) {
    case "mock":
      ready = true;
      break;
    case "tripay":
      ready = Boolean(apiKey && privateKey && merchantCode);
      break;
    case "midtrans":
      ready = Boolean(apiKey);
      break;
    case "doku":
      ready = Boolean(apiKey && privateKey && merchantCode);
      break;
    case "duitku":
      ready = Boolean(apiKey && merchantCode);
      break;
    case "xendit":
      ready = Boolean(apiKey);
      break;
    case "ipaymu":
      ready = Boolean(apiKey && merchantCode);
      break;
    default:
      ready = false;
  }

  return {
    provider,
    apiKey,
    privateKey,
    merchantCode,
    overrideUrl: (process.env.PAYMENT_API_URL || "").trim().replace(/\/+$/, ""),
    mode,
    methods: methods.length ? methods : DEFAULTS[provider]?.methods ?? [],
    feePercent: Math.max(0, number(process.env.PAYMENT_FEE_PERCENT, 0)),
    feeFlat: Math.max(0, number(process.env.PAYMENT_FEE_FLAT, 0)),
    feeBearer: (process.env.PAYMENT_FEE_BEARER || "customer").trim() === "merchant" ? "merchant" : "customer",
    webhookToken: (process.env.PAYMENT_WEBHOOK_TOKEN || "").trim(),
    expiresMinutes: Math.max(5, number(process.env.PAYMENT_EXPIRES_MINUTES, 60)),
    /* Bila gateway aktif, order yang sudah DIBAYAR wajar langsung diproses. */
    autoSubmitAfterPaid: (process.env.ORDER_AUTO_SUBMIT_PAID ?? "1").trim() !== "0",
    ready,
    enabled: provider !== "manual",
  };
}

export function gatewayBaseUrl(config: GatewayConfig = getGatewayConfig()): string {
  if (config.overrideUrl) return config.overrideUrl;
  const entry = DEFAULTS[config.provider];
  if (!entry) return "";
  return config.mode === "production" ? entry.url : entry.sandboxUrl;
}

/**
 * URL publik website (dipakai gateway untuk callback & halaman kembali).
 * Urutan: env PUBLIC_BASE_URL → host dari request → origin request.
 */
export function getPublicBaseUrl(request: Request): string {
  const fromEnv = (process.env.PUBLIC_BASE_URL || "").trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;

  return new URL(request.url).origin;
}

/* ------------------------------------------------------------------ Biaya -- */

export interface FeeBreakdown {
  baseAmount: number;
  fee: number;
  amount: number;
  bearer: "customer" | "merchant";
}

/**
 * Biaya gateway. Bila PAYMENT_FEE_BEARER=customer (default), biaya ditambahkan
 * ke nominal yang dibayar customer sehingga laba Anda tidak termakan.
 */
export function computeGatewayFee(baseAmount: number, config: GatewayConfig = getGatewayConfig()): FeeBreakdown {
  if (!config.feePercent && !config.feeFlat) {
    return { baseAmount, fee: 0, amount: baseAmount, bearer: config.feeBearer };
  }
  const fee = Math.ceil((baseAmount * config.feePercent) / 100) + config.feeFlat;
  const amount = config.feeBearer === "customer" ? baseAmount + fee : baseAmount;
  return { baseAmount, fee, amount, bearer: config.feeBearer };
}

/* ---------------------------------------------------------------- Hasil API */

export interface GatewayCharge {
  provider: PaymentProvider;
  /** ID transaksi di sisi gateway (untuk rekonsiliasi). */
  providerRef: string;
  channel: string;
  baseAmount: number;
  fee: number;
  amount: number;
  payUrl?: string;
  qrString?: string;
  payCode?: string;
  expiresAt?: string;
  instructions: string[];
  simulated?: boolean;
}

export type ChargeResult =
  | { ok: true; data: GatewayCharge }
  | { ok: false; error: string };

interface ChargeInput {
  /** Kode referensi internal (SYN-XXXXXX) — dipakai sebagai merchant ref. */
  reference: string;
  /** Nominal dasar (harga jual ke customer, belum termasuk fee gateway). */
  baseAmount: number;
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  /** URL publik website, mis. https://synixai.id (untuk callback & return). */
  publicUrl: string;
}

const REQUEST_TIMEOUT_MS = 20_000;

async function postJson(
  url: string,
  body: unknown,
  headers: Record<string, string>,
  method: "POST" | "PUT" = "POST",
): Promise<{ ok: true; json: Record<string, unknown> } | { ok: false; error: string; raw?: string }> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Accept: "application/json", ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
    const text = await response.text();
    let json: Record<string, unknown> = {};
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      return { ok: false, error: `Respons gateway bukan JSON (HTTP ${response.status}).`, raw: text.slice(0, 300) };
    }
    if (!response.ok) {
      const message =
        json.message ??
        (json.error as Record<string, unknown> | undefined)?.message ??
        (json.meta as Record<string, unknown> | undefined)?.message ??
        (json.Response as Record<string, unknown> | undefined)?.Message;
      return {
        ok: false,
        error: `Gateway menolak permintaan (HTTP ${response.status})${message ? `: ${String(message)}` : "."}`,
        raw: text.slice(0, 300),
      };
    }
    return { ok: true, json };
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `Tidak dapat menghubungi gateway: ${cause}` };
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function pickString(source: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

/* ============================================================ Buat transaksi */

export async function createGatewayCharge(input: ChargeInput): Promise<ChargeResult> {
  const config = getGatewayConfig();
  if (!config.enabled) return { ok: false, error: "Payment gateway tidak diaktifkan (PAYMENT_PROVIDER=manual)." };
  if (!config.ready) return { ok: false, error: `Kredensial gateway ${config.provider} belum lengkap.` };

  const fee = computeGatewayFee(input.baseAmount, config);
  const returnUrl = `${input.publicUrl}/cek-order?order=${encodeURIComponent(input.reference)}`;
  const webhookUrl = `${input.publicUrl}/api/payment/webhook?provider=${config.provider}`;

  switch (config.provider) {
    /* --------------------------------------------------------------- MOCK */
    case "mock": {
      const token = config.webhookToken ? `&token=${encodeURIComponent(config.webhookToken)}` : "";
      const payUrl = `${input.publicUrl}/api/payment/webhook?provider=mock&reference=${encodeURIComponent(
        input.reference,
      )}&status=paid${token}`;
      return {
        ok: true,
        data: {
          provider: "mock",
          providerRef: `MOCK-${randomUUID().slice(0, 8).toUpperCase()}`,
          channel: "SIMULASI",
          baseAmount: fee.baseAmount,
          fee: fee.fee,
          amount: fee.amount,
          payUrl,
          expiresAt: new Date(Date.now() + config.expiresMinutes * 60_000).toISOString(),
          simulated: true,
          instructions: [
            "Ini transaksi SIMULASI (PAYMENT_PROVIDER=mock) — tidak ada uang yang benar-benar berpindah.",
            "Klik tombol Bayar Sekarang untuk menandai tagihan lunas dan menguji alur otomatis.",
            "Ganti PAYMENT_PROVIDER ke provider asli (mis. tripay) sebelum website dipakai publik.",
          ],
        },
      };
    }

    /* ------------------------------------------------------------- TRIPAY */
    case "tripay": {
      const method = config.methods[0] || "QRIS";
      const signature = createHmac("sha256", config.privateKey)
        .update(`${config.merchantCode}${input.reference}${fee.amount}`)
        .digest("hex");
      const result = await postJson(
        `${gatewayBaseUrl(config)}/transaction/create`,
        {
          method,
          merchant_ref: input.reference,
          amount: fee.amount,
          customer_name: input.customerName || "Pelanggan",
          customer_email: input.customerEmail || "pelanggan@example.com",
          customer_phone: input.customerPhone || "08123456789",
          order_items: [
            { sku: input.reference, name: input.description.slice(0, 60), price: fee.amount, quantity: 1 },
          ],
          callback_url: webhookUrl,
          return_url: returnUrl,
          expired_time: Math.floor(Date.now() / 1000) + config.expiresMinutes * 60,
          signature,
        },
        { Authorization: `Bearer ${config.apiKey}` },
      );
      if (!result.ok) return result;
      const data = asRecord(result.json.data);
      const payUrl = pickString(data, "checkout_url", "pay_url");
      const qrString = pickString(data, "qr_string");
      return {
        ok: true,
        data: {
          provider: "tripay",
          providerRef: pickString(data, "reference") || input.reference,
          channel: method,
          baseAmount: fee.baseAmount,
          fee: fee.fee,
          amount: fee.amount,
          payUrl,
          qrString,
          payCode: pickString(data, "pay_code"),
          expiresAt: pickString(data, "expired_time")
            ? new Date(Number(pickString(data, "expired_time")) * 1000).toISOString()
            : undefined,
          instructions: (Array.isArray(data.instructions) ? data.instructions : [])
            .map((step) => pickString(asRecord(step), "title", "instruction") ?? "")
            .filter(Boolean),
        },
      };
    }

    /* ----------------------------------------------------------- MIDTRANS */
    case "midtrans": {
      const auth = Buffer.from(`${config.apiKey}:`).toString("base64");
      const result = await postJson(
        `${gatewayBaseUrl(config)}/snap/v1/transactions`,
        {
          transaction_details: { order_id: input.reference, gross_amount: fee.amount },
          item_details: [
            { id: input.reference, name: input.description.slice(0, 50), price: fee.amount, quantity: 1 },
          ],
          customer_details: {
            first_name: input.customerName || "Pelanggan",
            email: input.customerEmail || "pelanggan@example.com",
            phone: input.customerPhone || "08123456789",
          },
          callbacks: { finish: returnUrl },
          expiry: { unit: "minutes", duration: config.expiresMinutes },
        },
        { Authorization: `Basic ${auth}` },
      );
      if (!result.ok) return result;
      return {
        ok: true,
        data: {
          provider: "midtrans",
          providerRef: pickString(result.json, "token") || input.reference,
          channel: "Snap (pilih di halaman pembayaran)",
          baseAmount: fee.baseAmount,
          fee: fee.fee,
          amount: fee.amount,
          payUrl: pickString(result.json, "redirect_url"),
          expiresAt: new Date(Date.now() + config.expiresMinutes * 60_000).toISOString(),
          instructions: ["Buka halaman pembayaran Midtrans, lalu pilih QRIS/VA/e-wallet."],
        },
      };
    }

    /* --------------------------------------------------------------- DOKU */
    case "doku": {
      const target = "/checkout/v1/payment";
      const requestId = randomUUID();
      const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
      const body = {
        order: {
          amount: fee.amount,
          invoice_number: input.reference,
          line_items: [{ name: input.description.slice(0, 50), price: fee.amount, quantity: 1 }],
          callback_url: webhookUrl,
          auto_redirect: true,
        },
        payment: { payment_due_date: config.expiresMinutes, ...(config.methods[0] && config.methods[0] !== "JOKUL_CHECKOUT" ? { payment_method_types: config.methods } : {}) },
        customer: {
          name: input.customerName || "Pelanggan",
          email: input.customerEmail || "pelanggan@example.com",
          phone: input.customerPhone || "08123456789",
        },
      };
      const digest = createHash("sha256").update(JSON.stringify(body)).digest("base64");
      const signature = createHmac("sha256", config.privateKey)
        .update(
          `Client-Id:${config.merchantCode}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${target}\nDigest:${digest}`,
        )
        .digest("base64");
      const result = await postJson(`${gatewayBaseUrl(config)}${target}`, body, {
        "Client-Id": config.merchantCode,
        "Request-Id": requestId,
        "Request-Timestamp": timestamp,
        Signature: `HMACSHA256=${signature}`,
      });
      if (!result.ok) return result;
      const response = asRecord(result.json.response);
      const payment = asRecord(response.payment);
      const order = asRecord(response.order);
      return {
        ok: true,
        data: {
          provider: "doku",
          providerRef: pickString(order, "invoice_number") || input.reference,
          channel: "Jokul Checkout",
          baseAmount: fee.baseAmount,
          fee: fee.fee,
          amount: fee.amount,
          payUrl: pickString(payment, "url", "checkout_url"),
          expiresAt: new Date(Date.now() + config.expiresMinutes * 60_000).toISOString(),
          instructions: ["Buka halaman pembayaran DOKU, pilih QRIS/VA/e-wallet, lalu selesaikan."],
        },
      };
    }

    /* ------------------------------------------------------------- DUITKU */
    case "duitku": {
      const paymentMethod = config.methods[0] || "DQ";
      const signature = createHash("md5")
        .update(`${config.merchantCode}${input.reference}${fee.amount}${config.apiKey}`)
        .digest("hex");
      const result = await postJson(
        `${gatewayBaseUrl(config)}/webapi/api/merchant/v2/inquiry`,
        {
          merchantCode: config.merchantCode,
          paymentAmount: fee.amount,
          paymentMethod,
          merchantOrderId: input.reference,
          productDetails: input.description.slice(0, 100),
          email: input.customerEmail || "pelanggan@example.com",
          phoneNumber: input.customerPhone || "08123456789",
          customerVaName: input.customerName || "Pelanggan",
          callbackUrl: webhookUrl,
          returnUrl,
          expiryPeriod: config.expiresMinutes,
          signature,
        },
        {},
      );
      if (!result.ok) return result;
      return {
        ok: true,
        data: {
          provider: "duitku",
          providerRef: pickString(result.json, "reference") || input.reference,
          channel: paymentMethod,
          baseAmount: fee.baseAmount,
          fee: fee.fee,
          amount: fee.amount,
          payUrl: pickString(result.json, "paymentUrl"),
          qrString: pickString(result.json, "qrString"),
          payCode: pickString(result.json, "vaNumber"),
          expiresAt: new Date(Date.now() + config.expiresMinutes * 60_000).toISOString(),
          instructions: ["Selesaikan pembayaran pada halaman Duitku sebelum batas waktu."],
        },
      };
    }

    /* ------------------------------------------------------------- XENDIT */
    case "xendit": {
      const auth = Buffer.from(`${config.apiKey}:`).toString("base64");
      const result = await postJson(
        `${gatewayBaseUrl(config)}/qr_codes`,
        {
          reference_id: input.reference,
          type: "DYNAMIC",
          currency: "IDR",
          amount: fee.amount,
          expires_at: new Date(Date.now() + config.expiresMinutes * 60_000).toISOString(),
          callback_url: webhookUrl,
        },
        { Authorization: `Basic ${auth}` },
      );
      if (!result.ok) return result;
      return {
        ok: true,
        data: {
          provider: "xendit",
          providerRef: pickString(result.json, "id") || input.reference,
          channel: "QRIS",
          baseAmount: fee.baseAmount,
          fee: fee.fee,
          amount: fee.amount,
          qrString: pickString(result.json, "qr_string"),
          expiresAt: pickString(result.json, "expires_at") ?? new Date(Date.now() + config.expiresMinutes * 60_000).toISOString(),
          instructions: ["Scan QRIS memakai aplikasi e-wallet atau m-banking Anda."],
        },
      };
    }

    /* ------------------------------------------------------------- IPAYMU */
    case "ipaymu": {
      const payload = {
        product: [input.description.slice(0, 60)],
        qty: [1],
        price: [fee.amount],
        amount: fee.amount,
        referenceId: input.reference,
        buyerName: input.customerName || "Pelanggan",
        buyerEmail: input.customerEmail || "pelanggan@example.com",
        buyerPhone: input.customerPhone || "08123456789",
        notifyUrl: webhookUrl,
        returnUrl,
        expired: config.expiresMinutes,
        lang: "id",
      };
      const bodyString = JSON.stringify(payload);
      const hashed = createHash("sha256").update(bodyString).digest("hex");
      const signature = createHash("sha256")
        .update(`POST:${config.merchantCode}:${hashed}:${config.apiKey}`)
        .digest("hex");
      const result = await postJson(`${gatewayBaseUrl(config)}/api/v2/payment`, payload, {
        va: config.merchantCode,
        signature,
        timestamp: new Date().toISOString().slice(0, 19).replace(/[-:T]/g, ""),
      });
      if (!result.ok) return result;
      const data = asRecord(result.json.Data);
      return {
        ok: true,
        data: {
          provider: "ipaymu",
          providerRef: pickString(data, "SessionID", "TransactionId") || input.reference,
          channel: config.methods[0] || "qris",
          baseAmount: fee.baseAmount,
          fee: fee.fee,
          amount: fee.amount,
          payUrl: pickString(data, "Url", "PaymentUrl"),
          expiresAt: new Date(Date.now() + config.expiresMinutes * 60_000).toISOString(),
          instructions: ["Buka halaman pembayaran iPaymu dan selesaikan transaksi."],
        },
      };
    }

    default:
      return { ok: false, error: `Provider ${config.provider} belum didukung.` };
  }
}

/* ========================================================= Verifikasi webhook */

export interface WebhookEvent {
  reference?: string;
  providerRef?: string;
  status: "paid" | "pending" | "expired" | "failed";
  channel?: string;
  /** Nominal yang benar-benar diterima (setelah fee). */
  amount?: number;
  fee?: number;
  paidAt?: string;
  raw: Record<string, unknown>;
}

export type WebhookVerification =
  | { ok: true; event: WebhookEvent }
  | { ok: false; status: number; error: string };

function parseBody(rawBody: string): Record<string, unknown> {
  try {
    return JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    /* Beberapa provider mengirim form-urlencoded. */
    const params = new URLSearchParams(rawBody);
    const result: Record<string, unknown> = {};
    params.forEach((value, key) => (result[key] = value));
    return result;
  }
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return diff === 0;
}

function normalizeStatus(value: string | undefined): WebhookEvent["status"] | null {
  if (!value) return null;
  const text = value.trim().toLowerCase();
  if (["paid", "settlement", "capture", "success", "succeeded", "berhasil", "00", "200", "qr.payment"].includes(text)) {
    return "paid";
  }
  if (["pending", "unpaid", "waiting", "1"].includes(text)) return "pending";
  if (["expire", "expired", "kadaluarsa"].includes(text)) return "expired";
  if (["deny", "cancel", "canceled", "cancelled", "failure", "failed", "refund", "2"].includes(text)) return "failed";
  return null;
}

/**
 * Verifikasi & normalisasi webhook dari provider.
 * `headers` cukup objek biasa (mis. Object.fromEntries(request.headers)).
 */
export function verifyWebhook(
  rawBody: string,
  headers: Record<string, string>,
  providerFromQuery?: string,
): WebhookVerification {
  const config = getGatewayConfig();
  const provider = ((providerFromQuery || config.provider) as PaymentProvider) ?? config.provider;
  const body = parseBody(rawBody);

  if (provider === "manual") {
    return { ok: false, status: 503, error: "Gateway tidak aktif (PAYMENT_PROVIDER=manual)." };
  }

  /* ------------------------------------------------------------------ MOCK */
  if (provider === "mock") {
    if (config.webhookToken) {
      const provided = headers["x-webhook-token"] || headers["x-callback-token"] || "";
      if (!safeEqual(provided, config.webhookToken)) {
        return { ok: false, status: 401, error: "Token webhook simulasi tidak valid." };
      }
    }
    const reference = pickString(body, "reference", "merchant_ref", "reference_id");
    return {
      ok: true,
      event: {
        reference,
        providerRef: pickString(body, "providerRef") || `MOCK-${randomUUID().slice(0, 8).toUpperCase()}`,
        status: normalizeStatus(pickString(body, "status")) ?? "paid",
        channel: "SIMULASI",
        amount: Number(pickString(body, "amount") ?? 0) || undefined,
        paidAt: new Date().toISOString(),
        raw: body,
      },
    };
  }

  /* ---------------------------------------------------------------- TRIPAY */
  if (provider === "tripay") {
    const signature = headers["x-callback-signature"] || "";
    const expected = createHmac("sha256", config.privateKey).update(rawBody).digest("hex");
    if (!signature || !safeEqual(signature, expected)) {
      return { ok: false, status: 401, error: "Signature callback Tripay tidak valid." };
    }
    const status = normalizeStatus(pickString(body, "status"));
    if (!status) return { ok: false, status: 400, error: "Status callback Tripay tidak dikenali." };
    return {
      ok: true,
      event: {
        reference: pickString(body, "merchant_ref"),
        providerRef: pickString(body, "reference"),
        status,
        channel: pickString(body, "payment_name", "payment_method"),
        amount: Number(pickString(body, "amount_received", "amount") ?? 0) || undefined,
        fee: Number(pickString(body, "total_fee") ?? 0) || undefined,
        paidAt: pickString(body, "paid_at"),
        raw: body,
      },
    };
  }

  /* -------------------------------------------------------------- MIDTRANS */
  if (provider === "midtrans") {
    const orderId = pickString(body, "order_id") || "";
    const statusCode = pickString(body, "status_code") || "";
    const grossAmount = pickString(body, "gross_amount") || "";
    const signatureKey = pickString(body, "signature_key") || "";
    const expected = createHash("sha512")
      .update(`${orderId}${statusCode}${grossAmount}${config.apiKey}`)
      .digest("hex");
    if (!signatureKey || !safeEqual(signatureKey, expected)) {
      return { ok: false, status: 401, error: "Signature webhook Midtrans tidak valid." };
    }
    const transactionStatus = pickString(body, "transaction_status") || "";
    const fraud = pickString(body, "fraud_status") || "";
    let status: WebhookEvent["status"] = "pending";
    if (transactionStatus === "capture") status = fraud === "challenge" ? "pending" : "paid";
    else if (transactionStatus === "settlement") status = "paid";
    else if (transactionStatus === "pending") status = "pending";
    else if (transactionStatus === "expire") status = "expired";
    else status = "failed";
    return {
      ok: true,
      event: {
        reference: orderId,
        providerRef: pickString(body, "transaction_id") || orderId,
        status,
        channel: pickString(body, "payment_type"),
        amount: Number(grossAmount) || undefined,
        paidAt: pickString(body, "settlement_time", "transaction_time"),
        raw: body,
      },
    };
  }

  /* ------------------------------------------------------------------ DOKU */
  if (provider === "doku") {
    const clientId = headers["client-id"] || "";
    const requestId = headers["request-id"] || "";
    const timestamp = headers["request-timestamp"] || "";
    const signatureHeader = headers["signature"] || "";
    const digest = createHash("sha256").update(rawBody).digest("base64");
    const target = "/api/payment/webhook";
    const expected = createHmac("sha256", config.privateKey)
      .update(
        `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${target}\nDigest:${digest}`,
      )
      .digest("base64");
    const provided = signatureHeader.replace(/^HMACSHA256=/i, "");
    if (!provided || !safeEqual(provided, expected)) {
      return { ok: false, status: 401, error: "Signature webhook DOKU tidak valid." };
    }
    const order = asRecord(body.order);
    const transaction = asRecord(body.transaction);
    const channel = asRecord(body.channel);
    const statusText = pickString(transaction, "status");
    const status: WebhookEvent["status"] =
      statusText?.toUpperCase() === "SUCCESS" ? "paid" : statusText?.toUpperCase() === "PENDING" ? "pending" : "failed";
    return {
      ok: true,
      event: {
        reference: pickString(order, "invoice_number"),
        providerRef: pickString(transaction, "original_request_id") || pickString(order, "invoice_number"),
        status,
        channel: pickString(channel, "id"),
        amount: Number(pickString(order, "amount") ?? 0) || undefined,
        paidAt: pickString(transaction, "date"),
        raw: body,
      },
    };
  }

  /* --------------------------------------------------------------- DUITKU */
  if (provider === "duitku") {
    const merchantCode = pickString(body, "merchantCode") || "";
    const amount = pickString(body, "amount") || "";
    const merchantOrderId = pickString(body, "merchantOrderId") || "";
    const signature = pickString(body, "signature") || "";
    const expected = createHash("md5").update(`${merchantCode}${amount}${merchantOrderId}${config.apiKey}`).digest("hex");
    if (!signature || !safeEqual(signature.toLowerCase(), expected)) {
      return { ok: false, status: 401, error: "Signature callback Duitku tidak valid." };
    }
    const resultCode = pickString(body, "resultCode");
    const status: WebhookEvent["status"] = resultCode === "00" ? "paid" : resultCode === "01" ? "pending" : "failed";
    return {
      ok: true,
      event: {
        reference: merchantOrderId,
        providerRef: pickString(body, "reference"),
        status,
        channel: pickString(body, "paymentCode"),
        amount: Number(amount) || undefined,
        paidAt: pickString(body, "settlementDate", "publisherOrderId") ? undefined : undefined,
        raw: body,
      },
    };
  }

  /* ---------------------------------------------------------------- XENDIT */
  if (provider === "xendit") {
    const token = headers["x-callback-token"] || "";
    if (!config.webhookToken || !safeEqual(token, config.webhookToken)) {
      return { ok: false, status: 401, error: "Token callback Xendit tidak valid (isi PAYMENT_WEBHOOK_TOKEN)." };
    }
    const event = pickString(body, "event");
    const data = asRecord(body.data);
    const source = event?.startsWith("qr") ? data : body;
    const status =
      normalizeStatus(pickString(source, "status")) ?? (event === "qr.payment" ? "paid" : null);
    if (!status) return { ok: false, status: 400, error: "Status callback Xendit tidak dikenali." };
    return {
      ok: true,
      event: {
        reference: pickString(source, "reference_id", "external_id"),
        providerRef: pickString(source, "id", "qr_code_id", "invoice_id"),
        status,
        channel: pickString(source, "payment_method", "channel_code") || "QRIS",
        amount: Number(pickString(source, "paid_amount", "amount") ?? 0) || undefined,
        paidAt: pickString(source, "paid_at", "updated"),
        raw: body,
      },
    };
  }

  /* --------------------------------------------------------------- IPAYMU */
  if (provider === "ipaymu") {
    const statusCode = pickString(body, "status_code", "statusCode");
    const reference = pickString(body, "reference_id", "referenceId", "sid");
    if (config.webhookToken) {
      const provided = headers["x-webhook-token"] || "";
      if (!safeEqual(provided, config.webhookToken)) {
        return { ok: false, status: 401, error: "Token webhook iPaymu tidak valid." };
      }
    }
    const status: WebhookEvent["status"] =
      statusCode === "200" || normalizeStatus(pickString(body, "status")) === "paid" ? "paid" : "pending";
    return {
      ok: true,
      event: {
        reference,
        providerRef: pickString(body, "trx_id", "transactionId"),
        status,
        channel: pickString(body, "payment_method", "channel"),
        amount: Number(pickString(body, "amount", "total") ?? 0) || undefined,
        paidAt: pickString(body, "paid_at", "transaction_time"),
        raw: body,
      },
    };
  }

  return { ok: false, status: 400, error: `Provider ${provider} tidak dikenal.` };
}
