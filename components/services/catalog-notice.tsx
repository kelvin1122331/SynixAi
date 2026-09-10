import Link from "next/link";
import { AlertTriangle, CheckCircle2, Database, RefreshCw } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import type { Catalog } from "@/lib/types";

/**
 * Banner status sumber data katalog.
 * Ditampilkan hanya jika data BUKAN langsung dari panel, supaya pengunjung
 * (dan Anda sendiri) tahu kapan katalog sedang memakai data cadangan.
 */
export function CatalogNotice({ catalog, compact = false }: { catalog: Catalog; compact?: boolean }) {
  if (catalog.source === "panel") {
    if (compact) {
      return (
        <div className="flex items-center gap-2 text-[11.5px] text-muted">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          Katalog tersinkron dari panel · {formatDateTime(catalog.fetchedAt)}
        </div>
      );
    }
    return null;
  }

  const isDemo = catalog.source === "demo";

  return (
    <div className="container-page">
      <div
        className={`flex flex-col gap-2 rounded-2xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between ${
          isDemo
            ? "border-amber-500/30 bg-amber-500/10"
            : "border-cyan-500/30 bg-cyan-500/10"
        }`}
      >
        <div className="flex items-start gap-2.5">
          {isDemo ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-300" />
          ) : (
            <Database className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500 dark:text-cyan-300" />
          )}
          <div>
            <p className="text-[12.5px] font-bold text-fg">
              {isDemo
                ? "Mode pratinjau — menampilkan katalog contoh"
                : "Menampilkan snapshot katalog tersimpan"}
            </p>
            <p className="mt-0.5 text-[11.5px] leading-snug text-muted">
              {isDemo
                ? "Server ini belum bisa menjangkau API panel SMM Nusantara, jadi data di bawah adalah contoh. Setelah di-deploy (dan kredensial terisi), katalog asli akan otomatis tampil."
                : `Data terakhir disimpan ${formatDateTime(catalog.fetchedAt)}. Klik sinkron ulang di halaman diagnosa untuk memperbarui.`}
              {catalog.error ? <span className="block text-muted/90">Detail: {catalog.error}</span> : null}
            </p>
          </div>
        </div>
        <Link
          href="/admin"
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-line bg-surface-2/70 px-3 py-2 text-[12px] font-bold text-fg-soft transition-colors hover:border-brand-400/50 hover:text-fg sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Cek status sinkronisasi
        </Link>
      </div>
    </div>
  );
}
