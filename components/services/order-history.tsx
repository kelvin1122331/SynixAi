"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, History, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { formatDateTime, formatRupiah, statusLabel, statusTone } from "@/lib/format";
import { readHistory, type HistoryItem } from "./order-form";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { cn } from "@/lib/cn";

const toneClasses: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300",
  progress: "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  error: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  neutral: "border-line bg-surface-3 text-muted",
};

export function OrderHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(readHistory());
  }, []);

  const stats = useMemo(() => {
    const total = items.reduce((sum, item) => sum + (item.total ?? 0), 0);
    return { count: items.length, total };
  }, [items]);

  async function refresh(ids: string[]) {
    if (!ids.length) return;
    setLoading(ids.join(","));
    try {
      const res = await fetch(`/api/status?orders=${encodeURIComponent(ids.join(","))}`, { cache: "no-store" });
      const data = (await res.json()) as { data?: Array<{ id: string; ok: boolean; status: string | null }> };
      if (Array.isArray(data.data)) {
        setItems((prev) => {
          const next = prev.map((item) => {
            const found = data.data?.find((r) => r.id === item.id);
            return found?.ok ? { ...item, status: found.status ?? item.status } : item;
          });
          try {
            window.localStorage.setItem("synix-orders", JSON.stringify(next));
          } catch {
            /* abaikan */
          }
          return next;
        });
      }
    } catch {
      /* diamkan */
    } finally {
      setLoading(null);
    }
  }

  function remove(id: string) {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        window.localStorage.setItem("synix-orders", JSON.stringify(next));
      } catch {
        /* abaikan */
      }
      return next;
    });
  }

  function clearAll() {
    setItems([]);
    try {
      window.localStorage.removeItem("synix-orders");
    } catch {
      /* abaikan */
    }
  }

  function exportCsv() {
    const header = "ID,Layanan,Platform,Target,Jumlah,Total,Status,Tanggal";
    const rows = items.map((item) =>
      [item.id, item.serviceName, item.platform, item.target, item.quantity, item.total, item.status ?? "", item.createdAt]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `riwayat-order-synixai-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!mounted) {
    return <div className="h-40 animate-pulse rounded-3xl border border-line bg-surface-2/40" />;
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={<History className="h-6 w-6" />}
        title="Belum ada riwayat pesanan di perangkat ini"
        description="Setiap pesanan yang Anda buat lewat website ini otomatis tersimpan di browser (localStorage) — bukan di server kami — sehingga data tetap privat."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button href="/layanan" size="md">
              Lihat katalog layanan
            </Button>
            <Button href="/cek-order" variant="secondary" size="md">
              Cek ID pesanan manual
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface-2/50 px-4 py-3">
        <p className="text-[13px] text-muted">
          <span className="font-bold text-fg">{stats.count}</span> pesanan · total{" "}
          <span className="font-bold text-fg">{formatRupiah(stats.total)}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => void refresh(items.map((i) => i.id))}>
            <RefreshCw className={cn("h-4 w-4", loading ? "animate-spin" : "")} /> Perbarui status
          </Button>
          <Button variant="secondary" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Ekspor CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <Trash2 className="h-4 w-4" /> Hapus semua
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface-2/45">
        {items.map((item) => {
          const tone = statusTone(item.status ?? "");
          return (
            <div key={item.id} className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3.5 last:border-0">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line bg-surface-3">
                <PlatformIcon platform={item.platform} className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-fg">{item.serviceName}</p>
                <p className="truncate text-[11.5px] text-muted">
                  #{item.id} · {item.target} · {formatDateTime(item.createdAt)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[12.5px] font-bold text-fg">{item.quantity.toLocaleString("id-ID")} unit</p>
                <p className="text-[11.5px] text-muted">{formatRupiah(item.total)}</p>
              </div>

              <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-bold", toneClasses[tone])}>
                {item.status ? statusLabel(item.status) : "Belum dicek"}
              </span>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/cek-order?order=${item.id}`}
                  className="rounded-lg border border-line px-2.5 py-1.5 text-[11.5px] font-bold text-fg-soft transition-colors hover:border-brand-400/50 hover:text-fg"
                >
                  Pantau
                </Link>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`Hapus pesanan ${item.id}`}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-rose-400/50 hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11.5px] leading-relaxed text-muted">
        Catatan: riwayat ini disimpan di perangkat Anda sendiri. Jika berganti perangkat atau menghapus data
        browser, riwayat akan hilang — simpan ID pesanan Anda untuk pengecekan manual di halaman Cek Order.
      </p>
    </div>
  );
}
