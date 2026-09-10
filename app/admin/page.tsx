import { revalidatePath } from "next/cache";
import {
  AlertTriangle, CheckCircle2, Database, KeyRound, RefreshCw, Server, ShieldAlert, Terminal, Wifi,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/field";
import { getCatalog, getCatalogStats, invalidateCatalog } from "@/lib/catalog";
import { fetchPanelBalance, getCredentials, getPanelBaseUrl, isIpNotAllowed, maskSecret } from "@/lib/smm";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Diagnosa Sistem",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function syncCatalog() {
  "use server";
  await invalidateCatalog();
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/layanan");
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

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
          <h1 className="mt-4 text-[20px] font-extrabold text-fg">Halaman diagnosa terkunci</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Masukkan token admin (nilai <code className="font-mono text-brand-400">ADMIN_TOKEN</code> pada
            environment) untuk membuka halaman ini.
          </p>
          <form method="GET" className="mt-4 flex gap-2">
            <Input name="token" placeholder="Token admin" type="password" autoComplete="off" required />
            <Button type="submit" size="md">
              Buka
            </Button>
          </form>
          <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
            Tips: kosongkan <code className="font-mono">ADMIN_TOKEN</code> jika ingin halaman ini bebas
            diakses (tidak disarankan pada situs publik).
          </p>
        </div>
      </div>
    );
  }

  const catalog = await getCatalog();
  const stats = getCatalogStats(catalog.services);
  const credentials = getCredentials();
  const baseUrl = getPanelBaseUrl();

  const probes = probe
    ? {
        balance: await fetchPanelBalance(),
        ipProbe: await fetchPanelBalance().then((r) => r.ok).catch(() => false),
      }
    : null;

  const balanceError = probes && !probes.balance.ok ? probes.balance.error : null;
  const ipBlocked = isIpNotAllowed(balanceError);

  return (
    <>
      <PageHero
        eyebrow="Internal"
        breadcrumbs={[{ label: "Diagnosa Sistem" }]}
        title={
          <>
            Diagnosa <span className="gradient-text">koneksi &amp; katalog</span>
          </>
        }
        description="Halaman ini membantu Anda memastikan website sudah terhubung dengan benar ke panel SMM Nusantara: kredensial terbaca, katalog tersinkron, dan IP server sudah diizinkan untuk membuat pesanan."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={credentials.configured ? "success" : "danger"}>
            {credentials.configured ? "Kredensial terbaca" : "Kredensial belum diisi"}
          </Badge>
          <Badge tone={catalog.source === "panel" ? "success" : catalog.source === "snapshot" ? "info" : "warning"}>
            Sumber katalog: {catalog.source}
          </Badge>
          <Badge tone="neutral">{stats.totalServices.toLocaleString("id-ID")} layanan</Badge>
        </div>
      </PageHero>

      <div className="container-page space-y-6">
        {/* Grid status */}
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
            title="Kesiapan order"
            value={catalog.source === "panel" ? "Siap (perlu IP whitelist)" : "Belum siap"}
            ok={catalog.source === "panel"}
            note="Order & cek status butuh IP server diizinkan panel"
          />
        </div>

        {/* Sync + probe */}
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-line bg-surface-2/50 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-fg">
              <RefreshCw className="h-4.5 w-4.5 text-brand-400" /> Sinkronisasi katalog
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Katalog disimpan dalam cache {process.env.CATALOG_REVALIDATE_SECONDS ?? 600} detik. Klik tombol
              di bawah untuk memaksa penarikan ulang data dari panel saat ini juga.
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

            <form action={syncCatalog} className="mt-4 flex flex-wrap items-center gap-3">
              <Button type="submit" size="md">
                <RefreshCw className="h-4 w-4" /> Sinkronkan sekarang
              </Button>
              <Button
                href={`/admin?token=${encodeURIComponent(provided ?? "")}&probe=1`}
                variant="secondary"
                size="md"
              >
                <ShieldAlert className="h-4 w-4" /> Uji saldo panel (probe)
              </Button>
            </form>

            {probes ? (
              <div className="mt-4 rounded-2xl border border-line bg-surface-3/45 p-4">
                <p className="text-[12.5px] font-bold text-fg">Hasil probe saldo</p>
                {probes.balance.ok ? (
                  <p className="mt-1.5 flex items-center gap-2 text-[13px] text-emerald-500 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" /> Saldo panel: {probes.balance.data.balance}{" "}
                    {probes.balance.data.currency}
                  </p>
                ) : (
                  <div className="mt-1.5 space-y-2">
                    <p className="text-[12.5px] leading-relaxed text-rose-500 dark:text-rose-300">
                      {probes.balance.error}
                    </p>
                    {ipBlocked ? (
                      <p className="text-[12px] leading-relaxed text-muted">
                        Solusi: buka dashboard SMM Nusantara → menu <strong>API / Pengaturan API</strong> →
                        tambahkan IP server hosting website ini ke daftar IP yang diizinkan. Setelah itu coba
                        probe lagi.
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
              <EnvRow label="NEXT_PUBLIC_PRICE_MARKUP" value={`${process.env.NEXT_PUBLIC_PRICE_MARKUP ?? "0"}%`} />
              <EnvRow label="CATALOG_REVALIDATE_SECONDS" value={String(process.env.CATALOG_REVALIDATE_SECONDS ?? 600)} />
              <EnvRow label="CATALOG_FORCE_OFFLINE" value={process.env.CATALOG_FORCE_OFFLINE === "1" ? "aktif" : "nonaktif"} />
              <EnvRow label="ADMIN_TOKEN" value={process.env.ADMIN_TOKEN ? "terpasang" : "(kosong)"} />
            </div>
          </div>
        </div>

        {/* Checklist deploy */}
        <div className="rounded-3xl border border-line bg-surface-2/50 p-5 sm:p-6">
          <h2 className="text-[16px] font-extrabold text-fg">Checklist go-live</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              {
                title: "Isi environment produksi",
                desc: "SMM_API_URL, SMM_API_ID, SMM_API_KEY, NEXT_PUBLIC_WA_NUMBER, serta NEXT_PUBLIC_SITE_URL pada platform hosting (Vercel/Netlify/VPS).",
              },
              {
                title: "Whitelist IP server",
                desc: "Tambahkan IP keluar (outbound) server ke daftar IP yang diizinkan di dashboard panel, agar pembuatan pesanan & cek status berjalan.",
              },
              {
                title: "Uji order kecil",
                desc: "Buat pesanan uji dengan jumlah minimum untuk memastikan pemotongan saldo panel dan ID pesanan tampil di halaman Cek Order.",
              },
              {
                title: "Atur markup harga (opsional)",
                desc: "Isi NEXT_PUBLIC_PRICE_MARKUP (mis. 20 untuk +20%) bila ingin mengambil margin dari harga panel.",
              },
              {
                title: "Backup katalog (opsional)",
                desc: "Jalankan `npm run sync:catalog` di komputer/VPS Anda untuk menyimpan snapshot katalog lokal sebagai cadangan.",
              },
              {
                title: "Ganti nomor WhatsApp",
                desc: "Pastikan NEXT_PUBLIC_WA_NUMBER memakai format internasional tanpa tanda plus, mis. 628123456789.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-line bg-surface-3/40 p-4">
                <p className="text-[13px] font-bold text-fg">{item.title}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

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
                <span key={label} className="rounded-lg border border-line bg-surface-3/50 px-3 py-1.5 text-[12px] font-semibold text-fg-soft">
                  {label}: <span className="font-bold text-fg">{count}</span>
                </span>
              ))}
          </div>
        </div>
      </div>
    </>
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
    <div className={`rounded-2xl border p-4 ${ok ? "border-emerald-500/25 bg-emerald-500/[0.06]" : "border-amber-500/30 bg-amber-500/[0.07]"}`}>
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
