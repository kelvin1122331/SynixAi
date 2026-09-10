import { NextResponse } from "next/server";
import { getCatalog, getCatalogStats } from "@/lib/catalog";
import { fetchPanelBalance, getCredentials, getPanelBaseUrl, isIpNotAllowed, maskSecret } from "@/lib/smm";

/**
 * GET /api/health            → ringkasan status
 * GET /api/health?probe=1    → sekaligus uji saldo panel (untuk memastikan IP whitelist)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const probe = searchParams.get("probe") === "1";

  const credentials = getCredentials();
  const catalog = await getCatalog();
  const stats = getCatalogStats(catalog.services);

  let balance: { ok: boolean; value?: string; currency?: string; error?: string; ipIssue?: boolean } | null = null;
  if (probe) {
    const res = await fetchPanelBalance();
    balance = res.ok
      ? { ok: true, value: res.data.balance, currency: res.data.currency }
      : { ok: false, error: res.error, ipIssue: isIpNotAllowed(res.error) };
  }

  return NextResponse.json({
    ok: true,
    checkedAt: new Date().toISOString(),
    panel: {
      baseUrl: getPanelBaseUrl(),
      credentialsConfigured: credentials.configured,
      apiId: credentials.apiId ? maskSecret(credentials.apiId, 2) : null,
      apiKey: credentials.apiKey ? maskSecret(credentials.apiKey) : null,
    },
    catalog: {
      source: catalog.source,
      totalServices: stats.totalServices,
      totalPlatforms: stats.totalPlatforms,
      totalCategories: stats.totalCategories,
      fetchedAt: catalog.fetchedAt,
      error: catalog.error,
    },
    orderReady: catalog.source === "panel",
    balance,
  });
}

export const dynamic = "force-dynamic";
