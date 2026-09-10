import { NextResponse } from "next/server";
import { fetchPanelOrderStatus, isIpNotAllowed } from "@/lib/smm";
import { statusLabel } from "@/lib/format";

/**
 * GET /api/status?order=12345
 * GET /api/status?orders=12345,12346,12347   (maksimal 20 ID)
 *
 * Meneruskan pengecekan status ke panel dari sisi server.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const single = searchParams.get("order");
  const multiple = searchParams.get("orders");

  const ids = (multiple ? multiple.split(",") : single ? [single] : [])
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 20);

  if (!ids.length) {
    return NextResponse.json(
      { ok: false, error: "Sertakan parameter `order` atau `orders` (contoh: /api/status?order=12345)." },
      { status: 400 },
    );
  }

  const results = [];
  for (const id of ids) {
    const res = await fetchPanelOrderStatus(id);
    if (res.ok) {
      results.push({
        id,
        ok: true,
        status: res.data.status,
        statusLabel: statusLabel(res.data.status),
        startCount: res.data.startCount,
        remains: res.data.remains,
        charge: res.data.charge,
        currency: res.data.currency,
      });
    } else {
      results.push({
        id,
        ok: false,
        status: null,
        statusLabel: null,
        error: res.error,
        code: isIpNotAllowed(res.error) ? "IP_NOT_ALLOWED" : "PANEL_ERROR",
      });
    }
  }

  return NextResponse.json({
    ok: results.some((r) => r.ok),
    count: results.length,
    data: results,
    checkedAt: new Date().toISOString(),
  });
}

export const dynamic = "force-dynamic";
