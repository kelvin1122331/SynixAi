import type { PlatformMeta } from "./types";

/**
 * Metadata platform media sosial yang didukung.
 * Dipakai untuk chip filter, ikon, dan warna aksen.
 */
export const PLATFORMS: PlatformMeta[] = [
  { key: "instagram", label: "Instagram", color: "#E1306C", gradient: "from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]", icon: "Instagram" },
  { key: "tiktok", label: "TikTok", color: "#25F4EE", gradient: "from-[#25F4EE] to-[#FE2C55]", icon: "Music2" },
  { key: "youtube", label: "YouTube", color: "#FF0033", gradient: "from-[#FF0000] to-[#C4001D]", icon: "Youtube" },
  { key: "facebook", label: "Facebook", color: "#1877F2", gradient: "from-[#1877F2] to-[#0A4FB0]", icon: "Facebook" },
  { key: "twitter", label: "Twitter / X", color: "#1DA1F2", gradient: "from-[#1DA1F2] to-[#0B2A3A]", icon: "Twitter" },
  { key: "telegram", label: "Telegram", color: "#229ED9", gradient: "from-[#229ED9] to-[#0E6FA3]", icon: "Send" },
  { key: "whatsapp", label: "WhatsApp", color: "#25D366", gradient: "from-[#25D366] to-[#128C7E]", icon: "MessageCircle" },
  { key: "shopee", label: "Shopee", color: "#EE4D2D", gradient: "from-[#F53D2D] to-[#C73322]", icon: "ShoppingBag" },
  { key: "tokopedia", label: "Tokopedia", color: "#42B549", gradient: "from-[#42B549] to-[#1E7A25]", icon: "Store" },
  { key: "spotify", label: "Spotify", color: "#1DB954", gradient: "from-[#1DB954] to-[#0E7B36]", icon: "AudioLines" },
  { key: "threads", label: "Threads", color: "#8B98F3", gradient: "from-[#8B98F3] to-[#3B3F5C]", icon: "AtSign" },
  { key: "linkedin", label: "LinkedIn", color: "#0A66C2", gradient: "from-[#0A66C2] to-[#064073]", icon: "Linkedin" },
  { key: "discord", label: "Discord", color: "#5865F2", gradient: "from-[#5865F2] to-[#3A44B0]", icon: "Gamepad2" },
  { key: "snackvideo", label: "Snack Video", color: "#F5B800", gradient: "from-[#FFCB00] to-[#E08A00]", icon: "Video" },
  { key: "likee", label: "Likee", color: "#FF5B8A", gradient: "from-[#FF5B8A] to-[#B31E52]", icon: "Heart" },
  { key: "google", label: "Google / SEO", color: "#4285F4", gradient: "from-[#4285F4] to-[#1A46A0]", icon: "Globe" },
  { key: "website", label: "Website / Traffic", color: "#22D3EE", gradient: "from-[#22D3EE] to-[#0E7490]", icon: "Globe" },
  { key: "netflix", label: "Netflix", color: "#E50914", gradient: "from-[#E50914] to-[#7A0409]", icon: "Clapperboard" },
  { key: "twitch", label: "Twitch", color: "#9146FF", gradient: "from-[#9146FF] to-[#5B21B6]", icon: "Twitch" },
  { key: "lainnya", label: "Lainnya", color: "#A855F7", gradient: "from-[#A855F7] to-[#6D28D9]", icon: "Sparkles" },
];

/** Pemetaan alias platform (dari teks kategori panel) ke key internal. */
const PLATFORM_ALIASES: Record<string, string> = {
  tiktok: "tiktok",
  "tik tok": "tiktok",
  douyin: "tiktok",
  instagram: "instagram",
  ig: "instagram",
  insta: "instagram",
  youtube: "youtube",
  yt: "youtube",
  "you tube": "youtube",
  facebook: "facebook",
  fb: "facebook",
  "facebook page": "facebook",
  twitter: "twitter",
  x: "twitter",
  "twitter/x": "twitter",
  telegram: "telegram",
  tg: "telegram",
  whatsapp: "whatsapp",
  wa: "whatsapp",
  shopee: "shopee",
  tokopedia: "tokopedia",
  spotify: "spotify",
  threads: "threads",
  linkedin: "linkedin",
  discord: "discord",
  snackvideo: "snackvideo",
  "snack video": "snackvideo",
  kwai: "snackvideo",
  likee: "likee",
  google: "google",
  "google maps": "google",
  "google review": "google",
  website: "website",
  seo: "website",
  traffic: "website",
  netflix: "netflix",
  twitch: "twitch",
  soundcloud: "lainnya",
  audiomack: "lainnya",
  app: "lainnya",
};

export function resolvePlatform(rawPlatform: string): { key: string; label: string } {
  const normalized = rawPlatform
    .toLowerCase()
    .replace(/[^a-z\s/&]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const key = PLATFORM_ALIASES[normalized] ?? "lainnya";
  const meta = PLATFORMS.find((p) => p.key === key) ?? PLATFORMS[PLATFORMS.length - 1];
  return { key: meta.key, label: meta.label };
}

export function getPlatform(key: string): PlatformMeta {
  return PLATFORMS.find((p) => p.key === key) ?? PLATFORMS[PLATFORMS.length - 1];
}

/** Urutan platform yang ditampilkan lebih dulu di UI. */
export const PLATFORM_PRIORITY: string[] = PLATFORMS.map((p) => p.key);
