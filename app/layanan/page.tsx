import type { Metadata } from "next";
import Link from "next/link";
import { Flame, LayoutGrid, ListFilter, MessageCircle, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { ServiceCard } from "@/components/services/service-card";
import { ServiceFilters } from "@/components/services/service-filters";
import { CatalogNotice } from "@/components/services/catalog-notice";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { getCatalog, filterServices } from "@/lib/catalog";
import { compactNumber, formatRupiah } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Katalog Layanan SMM — Followers, Likes, Views Termurah",
  description:
    "Daftar lengkap layanan SMM: followers Instagram, TikTok, YouTube, likes, views, komentar, subscriber, dan live stream viewers. Harga per 1.000 transparan, banyak layanan bergaransi.",
  alternates: { canonical: "/layanan" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LayananPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const catalog = await getCatalog();

  const page = Number(first(sp.page) ?? 1) || 1;
  const perPage = Number(first(sp.perPage) ?? 24) || 24;
  const platform = first(sp.platform) ?? "semua";
  const category = first(sp.category);
  const q = first(sp.q);
  const sort = (first(sp.sort) ?? "populer") as "populer" | "termurah" | "termahal" | "min" | "maks" | "az";
  const minPrice = first(sp.minPrice) ? Number(first(sp.minPrice)) : undefined;
  const maxPrice = first(sp.maxPrice) ? Number(first(sp.maxPrice)) : undefined;
  const refillOnly = first(sp.refill) === "1";
  const instantOnly = first(sp.instant) === "1";
  const view = first(sp.view) ?? "grid";

  const result = filterServices(catalog.services, {
    q,
    platform,
    category,
    minPrice,
    maxPrice,
    refillOnly,
    instantOnly,
    sort,
    page,
    perPage,
  });

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([key, value]) => {
      const v = first(value);
      if (v && key !== "page") params.set(key, v);
    });
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/layanan${qs ? `?${qs}` : ""}`;
  };

  const startItem = (result.page - 1) * result.perPage + 1;
  const endItem = Math.min(result.page * result.perPage, result.total);

  return (
    <>
      <PageHero
        eyebrow="Katalog layanan"
        breadcrumbs={[{ label: "Katalog Layanan" }]}
        title={
          <>
            Katalog Layanan <span className="gradient-text">SMM Terlengkap</span>
          </>
        }
        description={
          <>
            {catalog.services.length.toLocaleString("id-ID")} layanan aktif untuk menambah followers, likes,
            views, komentar, subscriber, hingga live stream viewers. Semua harga di bawah adalah harga per
            1.000 unit dan total biaya dihitung otomatis saat memesan.
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <QuickStat
            icon={<LayoutGrid className="h-4 w-4" />}
            label="Total layanan"
            value={catalog.services.length.toLocaleString("id-ID")}
          />
          <QuickStat
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Layanan bergaransi"
            value={result.facets.platforms.length ? `${catalog.services.filter((s) => s.refill).length}+` : "-"}
          />
          <QuickStat
            icon={<Zap className="h-4 w-4" />}
            label="Harga mulai"
            value={formatRupiah(result.facets.priceRange.min)}
          />
        </div>
      </PageHero>

      <div className="container-page">
        <CatalogNotice catalog={catalog} />

        <div className="mt-6 lg:mt-8">
          <ServiceFilters facets={result.facets} total={result.total} />
        </div>

        {/* Info hasil + kontrol tampilan */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] font-medium text-muted">
            {result.total > 0 ? (
              <>
                Menampilkan <span className="font-bold text-fg">{startItem.toLocaleString("id-ID")}</span>–
                <span className="font-bold text-fg">{endItem.toLocaleString("id-ID")}</span> dari{" "}
                <span className="font-bold text-fg">{result.total.toLocaleString("id-ID")}</span> layanan
                {platform !== "semua" ? ` · platform ${platform}` : ""}
              </>
            ) : (
              "Tidak ada layanan yang cocok dengan filter Anda"
            )}
          </p>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-xl border border-line bg-surface-2/60 p-1 sm:flex">
              {[24, 48, 96].map((size) => (
                <Link
                  key={size}
                  href={(() => {
                    const params = new URLSearchParams(
                      Object.entries(sp)
                        .map(([k, v]) => [k, first(v)] as const)
                        .filter(([, v]) => Boolean(v)) as Array<[string, string]>,
                    );
                    params.set("perPage", String(size));
                    params.delete("page");
                    return `/layanan?${params.toString()}`;
                  })()}
                  className={`rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors ${
                    result.perPage === size ? "gradient-brand text-white" : "text-muted hover:text-fg"
                  }`}
                >
                  {size}
                </Link>
              ))}
            </div>

            <div className="hidden items-center gap-1.5 rounded-xl border border-line bg-surface-2/60 p-1 lg:flex">
              {[
                { key: "grid", label: "Grid", icon: LayoutGrid },
                { key: "list", label: "Daftar", icon: ListFilter },
              ].map((mode) => {
                const Icon = mode.icon;
                const params = new URLSearchParams(
                  Object.entries(sp)
                    .map(([k, v]) => [k, first(v)] as const)
                    .filter(([, v]) => Boolean(v)) as Array<[string, string]>,
                );
                params.set("view", mode.key);
                return (
                  <Link
                    key={mode.key}
                    href={`/layanan?${params.toString()}`}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors ${
                      view === mode.key ? "gradient-brand text-white" : "text-muted hover:text-fg"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {mode.label}
                  </Link>
                );
              })}
            </div>

            <Button href="/order" size="sm" variant="secondary" className="hidden lg:inline-flex">
              <Sparkles className="h-4 w-4" /> Order cepat
            </Button>
          </div>
        </div>

        {/* Daftar layanan */}
        {result.items.length === 0 ? (
          <EmptyState
            title="Layanan tidak ditemukan"
            description="Coba ubah kata kunci, pilih platform lain, atau reset filter. Jika yakin layanannya ada, hubungi admin — katalog bisa disesuaikan."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button href="/layanan" variant="secondary">
                  Reset filter
                </Button>
                <Button
                  href={siteConfig.whatsappLink("Halo admin, saya mencari layanan tertentu. Bisa dibantu?")}
                  variant="whatsapp"
                >
                  <MessageCircle className="h-4 w-4" /> Tanya admin
                </Button>
              </div>
            }
          />
        ) : view === "list" ? (
          <div className="overflow-hidden rounded-2xl border border-line bg-surface-2/45">
            {result.items.map((service) => (
              <div key={service.id} className="border-b border-line last:border-0">
                <ServiceCard service={service} className="rounded-none border-0 bg-transparent shadow-none hover:translate-y-0" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.items.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        <Pagination page={result.page} totalPages={result.totalPages} buildHref={buildHref} className="mt-10" />

        {result.totalPages > 1 ? (
          <p className="mt-3 text-center text-[12.5px] text-muted">
            Halaman {result.page} dari {result.totalPages}
          </p>
        ) : null}

        {/* Bantuan di bawah katalog */}
        <div className="mt-14 grid gap-4 rounded-3xl border border-line bg-surface-2/50 p-6 sm:grid-cols-[1.5fr_1fr] sm:p-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-amber-600 uppercase dark:text-amber-300">
              <Flame className="h-3.5 w-3.5" /> Tips memilih
            </span>
            <h2 className="mt-3 text-[20px] font-extrabold sm:text-[24px]">
              Bingung pilih layanan yang aman untuk akun Anda?
            </h2>
            <ul className="mt-4 space-y-2.5 text-[13.5px] leading-relaxed text-muted">
              <li>
                <span className="font-semibold text-fg-soft">Akun utama (brand/klien):</span> pilih layanan
                bertanda <em>Real</em> atau <em>High Quality</em> dengan garansi R30–R365 agar drop tertangani.
              </li>
              <li>
                <span className="font-semibold text-fg-soft">Butuh cepat &amp; murah:</span> pilih layanan
                bertanda <em>Instan</em> dan <em>Hemat</em> — cocok untuk konten yang sedang ramai.
              </li>
              <li>
                <span className="font-semibold text-fg-soft">Live streaming &amp; jualan:</span> gunakan layanan
                live viewers atau marketplace (Shopee/Tokopedia) yang memang khusus untuk itu.
              </li>
            </ul>
          </div>
          <div className="flex flex-col justify-center gap-3 rounded-2xl border border-line bg-surface-3/50 p-5">
            <p className="text-[13.5px] font-bold text-fg">Masih ragu? Konsultasi gratis.</p>
            <p className="text-[12.5px] leading-relaxed text-muted">
              Kirim link akun Anda, admin akan merekomendasikan layanan dengan harga paling efisien dan risiko
              paling kecil. Online {siteConfig.operationalHours}.
            </p>
            <Button
              href={siteConfig.whatsappLink("Halo admin, mohon rekomendasi layanan untuk akun saya.")}
              variant="whatsapp"
              size="md"
              className="w-full"
            >
              <MessageCircle className="h-4 w-4" /> Chat Admin
            </Button>
            <p className="text-center text-[11.5px] text-muted">
              Rata-rata dibalas &lt; 5 menit · {compactNumber(catalog.services.length)} layanan aktif
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2/50 px-4 py-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/12 text-brand-500 dark:text-brand-300">
        {icon}
      </span>
      <div>
        <p className="text-[11.5px] font-medium text-muted">{label}</p>
        <p className="text-[15px] font-extrabold text-fg">{value}</p>
      </div>
    </div>
  );
}
