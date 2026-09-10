import type { OrderResponse, OrderStatus, PanelResult, RawPanelService } from "./types";

/**
 * ============================================================================
 *  SMM Nusantara API Client
 * ============================================================================
 *  Endpoint  : {SMM_API_URL}/api/{action}
 *  Method    : POST form-urlencoded (fallback otomatis ke GET query)
 *  Parameter : api_id, api_key  + parameter sesuai action
 *
 *  Action yang dipakai:
 *   - services : daftar seluruh layanan (tidak butuh IP whitelist)
 *   - order    : buat pesanan  -> butuh IP server terdaftar di panel
 *   - status   : cek status    -> butuh IP server terdaftar di panel
 *   - balance  : cek saldo     -> butuh IP server terdaftar di panel
 *
 *  Catatan hasil uji langsung (11 Sep 2026):
 *   /api/services -> {"status":true,"msg":"OK","services":[...]}   (2.200+ layanan)
 *   /api/order    -> parameter target = link/username (bukan `data`)
 *   /api/order    -> {"status":false,"msg":"IP x.x.x.x tidak diizinkan."}
 *                    bila IP server belum di-whitelist di panel.
 * ============================================================================
 */

const DEFAULT_BASE_URL = "https://smmnusantara.id";
const REQUEST_TIMEOUT_MS = 25_000;

export function getPanelBaseUrl(): string {
  return (process.env.SMM_API_URL || DEFAULT_BASE_URL).replace(/\/+$/, "").replace(/\/api(\/.*)?$/, "");
}

export function getCredentials(): { apiId: string; apiKey: string; configured: boolean } {
  const apiId = (process.env.SMM_API_ID || "").trim();
  const apiKey = (process.env.SMM_API_KEY || "").trim();
  return { apiId, apiKey, configured: Boolean(apiId && apiKey) };
}

export function maskSecret(value: string, visible = 4): string {
  if (!value) return "(kosong)";
  if (value.length <= visible * 2) return `${value.slice(0, visible)}••••`;
  return `${value.slice(0, visible)}••••••••${value.slice(-visible)}`;
}

type PanelAction = "services" | "order" | "status" | "balance" | string;

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    // Panel kadang mengirim HTML (halaman 404 Laravel) — ambil pesan sebisanya.
    if (/not found/i.test(text) || res.status === 404) {
      throw new PanelError("Endpoint API tidak ditemukan. Periksa SMM_API_URL.", 404, text.slice(0, 200));
    }
    throw new PanelError("Respons panel bukan JSON yang valid.", res.status, text.slice(0, 200));
  }
}

export class PanelError extends Error {
  status: number;
  raw?: unknown;
  constructor(message: string, status = 0, raw?: unknown) {
    super(message);
    this.name = "PanelError";
    this.status = status;
    this.raw = raw;
  }
}

/** Terjemahkan pesan error panel menjadi petunjuk yang bisa ditindaklanjuti. */
function humanizePanelMessage(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("ip ") && lower.includes("tidak diizinkan")) {
    const ip = msg.replace(/[^0-9a-f.:]/gi, "").trim();
    return `IP server (${ip || "tidak diketahui"}) belum diizinkan di panel. Tambahkan IP tersebut di dashboard SMM Nusantara → menu API → IP Whitelist (biasanya perlu 1×24 jam atau langsung aktif).`;
  }
  if (lower.includes("kredensial")) return "Kredensial panel tidak valid. Periksa SMM_API_ID dan SMM_API_KEY.";
  if (lower.includes("isian api id")) return "SMM_API_ID belum diisi.";
  if (lower.includes("saldo")) return "Saldo panel tidak cukup untuk memproses pesanan ini. Silakan top-up saldo panel terlebih dahulu.";
  if (lower.includes("layanan yang dipilih")) return "Layanan tidak valid atau sedang dinonaktifkan di panel.";
  if (lower.includes("target")) return "Target/link pesanan tidak valid atau kosong.";
  if (lower.includes("jumlah") || lower.includes("quantity")) return "Jumlah pesanan tidak sesuai ketentuan layanan (min/maks).";
  return msg;
}

/**
 * Panggil API panel. POST dulu (sesuai dokumentasi panel),
 * otomatis jatuh ke GET bila POST tidak didukung/diblokir.
 */
async function panelRequest(action: PanelAction, params: Record<string, string | number | undefined>): Promise<unknown> {
  const { apiId, apiKey, configured } = getCredentials();
  if (!configured) {
    throw new PanelError("Kredensial panel belum dikonfigurasi (SMM_API_ID / SMM_API_KEY kosong).", 500);
  }

  const base = getPanelBaseUrl();
  const url = `${base}/api/${action}`;

  const body = new URLSearchParams({ api_id: apiId, api_key: apiKey });
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    body.set(key, String(value));
  }

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
    "User-Agent": "SynixAI/1.0 (+smm-panel-storefront)",
  };

  const errors: string[] = [];

  // 1) POST (form-urlencoded)
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      redirect: "follow",
    });
    if (res.ok) return await parseJsonSafe(res);
    errors.push(`POST ${res.status}`);
  } catch (err) {
    if (err instanceof PanelError) throw err;
    errors.push(`POST gagal: ${(err as Error).message}`);
  }

  // 2) GET (query string)
  try {
    const res = await fetch(`${url}?${body.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json", "User-Agent": headers["User-Agent"] },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      redirect: "follow",
    });
    if (res.ok) return await parseJsonSafe(res);
    throw new PanelError(`Panel membalas HTTP ${res.status}. (${errors.join("; ")})`, res.status);
  } catch (err) {
    if (err instanceof PanelError) throw err;
    throw new PanelError(
      `Tidak dapat menghubungi panel (${errors.join("; ")}; GET gagal: ${(err as Error).message}).`,
    );
  }
}

/** Bungkus hasil pemanggilan panel menjadi PanelResult. */
async function call<T>(action: PanelAction, params: Record<string, string | number | undefined> = {}): Promise<PanelResult<T>> {
  try {
    const json = await panelRequest(action, params) as Record<string, unknown> & { status?: boolean; msg?: string };
    if (json && typeof json === "object" && json.status === false) {
      return { ok: false, error: humanizePanelMessage(String(json.msg ?? "Permintaan ditolak panel.")), raw: json };
    }
    return { ok: true, data: json as T };
  } catch (err) {
    const message = err instanceof PanelError ? humanizePanelMessage(err.message) : (err as Error).message;
    return { ok: false, error: message };
  }
}

/** Ambil seluruh katalog layanan dari panel. */
export async function fetchPanelServices(): Promise<PanelResult<RawPanelService[]>> {
  const res = await call<{ services?: RawPanelService[] } | RawPanelService[]>("services");
  if (!res.ok) return res;

  const payload = res.data as unknown as { services?: RawPanelService[] } | RawPanelService[];
  const list = Array.isArray(payload) ? payload : Array.isArray(payload?.services) ? payload.services : [];
  if (!list.length) {
    return { ok: false, error: "Panel tidak mengembalikan daftar layanan (respons kosong).", raw: res.data };
  }
  return { ok: true, data: list };
}

/** Buat pesanan baru. Parameter `target` = link/username tujuan. */
export async function createPanelOrder(input: {
  service: number | string;
  target: string;
  quantity: number;
  comments?: string;
  runs?: number;
  interval?: number;
}): Promise<PanelResult<OrderResponse>> {
  const res = await call<Record<string, unknown>>("order", {
    service: input.service,
    target: input.target,
    quantity: input.quantity,
    comments: input.comments,
    runs: input.runs,
    interval: input.interval,
  });
  if (!res.ok) return res;

  const raw = res.data as Record<string, unknown>;
  const nested = (raw?.data ?? {}) as Record<string, unknown>;
  const orderId =
    raw?.order ??
    raw?.id ??
    nested?.id ??
    nested?.order ??
    (typeof raw?.order_id !== "undefined" ? raw.order_id : undefined);

  if (orderId === undefined || orderId === null || orderId === "") {
    return { ok: false, error: "Panel tidak mengembalikan ID pesanan.", raw };
  }
  return { ok: true, data: { orderId: String(orderId), raw } };
}

/** Cek status satu pesanan. */
export async function fetchPanelOrderStatus(orderId: string | number): Promise<PanelResult<OrderStatus>> {
  const res = await call<Record<string, unknown>>("status", { id: orderId });
  if (!res.ok) return res;

  const raw = res.data as Record<string, unknown>;
  // Format panel: {"status":true,"data":{"status":"Pending","start_count":"0","remains":"100"}}
  const data = (raw?.data && typeof raw.data === "object" ? raw.data : raw) as Record<string, unknown>;
  const statusValue = data?.status ?? raw?.status;

  // `status` bisa berupa boolean true/false pada beberapa varian panel.
  if (typeof statusValue === "boolean") {
    return { ok: false, error: "Pesanan tidak ditemukan di panel.", raw };
  }

  return {
    ok: true,
    data: {
      id: String(orderId),
      status: String(statusValue ?? "Tidak diketahui"),
      startCount: data?.start_count !== undefined ? String(data.start_count) : null,
      remains: data?.remains !== undefined ? String(data.remains) : null,
      charge: data?.charge !== undefined ? String(data.charge) : null,
      currency: data?.currency !== undefined ? String(data.currency) : null,
    },
  };
}

/** Cek saldo akun panel (butuh IP whitelist). */
export async function fetchPanelBalance(): Promise<PanelResult<{ balance: string; currency: string }>> {
  const res = await call<Record<string, unknown>>("balance");
  if (!res.ok) return res;
  const raw = res.data as Record<string, unknown>;
  const data = (raw?.data && typeof raw.data === "object" ? raw.data : raw) as Record<string, unknown>;
  return {
    ok: true,
    data: {
      balance: String(data?.balance ?? "0"),
      currency: String(data?.currency ?? "IDR"),
    },
  };
}

/** Apakah error bertipe "IP tidak diizinkan" (butuh whitelist). */
export function isIpNotAllowed(message?: string | null): boolean {
  return Boolean(message && /ip .*tidak diizinkan/i.test(message));
}
