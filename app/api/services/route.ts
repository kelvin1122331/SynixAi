import { NextResponse } from "next/server";
import { filterServices, getCatalog, getCatalogStats } from "@/lib/catalog";

/**
 * GET /api/services
 * Katalog layanan (publik, untuk reseller maupun frontend sendiri).
 *
 * Query: q, platform, category, sort, minPrice, maxPrice, refill, instant, page, perPage, format
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const catalog = await getCatalog();

  if (searchParams.get("format") === "summary") {
    return NextResponse.json({
      ok: true,
      source: catalog.source,
      fetchedAt: catalog.fetchedAt,
      stats: getCatalogStats(catalog.services),
    });
  }

  const result = filterServices(catalog.services, {
    q: searchParams.get("q") ?? undefined,
    platform: searchParams.get("platform") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    refillOnly: searchParams.get("refill") === "1",
    instantOnly: searchParams.get("instant") === "1",
    sort: (searchParams.get("sort") as "populer" | "termurah" | "termahal" | "min" | "maks" | "az") ?? "populer",
    page: Number(searchParams.get("page") ?? 1) || 1,
    perPage: Number(searchParams.get("perPage") ?? 50) || 50,
  });

  return NextResponse.json({
    ok: true,
    source: catalog.source,
    fetchedAt: catalog.fetchedAt,
    pagination: {
      page: result.page,
      perPage: result.perPage,
      total: result.total,
      totalPages: result.totalPages,
    },
    facets: result.facets,
    data: result.items.map((s) => ({
      id: s.id,
      name: s.name,
      fullName: s.fullName,
      platform: s.platform,
      platformLabel: s.platformLabel,
      category: s.category,
      categoryRaw: s.categoryRaw,
      variant: s.variant,
      type: s.type,
      price: s.priceRetail,
      pricePerUnit: Math.round((s.priceRetail / 1000) * 100) / 100,
      min: s.min,
      max: s.max,
      refill: s.refill,
      refillDays: s.refillDays,
      instant: s.instant,
      speed: s.speed,
      badges: s.badges,
      targetHint: s.targetHint,
      description: s.description,
    })),
  });
}

export const dynamic = "force-dynamic";
