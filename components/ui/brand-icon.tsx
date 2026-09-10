import {
  siDiscord, siFacebook, siGoogle, siInstagram, siNetflix, siShopee, siSpotify,
  siTelegram, siThreads, siTiktok, siTwitch, siWhatsapp, siX, siYoutube,
} from "simple-icons";
import { cn } from "@/lib/cn";

/**
 * Ikon brand resmi (SVG path dari paket `simple-icons`, tanpa request eksternal).
 * Brand yang tidak tersedia di simple-icons digambar manual (LinkedIn) atau
 * memakai ikon generik dari lucide (lihat platform-icon.tsx).
 */
const BRANDS: Record<string, { path: string; hex: string; title: string }> = {
  instagram: siInstagram,
  tiktok: siTiktok,
  youtube: siYoutube,
  facebook: siFacebook,
  twitter: siX,
  telegram: siTelegram,
  whatsapp: siWhatsapp,
  shopee: siShopee,
  spotify: siSpotify,
  threads: siThreads,
  discord: siDiscord,
  google: siGoogle,
  netflix: siNetflix,
  twitch: siTwitch,
};

/** Path custom untuk brand yang tidak ada di simple-icons. */
const CUSTOM_BRANDS: Record<string, { path: string; hex: string; title: string }> = {
  linkedin: {
    title: "LinkedIn",
    hex: "0A66C2",
    path: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm6 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95C20.4 8.75 21 11 21 14.1V21h-4v-6.1c0-1.45-.03-3.3-2.02-3.3-2.02 0-2.33 1.57-2.33 3.2V21H9V9z",
  },
  tokopedia: {
    title: "Tokopedia",
    hex: "42B549",
    path: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-4.2 4.6a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8zm8.4 0a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8zM12 9.2c2.6 0 4.7 1.4 4.7 3.1 0 1.2-1 2.2-2.6 2.7.6.4 1 1 1 1.7v.9c0 .4-.3.7-.7.7H9.6a.7.7 0 0 1-.7-.7v-.9c0-.7.4-1.3 1-1.7-1.6-.5-2.6-1.5-2.6-2.7 0-1.7 2.1-3.1 4.7-3.1z",
  },
};

export function BrandIcon({
  platform,
  className,
  colored = true,
  title,
}: {
  platform: string;
  className?: string;
  colored?: boolean;
  title?: string;
}) {
  const brand = BRANDS[platform] ?? CUSTOM_BRANDS[platform];
  if (!brand) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={title ?? brand.title}
      className={cn("h-4 w-4", className)}
      style={colored ? { color: `#${brand.hex}` } : undefined}
      fill="currentColor"
    >
      <title>{title ?? brand.title}</title>
      <path d={brand.path} />
    </svg>
  );
}

export function hasBrandIcon(platform: string): boolean {
  return Boolean(BRANDS[platform] ?? CUSTOM_BRANDS[platform]);
}

export const BRAND_HEX: Record<string, string> = Object.fromEntries(
  [...Object.entries(BRANDS), ...Object.entries(CUSTOM_BRANDS)].map(([key, value]) => [key, `#${value.hex}`]),
);
