import { promises as fs } from "node:fs";
import path from "node:path";
import { fetchPanelServices, getCredentials } from "./smm";
import { resolvePlatform, getPlatform, PLATFORM_PRIORITY } from "./platforms";
import { parseLooseNumber } from "./format";
import type { Catalog, RawPanelService, Service } from "./types";

/* ==========================================================================
 *  Normalisasi katalog
 *  Mengubah data mentah panel menjadi struktur yang rapi untuk UI.
 * ========================================================================== */

const BOILERPLATE_PATTERNS: RegExp[] = [
  /saat server sibuk/i,
  /jangan melakukan pemesanan kedua/i,
  /jika ada masalah dengan layanan/i,
  /silakan hubungi dukungan/i,
  /^mohon baca deskripsi/i,
  /^catatan\s*:?\s*$/i,
  /^target\s*:\s*$/i,
];

/** Ubah karakter Unicode "dekoratif" (𝗯𝗼𝗹𝗱, 𝘪𝘵𝘢𝘭𝓲𝓬, dll.) menjadi huruf biasa. */
function decorativeToAscii(input: string): string {
  let out = "";
  for (const ch of input) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp >= 0x1d400 && cp < 0x1d800) {
      out += String.fromCharCode(97 + ((cp - 0x1d400) % 26));
    } else {
      out += ch;
    }
  }
  return out;
}

/** Hapus tag HTML dan decode entitas umum. */
export function stripHtml(input?: string | null): string {
  if (!input) return "";
  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|span|pre|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\r/g, "");
}

/** Hapus emoji & simbol dekoratif dari nama layanan. */
export function stripEmoji(input: string): string {
  return input
    .replace(/[\u{1F000}-\u{1FAFF}]/gu, " ")
    .replace(/[\u{2190}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu, " ")
    .replace(/[\u{1D400}-\u{1D7FF}]/gu, " ")
    .replace(/[★☆✔✅❌⚡🔥💎🎯🎁🏆🥇⚠️]/gu, " ");
}

/** Rapikan nama layanan: buang emoji, spasi ganda, dan tanda pemisah berlebih. */
function cleanDisplayName(raw: string): string {
  const without = stripEmoji(decorativeToAscii(raw))
    .replace(/\s*\|\s*/g, " | ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s|]+|[\s|]+$/g, "")
    .trim();
  return without || raw.trim();
}

/** Deskripsi bersih tanpa boilerplate panel. */
function cleanDescription(raw?: string | null): string {
  const text = stripHtml(raw);
  if (!text.trim()) return "";
  const lines = text
    .split("\n")
    .map((l) => l.replace(/\s{2,}/g, " ").trim())
    .filter((l) => l.length > 0)
    .filter((l) => !BOILERPLATE_PATTERNS.some((p) => p.test(l)));
  // Buang duplikat berturut-turut.
  const unique: string[] = [];
  for (const line of lines) {
    if (unique[unique.length - 1] !== line) unique.push(line);
  }
  return unique.join("\n").slice(0, 1200).trim();
}

function extractTargetHint(description: string): string | null {
  const match = description.match(/target\s*:?\s*([^\n]{2,80})/i);
  if (!match) return null;
  return match[1].replace(/\s{2,}/g, " ").trim();
}

/** Deteksi lama garansi dari teks (R30 = 30 hari, R365 = 365 hari, LifeTime). */
function detectRefillDays(text: string): number | null {
  if (/lifetime|seumur hidup/i.test(text)) return 36500;
  const match = text.match(/\bR(\d{1,4})\b/i);
  if (match) {
    const days = Number.parseInt(match[1], 10);
    return Number.isFinite(days) ? days : null;
  }
  return null;
}

function detectQuality(text: string): string[] {
  const t = text.toLowerCase();
  const out: string[] = [];
  const map: Array<[RegExp, string]> = [
    [/high[- ]?quality|\bhq\b/, "High Quality"],
    [/real[- ]?quality|100% real|\breal\b/, "Real"],
    [/old[- ]?quality|\bold\b/, "Old Account"],
    [/mix[- ]?quality|\bmix\b/, "Mix"],
    [/bot\b/, "Bot"],
    [/\bnr\b|no refill/, "No Refill"],
    [/low drop|less drop|non[- ]?drop|no drop/, "Low Drop"],
    [/ultracheap|supercheap|termurah|cheap|murah/, "Hemat"],
    [/instant|superfast|super instant|ultrafast/, "Instan"],
    [/recommended|rekomendasi|top\b|best\b/, "Rekomendasi"],
  ];
  for (const [re, label] of map) {
    if (re.test(t) && !out.includes(label)) out.push(label);
  }
  return out;
}

function detectSpeed(text: string): string | null {
  const match = text.match(/(\d+(?:[.,]\d+)?\s*[KMB]?)\s*\/\s*(days?|hari|day)/i);
  if (!match) return null;
  return `${match[1].toUpperCase().replace(/\s+/g, "")}/hari`;
}

function detectMax(text: string, fallback: number): number {
  const match = text.match(/maks(?:imal)?\s*:?\s*([\d.,]+\s*[KMB]?)/i);
  if (!match) return fallback;
  const parsed = parseLooseNumber(match[1]);
  return parsed > 0 ? parsed : fallback;
}

function buildBadges(input: {
  refill: boolean;
  refillDays: number | null;
  instant: boolean;
  quality: string[];
  max: number;
  speed: string | null;
  recommended: boolean;
}): string[] {
  const badges: string[] = [];
  if (input.recommended || input.quality.includes("Rekomendasi")) badges.push("★ Rekomendasi");
  if (input.instant || input.quality.includes("Instan")) badges.push("⚡ Instan");
  if (input.refill) {
    badges.push(input.refillDays && input.refillDays >= 36500 ? "♾️ Lifetime" : `🔁 Garansi${input.refillDays ? ` R${input.refillDays}` : ""}`);
  } else if (input.refillDays) {
    badges.push(`♻️ Refill R${input.refillDays}`);
  }
  if (input.quality.includes("High Quality")) badges.push("💎 HQ");
  else if (input.quality.includes("Real")) badges.push("✅ Real");
  else if (input.quality.includes("Old Account")) badges.push("🕰️ Old");
  if (input.quality.includes("Low Drop")) badges.push("📉 Low Drop");
  if (input.quality.includes("Hemat")) badges.push("💰 Hemat");
  if (input.max >= 1_000_000) badges.push(`📈 Maks ${maxLabel(input.max)}`);
  if (input.speed) badges.push(`🚀 ${input.speed}`);
  return Array.from(new Set(badges)).slice(0, 6);
}

function maxLabel(n: number): string {
  if (n >= 1_000_000_000) return `${Math.round(n / 100_000_000) / 10}B`.replace(".0", "");
  if (n >= 1_000_000) return `${Math.round(n / 100_000) / 10}M`.replace(".0", "");
  if (n >= 1_000) return `${Math.round(n / 100) / 10}K`.replace(".0", "");
  return String(n);
}

/** Markup & pembulatan harga jual dari env (dipanggil sekali per normalisasi). */
function retailPrice(base: number): number {
  const markup = Number(process.env.NEXT_PUBLIC_PRICE_MARKUP ?? 0);
  const rounding = Number(process.env.NEXT_PUBLIC_PRICE_ROUNDING ?? 0);
  let value = base * (1 + (Number.isFinite(markup) ? markup : 0) / 100);
  if (Number.isFinite(rounding) && rounding > 0) {
    value = Math.ceil(value / rounding) * rounding;
  }
  return Math.round(value);
}

export function normalizeService(raw: RawPanelService): Service {
  const rawName = String(raw.name ?? "").trim();
  const decorated = decorativeToAscii(rawName);
  const searchText = `${decorated} ${raw.category ?? ""}`;

  const categoryRaw = String(raw.category ?? "").trim();
  const [groupPart, ...variantParts] = categoryRaw.split("|");
  const variant = variantParts.join(" | ").trim();
  const [platformPart, ...categoryParts] = groupPart.split("-");
  const platform = resolvePlatform(platformPart?.trim() ?? "");
  const category = (categoryParts.join("-").trim() || groupPart.trim() || "Layanan") || "Layanan";

  const description = cleanDescription(raw.description);
  const price = Math.max(0, Math.round(Number(raw.price ?? 0) || 0));
  const min = Math.max(1, Math.round(parseLooseNumber(raw.min) || 1));
  const maxRaw = Math.max(min, Math.round(parseLooseNumber(raw.max) || min));
  const max = detectMax(decorated, maxRaw);
  const refill = raw.refill === 1 || raw.refill === true || String(raw.refill) === "1";
  const refillDays = detectRefillDays(decorated + " " + categoryRaw);
  const quality = detectQuality(searchText);
  const instant = /super ?instant|instant|ultrafast|superfast/i.test(searchText);
  const speed = detectSpeed(decorated);
  const recommended = /recommended|rekomendasi/i.test(decorativeToAscii(searchText).toLowerCase());

  const name = cleanDisplayName(rawName);
  const shortName = (name.split("|")[0] ?? name).trim();

  const score =
    (recommended ? 45 : 0) +
    (instant ? 25 : 0) +
    (refill ? 22 : 0) +
    (quality.includes("High Quality") || quality.includes("Real") ? 12 : 0) +
    (quality.includes("Low Drop") ? 8 : 0) +
    (speed ? 6 : 0) +
    (max >= 1_000_000 ? 6 : 0) +
    (price > 0 && price <= 15000 ? 10 : 0);

  return {
    id: Number(raw.id),
    name: shortName,
    fullName: name,
    categoryRaw,
    platform: platform.key,
    platformLabel: platform.label,
    category,
    variant,
    type: String(raw.type ?? "default"),
    price,
    priceRetail: retailPrice(price),
    min,
    max,
    refill,
    refillDays,
    instant,
    quality,
    speed,
    badges: buildBadges({ refill, refillDays, instant, quality, max, speed, recommended }),
    description,
    targetHint: extractTargetHint(description),
    score,
  };
}

/* ==========================================================================
 *  Sumber data + cache
 * ========================================================================== */

interface CacheEntry {
  catalog: Catalog;
  expiresAt: number;
}

let cache: CacheEntry | null = null;
let inflight: Promise<Catalog> | null = null;

function ttlMs(): number {
  const seconds = Number(process.env.CATALOG_REVALIDATE_SECONDS ?? 600);
  return (Number.isFinite(seconds) && seconds > 0 ? seconds : 600) * 1000;
}

async function readJsonFile(fileName: string): Promise<Service[] | null> {
  try {
    const filePath = path.join(process.cwd(), "data", fileName);
    const content = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(content) as unknown;
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { services?: unknown[] })?.services)
        ? (parsed as { services: unknown[] }).services
        : null;
    if (!list || !list.length) return null;
    // File snapshot sudah berisi layanan ternormalisasi; normalisasi ulang agar aman.
    return (list as RawPanelService[]).map((item) => normalizeService(item));
  } catch {
    return null;
  }
}

/**
 * Ambil katalog dengan urutan prioritas:
 *  1. Cache memori (masih segar)
 *  2. API panel (data real-time)
 *  3. data/services.json (hasil `npm run sync:catalog`)
 *  4. data/services.sample.json (mode demo)
 */
export async function getCatalog(options: { force?: boolean } = {}): Promise<Catalog> {
  if (!options.force && cache && cache.expiresAt > Date.now()) {
    return cache.catalog;
  }
  if (inflight) return inflight;

  inflight = (async (): Promise<Catalog> => {
    const forceOffline = process.env.CATALOG_FORCE_OFFLINE === "1";
    const { configured } = getCredentials();
    let error: string | null = null;

    // 1) Panel (real-time)
    if (!forceOffline && configured) {
      const res = await fetchPanelServices();
      if (res.ok) {
        const services = res.data
          .map(normalizeService)
          .filter((s) => Number.isFinite(s.id) && s.id > 0 && s.priceRetail >= 0);
        if (services.length) {
          const catalog: Catalog = {
            services,
            source: "panel",
            fetchedAt: new Date().toISOString(),
            error: null,
          };
          cache = { catalog, expiresAt: Date.now() + ttlMs() };
          return catalog;
        }
        error = "Panel mengembalikan katalog kosong.";
      } else {
        error = res.error;
      }
    } else if (!configured) {
      error = "Kredensial panel (SMM_API_ID / SMM_API_KEY) belum diisi — memakai data lokal.";
    }

    // 2) Snapshot hasil sync
    const snapshot = await readJsonFile("services.json");
    if (snapshot?.length) {
      const catalog: Catalog = {
        services: snapshot,
        source: "snapshot",
        fetchedAt: new Date().toISOString(),
        error,
      };
      cache = { catalog, expiresAt: Date.now() + ttlMs() };
      return catalog;
    }

    // 3) Data demo
    const demo = (await readJsonFile("services.sample.json")) ?? [];
    const catalog: Catalog = {
      services: demo,
      source: "demo",
      fetchedAt: new Date().toISOString(),
      error: error ?? "Tidak ada sumber data katalog.",
    };
    cache = { catalog, expiresAt: Date.now() + Math.min(ttlMs(), 60_000) };
    return catalog;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

/** Paksa tarik ulang katalog (dipakai tombol sync di halaman /admin). */
export async function invalidateCatalog(): Promise<Catalog> {
  cache = null;
  return getCatalog({ force: true });
}

/* ==========================================================================
 *  Query, filter, dan agregasi
 * ========================================================================== */

export interface ServiceQuery {
  q?: string;
  platform?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  refillOnly?: boolean;
  instantOnly?: boolean;
  sort?: "populer" | "termurah" | "termahal" | "min" | "maks" | "az";
  page?: number;
  perPage?: number;
}

export interface ServiceQueryResult {
  items: Service[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  facets: {
    platforms: Array<{ key: string; label: string; count: number; color: string }>;
    categories: Array<{ name: string; count: number }>;
    priceRange: { min: number; max: number };
  };
}

export function filterServices(services: Service[], query: ServiceQuery = {}): ServiceQueryResult {
  const {
    q,
    platform,
    category,
    minPrice,
    maxPrice,
    refillOnly,
    instantOnly,
    sort = "populer",
    page = 1,
    perPage = 24,
  } = query;

  let items = services;

  if (platform && platform !== "semua") {
    items = items.filter((s) => s.platform === platform);
  }
  if (category) {
    const target = category.toLowerCase();
    items = items.filter((s) => s.category.toLowerCase() === target);
  }
  if (refillOnly) items = items.filter((s) => s.refill);
  if (instantOnly) items = items.filter((s) => s.instant);
  if (typeof minPrice === "number" && Number.isFinite(minPrice)) {
    items = items.filter((s) => s.priceRetail >= minPrice);
  }
  if (typeof maxPrice === "number" && Number.isFinite(maxPrice) && maxPrice > 0) {
    items = items.filter((s) => s.priceRetail <= maxPrice);
  }
  if (q && q.trim().length > 0) {
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    items = items.filter((s) => {
      const haystack = `${s.name} ${s.category} ${s.variant} ${s.platformLabel} ${s.id}`.toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    });
  }

  const sorted = [...items];
  switch (sort) {
    case "termurah":
      sorted.sort((a, b) => a.priceRetail - b.priceRetail || a.id - b.id);
      break;
    case "termahal":
      sorted.sort((a, b) => b.priceRetail - a.priceRetail || a.id - b.id);
      break;
    case "min":
      sorted.sort((a, b) => a.min - b.min || a.priceRetail - b.priceRetail);
      break;
    case "maks":
      sorted.sort((a, b) => b.max - a.max || a.priceRetail - b.priceRetail);
      break;
    case "az":
      sorted.sort((a, b) => a.name.localeCompare(b.name, "id"));
      break;
    default:
      sorted.sort((a, b) => b.score - a.score || a.priceRetail - b.priceRetail);
  }

  const safePerPage = Math.min(Math.max(perPage, 1), 96);
  const totalPages = Math.max(1, Math.ceil(sorted.length / safePerPage));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * safePerPage;

  // Facet dihitung dari hasil filter sebelum paginasi (tanpa filter platform/category
  // agar angka chip tetap stabil saat pengguna berpindah filter).
  const facetBase = services;
  const platformCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  for (const s of facetBase) {
    platformCounts.set(s.platform, (platformCounts.get(s.platform) ?? 0) + 1);
  }
  const relevant = platform && platform !== "semua" ? facetBase.filter((s) => s.platform === platform) : facetBase;
  for (const s of relevant) {
    categoryCounts.set(s.category, (categoryCounts.get(s.category) ?? 0) + 1);
  }

  const prices = facetBase.map((s) => s.priceRetail).filter((p) => p > 0);

  return {
    items: sorted.slice(start, start + safePerPage),
    total: sorted.length,
    page: safePage,
    perPage: safePerPage,
    totalPages,
    facets: {
      platforms: PLATFORM_PRIORITY.filter((key) => platformCounts.has(key)).map((key) => {
        const meta = getPlatform(key);
        return { key, label: meta.label, count: platformCounts.get(key) ?? 0, color: meta.color };
      }),
      categories: [...categoryCounts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "id"))
        .slice(0, 60),
      priceRange: {
        min: prices.length ? Math.min(...prices) : 0,
        max: prices.length ? Math.max(...prices) : 0,
      },
    },
  };
}

export function getServiceById(services: Service[], id: number): Service | undefined {
  return services.find((s) => s.id === id);
}

/** Layanan terkait: satu platform + kategori sama, harga berdekatan. */
export function getRelatedServices(services: Service[], service: Service, limit = 8): Service[] {
  const sameGroup = services.filter(
    (s) => s.id !== service.id && s.platform === service.platform && s.category === service.category,
  );
  sameGroup.sort((a, b) => Math.abs(a.priceRetail - service.priceRetail) - Math.abs(b.priceRetail - service.priceRetail));
  if (sameGroup.length >= limit) return sameGroup.slice(0, limit);
  const samePlatform = services
    .filter((s) => s.id !== service.id && s.platform === service.platform && !sameGroup.includes(s))
    .sort((a, b) => b.score - a.score);
  return [...sameGroup, ...samePlatform].slice(0, limit);
}

export interface CatalogStats {
  totalServices: number;
  totalPlatforms: number;
  totalCategories: number;
  cheapest: Service | null;
  priceFrom: number;
  priceTo: number;
  refillCount: number;
  featured: Service[];
}

export function getCatalogStats(services: Service[]): CatalogStats {
  const withPrice = services.filter((s) => s.priceRetail > 0);
  const prices = withPrice.map((s) => s.priceRetail);
  const platforms = new Set(services.map((s) => s.platform));
  const categories = new Set(services.map((s) => `${s.platform}:${s.category}`));
  const cheapest = withPrice.length
    ? withPrice.reduce((min, s) => (s.priceRetail < min.priceRetail ? s : min), withPrice[0])
    : null;

  const featured = [...services]
    .sort((a, b) => b.score - a.score || a.priceRetail - b.priceRetail)
    .filter((s) => s.platform !== "lainnya")
    .slice(0, 12);

  return {
    totalServices: services.length,
    totalPlatforms: platforms.size,
    totalCategories: categories.size,
    cheapest,
    priceFrom: prices.length ? Math.min(...prices) : 0,
    priceTo: prices.length ? Math.max(...prices) : 0,
    refillCount: services.filter((s) => s.refill).length,
    featured,
  };
}

/** Pilih layanan populer untuk tiap platform (dipakai di landing page). */
export function getTopByPlatform(services: Service[], perPlatform = 4, limitPlatforms = 6): Array<{ platform: string; label: string; items: Service[] }> {
  const groups: Array<{ platform: string; label: string; items: Service[] }> = [];
  for (const key of PLATFORM_PRIORITY) {
    if (key === "lainnya") continue;
    const items = services
      .filter((s) => s.platform === key && s.priceRetail > 0)
      .sort((a, b) => b.score - a.score || a.priceRetail - b.priceRetail)
      .slice(0, perPlatform);
    if (items.length >= 2) {
      groups.push({ platform: key, label: items[0].platformLabel, items });
    }
    if (groups.length >= limitPlatforms) break;
  }
  return groups;
}

/** Daftar layanan termurah per kategori (untuk section "harga mulai"). */
export function getCheapestByCategory(services: Service[], limit = 8): Service[] {
  const map = new Map<string, Service>();
  for (const s of services) {
    if (s.priceRetail <= 0) continue;
    const key = `${s.platform}:${s.category}`;
    const current = map.get(key);
    if (!current || s.priceRetail < current.priceRetail) map.set(key, s);
  }
  return [...map.values()].sort((a, b) => a.priceRetail - b.priceRetail).slice(0, limit);
}

/**
 * Bentuk layanan yang aman dikirim ke browser (komponen client).
 * Harga modal panel (`price`) diganti dengan harga jual sehingga biaya
 * kulakan tidak pernah terekspos ke pengunjung / pesaing.
 */
export function toPublicService(service: Service): Service {
  return { ...service, price: service.priceRetail };
}

export function toPublicServices(services: Service[]): Service[] {
  return services.map(toPublicService);
}
