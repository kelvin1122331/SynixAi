import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Clock, CreditCard, Headphones, Lock, MessageCircle, ShieldCheck, Zap } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { OrderForm } from "@/components/services/order-form";
import { ServiceCard } from "@/components/services/service-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCatalog, getServiceById, getTopByPlatform, toPublicServices } from "@/lib/catalog";
import { compactNumber, formatRupiah } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import { targetExamples } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pesan Layanan SMM — Followers, Likes, Views Otomatis",
  description:
    "Form pemesanan layanan SMM: pilih layanan, masukkan link atau username, tentukan jumlah, dan biaya dihitung otomatis. Proses cepat 24 jam, banyak pilihan bergaransi.",
  alternates: { canonical: "/order" },
};

export const revalidate = 120;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function OrderPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const rawService = Array.isArray(sp.service) ? sp.service[0] : sp.service;
  const catalog = await getCatalog();
  const initialService = rawService ? getServiceById(catalog.services, Number(rawService)) ?? null : null;

  // Saran layanan populer (dikirim ke browser dalam bentuk aman: tanpa harga modal panel)
  const suggestions = toPublicServices(
    getTopByPlatform(catalog.services, 4, 3).flatMap((group) => group.items.slice(0, 2)),
  );
  const bestValue = toPublicServices(
    [...catalog.services]
      .filter((s) => s.priceRetail > 0 && s.min <= 100)
      .sort((a, b) => a.priceRetail - b.priceRetail)
      .slice(0, 4),
  );

  return (
    <>
      <PageHero
        eyebrow="Pemesanan"
        breadcrumbs={[{ label: "Pesan Sekarang" }]}
        title={
          <>
            Pesan Layanan dalam <span className="gradient-text">1 menit</span>
          </>
        }
        description="Isi form di bawah, total biaya langsung terlihat. Setelah pesanan dibuat, Anda mendapat ID pesanan yang bisa dipantau di halaman Cek Order. Butuh bantuan admin? Admin kami online 24 jam."
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="success">
            <ShieldCheck className="h-3.5 w-3.5" /> Garansi &amp; refill tersedia
          </Badge>
          <Badge tone="info">
            <Zap className="h-3.5 w-3.5" /> Banyak layanan mulai instan
          </Badge>
          <Badge tone="brand">
            <Lock className="h-3.5 w-3.5" /> Tanpa password akun
          </Badge>
          <Badge tone="neutral">
            <CreditCard className="h-3.5 w-3.5" /> QRIS, e-wallet, transfer bank
          </Badge>
        </div>
      </PageHero>

      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          <div>
            <OrderForm initialService={initialService} services={[]} />

            {initialService ? (
              <p className="mt-3 text-[12.5px] text-muted">
                Layanan terpilih otomatis:{" "}
                <span className="font-semibold text-fg">{initialService.name}</span> —{" "}
                <Link href="/layanan" className="font-semibold text-brand-400 hover:underline">
                  ganti layanan lain
                </Link>
                .
              </p>
            ) : null}

            {/* Saran layanan */}
            <section className="mt-10">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-[19px] font-extrabold text-fg">Sering dipesan pelanggan lain</h2>
                  <p className="mt-1 text-[13px] text-muted">
                    Klik untuk langsung memilih layanan ini di form pemesanan.
                  </p>
                </div>
                <Link href="/layanan" className="text-[12.5px] font-bold text-brand-400 hover:underline">
                  Lihat katalog lengkap →
                </Link>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[...suggestions, ...bestValue].slice(0, 6).map((service) => (
                  <ServiceCard key={`sug-${service.id}`} service={service} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-3xl border border-line bg-surface-2/55 p-5">
              <h2 className="text-[15px] font-extrabold text-fg">Ringkasan cara order</h2>
              <ol className="mt-4 space-y-3.5">
                {[
                  "Pilih layanan sesuai platform & kebutuhan",
                  "Tempel link profil / postingan (tanpa password)",
                  "Tentukan jumlah, total biaya muncul otomatis",
                  "Bayar, lalu pantau progres lewat halaman Cek Order",
                ].map((text, index) => (
                  <li key={text} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-500/15 text-[11.5px] font-extrabold text-brand-500 dark:text-brand-300">
                      {index + 1}
                    </span>
                    <span className="text-[13px] leading-snug text-fg-soft">{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-3xl border border-line bg-surface-2/55 p-5">
              <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-fg">
                <Clock className="h-4 w-4 text-brand-400" /> Estimasi waktu proses
              </h2>
              <div className="mt-3.5 space-y-2.5 text-[12.5px]">
                <EstimateRow label="Layanan Instan / SuperInstant" value="1–5 menit" tone="success" />
                <EstimateRow label="Layanan Real / HQ" value="10–60 menit" tone="info" />
                <EstimateRow label="Live stream & marketplace" value="Saat live / realtime" tone="brand" />
                <EstimateRow label="Komplain & garansi" value="1×24 jam" tone="neutral" />
              </div>
            </div>

            <div className="rounded-3xl border border-line bg-surface-2/55 p-5">
              <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-fg">
                <BadgeCheck className="h-4 w-4 text-emerald-400" /> Contoh input target
              </h2>
              <ul className="mt-3.5 space-y-2">
                {targetExamples.slice(0, 6).map((example) => (
                  <li key={example.label} className="rounded-xl border border-line bg-surface-3/50 px-3 py-2">
                    <p className="text-[11.5px] font-bold text-fg-soft">{example.label}</p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-muted">{example.value}</p>
                  </li>
                ))}
              </ul>
              <Link href="/page/contoh-target" className="mt-3 inline-block text-[12.5px] font-bold text-brand-400 hover:underline">
                Lihat semua contoh →
              </Link>
            </div>

            <div className="rounded-3xl border border-brand-500/25 bg-brand-500/[0.07] p-5">
              <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-fg">
                <Headphones className="h-4 w-4 text-brand-400" /> Butuh bantuan?
              </h2>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                Kirim link akun dan target jumlah Anda, admin akan merekomendasikan layanan paling hemat &
                aman. Online {siteConfig.operationalHours}.
              </p>
              <Button
                href={siteConfig.whatsappLink("Halo admin, saya mau dibantu memilih layanan dan melakukan pemesanan.")}
                variant="whatsapp"
                size="md"
                className="mt-3.5 w-full"
              >
                <MessageCircle className="h-4 w-4" /> Chat Admin WhatsApp
              </Button>
              <p className="mt-2.5 text-center text-[11.5px] text-muted">
                {compactNumber(catalog.services.length)} layanan aktif · harga mulai{" "}
                {formatRupiah(Math.min(...catalog.services.filter((s) => s.priceRetail > 0).map((s) => s.priceRetail)))}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function EstimateRow({ label, value, tone }: { label: string; value: string; tone: "success" | "info" | "brand" | "neutral" }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-3/40 px-3 py-2">
      <span className="text-fg-soft">{label}</span>
      <Badge tone={tone} size="sm">
        {value}
      </Badge>
    </div>
  );
}
