import Link from "next/link";
import { ArrowRight, Calculator, Tag } from "lucide-react";
import { SectionHeading } from "./sections";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { Badge } from "@/components/ui/badge";
import { compactNumber, formatRupiah } from "@/lib/format";
import type { Service } from "@/lib/types";

/** Tabel harga termurah per kategori — memudahkan pengunjung melihat kisaran harga. */
export function PriceTable({ services }: { services: Service[] }) {
  if (!services.length) return null;

  return (
    <section id="harga" className="scroll-mt-24 py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Daftar harga"
          align="left"
          title={<>Harga <span className="gradient-text">termurah</span> di tiap kategori</>}
          description="Diambil otomatis dari katalog: satu layanan dengan harga paling rendah untuk setiap kategori. Harga dapat berubah sewaktu-waktu mengikuti provider."
          action={
            <Link
              href="/layanan?sort=termurah"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-brand-400/40 px-4 py-2.5 text-[13px] font-bold text-brand-500 transition-colors hover:bg-brand-500/10 dark:text-brand-300"
            >
              <Calculator className="h-4 w-4" /> Urutkan dari termurah
            </Link>
          }
        />

        <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-surface-2/45">
          <div className="hidden grid-cols-[1.6fr_1fr_0.8fr_0.8fr_0.9fr_auto] gap-3 border-b border-line bg-surface-3/40 px-5 py-3 text-[11px] font-bold tracking-[0.1em] text-muted uppercase lg:grid">
            <span>Layanan</span>
            <span>Kategori</span>
            <span className="text-right">Harga / 1K</span>
            <span className="text-right">Min</span>
            <span className="text-right">Maks</span>
            <span className="text-right">Aksi</span>
          </div>

          <div className="divide-y divide-line">
            {services.map((service) => (
              <div
                key={service.id}
                className="grid items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-3/40 sm:px-5 lg:grid-cols-[1.6fr_1fr_0.8fr_0.8fr_0.9fr_auto]"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-line bg-surface-3">
                    <PlatformIcon platform={service.platform} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-bold text-fg">{service.name}</p>
                    <p className="truncate text-[11.5px] text-muted lg:hidden">{service.category}</p>
                  </div>
                </div>

                <div className="hidden min-w-0 lg:block">
                  <p className="truncate text-[12.5px] font-semibold text-fg-soft">{service.category}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {service.badges.slice(0, 2).map((badge) => (
                      <Badge key={badge} size="sm" tone="neutral">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 lg:block lg:text-right">
                  <span className="text-[11px] font-semibold text-muted uppercase lg:hidden">Harga</span>
                  <p className="text-[14px] font-extrabold text-emerald-500 dark:text-emerald-300">
                    {formatRupiah(service.priceRetail)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 lg:block lg:text-right">
                  <span className="text-[11px] font-semibold text-muted uppercase lg:hidden">Min / Maks</span>
                  <p className="text-[12.5px] font-semibold text-fg-soft">
                    {compactNumber(service.min)} – {compactNumber(service.max)}
                  </p>
                </div>

                <div className="hidden text-right lg:block">
                  <p className="text-[12.5px] font-semibold text-fg-soft">
                    {service.instant ? "Instan" : "Antrean"}
                  </p>
                  <p className="text-[11px] text-muted">{service.refill ? "Garansi refill" : "Tanpa garansi"}</p>
                </div>

                <div className="flex justify-end">
                  <Link
                    href={`/order?service=${service.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-400/40 px-3 py-1.5 text-[12px] font-bold text-brand-500 transition-colors hover:bg-brand-500/10 dark:text-brand-300"
                  >
                    Pesan <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-3/30 px-5 py-3.5">
            <p className="flex items-center gap-1.5 text-[12px] text-muted">
              <Tag className="h-3.5 w-3.5 text-brand-400" />
              Harga per 1.000 unit. Total otomatis dihitung di halaman pemesanan.
            </p>
            <Link href="/layanan" className="text-[12.5px] font-bold text-brand-400 hover:underline">
              Lihat 2.000+ layanan lainnya →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
