/** Helper format angka, mata uang, dan tanggal (locale Indonesia). */

export function formatRupiah(value: number, opts: { compact?: boolean } = {}): string {
  if (!Number.isFinite(value)) return "Rp 0";
  if (opts.compact && value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  }
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

/** Rp 18.215 / 1.000 followers */
export function formatRate(value: number): string {
  return `${formatRupiah(value)} / 1.000`;
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString("id-ID");
}

/** 1.250.000 -> "1,2 jt" */
export function compactNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${trim(value / 1_000_000_000)} M`;
  if (abs >= 1_000_000) return `${trim(value / 1_000_000)} jt`;
  if (abs >= 1_000) return `${trim(value / 1_000)} rb`;
  return String(value);
}

function trim(n: number): string {
  return n.toFixed(1).replace(/\.0$/, "").replace(".", ",");
}

export function formatDateTime(iso: string | number | Date): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTimeAgo(iso: string | number | Date): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "-";
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan lalu`;
  return `${Math.floor(months / 12)} tahun lalu`;
}

/** Parse angka yang mungkin berupa string seperti "10K", "1M", "100.000". */
export function parseLooseNumber(input: unknown): number {
  if (typeof input === "number") return Number.isFinite(input) ? input : 0;
  if (typeof input !== "string") return 0;
  const cleaned = input.trim().replace(/\s|\./g, "").replace(",", ".");
  const match = cleaned.match(/^([\d.]+)\s*([kmb])?/i);
  if (!match) return 0;
  const base = Number.parseFloat(match[1]);
  if (!Number.isFinite(base)) return 0;
  const suffix = (match[2] ?? "").toLowerCase();
  const multiplier = suffix === "k" ? 1_000 : suffix === "m" ? 1_000_000 : suffix === "b" ? 1_000_000_000 : 1;
  return Math.round(base * multiplier);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Warna status order panel -> tone UI. */
export type StatusTone = "pending" | "progress" | "success" | "error" | "neutral";

export function statusTone(status: string): StatusTone {
  const s = (status || "").toLowerCase();
  if (s.includes("complete") || s.includes("success") || s.includes("selesai")) return "success";
  if (s.includes("progress") || s.includes("processing") || s.includes("partial")) return "progress";
  if (s.includes("pending") || s.includes("await") || s.includes("menunggu")) return "pending";
  if (s.includes("cancel") || s.includes("error") || s.includes("fail") || s.includes("refund")) return "error";
  return "neutral";
}

export function statusLabel(status: string): string {
  const tone = statusTone(status);
  const map: Record<StatusTone, string> = {
    pending: "Menunggu",
    progress: "Diproses",
    success: "Selesai",
    error: "Gagal / Dibatalkan",
    neutral: "Tidak diketahui",
  };
  return map[tone];
}
