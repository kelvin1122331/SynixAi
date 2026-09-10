import {
  AudioLines, Clapperboard, Gamepad2, Globe, Heart, MessageCircle, Music2, Send,
  ShoppingBag, Sparkles, Store, Video,
} from "lucide-react";
import { BrandIcon, hasBrandIcon } from "./brand-icon";
import { getPlatform } from "@/lib/platforms";
import { cn } from "@/lib/cn";

/** Ikon cadangan (lucide) untuk platform yang tidak punya logo brand resmi. */
const FALLBACK_ICONS: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>
> = {
  AudioLines, MessageCircle, ShoppingBag, Store, Gamepad2, Video, Heart, Globe, Clapperboard, Music2, Send, Sparkles,
};

export function PlatformIcon({
  platform,
  className,
  colored = true,
}: {
  platform: string;
  className?: string;
  colored?: boolean;
}) {
  const meta = getPlatform(platform);

  if (hasBrandIcon(meta.key)) {
    return <BrandIcon platform={meta.key} className={className} colored={colored} />;
  }

  const Icon = FALLBACK_ICONS[meta.icon] ?? Sparkles;
  return (
    <Icon
      className={cn("h-4 w-4", className)}
      strokeWidth={2.1}
      style={colored ? { color: meta.color } : undefined}
    />
  );
}

/** Chip platform dengan ikon + label + jumlah layanan (dipakai di filter). */
export function PlatformChip({
  platform,
  label,
  count,
  active,
  className,
}: {
  platform: string;
  label?: string;
  count?: number;
  active?: boolean;
  className?: string;
}) {
  const meta = getPlatform(platform);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition-colors",
        active ? "border-transparent text-white" : "border-line bg-surface-2/60 text-fg-soft",
        className,
      )}
      style={active ? { backgroundImage: `linear-gradient(120deg, ${meta.color}, ${meta.color}cc)` } : undefined}
    >
      <PlatformIcon platform={platform} colored={!active} className="h-3.5 w-3.5" />
      {label ?? meta.label}
      {typeof count === "number" ? <span className="opacity-70">({count})</span> : null}
    </span>
  );
}
