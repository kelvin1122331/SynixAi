import { NextResponse } from "next/server";
import { getCatalog, getServiceById } from "@/lib/catalog";
import { createPanelOrder, isIpNotAllowed } from "@/lib/smm";
import { createQuote } from "@/lib/quotes";
import { compactNumber, formatRupiah } from "@/lib/format";
import { paymentConfig } from "@/lib/site-config";

/**
 * POST /api/order
 * Membuat pesanan (dipanggil dari server, kredensial panel aman).
 *
 * Dua mode (env ORDER_AUTO_SUBMIT):
 *  - "0" (default, aman): membuat penawaran/pesanan menunggu pembayaran dengan
 *    kode referensi. Saldo panel TIDAK terpotong. Setelah customer membayar,
 *    admin menekan "Kirim ke panel" di /admin (satu klik, otomatis ke provider).
 *  - "1": langsung meneruskan pesanan ke panel tanpa menunggu pembayaran.
 *
 * Body: { service: number, target: string, quantity: number, comments?: string }
 */

interface Body {
  service?: number | string;
  target?: string;
  quantity?: number | string;
  comments?: string;
}

/* Rate limit sederhana berbasis memori (per IP). */
const hits = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 15;
const WINDOW_MS = 10 * 60 * 1000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > LIMIT;
}

/**
 * Layanan yang target-nya berupa KONTEN wajib memakai link
 * (mis. views, likes, komentar, live stream). Sedangkan layanan berbasis
 * AKUN (followers, subscriber, members) boleh memakai username.
 */
const CONTENT_KEYWORDS = [
  "view", "views", "like", "likes", "comment", "comments", "play", "plays",
  "watch time", "live stream", "live", "story", "reels", "shorts", "traffic",
  "review", "reviews", "save", "saves", "share", "shares", "retweet", "repost",
  "post", "video", "tweet", "favorite", "favorites", "backlink", "impression",
  "impressions", "click", "clicks", "presave", "compare", "poll",
];

const ACCOUNT_KEYWORDS = [
  "follower", "followers", "subscriber", "subscribers", "member", "members",
  "listener", "listeners", "page like", "channel", "profile", "audience", "fan",
];

function requiresUrl(category: string, name: string): boolean {
  const haystack = `${category} ${name}`.toLowerCase();
  const accountHit = ACCOUNT_KEYWORDS.some((keyword) => haystack.includes(keyword));
  const contentHit = CONTENT_KEYWORDS.some((keyword) => haystack.includes(keyword));
  if (accountHit && !contentHit) return false;
  return contentHit;
}

/** Validasi bentuk target sesuai jenis layanan (mencegah salah input fatal). */
function validateTarget(target: string, platform: string, category: string, name: string): string | null {
  const value = target.trim();
  if (value.length < 3) return "Target terlalu pendek. Masukkan link atau username yang benar.";
  if (value.length > 500) return "Target terlalu panjang (maksimal 500 karakter).";
  if (/\s/.test(value)) {
    return "Target tidak boleh mengandung spasi. Pastikan Anda menempel link atau username yang benar (bukan nama file/screenshot).";
  }

  const looksLikeUrl = /^https?:\/\//i.test(value);
  const needsUrl = requiresUrl(category, name);

  if (looksLikeUrl) {
    if (!/^https:\/\//i.test(value)) {
      return "Gunakan link dengan awalan https:// (link http:// tidak dianjurkan).";
    }
    return null;
  }

  if (needsUrl) {
    return `${category} membutuhkan LINK (bukan username). Contoh: https://youtu.be/VIDEO_ID, https://vt.tiktok.com/xxxx, atau https://instagram.com/p/xxxx — salin lewat tombol bagikan di aplikasi.`;
  }

  const handleOnlyPlatforms = ["instagram", "tiktok", "youtube", "twitter", "threads", "spotify"];
  const looksLikeHandle = /^@?[\w.\-]{2,40}$/.test(value);
  if (!looksLikeHandle || !handleOnlyPlatforms.includes(platform)) {
    return "Format target tidak dikenali. Tempel link lengkap (diawali https://) atau username saja (contoh: @username.anda).";
  }
  return null;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Terlalu banyak percobaan pesanan dari jaringan ini. Coba lagi beberapa menit lagi atau hubungi admin.",
      },
      { status: 429 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Format permintaan tidak valid." }, { status: 400 });
  }

  const serviceId = Number(body.service);
  const target = String(body.target ?? "").trim();
  const quantity = Math.floor(Number(body.quantity));

  if (!Number.isFinite(serviceId) || serviceId <= 0) {
    return NextResponse.json({ ok: false, error: "Layanan belum dipilih." }, { status: 400 });
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return NextResponse.json({ ok: false, error: "Jumlah pesanan tidak valid." }, { status: 400 });
  }

  const catalog = await getCatalog();
  const service = getServiceById(catalog.services, serviceId);

  if (!service) {
    return NextResponse.json({ ok: false, error: "Layanan tidak ditemukan di katalog." }, { status: 404 });
  }
  if (quantity < service.min || quantity > service.max) {
    return NextResponse.json(
      {
        ok: false,
        error: `Jumlah harus antara ${compactNumber(service.min)} dan ${compactNumber(service.max)} untuk layanan ini.`,
      },
      { status: 400 },
    );
  }

  const targetError = validateTarget(target, service.platform, service.category, service.name);
  if (targetError) {
    return NextResponse.json({ ok: false, error: targetError }, { status: 400 });
  }

  const total = Math.round((service.priceRetail / 1000) * quantity);
  const cost = Math.round((service.price / 1000) * quantity);
  const profit = total - cost;

  /* ------------------------------------------------ Mode 1: kirim ke panel */
  const autoSubmit = process.env.ORDER_AUTO_SUBMIT === "1";

  if (autoSubmit) {
    if (catalog.source === "demo") {
      return NextResponse.json(
        {
          ok: false,
          code: "DEMO_MODE",
          error:
            "Server ini sedang menampilkan katalog contoh (belum terhubung ke panel), jadi pesanan belum bisa dikirim otomatis. Silakan konfirmasi lewat WhatsApp — admin akan memprosesnya.",
        },
        { status: 503 },
      );
    }

    const result = await createPanelOrder({
      service: service.id,
      target,
      quantity,
      comments: body.comments?.trim() || undefined,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          code: isIpNotAllowed(result.error) ? "IP_NOT_ALLOWED" : "PANEL_ERROR",
          error: result.error,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      mode: "auto",
      orderId: result.data.orderId,
      reference: result.data.orderId,
      service: { id: service.id, name: service.name },
      target,
      quantity,
      unitPrice: Math.round((service.priceRetail / 1000) * 100) / 100,
      total,
      totalFormatted: formatRupiah(total),
      createdAt: new Date().toISOString(),
    });
  }

  /* ------------------------------- Mode 2: penawaran menunggu pembayaran */
  const quote = createQuote({
    serviceId: service.id,
    serviceName: service.name,
    platform: service.platform,
    target,
    quantity,
    retailPerThousand: service.priceRetail,
    costPerThousand: service.price,
    total,
    profit,
  });

  const expiresAt = new Date(
    Date.now() + (Number.isFinite(paymentConfig.quoteValidityMinutes) ? paymentConfig.quoteValidityMinutes : 120) * 60_000,
  ).toISOString();

  return NextResponse.json({
    ok: true,
    mode: "manual",
    needsPayment: true,
    catalogSource: catalog.source,
    reference: quote.reference,
    service: { id: service.id, name: service.name, platform: service.platform },
    target,
    quantity,
    unitPrice: Math.round((service.priceRetail / 1000) * 100) / 100,
    total,
    totalFormatted: formatRupiah(total),
    expiresAt,
    payment: {
      qrisName: paymentConfig.qrisMerchant,
      bank: paymentConfig.bank,
      ewallet: paymentConfig.ewallet,
    },
    createdAt: quote.createdAt,
  });
}

export const dynamic = "force-dynamic";
