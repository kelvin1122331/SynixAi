/**
 * Generator data katalog contoh (fallback / mode demo).
 *
 * Dipakai HANYA bila server tidak dapat menjangkau API panel (mis. saat
 * preview di lingkungan tanpa internet) atau saat `CATALOG_FORCE_OFFLINE=1`.
 *
 * Data di bawah mengikuti pola asli katalog SMM Nusantara: format nama
 * "Platform Category S-N | Maks: 1M | R30 | SuperInstant | 100K/Days",
 * struktur kategori "Platform - Kategori | Varian", dan rentang harga
 * per 1.000 (IDR) sesuai pengamatan langsung pada panel.
 *
 * Jalankan: node scripts/generate-sample.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const outFile = path.join(process.cwd(), "data", "services.sample.json");

const BOILERPLATE =
  "⚠️ Mohon Baca Deskripsi ⚠️</p>\nTarget : {TARGET}</p>\nCatatan:\r\n" +
  "- Saat Server sibuk, kecepatan bisa berubah.\r\n" +
  "- Jangan melakukan pemesanan kedua pada link yang sama sebelum pesanan Anda selesai di sistem.\r\n" +
  "- Jika ada masalah dengan layanan, silakan hubungi dukungan.</span></pre>";

const TARGET_MAP = {
  profile: "Link/Username",
  post: "Link POST",
  video: "Link VT",
  live: "Link Live",
  channel: "Link Channel",
  product: "Link Produk",
  store: "Link Toko",
  song: "Link Lagu",
  place: "Link Google Maps",
  website: "Link Website",
  story: "Link Story",
  reel: "Link Reels",
  comment: "Link POST",
};

/* Layanan asli yang terbaca langsung dari API panel (11 Sep 2026). */
const REAL_SERVICES = [
  { id: 3087, name: "🇮🇩 TikTok Views Indonesia S-1 | Maks: 100K | R30 | 1M/Days 🔥⚡⭐️♻️", category: "Tiktok - Views | Indonesia 🇮🇩", price: 1820, min: 100, max: 100000, refill: 0, target: "video" },
  { id: 6622, name: "Instagram Comments Random S-2 | Maks: 100K 🔥⚡⭐️", category: "Instagram - Comments | Random", price: 87336, min: 10, max: 1090000, refill: 0, target: "post" },
  { id: 6624, name: "Instagram Comments Random S-1 | Maks: 100K | Positive Emoji 🔥⚡⭐️", category: "Instagram - Comments | Random", price: 87336, min: 10, max: 100000, refill: 0, target: "post" },
  { id: 6806, name: "TikTok Followers S-8 | Maks: 10M | HIgh-Quality | UltraFast | 100K/Days 🔥⚡", category: "Tiktok - Followers | Tidak Garansi", price: 49492, min: 10, max: 10000000, refill: 0, target: "profile" },
  { id: 6807, name: "TikTok Followers S-4 | Maks: 1M | Real-Quality | SuperInstant | 100K/Days⚡🔥 ⭐", category: "Tiktok - Followers | Tidak Garansi", price: 30568, min: 10, max: 1000000, refill: 0, target: "profile" },
  { id: 6809, name: "TikTok Followers S-155 | Maks: 5M | Real-Quality | R90 | SuperInstant | 100K/Days 🔥⚡♻️", category: "Tiktok - Followers | Garansi (SuperFast)", price: 54149, min: 10, max: 5000000, refill: 1, target: "profile" },
  { id: 6810, name: "TikTok Followers S-7 | Maks: 500K | Real-Quality | Low Drop | NR | SuperInstant | 50K/Days 🔥⚡⭐️", category: "Tiktok - Followers | Tidak Garansi", price: 48831, min: 10, max: 500000, refill: 0, target: "profile" },
  { id: 6813, name: "TikTok Followers S-68 | Maks: 1M | High-Quality | + Photo | Less Drop | R30 | 100K/Days 🔥⚡♻️", category: "Tiktok - Followers | Garansi (SuperFast)", price: 50656, min: 10, max: 1000000, refill: 0, target: "profile" },
  { id: 6815, name: "TikTok Followers S-170 | Maks: 5M | Real-Quality | Low Drop | R30 | SuperInstant | 100K/Days 🔥⚡⭐️♻️", category: "Tiktok - Followers | Garansi (SuperFast)", price: 53858, min: 10, max: 5000000, refill: 0, target: "profile" },
  { id: 6823, name: "TikTok Followers S-8 | Maks: 500K | High-Quality | R30 | 𝗥𝗘𝗖𝗢𝗠𝗠𝗘𝗡𝗗𝗘𝗗 | 10K/Days 🔥⚡♻️", category: "Tiktok - Followers | Garansi (SuperFast)", price: 51530, min: 10, max: 500000, refill: 1, target: "profile" },
  { id: 6825, name: "TikTok Followers S-14 | Maks: 1M | High-Quality | + Photo | Less Drop | R60 | 100K/Days 🔥⚡♻️", category: "Tiktok - Followers | Garansi (SuperFast)", price: 50365, min: 10, max: 1000000, refill: 1, target: "profile" },
  { id: 8093, name: "Facebook Page / Profile Followers S-5 | Maks: 50K | Non Drop | R30 | 50K/Days 🔥⚡♻️", category: "Facebook - Profile & Page | Followers", price: 24455, min: 10, max: 50000, refill: 0, target: "profile" },
  { id: 8094, name: "Whatsapp Channel Members S-1 | Maks: 5K | HQ Profiles | SuperInstant 🔥⚡⭐", category: "Whatsapp - Channel | Members", price: 103932, min: 10, max: 50000, refill: 0, target: "channel" },
  { id: 8091, name: "Instagram Followers S-170 | Maks: 100K | High-Quality | R365 | SuperInstant | 50K/Days 🔥⚡⭐️♻️", category: "Instagram - Followers | Garansi", price: 19215, min: 10, max: 100000, refill: 0, target: "profile" },
  { id: 9623, name: "Instagram Followers S-128 | Maks: 1M | Old-Quality | Low Drop | NR | SuperInstant | 200K/Days 🔥⚡⭐️🥇", category: "Instagram - Followers | Recommended 🏆 ᴺᴱᵂ", price: 39012, min: 10, max: 1000000, refill: 0, target: "profile" },
  { id: 9634, name: "TikTok Likes S-82 | Maks: 10M | High-Quality | Less Drop | R90 | SuperInstant | 100K/Day 🔥⚡⭐️♻️", category: "Tiktok - Likes", price: 6696, min: 5, max: 10000000, refill: 0, target: "video" },
  { id: 9635, name: "TikTok Likes S-83 | Maks: 500K | Mix-Quality | R60 | SuperInstant | 100K/Days 🔥⚡♻️", category: "Tiktok - Likes", price: 5533, min: 10, max: 500000, refill: 1, target: "video" },
  { id: 9638, name: "Instagram Followers S-81 | Maks: 1M | High-Quality | + Post | Low Drop | NR | 𝗥𝗘𝗖𝗢𝗠𝗠𝗘𝗡𝗗𝗘𝗗 | 100K/Days 🔥⚡🥇", category: "Instagram - Followers | Tidak Garansi", price: 32024, min: 10, max: 1000000, refill: 0, target: "profile" },
  { id: 9639, name: "Instagram Followers S-177 | Maks: 1M | High-Quality | R30 | SuperInstant | 200K/Days 🔥⚡⭐️♻️", category: "Instagram - Followers | Garansi", price: 42141, min: 100, max: 1000000, refill: 1, target: "profile" },
  { id: 9643, name: "Instagram Likes S-21 | Maks: 1M | Mix Account | NR | 100K/Days 🔥⚡⭐️", category: "Instagram - Likes | Bot (SuperCheap)", price: 7861, min: 50, max: 200000, refill: 0, target: "post" },
  { id: 10541, name: "Instagram Followers S-101 | Maks: 5M | Recommended | Real-Quality | +Post | NR | SuperInstant | 200K/Days 🔥⚡⭐️", category: "Instagram - Followers | Recommended 🏆 ᴺᴱᵂ", price: 10549, min: 10, max: 5000000, refill: 0, target: "profile" },
  { id: 10528, name: "TikTok Followers S-244 | Maks: 1M | High-Quality | R365 | SuperInstant | 200K/Days 🔥⚡⭐️♻️", category: "Tiktok - Followers | Garansi (SuperFast)", price: 93450, min: 10, max: 1000000, refill: 0, target: "profile" },
  { id: 10530, name: "TikTok Live Stream Views | Maks: 50K | Real-Quality | SuperInstant | 15 Minutes 🔥⚡⭐", category: "Tiktok - Live Stream | Views S-18 (Stabil)", price: 18924, min: 50, max: 50000, refill: 0, target: "live" },
  { id: 10535, name: "TikTok Live Stream Views | Maks: 50K | Real-Quality | SuperInstant | 120 Minutes 🔥⚡⭐", category: "Tiktok - Live Stream | Views S-18 (Stabil)", price: 151383, min: 50, max: 50000, refill: 0, target: "live" },
  { id: 9625, name: "YouTube Live Stream | Maks: 500K | SuperInstant | 1 Day 🔥⚡⭐️", category: "Youtube - Live Stream | Views S-6 (UltraCheap)", price: 1339152, min: 50, max: 500000, refill: 0, target: "live" },
];

/**
 * Template kategori: [platform, kategori, varian, target, harga minimum, harga maksimum]
 * Harga per 1.000 unit dalam Rupiah, mengikuti rentang nyata di panel.
 */
const TEMPLATES = [
  ["Instagram", "Followers", "Garansi", "profile", 12000, 45000],
  ["Instagram", "Followers", "Tidak Garansi", "profile", 8000, 35000],
  ["Instagram", "Followers", "Recommended 🏆 ᴺᴱᵂ", "profile", 10000, 40000],
  ["Instagram", "Likes", "Bot (SuperCheap)", "post", 3000, 12000],
  ["Instagram", "Likes", "Real (Garansi)", "post", 12000, 40000],
  ["Instagram", "Views", "Reels (Instant)", "reel", 1200, 8000],
  ["Instagram", "Views", "Story", "story", 2000, 10000],
  ["Instagram", "Comments", "Random", "comment", 45000, 95000],
  ["Instagram", "Comments", "Custom", "comment", 60000, 140000],
  ["Instagram", "Saves", "Instant", "post", 4000, 15000],
  ["Instagram", "Shares", "Instant", "post", 4000, 15000],

  ["Tiktok", "Followers", "Garansi (SuperFast)", "profile", 30000, 95000],
  ["Tiktok", "Followers", "Tidak Garansi", "profile", 22000, 60000],
  ["Tiktok", "Followers", "Indonesia 🇮🇩", "profile", 45000, 120000],
  ["Tiktok", "Likes", "Instant", "video", 3500, 26000],
  ["Tiktok", "Likes", "Real (Garansi)", "video", 15000, 45000],
  ["Tiktok", "Views", "Indonesia 🇮🇩", "video", 1500, 6000],
  ["Tiktok", "Views", "Global (Instan)", "video", 800, 4000],
  ["Tiktok", "Shares", "Instant", "video", 3000, 12000],
  ["Tiktok", "Saves", "Instant", "video", 3000, 12000],
  ["Tiktok", "Comments", "Random", "comment", 35000, 90000],
  ["Tiktok", "Live Stream | Views S-18 (Stabil)", "Real-Quality", "live", 15000, 320000],
  ["Tiktok", "Story Views", "Instant", "profile", 2500, 9000],

  ["Youtube", "Subscribers", "Garansi R365", "channel", 120000, 480000],
  ["Youtube", "Subscribers", "Tidak Garansi", "channel", 85000, 260000],
  ["Youtube", "Views", "Monetisasi (Aman)", "video", 12000, 65000],
  ["Youtube", "Views", "UltraCheap", "video", 4500, 18000],
  ["Youtube", "Likes", "Instant", "video", 6000, 30000],
  ["Youtube", "Comments", "Random", "video", 45000, 150000],
  ["Youtube", "Watch Time | 4.000 Jam", "Non Drop", "video", 45000, 120000],
  ["Youtube", "Shorts Views", "Instant", "video", 2500, 15000],
  ["Youtube", "Premiere Views", "Instant", "video", 9000, 40000],

  ["Facebook", "Profile & Page | Followers", "Non Drop", "profile", 12000, 45000],
  ["Facebook", "Page Likes", "Real (Garansi)", "profile", 14000, 55000],
  ["Facebook", "Post Likes", "Instant", "post", 5000, 22000],
  ["Facebook", "Views", "Video (Instant)", "video", 2000, 12000],
  ["Facebook", "Live Stream | Views", "Instant", "live", 12000, 90000],
  ["Facebook", "Comments", "Random", "post", 40000, 130000],
  ["Facebook", "Group Members", "HQ Profile", "profile", 25000, 90000],

  ["Twitter", "Followers", "Real (Non Drop)", "profile", 35000, 130000],
  ["Twitter", "Likes", "Instant", "post", 9000, 40000],
  ["Twitter", "Retweets", "Instant", "post", 9000, 45000],
  ["Twitter", "Views", "Instant", "post", 1500, 7000],
  ["Twitter / X", "Followers", "Indonesia 🇮🇩", "profile", 45000, 160000],

  ["Telegram", "Members", "Real (Non Drop)", "channel", 45000, 190000],
  ["Telegram", "Channel Members", "HQ Profile", "channel", 38000, 150000],
  ["Telegram", "Post Views", "Instant", "post", 1200, 8000],
  ["Telegram", "Reactions", "Positive", "post", 8000, 45000],

  ["Whatsapp", "Channel | Members", "HQ Profiles", "channel", 65000, 160000],
  ["Whatsapp", "Group Members", "Indonesia 🇮🇩", "channel", 70000, 190000],

  ["Shopee", "Followers", "Real (Non Drop)", "store", 15000, 55000],
  ["Shopee", "Product Favorites", "Instant", "product", 6000, 25000],
  ["Shopee", "Live Stream | Viewers", "Instant", "live", 9000, 45000],
  ["Shopee", "Product Reviews", "Random", "product", 65000, 180000],

  ["Tokopedia", "Followers", "Real (Garansi)", "store", 18000, 60000],
  ["Tokopedia", "Product Favorites", "Instant", "product", 7000, 26000],

  ["Spotify", "Plays", "Real (Aman)", "song", 4000, 20000],
  ["Spotify", "Followers", "Real", "profile", 20000, 70000],
  ["Spotify", "Monthly Listeners", "HQ", "profile", 35000, 120000],

  ["Threads", "Followers", "Non Drop", "profile", 25000, 90000],
  ["Threads", "Likes", "Instant", "post", 6000, 25000],
  ["Threads", "Views", "Instant", "post", 2000, 9000],

  ["LinkedIn", "Followers", "HQ Profile", "profile", 55000, 200000],
  ["LinkedIn", "Post Likes", "Instant", "post", 15000, 65000],

  ["Google", "Reviews | 5 Bintang", "Manual (Garansi)", "place", 250000, 900000],
  ["Google", "Maps Views", "Instant", "place", 3500, 15000],

  ["Website", "Traffic | Indonesia 🇮🇩", "SEO Friendly", "website", 3000, 25000],
  ["Website", "Traffic | Global", "SEO Friendly", "website", 2500, 18000],
  ["Website", "Backlink", "High DA", "website", 150000, 500000],

  ["Snackvideo", "Followers", "Instant", "profile", 15000, 60000],
  ["Snackvideo", "Likes", "Instant", "video", 4000, 18000],
  ["Likee", "Followers", "Instant", "profile", 18000, 70000],
  ["Likee", "Likes", "Instant", "video", 5000, 20000],
  ["Netflix", "Premium Account", "Private (Garansi)", "profile", 25000, 90000],
  ["Discord", "Members", "Real (Non Drop)", "channel", 35000, 140000],
  ["Twitch", "Followers", "Non Drop", "profile", 25000, 95000],
];

/** PRNG deterministik supaya hasil generate selalu sama. */
function mulberry32(seed) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20260911);
const pick = (arr) => arr[Math.floor(random() * arr.length)];
const between = (min, max) => Math.round(min + random() * (max - min));

const QUALITY_WORDS = ["High-Quality", "Real-Quality", "Old-Quality", "Mix-Quality", "SuperInstant", "UltraFast"];
const REFILL_WORDS = ["R30", "R60", "R90", "R365", "LifeTime", "NR"];
const SPEEDS = ["10K/Days", "50K/Days", "100K/Days", "200K/Days", "500K/Days", "1M/Days"];
const MAX_LABELS = ["100K", "500K", "1M", "5M", "10M"];
const EMOJIS = ["🔥", "⚡", "⭐️", "♻️", "💎", "🥇"];
const MIN_OPTIONS = [5, 10, 50, 100, 500];

function buildName(platform, category, index, price) {
  const parts = [`${platform} ${category} S-${index}`];
  const max = pick(MAX_LABELS);
  parts.push(`Maks: ${max}`);
  const quality = [];
  if (random() > 0.35) quality.push(pick(QUALITY_WORDS));
  if (random() > 0.7) quality.push("Low Drop");
  if (quality.length) parts.push(quality.join(" | "));
  if (random() > 0.3) parts.push(pick(REFILL_WORDS));
  if (random() > 0.35) parts.push(pick(SPEEDS));
  const emoji = random() > 0.4 ? " " + Array.from({ length: between(1, 3) }, () => pick(EMOJIS)).join("") : "";
  return `${parts.join(" | ")}${emoji}`;
}

function buildMin(price, target) {
  if (target === "live") return pick([50, 100, 250]);
  if (price >= 100000) return pick([10, 25, 50]);
  if (price >= 40000) return pick([10, 50, 100]);
  return pick(MIN_OPTIONS);
}

function maxFor(label) {
  const map = { "100K": 100000, "500K": 500000, "1M": 1000000, "5M": 5000000, "10M": 10000000 };
  return map[label] ?? 1000000;
}

const services = [];
let nextId = 12000;

// 1) Masukkan layanan asli hasil pembacaan API.
for (const item of REAL_SERVICES) {
  services.push({
    id: item.id,
    name: item.name,
    type: "default",
    category: item.category,
    price: item.price,
    min: item.min,
    max: item.max,
    refill: item.refill,
    description: BOILERPLATE.replace("{TARGET}", TARGET_MAP[item.target] ?? "Link/Username"),
  });
}

// 2) Generate variasi realistis per kategori.
for (const [platform, category, variant, target, priceMin, priceMax] of TEMPLATES) {
  const count = between(3, 6);
  for (let i = 0; i < count; i += 1) {
    const price = between(priceMin, priceMax);
    const catName = category.includes("|") ? category : `${category} | ${variant}`;
    const maxLabel = pick(MAX_LABELS);
    services.push({
      id: nextId++,
      name: buildName(platform, category.split("|")[0].trim(), between(1, 320), price),
      type: "default",
      category: `${platform} - ${catName}`,
      price,
      min: buildMin(price, target),
      max: maxFor(maxLabel),
      refill: random() > 0.55 ? 1 : 0,
      description: BOILERPLATE.replace("{TARGET}", TARGET_MAP[target] ?? "Link/Username"),
    });
  }
}

mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(services, null, 2));
console.log(`✅ ${services.length} layanan contoh ditulis ke ${path.relative(process.cwd(), outFile)}`);
