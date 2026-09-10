import { NextResponse } from "next/server";
import { getCatalog, getServiceById } from "@/lib/catalog";
import { createPanelOrder, isIpNotAllowed } from "@/lib/smm";
import { compactNumber, formatRupiah } from "@/lib/format";

/**
 * POST /api/order
 * Membuat pesanan ke panel SMM Nusantara (dipanggil dari server, kredensial aman).
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

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak percobaan pesanan dari jaringan ini. Coba lagi beberapa menit lagi atau hubungi admin." },
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
  if (target.length < 3 || target.length > 500) {
    return NextResponse.json(
      { ok: false, error: "Target tidak valid. Masukkan link atau username dengan benar (3–500 karakter)." },
      { status: 400 },
    );
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

  // Mode demo: katalog contoh tidak ada di panel, jadi jangan diteruskan.
  if (catalog.source === "demo") {
    return NextResponse.json(
      {
        ok: false,
        code: "DEMO_MODE",
        error:
          "Server ini sedang menampilkan katalog contoh (belum terhubung ke panel), jadi pesanan belum bisa dikirim otomatis. Silakan konfirmasi pesanan lewat WhatsApp — admin akan memprosesnya.",
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
    orderId: result.data.orderId,
    service: { id: service.id, name: service.name },
    target,
    quantity,
    total: Math.round((service.priceRetail / 1000) * quantity),
    totalFormatted: formatRupiah((service.priceRetail / 1000) * quantity),
    createdAt: new Date().toISOString(),
  });
}

export const dynamic = "force-dynamic";
