import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, BadgeCheck, Boxes, Clock, Info, Layers, ListChecks, MessageCircle, ShieldCheck,
  Tag, Target, TrendingUp, Zap,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { OrderForm } from "@/components/services/order-form";
import { ServiceCard } from "@/components/services/service-card";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { Badge, badgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/misc";
import { getCatalog, getRelatedServices, getServiceById, toPublicServices } from "@/lib/catalog";
import { compactNumber, formatRupiah } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 300;

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const catalog = await getCatalog();
  const service = getServiceById(catalog.services, Number(id));

  if (!service) {
    return { title: "Layanan tidak ditemukan" };
  }

  return {
    title: `${service.name} — ${service.platformLabel} ${service.category}`,
    description: `${service.name} dengan harga ${formatRupiah(service.priceRetail)} per 1.000 unit. Minimal order ${compactNumber(service.min)}, maksimal ${compactNumber(service.max)}.${service.refill ? " Bergaransi refill." : ""} Proses otomatis 24 jam.`,
    alternates: { canonical: `/layanan/${service.id}` },
    openGraph: {
      title: `${service.name} | ${siteConfig.name}`,
      description: `Harga ${formatRupiah(service.priceRetail)} / 1.000 · min ${compactNumber(service.min)} · maks ${compactNumber(service.max)}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  const catalog = await getCatalog();
  const service = getServiceById(catalog.services, numericId);
  if (!service) notFound();

  const related = toPublicServices(getRelatedServices(catalog.services, service, 8));
  const publicService = { ...service, price: service.priceRetail };

  return (
    <>
      <PageHero
        breadcrumbs={[
          { href: "/layanan", label: "Katalog Layanan" },
          { href: `/layanan?platform=${service.platform}`, label: service.platformLabel },
          { label: service.category },
        ]}
        eyebrow={`${service.platformLabel} · ${service.category}`}
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-line bg-surface-2">
              <PlatformIcon platform={service.platform} className="h-6 w-6" />
            </span>
            {service.name}
          </span>
        }
        description={service.variant ? <span className="text-fg-soft">{service.variant}</span> : undefined}
      >
        <div className="flex flex-wrap items-center gap-2">
          {service.badges.map((badge) => (
            <Badge key={badge} tone={badgeTone(badge)}>
              {badge}
            </Badge>
          ))}
          <span className="rounded-full border border-line bg-surface-2/60 px-2.5 py-1 text-[11.5px] font-semibold text-muted">
            ID Layanan: #{service.id}
          </span>
          <CopyButton value={String(service.id)} label="Salin ID" />
        </div>
      </PageHero>

      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
          {/* Kolom kiri: info layanan */}
          <div className="space-y-6">
            {/* Ringkasan harga */}
            <section className="grid gap-3 sm:grid-cols-3">
              <SummaryCard
                icon={<Tag className="h-4 w-4" />}
                label="Harga per 1.000"
                value={formatRupiah(service.priceRetail)}
                hint={`≈ ${formatRupiah(service.priceRetail / 1000)} per unit`}
                highlight
              />
              <SummaryCard
                icon={<Layers className="h-4 w-4" />}
                label="Minimal order"
                value={compactNumber(service.min)}
                hint="unit per pesanan"
              />
              <SummaryCard
                icon={<Boxes className="h-4 w-4" />}
                label="Maksimal order"
                value={compactNumber(service.max)}
                hint="unit per pesanan"
              />
            </section>

            {/* Spesifikasi */}
            <section className="rounded-3xl border border-line bg-surface-2/50 p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-fg">
                <ListChecks className="h-4.5 w-4.5 text-brand-400" /> Spesifikasi layanan
              </h2>
              <div className="mt-4 grid gap-x-8 gap-y-0 sm:grid-cols-2">
                <SpecRow label="Platform" value={service.platformLabel} />
                <SpecRow label="Kategori" value={`${service.category}${service.variant ? ` · ${service.variant}` : ""}`} />
                <SpecRow label="Tipe layanan" value={service.type === "default" ? "Default (otomatis)" : service.type} />
                <SpecRow label="Kecepatan" value={service.speed ?? "Mengikuti antrean provider"} />
                <SpecRow label="Garansi / refill" value={service.refill ? refillLabel(service.refillDays) : "Tidak bergaransi"} />
                <SpecRow label="Proses" value={service.instant ? "Instan (1–5 menit)" : "Bertahap sesuai antrean"} />
                <SpecRow label="Target input" value={service.targetHint ?? defaultTargetHint(service.platform)} />
                <SpecRow label="Kualitas" value={service.quality.length ? service.quality.join(", ") : "Standar provider"} />
              </div>
            </section>

            {/* Deskripsi */}
            <section className="rounded-3xl border border-line bg-surface-2/50 p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-fg">
                <Info className="h-4.5 w-4.5 text-brand-400" /> Deskripsi &amp; ketentuan
              </h2>

              {service.description ? (
                <div className="mt-3.5 space-y-2 text-[13.5px] leading-relaxed whitespace-pre-line text-fg-soft">
                  {service.description}
                </div>
              ) : (
                <p className="mt-3.5 text-[13.5px] text-muted">
                  Provider tidak menyertakan deskripsi tambahan untuk layanan ini. Ketentuan umum berlaku:
                  jangan melakukan dua pesanan pada link yang sama secara bersamaan, dan pastikan akun target
                  dalam keadaan publik.
                </p>
              )}

              <div className="mt-4 rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-4">
                <p className="text-[12.5px] font-bold text-fg">Catatan penting sebelum memesan</p>
                <ul className="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-muted">
                  <li>• Pastikan akun/link target bersifat publik (bukan private) saat pesanan diproses.</li>
                  <li>• Jangan mengubah username/handle selama pesanan berjalan — bisa menggagalkan proses.</li>
                  <li>• Hindari memesan layanan sejenis pada link yang sama secara bersamaan.</li>
                  <li>• Jumlah bisa sedikit berkurang (drop) setelah pesanan selesai — layanan bergaransi dapat refill gratis.</li>
                </ul>
              </div>
            </section>

            {/* Cara order khusus layanan ini */}
            <section className="rounded-3xl border border-line bg-surface-2/50 p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-fg">
                <Target className="h-4.5 w-4.5 text-brand-400" /> Cara memesan layanan ini
              </h2>
              <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  `Siapkan ${service.targetHint ?? defaultTargetHint(service.platform)} akun Anda.`,
                  "Masukkan pada kolom Target di form pemesanan.",
                  `Tentukan jumlah antara ${compactNumber(service.min)} sampai ${compactNumber(service.max)}.`,
                  "Selesaikan pembayaran — pesanan otomatis diteruskan ke provider.",
                ].map((text, index) => (
                  <li key={text} className="flex gap-3 rounded-2xl border border-line bg-surface-3/40 p-3.5">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full gradient-brand text-[11.5px] font-extrabold text-white">
                      {index + 1}
                    </span>
                    <span className="text-[12.8px] leading-snug text-fg-soft">{text}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Layanan terkait */}
            {related.length ? (
              <section>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-fg">
                    <TrendingUp className="h-4.5 w-4.5 text-brand-400" /> Layanan serupa &amp; alternatif lain
                  </h2>
                  <Link
                    href={`/layanan?platform=${service.platform}`}
                    className="text-[12.5px] font-bold text-brand-400 hover:underline"
                  >
                    Semua layanan {service.platformLabel} →
                  </Link>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {related.slice(0, 6).map((item) => (
                    <ServiceCard key={item.id} service={item} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          {/* Kolom kanan: form pemesanan */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <OrderForm initialService={publicService} lockedService />

            <div className="mt-4 space-y-3 rounded-3xl border border-line bg-surface-2/55 p-5">
              <p className="flex items-center gap-2 text-[13px] font-bold text-fg">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Aman &amp; terpercaya
              </p>
              <ul className="space-y-2 text-[12.5px] leading-snug text-muted">
                <li>• Tanpa password akun — hanya link publik.</li>
                <li>• Pesanan diproses sistem otomatis, bukan antre manual.</li>
                <li>• Status dapat dipantau real-time lewat halaman Cek Order.</li>
                <li>• Bantuan admin {siteConfig.operationalHours} lewat WhatsApp.</li>
              </ul>
              <Button
                href={siteConfig.whatsappLink(
                  `Halo admin, saya ingin bertanya tentang layanan: ${service.name} (#${service.id}).`,
                )}
                variant="whatsapp"
                size="md"
                className="w-full"
              >
                <MessageCircle className="h-4 w-4" /> Tanya sebelum memesan
              </Button>
            </div>

            <div className="mt-4 grid gap-2.5 rounded-3xl border border-line bg-surface-2/40 p-4 sm:grid-cols-2 lg:grid-cols-1">
              <MiniFact icon={<Zap className="h-3.5 w-3.5" />} label="Proses mulai" value={service.instant ? "1–5 menit" : "10–60 menit"} />
              <MiniFact icon={<Clock className="h-3.5 w-3.5" />} label="Jam operasional" value="24 jam / 7 hari" />
              <MiniFact icon={<BadgeCheck className="h-3.5 w-3.5" />} label="Garansi" value={service.refill ? refillLabel(service.refillDays) : "Tanpa garansi"} />
              <MiniFact icon={<Layers className="h-3.5 w-3.5" />} label="Total layanan aktif" value={`${compactNumber(catalog.services.length)} layanan`} />
            </div>

            <div className="mt-4 flex items-center gap-2 text-[12px] text-muted">
              <ArrowLeft className="h-3.5 w-3.5" />
              <Link href="/layanan" className="font-semibold text-brand-400 hover:underline">
                Kembali ke katalog lengkap
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: service.name,
            description: service.description || `${service.name} — layanan SMM ${service.platformLabel} ${service.category}.`,
            sku: String(service.id),
            brand: { "@type": "Brand", name: siteConfig.name },
            category: `${service.platformLabel} ${service.category}`,
            offers: {
              "@type": "Offer",
              price: service.priceRetail,
              priceCurrency: "IDR",
              availability: "https://schema.org/InStock",
              url: `${siteConfig.url}/layanan/${service.id}`,
            },
          }),
        }}
      />
    </>
  );
}

function refillLabel(days: number | null): string {
  if (!days) return "Garansi refill";
  if (days >= 36500) return "Garansi Lifetime (seumur hidup)";
  if (days >= 365) return `Garansi ${Math.round(days / 365)} tahun (R${days})`;
  if (days >= 30) return `Garansi ${Math.round(days / 30)} bulan (R${days})`;
  return `Garansi ${days} hari`;
}

function defaultTargetHint(platform: string): string {
  const map: Record<string, string> = {
    instagram: "Link profil / postingan",
    tiktok: "Link video / username",
    youtube: "Link video / channel",
    facebook: "Link halaman / postingan",
    twitter: "Link profil / tweet",
    telegram: "Link channel / grup",
    whatsapp: "Link channel",
    shopee: "Link toko / produk",
    tokopedia: "Link toko / produk",
    spotify: "Link lagu / album",
    threads: "Link profil / postingan",
    google: "Link Google Maps",
    website: "URL halaman website",
  };
  return map[platform] ?? "Link / username target";
}

function SummaryCard({
  icon,
  label,
  value,
  hint,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? "border-emerald-500/30 bg-emerald-500/[0.08]" : "border-line bg-surface-2/50"
      }`}
    >
      <span
        className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase ${
          highlight ? "text-emerald-500 dark:text-emerald-300" : "text-muted"
        }`}
      >
        {icon} {label}
      </span>
      <p className="mt-2 text-[20px] leading-tight font-extrabold text-fg">{value}</p>
      {hint ? <p className="mt-0.5 text-[11.5px] text-muted">{hint}</p> : null}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-2.5 last:border-0">
      <span className="text-[12.5px] text-muted">{label}</span>
      <span className="max-w-[60%] text-right text-[12.8px] font-semibold text-fg">{value}</span>
    </div>
  );
}

function MiniFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-3/40 px-3 py-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-500/12 text-brand-500 dark:text-brand-300">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10.5px] font-semibold tracking-wide text-muted uppercase">{label}</p>
        <p className="truncate text-[12.5px] font-bold text-fg">{value}</p>
      </div>
    </div>
  );
}
