import Link from "next/link";
import {
  AlertTriangle, Ban, Banknote, CheckCircle2, Database, KeyRound, PackageCheck, Percent,
  RefreshCw, Send, Server, ShieldAlert, Terminal, TrendingUp, Wallet, Wifi,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/field";
import { CancelQuoteButton, SubmitQuoteButton, SyncCatalogButton } from "@/components/admin/quote-actions";
import { getCatalog, getCatalogStats, getMarginSummary } from "@/lib/catalog";
import { fetchPanelBalance, getCredentials, getPanelBaseUrl, isIpNotAllowed, maskSecret } from "@/lib/smm";
import { getPricingConfig, summarizePricing } from "@/lib/pricing";
import { listQuotes, summarizeQueue } from "@/lib/quotes";
import { formatDateTime, formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard Internal — Diagnosa & Margin",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/* ------------------------------------------------------------------- Halaman */

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const adminToken = process.env.ADMIN_TOKEN || "";
  const provided = first(sp.token);
  const probe = first(sp.probe) === "1";

  if (adminToken && provided !== adminToken) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-line bg-surface-2/60 p-6">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-500/12 text-brand-500 dark:text-brand-300">
            <KeyRound className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-[20px] font-extrabold text-fg">Halaman internal terkunci</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Masukkan token admin (nilai <code className="font-mono text-brand-400">ADMIN_TOKEN</code> pada
            environment) untuk membuka dashboard internal.
          </p>
          <form method="GET" className="mt-4 flex gap-2">
            <Input name="token" placeholder="Token admin" type="password" autoComplete="off" required />
            <Button type="submit" size="md">
              Buka
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const catalog = await getCatalog();
  const stats = getCatalogStats(catalog.services);
  const credentials = getCredentials();
  const baseUrl = getPanelBaseUrl();
  const pricingConfig = getPricingConfig();
  const pricing = summarizePricing(catalog.services, pricingConfig);
  const margin = getMarginSummary(catalog.services);
  const queue = summarizeQueue();
  const pendingQuotes = listQuotes("menunggu_pembayaran");
  const recentQuotes = listQuotes().slice(0, 25);
  const autoSubmit = process.env.ORDER_AUTO_SUBMIT === "1";

  const probeBalance = probe ? await fetchPanelBalance() : null;
  const ipBlocked = probeBalance && !probeBalance.ok ? isIpNotAllowed(probeBalance.error) : false;

  const tokenQuery = encodeURIComponent(provided ?? "");

  return (
    <>
      <PageHero
        eyebrow="Internal"
        breadcrumbs={[{ label: "Dashboard" }]}
        title={
          <>
            Dashboard <span className="gradient-text">penjualan &amp; sistem</span>
          </>
        }
        description="Pantau margin keuntungan tiap layanan, kelola pesanan yang menunggu pembayaran, dan pastikan koneksi ke panel SMM Nusantara berjalan normal."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={autoSubmit ? "danger" : "success"}>
            {autoSubmit ? "Mode instan: order langsung ke panel" : "Mode aman: bayar dulu, baru diproses"}
          </Badge>
          <Badge tone={credentials.configured ? "success" : "danger"}>
            {credentials.configured ? "Kredensial terbaca" : "Kredensial belum diisi"}
          </Badge>
          <Badge tone={catalog.source === "panel" ? "success" : "warning"}>
            Katalog: {catalog.source}
          </Badge>
          <Badge tone="brand">
            <Percent className="h-3.5 w-3.5" /> Rata-rata margin {margin.averageMarginPercent.toFixed(0)}%
          </Badge>
        </div>
      </PageHero>

      <div className="container-page space-y-6">
        {/* ---------------------------------------------------- Ringkasan angka */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Markup rata-rata"
            value={`${pricing.averageMultiplier.toFixed(2)}×`}
            note={`margin +${margin.averageMarginPercent.toFixed(0)}% dari modal panel`}
            tone="brand"
          />
          <MetricCard
            icon={<Banknote className="h-4 w-4" />}
            label="Contoh termurah"
            value={`${formatRupiah(pricing.cheapestCost)} → ${formatRupiah(pricing.cheapestRetail)}`}
            note="harga modal → harga jual (per 1.000)"
            tone="success"
          />
          <MetricCard
            icon={<Wallet className="h-4 w-4" />}
            label="Menunggu pembayaran"
            value={formatRupiah(queue.pendingValue)}
            note={`${queue.pendingCount} pesanan · potensi laba ${formatRupiah(queue.pendingProfit)}`}
            tone={queue.pendingCount > 0 ? "warning" : "neutral"}
          />
          <MetricCard
            icon={<PackageCheck className="h-4 w-4" />}
            label="Laba terealisasi"
            value={formatRupiah(queue.sentProfit)}
            note={`${queue.sentCount} pesanan sudah dikirim ke panel`}
            tone="success"
          />
        </div>

        {/* ------------------------------------------------------- Antrean bayar */}
        <section className="rounded-3xl border border-line bg-surface-2/50 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-fg">
              <Wallet className="h-4.5 w-4.5 text-brand-400" /> Antrean pesanan menunggu pembayaran
            </h2>
            <p className="text-[12px] text-muted">
              Total nilai {formatRupiah(queue.pendingValue)} · laba potensial{" "}
              <span className="font-bold text-emerald-500 dark:text-emerald-300">
                {formatRupiah(queue.pendingProfit)}
              </span>
            </p>
          </div>

          {pendingQuotes.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-line-strong bg-surface-3/30 px-4 py-8 text-center text-[13px] text-muted">
              Belum ada pesanan yang menunggu pembayaran. Pesanan baru akan muncul di sini secara otomatis.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line text-[11px] tracking-wide text-muted uppercase">
                    <th className="px-3 py-2.5 font-bold">Referensi</th>
                    <th className="px-3 py-2.5 font-bold">Layanan</th>
                    <th className="px-3 py-2.5 font-bold">Target</th>
                    <th className="px-3 py-2.5 text-right font-bold">Qty</th>
                    <th className="px-3 py-2.5 text-right font-bold">Dibayar</th>
                    <th className="px-3 py-2.5 text-right font-bold">Laba</th>
                    <th className="px-3 py-2.5 text-right font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingQuotes.map((quote) => (
                    <tr key={quote.reference} className="border-b border-line last:border-0">
                      <td className="px-3 py-3">
                        <span className="font-mono text-[12px] font-bold text-amber-600 dark:text-amber-300">
                          {quote.reference}
                        </span>
                        <p className="mt-0.5 text-[11px] text-muted">{formatDateTime(quote.createdAt)}</p>
                      </td>
                      <td className="max-w-[220px] px-3 py-3">
                        <p className="truncate text-[12.5px] font-semibold text-fg" title={quote.serviceName}>
                          {quote.serviceName}
                        </p>
                        <p className="text-[11px] text-muted">#{quote.serviceId} · {quote.platform}</p>
                      </td>
                      <td className="max-w-[200px] px-3 py-3">
                        <span className="block truncate font-mono text-[11.5px] text-muted" title={quote.target}>
                          {quote.target}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-[12.5px] font-semibold text-fg-soft">
                        {quote.quantity.toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-3 text-right text-[12.5px] font-bold text-fg">
                        {formatRupiah(quote.total)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-[12.5px] font-bold text-emerald-500 dark:text-emerald-300">
                          {formatRupiah(quote.profit)}
                        </span>
                        <p className="text-[10.5px] text-muted">
                          modal {formatRupiah(quote.costPerThousand)}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <SubmitQuoteButton reference={quote.reference} token={provided ?? ""} />
                          <CancelQuoteButton reference={quote.reference} token={provided ?? ""} />
                        </div>
                        {quote.note ? (
                          <p className="mt-1.5 max-w-[260px] text-right text-[11px] text-rose-500 dark:text-rose-300">
                            {quote.note}
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {recentQuotes.some((quote) => quote.status === "terkirim") ? (
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[12px] font-bold tracking-wide text-muted uppercase">
                Terakhir dikirim ke panel
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {recentQuotes
                  .filter((quote) => quote.status === "terkirim")
                  .slice(0, 6)
                  .map((quote) => (
                    <span
                      key={quote.reference}
                      className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-2 text-[11.5px]"
                    >
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-300">
                        {quote.reference}
                      </span>
                      <span className="text-muted"> → panel #{quote.panelOrderId} · laba </span>
                      <span className="font-bold text-fg">{formatRupiah(quote.profit)}</span>
                    </span>
                  ))}
              </div>
            </div>
          ) : null}
        </section>

        {/* ------------------------------------------------------- Harga & margin */}
        <section className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
          <div className="rounded-3xl border border-line bg-surface-2/50 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-fg">
              <Percent className="h-4.5 w-4.5 text-brand-400" /> Konfigurasi markup
            </h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
              Harga jual = harga modal panel × pengali tier, minimal modal +{" "}
              {formatRupiah(pricingConfig.minProfit)} per 1.000 unit.
              {pricingConfig.flatMarkupPercent > 0 ? (
                <span className="mt-1 block font-semibold text-amber-600 dark:text-amber-300">
                  Mode markup flat aktif: +{pricingConfig.flatMarkupPercent}% untuk semua layanan
                  (mengabaikan tier).
                </span>
              ) : null}
            </p>

            <div className="mt-4 overflow-hidden rounded-2xl border border-line">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-surface-3/50 text-[11px] tracking-wide text-muted uppercase">
                  <tr>
                    <th className="px-3 py-2 font-bold">Modal per 1.000</th>
                    <th className="px-3 py-2 text-right font-bold">Pengali</th>
                    <th className="px-3 py-2 text-right font-bold">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingConfig.tiers.map((tier, index) => {
                    const previous = index === 0 ? 0 : pricingConfig.tiers[index - 1].maxCost;
                    const label = Number.isFinite(tier.maxCost)
                      ? `${formatRupiah(previous)} – ${formatRupiah(tier.maxCost)}`
                      : `> ${formatRupiah(previous)}`;
                    return (
                      <tr key={`${tier.maxCost}-${tier.multiplier}`} className="border-t border-line">
                        <td className="px-3 py-2 text-fg-soft">{label}</td>
                        <td className="px-3 py-2 text-right font-bold text-fg">{tier.multiplier}×</td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-500 dark:text-emerald-300">
                          +{((tier.multiplier - 1) * 100).toFixed(0)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-2 text-[12px]">
              <EnvRow label="NEXT_PUBLIC_PRICE_MARKUP" value={`${pricingConfig.flatMarkupPercent || 0}% (0 = pakai tier)`} />
              <EnvRow label="PRICING_MIN_PROFIT" value={formatRupiah(pricingConfig.minProfit)} />
              <EnvRow label="PRICING_ROUND_STEP" value={pricingConfig.roundStep > 0 ? formatRupiah(pricingConfig.roundStep) : "otomatis"} />
              <EnvRow label="ORDER_AUTO_SUBMIT" value={autoSubmit ? "1 (instan)" : "0 (aman)"} />
            </div>

            <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
              Ubah nilainya di <code className="font-mono">.env.local</code> lalu tekan{" "}
              <strong>Sinkronkan katalog</strong> agar harga baru langsung berlaku.
            </p>
          </div>

          <div className="rounded-3xl border border-line bg-surface-2/50 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-fg">
              <TrendingUp className="h-4.5 w-4.5 text-brand-400" /> Audit margin layanan
            </h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
              Daftar layanan dengan margin terendah (per 1.000 unit). Gunakan untuk memastikan tidak ada
              layanan yang dijual mendekati harga modal.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-[12px]">
                <thead className="text-[11px] tracking-wide text-muted uppercase">
                  <tr className="border-b border-line">
                    <th className="px-2 py-2 font-bold">Layanan</th>
                    <th className="px-2 py-2 text-right font-bold">Modal</th>
                    <th className="px-2 py-2 text-right font-bold">Jual</th>
                    <th className="px-2 py-2 text-right font-bold">Laba</th>
                    <th className="px-2 py-2 text-right font-bold">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.lowestMargin.map((item) => (
                    <tr key={item.id} className="border-b border-line last:border-0">
                      <td className="max-w-[240px] px-2 py-2">
                        <Link href={`/layanan/${item.id}`} className="block truncate font-semibold text-fg hover:text-brand-400" title={item.name}>
                          {item.name}
                        </Link>
                        <span className="text-[10.5px] text-muted">#{item.id}</span>
                      </td>
                      <td className="px-2 py-2 text-right text-muted">{formatRupiah(item.cost)}</td>
                      <td className="px-2 py-2 text-right font-semibold text-fg">{formatRupiah(item.retail)}</td>
                      <td className="px-2 py-2 text-right font-bold text-emerald-500 dark:text-emerald-300">
                        {formatRupiah(item.profit)}
                      </td>
                      <td className="px-2 py-2 text-right font-bold text-brand-500 dark:text-brand-300">
                        +{item.profitPercent.toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <MiniStat
                label="Layanan termahal"
                value={margin.highest ? `${formatRupiah(margin.highest.price)} → ${formatRupiah(margin.highest.priceRetail)}` : "-"}
              />
              <MiniStat
                label="Layanan termurah"
                value={margin.lowest ? `${formatRupiah(margin.lowest.price)} → ${formatRupiah(margin.lowest.priceRetail)}` : "-"}
              />
            </div>
          </div>
        </section>

        {/* --------------------------------------------------- Status & sinkronisasi */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatusCard
            icon={<Server className="h-4 w-4" />}
            title="Panel API"
            value={baseUrl}
            ok={credentials.configured}
            note="SMM_API_URL"
          />
          <StatusCard
            icon={<KeyRound className="h-4 w-4" />}
            title="API ID / KEY"
            value={credentials.configured ? `${maskSecret(credentials.apiId, 2)} / ${maskSecret(credentials.apiKey)}` : "belum diisi"}
            ok={credentials.configured}
            note="Jangan bagikan nilai ini ke publik"
          />
          <StatusCard
            icon={<Database className="h-4 w-4" />}
            title="Katalog"
            value={`${stats.totalServices.toLocaleString("id-ID")} layanan · ${stats.totalPlatforms} platform`}
            ok={stats.totalServices > 0}
            note={`Diperbarui ${formatDateTime(catalog.fetchedAt)}`}
          />
          <StatusCard
            icon={<Wifi className="h-4 w-4" />}
            title="Kesiapan kirim ke panel"
            value={catalog.source === "panel" ? "Siap (perlu IP whitelist)" : "Belum siap"}
            ok={catalog.source === "panel"}
            note="Order & cek status butuh IP server diizinkan panel"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-line bg-surface-2/50 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-fg">
              <RefreshCw className="h-4.5 w-4.5 text-brand-400" /> Sinkronisasi & uji koneksi
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Katalog disimpan dalam cache {process.env.CATALOG_REVALIDATE_SECONDS ?? 600} detik. Sinkronkan
              ulang setelah mengubah konfigurasi harga, atau saat katalog panel berubah.
            </p>

            {catalog.error ? (
              <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-300" />
                <div>
                  <p className="text-[12.5px] font-bold text-fg">Pesan terakhir dari sistem</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{catalog.error}</p>
                </div>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <SyncCatalogButton token={provided ?? ""} />
              <Button href={`/admin?token=${tokenQuery}&probe=1`} variant="secondary" size="md">
                <ShieldAlert className="h-4 w-4" /> Uji saldo panel (probe)
              </Button>
            </div>

            {probeBalance ? (
              <div className="mt-4 rounded-2xl border border-line bg-surface-3/45 p-4">
                <p className="text-[12.5px] font-bold text-fg">Hasil probe saldo</p>
                {probeBalance.ok ? (
                  <p className="mt-1.5 flex items-center gap-2 text-[13px] text-emerald-500 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" /> Saldo panel: {probeBalance.data.balance}{" "}
                    {probeBalance.data.currency}
                  </p>
                ) : (
                  <div className="mt-1.5 space-y-2">
                    <p className="text-[12.5px] leading-relaxed text-rose-500 dark:text-rose-300">
                      {probeBalance.error}
                    </p>
                    {ipBlocked ? (
                      <p className="text-[12px] leading-relaxed text-muted">
                        Solusi: buka dashboard SMM Nusantara → menu <strong>API / Pengaturan API</strong> →
                        tambahkan IP server hosting website ini. Setelah itu coba probe lagi.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-line bg-surface-2/50 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-fg">
              <Terminal className="h-4.5 w-4.5 text-brand-400" /> Environment terbaca
            </h2>
            <div className="mt-3.5 space-y-2 text-[12.5px]">
              <EnvRow label="SMM_API_URL" value={baseUrl} />
              <EnvRow label="SMM_API_ID" value={credentials.apiId ? maskSecret(credentials.apiId, 2) : "(kosong)"} />
              <EnvRow label="SMM_API_KEY" value={credentials.apiKey ? maskSecret(credentials.apiKey) : "(kosong)"} />
              <EnvRow
                label="NEXT_PUBLIC_PAYMENT_BANK"
                value={`${process.env.NEXT_PUBLIC_PAYMENT_BANK ?? "(kosong)"} · ${process.env.NEXT_PUBLIC_PAYMENT_BANK_ACCOUNT ? maskSecret(process.env.NEXT_PUBLIC_PAYMENT_BANK_ACCOUNT, 3) : "(kosong)"}`}
              />
              <EnvRow label="CATALOG_REVALIDATE_SECONDS" value={String(process.env.CATALOG_REVALIDATE_SECONDS ?? 600)} />
              <EnvRow label="CATALOG_FORCE_OFFLINE" value={process.env.CATALOG_FORCE_OFFLINE === "1" ? "aktif" : "nonaktif"} />
              <EnvRow label="ADMIN_TOKEN" value={process.env.ADMIN_TOKEN ? "terpasang" : "(kosong)"} />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------- Checklist */}
        <div className="rounded-3xl border border-line bg-surface-2/50 p-5 sm:p-6">
          <h2 className="text-[16px] font-extrabold text-fg">Checklist go-live</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              {
                title: "1. Atur margin harga",
                desc: "Sudah aktif dengan markup bertingkat (rata-rata " +
                  `${pricing.averageMultiplier.toFixed(2)}×, margin +${margin.averageMarginPercent.toFixed(0)}%). ` +
                  "Ubah PRICING_TIERS bila ingin margin berbeda.",
              },
              {
                title: "2. Isi rekening pembayaran",
                desc: "NEXT_PUBLIC_PAYMENT_BANK / ACCOUNT / HOLDER dan E-WALLET agar instruksi pembayaran tampil benar ke customer.",
              },
              {
                title: "3. Whitelist IP server",
                desc: "Tambahkan IP keluar server di dashboard panel agar tombol \"Kirim ke panel\" berhasil.",
              },
              {
                title: "4. Uji satu pesanan kecil",
                desc: "Buat pesanan uji dari halaman /order → bayar sesuai instruksi → klik \"Kirim ke panel\" → cek statusnya.",
              },
              {
                title: "5. Tentukan alur order",
                desc: autoSubmit
                  ? "ORDER_AUTO_SUBMIT=1 aktif: pesanan langsung dikirim tanpa pembayaran. Hanya aman bila pembayaran sudah otomatis."
                  : "ORDER_AUTO_SUBMIT=0 (aman): customer bayar dulu, Anda konfirmasi lewat antrean di atas.",
              },
              {
                title: "6. Backup katalog (opsional)",
                desc: "Jalankan `npm run sync:catalog` di VPS Anda untuk menyimpan snapshot katalog sebagai cadangan.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-line bg-surface-3/40 p-4">
                <p className="text-[13px] font-bold text-fg">{item.title}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------------- Katalog info */}
        <div className="rounded-3xl border border-line bg-surface-2/40 p-5">
          <h2 className="text-[14px] font-extrabold text-fg">Ringkasan katalog per platform</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(
              catalog.services.reduce<Record<string, number>>((acc, service) => {
                acc[service.platformLabel] = (acc[service.platformLabel] ?? 0) + 1;
                return acc;
              }, {}),
            )
              .sort((a, b) => b[1] - a[1])
              .map(([label, count]) => (
                <span
                  key={label}
                  className="rounded-lg border border-line bg-surface-3/50 px-3 py-1.5 text-[12px] font-semibold text-fg-soft"
                >
                  {label}: <span className="font-bold text-fg">{count}</span>
                </span>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ Sub-komponen */

function MetricCard({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note?: string;
  tone: "brand" | "success" | "warning" | "neutral";
}) {
  const tones = {
    brand: "border-brand-500/25 bg-brand-500/[0.07] text-brand-600 dark:text-brand-300",
    success: "border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-600 dark:text-emerald-300",
    warning: "border-amber-500/30 bg-amber-500/[0.08] text-amber-600 dark:text-amber-300",
    neutral: "border-line bg-surface-2/50 text-muted",
  } as const;

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase">
        {icon} {label}
      </span>
      <p className="mt-2 text-[15px] leading-tight font-extrabold text-fg">{value}</p>
      {note ? <p className="mt-1 text-[11.5px] leading-snug text-muted">{note}</p> : null}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-3/40 px-3.5 py-3">
      <p className="text-[10.5px] font-bold tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-1 text-[12.5px] font-semibold text-fg">{value}</p>
    </div>
  );
}

function StatusCard({
  icon,
  title,
  value,
  note,
  ok,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  note?: string;
  ok?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        ok ? "border-emerald-500/25 bg-emerald-500/[0.06]" : "border-amber-500/30 bg-amber-500/[0.07]"
      }`}
    >
      <span
        className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase ${
          ok ? "text-emerald-500 dark:text-emerald-300" : "text-amber-600 dark:text-amber-300"
        }`}
      >
        {icon} {title}
      </span>
      <p className="mt-2 truncate text-[13.5px] font-bold text-fg" title={value}>
        {value}
      </p>
      {note ? <p className="mt-1 text-[11.5px] leading-snug text-muted">{note}</p> : null}
    </div>
  );
}

function EnvRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0">
      <code className="font-mono text-[11.5px] text-muted">{label}</code>
      <span className="truncate font-mono text-[11.5px] font-semibold text-fg">{value}</span>
    </div>
  );
}
