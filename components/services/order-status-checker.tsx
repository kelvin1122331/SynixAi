"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/field";
import { formatDateTime, statusLabel, statusTone } from "@/lib/format";
import { cn } from "@/lib/cn";

interface StatusRow {
  id: string;
  ok: boolean;
  status: string | null;
  statusLabel?: string | null;
  startCount?: string | null;
  remains?: string | null;
  charge?: string | null;
  currency?: string | null;
  error?: string;
  code?: string;
}

const toneClasses: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300",
  progress: "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  error: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  neutral: "border-line bg-surface-3 text-muted",
};

export function OrderStatusChecker({ initialOrder }: { initialOrder?: string }) {
  const [input, setInput] = useState(initialOrder ?? "");
  const [rows, setRows] = useState<StatusRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [auto, setAuto] = useState(false);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(
    async (value: string) => {
      const ids = value
        .split(/[\s,;]+/)
        .map((v) => v.trim())
        .filter(Boolean);
      if (!ids.length) {
        setError("Masukkan minimal satu ID pesanan.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/status?orders=${encodeURIComponent(ids.join(","))}`, { cache: "no-store" });
        const data = (await res.json()) as { ok: boolean; data?: StatusRow[]; error?: string };
        if (Array.isArray(data.data)) {
          setRows(data.data);
          setCheckedAt(new Date().toISOString());
        } else {
          setError(data.error ?? "Gagal mengambil status pesanan.");
        }
      } catch (err) {
        setError(`Tidak dapat menghubungi server: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (initialOrder) void check(initialOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrder]);

  useEffect(() => {
    if (!auto || !input) return;
    const timer = setInterval(() => void check(input), 30_000);
    return () => clearInterval(timer);
  }, [auto, input, check]);

  return (
    <div className="rounded-3xl border border-line bg-surface-2/55 p-5 sm:p-7">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void check(input);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Masukkan ID pesanan… (bisa beberapa, pisahkan koma)"
            aria-label="ID pesanan"
            className="h-12 w-full rounded-xl border border-line bg-surface-2/70 pr-3 pl-10 text-[13.5px] text-fg outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
          />
        </div>
        <Button type="submit" size="lg" disabled={loading} className="sm:w-auto">
          {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <RefreshCw className="h-4.5 w-4.5" />}
          Cek Status
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <Switch checked={auto} onChange={setAuto} label="Perbarui otomatis tiap 30 detik" />
        {checkedAt ? (
          <p className="flex items-center gap-1.5 text-[11.5px] text-muted">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            Terakhir dicek: {formatDateTime(checkedAt)}
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/[0.08] p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <p className="text-[12.5px] leading-relaxed text-muted">{error}</p>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div className="mt-5 space-y-3">
          {rows.map((row) => {
            const tone = row.ok ? statusTone(row.status ?? "") : "error";
            const startCount = Number(row.startCount ?? 0) || 0;
            const remains = Number(row.remains ?? 0) || 0;
            const totalGuess = startCount + remains;
            const progress =
              tone === "success"
                ? 100
                : totalGuess > 0 && startCount > 0
                  ? Math.min(99, Math.round((startCount / totalGuess) * 100))
                  : tone === "progress"
                    ? 45
                    : 0;

            return (
              <div key={row.id} className="rounded-2xl border border-line bg-surface-3/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[12px] font-extrabold text-fg">
                      #{row.id}
                    </span>
                    <span className={cn("rounded-full border px-3 py-1 text-[11.5px] font-bold", toneClasses[tone])}>
                      {row.ok ? (row.statusLabel ?? statusLabel(row.status ?? "")) : "Gagal dicek"}
                    </span>
                    {row.ok && row.status ? (
                      <span className="text-[11.5px] text-muted">({row.status})</span>
                    ) : null}
                  </div>
                  {row.ok && row.charge ? (
                    <p className="text-[12px] text-muted">
                      Biaya: <span className="font-bold text-fg-soft">{row.charge}</span>
                      {row.currency ? ` ${row.currency}` : ""}
                    </p>
                  ) : null}
                </div>

                {row.ok ? (
                  <>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          tone === "success" ? "bg-emerald-500" : tone === "error" ? "bg-rose-500" : "gradient-brand",
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-4 text-[12px] text-muted">
                      <span>
                        Mulai dari: <span className="font-bold text-fg-soft">{row.startCount ?? "-"}</span>
                      </span>
                      <span>
                        Sisa: <span className="font-bold text-fg-soft">{row.remains ?? "-"}</span>
                      </span>
                      {remains > 0 && tone !== "success" ? (
                        <Badge tone="warning" size="sm">
                          masih diproses
                        </Badge>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{row.error}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
