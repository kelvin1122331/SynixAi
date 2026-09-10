import { NextResponse } from "next/server";
import { getCatalog, getRelatedServices, getServiceById } from "@/lib/catalog";

/** GET /api/services/:id — detail satu layanan + layanan terkait. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ ok: false, error: "ID layanan tidak valid." }, { status: 400 });
  }

  const catalog = await getCatalog();
  const service = getServiceById(catalog.services, numericId);

  if (!service) {
    return NextResponse.json({ ok: false, error: "Layanan tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    source: catalog.source,
    fetchedAt: catalog.fetchedAt,
    data: {
      ...service,
      pricePerUnit: Math.round((service.priceRetail / 1000) * 100) / 100,
    },
    related: getRelatedServices(catalog.services, service, 6).map((s) => ({
      id: s.id,
      name: s.name,
      platform: s.platform,
      category: s.category,
      price: s.priceRetail,
      min: s.min,
      max: s.max,
      badges: s.badges,
    })),
  });
}

export const dynamic = "force-dynamic";
