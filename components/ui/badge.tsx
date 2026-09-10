import { cn } from "@/lib/cn";

type Tone = "brand" | "success" | "warning" | "danger" | "info" | "neutral" | "outline" | "pending";

const tones: Record<Tone, string> = {
  brand: "bg-brand-500/12 text-brand-600 dark:text-brand-200 border-brand-500/25",
  success: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 border-emerald-500/25",
  warning: "bg-amber-500/14 text-amber-700 dark:text-amber-300 border-amber-500/25",
  pending: "bg-amber-500/14 text-amber-700 dark:text-amber-300 border-amber-500/25",
  danger: "bg-rose-500/12 text-rose-600 dark:text-rose-300 border-rose-500/25",
  info: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300 border-cyan-500/25",
  neutral: "bg-surface-3 text-muted border-line",
  outline: "bg-transparent text-fg-soft border-line-strong",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  size = "md",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        size === "sm" ? "px-2 py-[3px] text-[10.5px]" : "px-2.5 py-1 text-[11.5px]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Pilih tone badge otomatis dari isi teks badge layanan. */
export function badgeTone(label: string): Tone {
  const l = label.toLowerCase();
  if (l.includes("rekomendasi")) return "warning";
  if (l.includes("instan")) return "info";
  if (l.includes("garansi") || l.includes("lifetime") || l.includes("refill")) return "success";
  if (l.includes("hemat")) return "brand";
  if (l.includes("low drop")) return "success";
  if (l.includes("hq") || l.includes("real")) return "brand";
  if (l.includes("maks")) return "neutral";
  if (l.includes("hari")) return "info";
  return "neutral";
}
