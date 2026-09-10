import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock, Lock, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Counter } from "@/components/ui/misc";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { compactNumber, formatRupiah } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import { PLATFORMS } from "@/lib/platforms";

interface HeroProps {
  totalServices: number;
  totalPlatforms: number;
  priceFrom: number;
  demoMode?: boolean;
}

export function Hero({ totalServices, totalPlatforms, priceFrom, demoMode }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-14 lg:pt-20 lg:pb-24">
      <div className="container-page">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* Kolom kiri */}
          <div className="reveal">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-line bg-surface-2/70 px-3 py-1.5 text-[11.5px] font-semibold backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-fg-soft">Server online · proses otomatis 24 jam</span>
              <span className="hidden text-muted sm:inline">•</span>
              <span className="hidden text-muted sm:inline">{compactNumber(totalServices)}+ layanan aktif</span>
            </div>

            <h1 className="text-balance-pretty mt-5 text-[34px] leading-[1.08] font-extrabold tracking-tight sm:text-[44px] lg:text-[52px]">
              Naikkan <span className="gradient-text">Followers</span>, Likes &amp; Views
              <br className="hidden sm:block" /> dalam Hitungan Menit
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-[16px]">
              {siteConfig.name} adalah panel SMM Indonesia untuk membeli followers, likes, views,
              komentar, dan subscriber di Instagram, TikTok, YouTube, dan {totalPlatforms - 3}+ platform
              lainnya. Tanpa perlu password akun, garansi refill, dan harga mulai{" "}
              <span className="font-bold text-fg">{formatRupiah(priceFrom)}</span> per 1.000.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button href="/layanan" size="lg">
                <Sparkles className="h-4.5 w-4.5" />
                Lihat Katalog Layanan
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/order" variant="secondary" size="lg">
                Pesan Sekarang
              </Button>
            </div>

            <div className="mt-6 grid max-w-xl gap-3 sm:grid-cols-3">
              <TrustPoint icon={<Lock className="h-4 w-4" />} title="Tanpa Password" desc="Cukup link/username akun Anda." />
              <TrustPoint icon={<BadgeCheck className="h-4 w-4" />} title="Bergaransi" desc="Banyak layanan ada refill." />
              <TrustPoint icon={<Clock className="h-4 w-4" />} title="Support 24/7" desc="Admin responsif via WhatsApp." />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-4">
              <Stat label="Layanan" value={totalServices} suffix="+" />
              <Stat label="Pesanan selesai" value={siteConfig.stats.ordersCompleted} compact />
              <Stat label="Pengguna aktif" value={siteConfig.stats.activeUsers} compact />
              <Stat label="Rating pengguna" value={siteConfig.stats.rating} decimals={1} suffix="/5" />
            </div>

            {demoMode ? (
              <p className="mt-5 inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[12px] font-medium text-amber-700 dark:text-amber-300">
                <Zap className="h-3.5 w-3.5" />
                Mode pratinjau: katalog contoh. Data asli otomatis tampil saat server terhubung ke panel.
              </p>
            ) : null}
          </div>

          {/* Kolom kanan: mock UI */}
          <div className="relative reveal" style={{ animationDelay: "120ms" }}>
            <div className="relative mx-auto max-w-[440px]">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-brand-600/25 via-fuchsia-500/15 to-cyan-400/20 blur-2xl" />

              <div className="relative rounded-[2rem] border border-line bg-surface-2/85 p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand">
                      <Zap className="h-4.5 w-4.5 text-white" />
                    </span>
                    <div>
                      <p className="text-[13px] font-bold text-fg">Order Baru</p>
                      <p className="text-[11px] text-muted">Proses otomatis &lt; 60 detik</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10.5px] font-bold text-emerald-500 dark:text-emerald-300">
                    ● LIVE
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {PLATFORMS.slice(0, 6).map((p, i) => (
                    <span
                      key={p.key}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-semibold ${
                        i === 1
                          ? "border-transparent bg-brand-500/15 text-brand-600 dark:text-brand-200"
                          : "border-line bg-surface-3/60 text-muted"
                      }`}
                    >
                      <PlatformIcon platform={p.key} className="h-3.5 w-3.5" />
                      {p.label}
                    </span>
                  ))}
                </div>

                <div className="mt-4 space-y-3">
                  <MockField label="Layanan dipilih">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[12.5px] font-semibold text-fg">TikTok Followers S-4 · Real</span>
                      <span className="shrink-0 text-[11px] font-bold text-brand-500 dark:text-brand-300">Rp 30.568 / 1K</span>
                    </div>
                  </MockField>

                  <MockField label="Link / username tujuan">
                    <span className="truncate text-[12.5px] font-medium text-muted">https://tiktok.com/@akun.anda</span>
                  </MockField>

                  <MockField label="Jumlah">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[12.5px] font-semibold text-fg">
                        <span>1.000 followers</span>
                        <span className="text-brand-500 dark:text-brand-300">Rp 30.568</span>
                      </div>
                      <div className="relative h-2 overflow-hidden rounded-full bg-surface-3">
                        <div className="absolute inset-y-0 left-0 w-[62%] rounded-full gradient-brand" />
                        <span className="absolute top-1/2 left-[62%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-500 shadow" />
                      </div>
                    </div>
                  </MockField>
                </div>

                <button
                  type="button"
                  tabIndex={-1}
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl gradient-brand text-[14px] font-bold text-white shadow-lg shadow-brand-600/30"
                >
                  Buat Pesanan
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted">
                  <Lock className="h-3 w-3" /> Pembayaran aman · QRIS, e-wallet, bank transfer
                </div>
              </div>

              {/* Kartu melayang */}
              <div className="absolute -bottom-6 -left-4 hidden w-[220px] animate-float rounded-2xl border border-line bg-surface-2/95 p-3.5 shadow-xl backdrop-blur-xl sm:block">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/15 text-emerald-400">✓</span>
                  <div>
                    <p className="text-[11.5px] font-bold text-fg">Order #SR-1042 selesai</p>
                    <p className="text-[10.5px] text-muted">+1.000 Followers terkirim</p>
                  </div>
                </div>
              </div>

              <div
                className="absolute -top-5 -right-3 hidden w-[190px] animate-float-slow rounded-2xl border border-line bg-surface-2/95 p-3.5 shadow-xl backdrop-blur-xl sm:block"
                style={{ animationDelay: "1.4s" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-fg">Proses order</p>
                  <p className="text-[11px] font-bold text-brand-500 dark:text-brand-300">87%</p>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full w-[87%] rounded-full gradient-brand" />
                </div>
                <p className="mt-2 flex items-center gap-1 text-[10.5px] text-muted">
                  <TrendingUp className="h-3 w-3 text-emerald-400" /> kecepatan 100K/hari
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface-3/50 px-3.5 py-2.5">
      <p className="mb-1 text-[10.5px] font-bold tracking-wide text-muted uppercase">{label}</p>
      {children}
    </div>
  );
}

function TrustPoint({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-line bg-surface-2/50 p-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-500/12 text-brand-500 dark:text-brand-300">
        {icon}
      </span>
      <div>
        <p className="text-[12.5px] font-bold text-fg">{title}</p>
        <p className="text-[11px] leading-snug text-muted">{desc}</p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix = "",
  decimals = 0,
  compact = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  compact?: boolean;
}) {
  return (
    <div>
      <p className="text-[20px] leading-tight font-extrabold text-fg sm:text-[22px]">
        {compact ? (
          <>
            {compactNumber(value)}
            {suffix}
          </>
        ) : (
          <Counter value={value} decimals={decimals} suffix={suffix} />
        )}
      </p>
      <p className="mt-0.5 text-[11.5px] font-medium text-muted">{label}</p>
    </div>
  );
}
