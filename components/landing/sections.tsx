import Link from "next/link";
import {
  ArrowRight, BadgeCheck, BarChart3, CreditCard, Headphones, Lock, MessageCircle,
  ShieldCheck, Sparkles, Wallet, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Marquee, Stars } from "@/components/ui/misc";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { Badge } from "@/components/ui/badge";
import { features, steps, testimonials } from "@/lib/content";
import { PLATFORMS } from "@/lib/platforms";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/cn";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Wallet, ShieldCheck, Lock, Headphones, CreditCard, BadgeCheck, BarChart3,
};

/* ------------------------------------------------------------ Judul section */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  action,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        action ? "sm:flex-row sm:items-end sm:justify-between sm:text-left" : "",
      )}
    >
      <div className={cn(align === "center" && !action ? "mx-auto max-w-2xl" : "max-w-2xl")}>
        {eyebrow ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-brand-600 uppercase dark:text-brand-300">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="mt-3.5 text-[26px] leading-tight font-extrabold tracking-tight sm:text-[32px]">{title}</h2>
        {description ? <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* ---------------------------------------------------------------- Fitur */
export function Features() {
  return (
    <section id="keunggulan" className="scroll-mt-24 py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Kenapa harus kami"
          title={<>Alasan ribuan creator &amp; reseller <span className="gradient-text">pilih {siteConfig.name}</span></>}
          description="Kami fokus pada tiga hal: harga murah, proses cepat, dan layanan yang bisa diandalkan. Semua fitur di bawah aktif tanpa biaya tambahan."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = ICONS[feature.icon] ?? Sparkles;
            return (
              <div
                key={feature.title}
                className="reveal group relative overflow-hidden rounded-2xl border border-line bg-surface-2/50 p-5 hover-lift"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <span className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-brand-500/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 sm:opacity-0" />
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-fuchsia-500/15 text-brand-500 ring-1 ring-brand-500/20 dark:text-brand-300">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[15px] font-bold text-fg">{feature.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Platform */
export function PlatformStrip() {
  const row = PLATFORMS.filter((p) => p.key !== "lainnya");
  return (
    <section className="border-y border-line bg-surface-2/30 py-8">
      <div className="container-page">
        <p className="text-center text-[12px] font-bold tracking-[0.16em] text-muted uppercase">
          Mendukung 20+ platform media sosial &amp; marketplace
        </p>
      </div>
      <div className="mt-6 space-y-3">
        <Marquee speed={38}>
          {row.map((p) => (
            <span
              key={`${p.key}-a`}
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-line bg-surface-2/70 px-4 py-2.5 text-[13px] font-bold text-fg-soft backdrop-blur"
            >
              <PlatformIcon platform={p.key} className="h-4.5 w-4.5" />
              {p.label}
            </span>
          ))}
        </Marquee>
        <Marquee speed={44} reverse>
          {[...row].reverse().map((p) => (
            <span
              key={`${p.key}-b`}
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-line bg-surface-2/70 px-4 py-2.5 text-[13px] font-bold text-fg-soft backdrop-blur"
            >
              <PlatformIcon platform={p.key} className="h-4.5 w-4.5" />
              {p.label}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Langkah */
export function Steps() {
  return (
    <section id="cara-order" className="scroll-mt-24 py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Cara order"
          title={<>Pesan dalam <span className="gradient-text">4 langkah</span> saja</>}
          description="Tidak perlu daftar ribet, tidak perlu isi saldo dulu. Anda bisa langsung memesan dan dibantu admin sampai selesai."
        />

        <div className="relative mt-12">
          <div aria-hidden className="absolute top-[42px] right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent lg:block" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="reveal relative rounded-2xl border border-line bg-surface-2/50 p-5" style={{ animationDelay: `${index * 80}ms` }}>
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl gradient-brand text-[15px] font-extrabold text-white shadow-lg shadow-brand-600/25">
                    {index + 1}
                  </span>
                  <h3 className="text-[15px] font-bold text-fg">{step.title}</h3>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button href="/layanan" size="lg">
            Mulai Pilih Layanan <ArrowRight className="h-4 w-4" />
          </Button>
          <Button href="/page/contoh-target" variant="secondary" size="lg">
            Lihat Contoh Input Link
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Testimoni */
export function Testimonials() {
  const row1 = testimonials.slice(0, 5);
  const row2 = testimonials.slice(5);

  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Testimoni"
          title={<>Kata mereka yang sudah <span className="gradient-text">membuktikan</span></>}
          description={`Lebih dari ${siteConfig.stats.ordersCompleted.toLocaleString("id-ID")} pesanan telah diproses dengan rating rata-rata ${siteConfig.stats.rating}/5.`}
        />
      </div>

      <div className="mt-12 space-y-4">
        <Marquee speed={52}>
          {row1.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </Marquee>
        <Marquee speed={58} reverse>
          {row2.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}

function TestimonialCard({
  name,
  role,
  text,
  rating,
}: {
  name: string;
  role: string;
  text: string;
  rating: number;
}) {
  return (
    <figure className="w-[300px] shrink-0 rounded-2xl border border-line bg-surface-2/60 p-4 backdrop-blur sm:w-[340px]">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full gradient-brand text-[13px] font-extrabold text-white">
          {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-bold text-fg">{name}</p>
          <p className="truncate text-[11.5px] text-muted">{role}</p>
        </div>
        <Stars value={rating} className="ml-auto" />
      </div>
      <blockquote className="mt-3 text-[12.8px] leading-relaxed text-fg-soft">“{text}”</blockquote>
    </figure>
  );
}

/* --------------------------------------------------------- Pembayaran */
export function PaymentMethods() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface-2/50 p-6 sm:p-10">
          <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <Badge tone="brand">Pembayaran</Badge>
              <h2 className="mt-3 text-[24px] font-extrabold sm:text-[28px]">
                Bayar pakai apa saja, <span className="gradient-text">semuanya bisa</span>
              </h2>
              <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted">
                Mendukung QRIS otomatis, dompet digital populer, dan transfer bank. Verifikasi pembayaran
                cepat supaya pesanan Anda langsung diproses tanpa menunggu lama.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {siteConfig.payments.map((p) => (
                  <span key={p.name} className={`rounded-xl bg-gradient-to-br ${p.tone} px-3.5 py-2 text-[12px] font-bold text-white shadow`}>
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-3 rounded-2xl border border-line bg-surface-3/50 p-5 lg:min-w-[260px]">
              <p className="text-[12px] font-bold tracking-[0.14em] text-muted uppercase">Jaminan kami</p>
              {[
                "Invoice & bukti pesanan tersimpan",
                "Tidak ada biaya tersembunyi",
                "Refund bila layanan gagal",
                "Support 24 jam, 7 hari seminggu",
              ].map((item) => (
                <p key={item} className="flex items-start gap-2 text-[12.8px] font-medium text-fg-soft">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-[10px] text-emerald-400">✓</span>
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- CTA */
export function CTASection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-4xl border border-brand-500/25 p-8 text-center sm:p-14">
          <div aria-hidden className="absolute inset-0 -z-10 gradient-brand opacity-[0.14]" />
          <div aria-hidden className="pointer-events-none absolute -bottom-20 left-1/2 h-56 w-[36rem] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />

          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-brand-600 uppercase dark:text-brand-300">
            Siap mulai?
          </span>
          <h2 className="mx-auto mt-4 max-w-2xl text-[28px] leading-tight font-extrabold sm:text-[36px]">
            Tingkatkan engagement akun Anda <span className="gradient-text">hari ini</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[14.5px] leading-relaxed text-muted">
            Pilih layanan, masukkan link, dan biarkan sistem kami bekerja. Bingung mau pilih yang mana?
            Chat admin — kami bantu rekomendasi layanan paling cocok untuk akun Anda.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button href="/layanan" size="lg">
              <Sparkles className="h-4.5 w-4.5" /> Lihat Katalog
            </Button>
            <Button
              href={siteConfig.whatsappLink(`Halo admin ${siteConfig.name}, saya mau konsultasi layanan dulu.`)}
              variant="whatsapp"
              size="lg"
            >
              <MessageCircle className="h-4.5 w-4.5" /> Chat Admin Sekarang
            </Button>
          </div>
          <p className="mt-5 text-[12.5px] text-muted">
            Belum yakin? Cek dulu <Link href="/cek-order" className="font-semibold text-brand-400 underline-offset-2 hover:underline">halaman cek order</Link> untuk melihat bagaimana pesanan dipantau.
          </p>
        </div>
      </div>
    </section>
  );
}
