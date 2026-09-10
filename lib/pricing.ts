/**
 * ============================================================================
 *  Mesin Penetapan Harga (Pricing Engine)
 * ============================================================================
 *  Harga panel = harga kulakan (modal). Harga yang tampil ke customer adalah
 *  hasil markup bertingkat + pembulatan, sehingga setiap pesanan menghasilkan
 *  margin.
 *
 *  Kenapa bertingkat, bukan satu persen flat?
 *   - Layanan murah (Rp 1.820/1.000) tahan markup besar karena pasar retail
 *     menjual jauh lebih mahal.
 *   - Layanan mahal (Rp 1.900.000/1.000) tidak bisa dimarkup 2,8× karena
 *     harganya jadi tidak masuk akal di pasar.
 *
 *  Semua parameter dapat diatur lewat environment variable (lihat .env.example).
 * ============================================================================
 */

export interface PricingTier {
  /** Batas atas harga modal per 1.000 (0 / Infinity = tanpa batas). */
  maxCost: number;
  /** Pengali harga jual. */
  multiplier: number;
}

/** Konfigurasi default: margin ±180% di layanan murah s.d. ±30% di layanan premium. */
export const DEFAULT_TIERS: PricingTier[] = [
  { maxCost: 3_000, multiplier: 2.8 },
  { maxCost: 8_000, multiplier: 2.4 },
  { maxCost: 20_000, multiplier: 2.0 },
  { maxCost: 50_000, multiplier: 1.7 },
  { maxCost: 150_000, multiplier: 1.5 },
  { maxCost: 500_000, multiplier: 1.4 },
  { maxCost: Number.POSITIVE_INFINITY, multiplier: 1.3 },
];

export interface PricingConfig {
  tiers: PricingTier[];
  /** Laba minimum per 1.000 unit (Rp). */
  minProfit: number;
  /** Pembulatan manual. 0 = otomatis. */
  roundStep: number;
  /** Markup flat (%) bila diisi > 0 — menimpa konfigurasi bertingkat. */
  flatMarkupPercent: number;
}

function parseTiers(raw: string | undefined): PricingTier[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Array<[number, number]>;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    const tiers: PricingTier[] = [];
    for (const entry of parsed) {
      if (!Array.isArray(entry) || entry.length < 2) continue;
      const maxCost = Number(entry[0]);
      const multiplier = Number(entry[1]);
      if (!Number.isFinite(multiplier) || multiplier <= 0) continue;
      tiers.push({
        // maxCost 0 / negatif / tidak valid = tanpa batas (tier terakhir)
        maxCost: Number.isFinite(maxCost) && maxCost > 0 ? maxCost : Number.POSITIVE_INFINITY,
        multiplier,
      });
    }
    if (!tiers.length) return null;

    // Urutkan menaik & pastikan ada tier tak terbatas di akhir.
    tiers.sort((a, b) => a.maxCost - b.maxCost);
    if (!Number.isFinite(tiers[tiers.length - 1].maxCost)) {
      // sudah benar
    } else {
      tiers.push({ maxCost: Number.POSITIVE_INFINITY, multiplier: tiers[tiers.length - 1].multiplier });
    }
    return tiers;
  } catch {
    return null;
  }
}

export function getPricingConfig(): PricingConfig {
  const flat = Number(process.env.NEXT_PUBLIC_PRICE_MARKUP ?? 0);
  const minProfit = Number(process.env.PRICING_MIN_PROFIT ?? 1_000);
  const roundStep = Number(process.env.PRICING_ROUND_STEP ?? 0);

  return {
    tiers: parseTiers(process.env.PRICING_TIERS) ?? DEFAULT_TIERS,
    minProfit: Number.isFinite(minProfit) && minProfit > 0 ? minProfit : 0,
    roundStep: Number.isFinite(roundStep) && roundStep > 0 ? roundStep : 0,
    flatMarkupPercent: Number.isFinite(flat) && flat > 0 ? flat : 0,
  };
}

/** Tier mana yang berlaku untuk harga modal tertentu. */
export function resolveMultiplier(cost: number, tiers: PricingTier[]): number {
  for (const tier of tiers) {
    if (cost <= tier.maxCost) return tier.multiplier;
  }
  return tiers[tiers.length - 1]?.multiplier ?? 1;
}

/** Pembulatan ke atas yang enak dibaca (bukan angka ganjil seperti 4.368). */
function roundUp(value: number, step: number): number {
  if (step > 0) return Math.ceil(value / step) * step;
  if (value < 10_000) return Math.ceil(value / 100) * 100;
  if (value < 100_000) return Math.ceil(value / 500) * 500;
  if (value < 1_000_000) return Math.ceil(value / 1_000) * 1_000;
  if (value < 10_000_000) return Math.ceil(value / 10_000) * 10_000;
  return Math.ceil(value / 100_000) * 100_000;
}

/**
 * Hitung harga jual per 1.000 unit dari harga modal per 1.000 unit.
 *
 * Rumus:
 *   harga_jual = bulatkan( max( modal × pengali_tier , modal + laba_minimum ) )
 */
export function calculateRetailPrice(cost: number, config: PricingConfig = getPricingConfig()): number {
  const safeCost = Number.isFinite(cost) && cost > 0 ? cost : 0;

  if (config.flatMarkupPercent > 0) {
    return roundUp(safeCost * (1 + config.flatMarkupPercent / 100), config.roundStep);
  }

  if (safeCost === 0) return 0;

  const multiplier = resolveMultiplier(safeCost, config.tiers);
  const byMultiplier = safeCost * multiplier;
  const byMinimumProfit = safeCost + config.minProfit;

  return roundUp(Math.max(byMultiplier, byMinimumProfit), config.roundStep);
}

export interface MarginInfo {
  cost: number;
  retail: number;
  profit: number;
  profitPercent: number;
  multiplier: number;
}

export function getMargin(cost: number, retail: number): MarginInfo {
  const profit = retail - cost;
  return {
    cost,
    retail,
    profit,
    profitPercent: cost > 0 ? (profit / cost) * 100 : 0,
    multiplier: cost > 0 ? retail / cost : 0,
  };
}

/** Ringkasan markup untuk halaman diagnosa. */
export interface PricingSummary {
  tiers: PricingTier[];
  minProfit: number;
  flatMarkupPercent: number;
  averageMultiplier: number;
  cheapestCost: number;
  cheapestRetail: number;
  highest: { cost: number; retail: number };
  /** Layanan dengan margin terendah — dipakai untuk audit. */
  lowestMargin: Array<MarginInfo & { id: number; name: string }>;
}

export function summarizePricing(
  services: Array<{ id: number; name: string; price: number; priceRetail: number }>,
  config: PricingConfig = getPricingConfig(),
): PricingSummary {
  const valid = services.filter((s) => s.price > 0 && s.priceRetail > 0);
  const sorted = [...valid].sort((a, b) => a.price - b.price);

  const totalMultiplier = valid.reduce((sum, s) => sum + s.priceRetail / s.price, 0);
  const lowestMargin = [...valid]
    .map((s) => ({ ...getMargin(s.price, s.priceRetail), id: s.id, name: s.name }))
    .sort((a, b) => a.profitPercent - b.profitPercent)
    .slice(0, 8);

  return {
    tiers: config.tiers,
    minProfit: config.minProfit,
    flatMarkupPercent: config.flatMarkupPercent,
    averageMultiplier: valid.length ? totalMultiplier / valid.length : 0,
    cheapestCost: sorted[0]?.price ?? 0,
    cheapestRetail: sorted[0]?.priceRetail ?? 0,
    highest: {
      cost: sorted[sorted.length - 1]?.price ?? 0,
      retail: sorted[sorted.length - 1]?.priceRetail ?? 0,
    },
    lowestMargin,
  };
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(0)}%`;
}
