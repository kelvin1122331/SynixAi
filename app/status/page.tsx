import type { Metadata } from "next";
import { Activity, AlertTriangle, CheckCircle2, Database, Server, Zap } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCatalog, getCatalogStats } from "@/lib/catalog";
import { getCredentials, getPanelBaseUrl } from "@/lib/smm";
import { formatDateTime, formatTimeAgo } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Status Sistem & Ketersediaan Layanan",
  description:
    "Status operasional SynixAI: koneksi ke provider, jumlah layanan aktif, sebaran layanan per platform, dan informasi gangguan layanan.",
  alternates: { canonical: "/status" },
};

export default async function StatusPage() {
  const catalog = await getCatalog();
  const stats = getCatalogStats(catalog.services);
  const credentials = getCredentials();

  const platformCounts = Object.entries(
    catalog.services.reduce<Record<string, number>>((acc, service) => {
      acc[service.platformLabel] = (acc[service.platformLabel] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const panelOnline = catalog.source === "panel";

  return (
    <>
      <PageHero
        eyebrow="Status"
        breadcrumbs={[{ label: "Status Sistem" }]}
        title={
          <>
            Status <span className="gradient-text">operasional</span>
          </>
        }
        description="Halaman ini menampilkan kondisi sistem secara langsung: koneksi ke provider, jumlah layanan aktif, dan sebaran katalog. Semua angka diperbarui otomatis mengikuti cache katalog."
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone={panelOnline ? "success" : "warning"}>
            {panelOnline ? "Provider terhubung (real-time)" : "Mode cadangan (data lokal)"}
          </Badge>
          <Badge tone="info">
            <Activity className="h-3.5 w-3.5" /> Uptime target {siteConfig.stats.uptime}%
          </Badge>
          <Badge tone="neutral">Diperbarui {formatTimeAgo(catalog.fetchedAt)}</Badge>
        </div>
      </PageHero>

      <div className="container-page space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Server className="h-4 w-4" />}
            label="Koneksi provider"
            value={panelOnline ? "Normal" : "Cadangan"}
            ok={panelOnline}
            note={getPanelBaseUrl()}
          />
          <StatCard
            icon={<Database className="h-4 w-4" />}
            label="Layanan aktif"
            value={stats.totalServices.toLocaleString("id-ID")}
            ok={stats.totalServices > 0}
            note={`${stats.totalCategories} kategori · ${stats.totalPlatforms} platform`}
          />
          <StatCard
            icon={<Zap className="h-4 w-4" />}
            label="Kredensial API"
            value={credentials.configured ? "Terpasang" : "Belum diisi"}
            ok={credentials.configured}
            note="Disimpan aman di sisi server"
          />
          <StatCard
            icon={<Activity className="h-4 w-4" />}
            label="Sinkron terakhir"
            value={formatDateTime(catalog.fetchedAt)}
            ok
            note={`Cache ${process.env.CATALOG_REVALIDATE_SECONDS ?? 600} detik`}
          />
        </div>

        {!panelOnline ? (
          <div className="flex items-start gap-3 rounded-3xl border border-amber-500/30 bg-amber-500/[0.08] p-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500 dark:text-amber-300" />
            <div>
              <p className="text-[14px] font-bold text-fg">Sistem sedang memakai data cadangan</p>
              <p className="mt-1 text-[12.8px] leading-relaxed text-muted">
                Server ini belum dapat menjangkau API panel secara langsung
                {catalog.error ? ` (${catalog.error})` : ""}. Harga dan ketersediaan layanan pada katalog
                cadangan bisa berbeda dengan panel asli. Tim kami tetap dapat memproses pesanan secara manual
                melalui WhatsApp.
              </p>
              <Button href="/kontak" variant="secondary" size="sm" className="mt-3">
                Hubungi admin
              </Button>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-line bg-surface-2/50 p-5 sm:p-6">
            <h2 className="text-[16px] font-extrabold text-fg">Ketersediaan layanan per platform</h2>
            <div className="mt-4 space-y-2.5">
              {platformCounts.map(([label, count]) => {
                const percent = Math.max(4, Math.round((count / stats.totalServices) * 100));
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="font-semibold text-fg-soft">{label}</span>
                      <span className="text-muted">{count.toLocaleString("id-ID")} layanan</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-3">
                      <div className="h-full rounded-full gradient-brand" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-line bg-surface-2/50 p-5">
              <h2 className="text-[15px] font-extrabold text-fg">Layanan bergaransi</h2>
              <p className="mt-2 text-[12.8px] leading-relaxed text-muted">
                <span className="text-[20px] font-extrabold text-fg">
                  {stats.refillCount.toLocaleString("id-ID")}
                </span>{" "}
                layanan memiliki opsi garansi/refill. Cocok untuk akun brand &amp; klien yang butuh keamanan
                ekstra.
              </p>
              <Button href="/layanan?refill=1" variant="secondary" size="sm" className="mt-3">
                Lihat layanan bergaransi
              </Button>
            </div>

            <div className="rounded-3xl border border-line bg-surface-2/50 p-5">
              <h2 className="text-[15px] font-extrabold text-fg">Riwayat gangguan</h2>
              <ul className="mt-3 space-y-3">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <div>
                    <p className="text-[12.8px] font-semibold text-fg">Tidak ada gangguan tercatat</p>
                    <p className="text-[11.5px] text-muted">30 hari terakhir · semua sistem normal</p>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <div>
                    <p className="text-[12.8px] font-semibold text-fg">Pemeliharaan rutin terjadwal</p>
                    <p className="text-[11.5px] text-muted">Mingguan, tanpa downtime</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
  ok,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note?: string;
  ok?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${ok ? "border-emerald-500/25 bg-emerald-500/[0.06]" : "border-amber-500/30 bg-amber-500/[0.07]"}`}>
      <span
        className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase ${
          ok ? "text-emerald-500 dark:text-emerald-300" : "text-amber-600 dark:text-amber-300"
        }`}
      >
        {icon} {label}
      </span>
      <p className="mt-2 truncate text-[15px] font-extrabold text-fg">{value}</p>
      {note ? <p className="mt-1 truncate text-[11.5px] text-muted">{note}</p> : null}
    </div>
  );
}
