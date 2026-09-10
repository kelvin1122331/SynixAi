import type { Metadata } from "next";
import { KeyRound, MessageCircle, Server, ShieldCheck, Webhook, Zap } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { CodeTabs } from "@/components/docs/api-tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/misc";
import { getCatalog } from "@/lib/catalog";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "API Reseller — Dokumentasi Integrasi SMM",
  description:
    "Dokumentasi API reseller SynixAI: daftar layanan, buat pesanan, dan cek status pesanan melalui HTTP POST. Cocok untuk integrasi sistem sendiri, bot WhatsApp, atau dashboard custom.",
  alternates: { canonical: "/api-docs" },
};

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://synixai.id";

const servicesSample = [
  {
    language: "cURL",
    code: `curl -X GET "${BASE}/api/services?platform=tiktok&sort=termurah&perPage=5"`,
  },
  {
    language: "PHP",
    code: `<?php
$url = "${BASE}/api/services?platform=tiktok&perPage=5";
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Accept: application/json'],
]);
$response = json_decode(curl_exec($ch), true);
curl_close($ch);

foreach ($response['data'] as $service) {
    echo $service['id'] . ' - ' . $service['name']
       . ' - Rp' . number_format($service['price'], 0, ',', '.') . " / 1000\\n";
}`,
  },
  {
    language: "Node.js",
    code: `const res = await fetch("${BASE}/api/services?platform=tiktok&perPage=5");
const json = await res.json();

for (const service of json.data) {
  console.log(\`#\${service.id} \${service.name} — Rp\${service.price.toLocaleString("id-ID")} / 1000\`);
}`,
  },
  {
    language: "Python",
    code: `import requests

r = requests.get("${BASE}/api/services", params={
    "platform": "tiktok",
    "sort": "termurah",
    "perPage": 5,
}, timeout=20)

for service in r.json()["data"]:
    print(service["id"], service["name"], service["price"])`,
  },
];

const orderSample = [
  {
    language: "cURL",
    code: `curl -X POST "${BASE}/api/order" \\
  -H "Content-Type: application/json" \\
  -d '{
    "service": 6807,
    "target": "https://tiktok.com/@username.anda",
    "quantity": 1000
  }'`,
  },
  {
    language: "PHP",
    code: `<?php
$payload = json_encode([
    'service'  => 6807,
    'target'   => 'https://tiktok.com/@username.anda',
    'quantity' => 1000,
]);

$ch = curl_init("${BASE}/api/order");
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
]);

$response = json_decode(curl_exec($ch), true);
curl_close($ch);

if ($response['ok']) {
    echo "ID Pesanan: " . $response['orderId'];
} else {
    echo "Gagal: " . $response['error'];
}`,
  },
  {
    language: "Node.js",
    code: `const res = await fetch("${BASE}/api/order", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    service: 6807,
    target: "https://tiktok.com/@username.anda",
    quantity: 1000,
  }),
});

const data = await res.json();
console.log(data.ok ? \`Order #\${data.orderId}\` : data.error);`,
  },
  {
    language: "Python",
    code: `import requests

r = requests.post("${BASE}/api/order", json={
    "service": 6807,
    "target": "https://tiktok.com/@username.anda",
    "quantity": 1000,
}, timeout=30)

data = r.json()
print("Order ID:", data["orderId"] if data["ok"] else data["error"])`,
  },
];

const statusSample = [
  {
    language: "cURL",
    code: `# satu pesanan
curl "${BASE}/api/status?order=12345"

# banyak pesanan sekaligus (maks 20, pisahkan dengan koma)
curl "${BASE}/api/status?orders=12345,12346,12347"`,
  },
  {
    language: "Node.js",
    code: `const res = await fetch("${BASE}/api/status?orders=12345,12346");
const json = await res.json();

for (const item of json.data) {
  console.log(item.id, item.ok ? \`\${item.status} (sisa \${item.remains})\` : item.error);
}`,
  },
  {
    language: "Python",
    code: `import requests

r = requests.get("${BASE}/api/status", params={"orders": "12345,12346"}, timeout=30)
for item in r.json()["data"]:
    print(item["id"], item["status"], item.get("remains"))`,
  },
];

export default async function ApiDocsPage() {
  const catalog = await getCatalog();
  const sampleId = catalog.services[0]?.id ?? 1;

  const endpoints = [
    {
      method: "GET",
      path: "/api/services",
      desc: "Ambil katalog layanan lengkap dengan harga jual, minimum, maksimum, badge, dan deskripsi.",
      params: [
        ["q", "string", "Kata kunci pencarian (nama/kategori/ID)."],
        ["platform", "string", "instagram, tiktok, youtube, facebook, telegram, dst."],
        ["category", "string", "Nama kelompok layanan, mis. Followers."],
        ["sort", "string", "populer | termurah | termahal | min | maks | az"],
        ["minPrice / maxPrice", "number", "Filter harga per 1.000."],
        ["refill / instant", "1", "Filter hanya layanan bergaransi / instan."],
        ["page / perPage", "number", "Paginasi (maksimal 96 per halaman)."],
      ],
    },
    {
      method: "GET",
      path: "/api/services/{id}",
      desc: "Detail satu layanan beserta layanan terkait.",
      params: [],
    },
    {
      method: "POST",
      path: "/api/order",
      desc: "Buat pesanan baru. Parameter dikirim sebagai JSON.",
      params: [
        ["service", "number", "ID layanan dari /api/services (wajib)."],
        ["target", "string", "Link atau username tujuan (wajib)."],
        ["quantity", "number", "Jumlah pesanan, antara min & maks layanan (wajib)."],
        ["comments", "string", "Opsional, hanya untuk layanan tipe komentar custom."],
      ],
    },
    {
      method: "GET",
      path: "/api/status",
      desc: "Cek status pesanan (maksimal 20 ID per request).",
      params: [
        ["order", "string", "Satu ID pesanan."],
        ["orders", "string", "Beberapa ID dipisah koma, mis. 123,124,125."],
      ],
    },
    {
      method: "GET",
      path: "/api/health",
      desc: "Status kesehatan sistem: kredensial, sumber katalog, dan kesiapan order.",
      params: [["probe", "1", "Tambahkan untuk menguji saldo panel (memastikan IP whitelist)."]],
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="API reseller"
        breadcrumbs={[{ label: "API Reseller" }]}
        title={
          <>
            Integrasikan <span className="gradient-text">katalog &amp; order</span> ke sistem Anda
          </>
        }
        description={
          <>
            Gunakan API ini untuk membangun panel sendiri, bot WhatsApp, atau dashboard internal. Semua
            endpoint mengembalikan JSON, harga yang dikirim adalah harga jual, dan pembuatan pesanan
            diteruskan langsung ke provider.
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">
            <Server className="h-3.5 w-3.5" /> REST + JSON
          </Badge>
          <Badge tone="success">
            <ShieldCheck className="h-3.5 w-3.5" /> Kredensial provider tetap di server
          </Badge>
          <Badge tone="info">
            <Zap className="h-3.5 w-3.5" /> {catalog.services.length.toLocaleString("id-ID")} layanan real-time
          </Badge>
        </div>
      </PageHero>

      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-8">
            {/* Base URL + auth */}
            <section className="rounded-3xl border border-line bg-surface-2/50 p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-fg">
                <KeyRound className="h-4.5 w-4.5 text-brand-400" /> Base URL &amp; autentikasi
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface-3/50 px-4 py-3">
                <code className="font-mono text-[12.5px] font-bold text-brand-400">{BASE}/api</code>
                <CopyButton value={`${BASE}/api`} label="Salin base URL" />
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-muted">
                Saat ini endpoint publik (katalog, order, dan status) dapat langsung dipanggil tanpa token —
                cocok untuk kebutuhan internal. Untuk akses reseller dengan <strong>harga khusus</strong>{" "}
                dan <strong>API key pribadi</strong>, hubungi admin agar akun Anda ditandai sebagai reseller.
              </p>
            </section>

            {/* Endpoint table */}
            <section>
              <h2 className="text-[17px] font-extrabold text-fg">Daftar endpoint</h2>
              <div className="mt-4 space-y-4">
                {endpoints.map((endpoint) => (
                  <div key={endpoint.path} className="overflow-hidden rounded-2xl border border-line bg-surface-2/45">
                    <div className="flex flex-wrap items-center gap-3 border-b border-line bg-surface-3/40 px-4 py-3">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-[11.5px] font-extrabold ${
                          endpoint.method === "POST"
                            ? "bg-emerald-500/15 text-emerald-500 dark:text-emerald-300"
                            : "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300"
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="font-mono text-[13px] font-bold text-fg">{endpoint.path}</code>
                    </div>
                    <div className="px-4 py-3.5">
                      <p className="text-[13px] leading-relaxed text-muted">{endpoint.desc}</p>
                      {endpoint.params.length ? (
                        <div className="mt-3 overflow-hidden rounded-xl border border-line">
                          <table className="w-full text-left">
                            <thead className="bg-surface-3/50 text-[11px] tracking-wide text-muted uppercase">
                              <tr>
                                <th className="px-3 py-2 font-bold">Parameter</th>
                                <th className="px-3 py-2 font-bold">Tipe</th>
                                <th className="px-3 py-2 font-bold">Keterangan</th>
                              </tr>
                            </thead>
                            <tbody className="text-[12.5px]">
                              {endpoint.params.map(([name, type, desc]) => (
                                <tr key={name} className="border-t border-line">
                                  <td className="px-3 py-2 font-mono font-semibold text-brand-400">{name}</td>
                                  <td className="px-3 py-2 text-muted">{type}</td>
                                  <td className="px-3 py-2 text-fg-soft">{desc}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Contoh kode */}
            <section>
              <h2 className="text-[17px] font-extrabold text-fg">Contoh penggunaan</h2>

              <div className="mt-4 space-y-6">
                <div>
                  <p className="mb-2 text-[13.5px] font-bold text-fg">1. Ambil daftar layanan</p>
                  <CodeTabs samples={servicesSample} />
                </div>
                <div>
                  <p className="mb-2 text-[13.5px] font-bold text-fg">2. Buat pesanan</p>
                  <CodeTabs samples={orderSample} />
                  <p className="mt-2 text-[12px] text-muted">
                    Contoh ID layanan di atas menggantikan ID nyata dari katalog Anda (contoh layanan aktif:{" "}
                    <code className="font-mono text-brand-400">#{sampleId}</code>).
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-[13.5px] font-bold text-fg">3. Cek status pesanan</p>
                  <CodeTabs samples={statusSample} />
                </div>
              </div>
            </section>

            {/* Format respons */}
            <section className="rounded-3xl border border-line bg-surface-2/50 p-5 sm:p-6">
              <h2 className="text-[17px] font-extrabold text-fg">Format respons</h2>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-[12.5px] font-bold text-emerald-500 dark:text-emerald-300">Sukses membuat pesanan</p>
                  <pre className="overflow-x-auto rounded-xl border border-line bg-[#080c18]/95 p-4 font-mono text-[11.5px] text-slate-200">{`{
  "ok": true,
  "orderId": "98765",
  "service": { "id": 6807, "name": "TikTok Followers S-4" },
  "target": "https://tiktok.com/@username.anda",
  "quantity": 1000,
  "total": 30568,
  "totalFormatted": "Rp 30.568",
  "createdAt": "2026-09-11T09:12:44.000Z"
}`}</pre>
                </div>
                <div>
                  <p className="mb-2 text-[12.5px] font-bold text-rose-400">Gagal</p>
                  <pre className="overflow-x-auto rounded-xl border border-line bg-[#080c18]/95 p-4 font-mono text-[11.5px] text-slate-200">{`{
  "ok": false,
  "code": "PANEL_ERROR",
  "error": "Saldo panel tidak cukup untuk memproses pesanan ini."
}`}</pre>
                  <ul className="mt-2.5 space-y-1.5 text-[12px] text-muted">
                    <li>• <code className="font-mono text-brand-400">IP_NOT_ALLOWED</code> — IP server belum di-whitelist di panel.</li>
                    <li>• <code className="font-mono text-brand-400">DEMO_MODE</code> — katalog sedang memakai data contoh.</li>
                    <li>• <code className="font-mono text-brand-400">PANEL_ERROR</code> — pesan dari provider (saldo, layanan nonaktif, dll).</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-3xl border border-line bg-surface-2/50 p-5">
              <p className="flex items-center gap-2 text-[14px] font-extrabold text-fg">
                <Webhook className="h-4 w-4 text-brand-400" /> Fitur API
              </p>
              <ul className="mt-3 space-y-2.5 text-[12.5px] leading-snug text-muted">
                <li>• Katalog real-time dari provider (harga &amp; ketersediaan).</li>
                <li>• Filter lanjutan: platform, kategori, harga, garansi, instan.</li>
                <li>• Pembuatan pesanan otomatis ke provider.</li>
                <li>• Cek status massal (hingga 20 ID sekaligus).</li>
                <li>• Harga jual otomatis (markup dapat diatur lewat environment).</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-line bg-surface-2/50 p-5">
              <p className="text-[14px] font-extrabold text-fg">Rekomendasi implementasi</p>
              <ol className="mt-3 space-y-2.5 text-[12.5px] leading-snug text-muted">
                <li><span className="font-bold text-fg-soft">1.</span> Simpan cache katalog 5–10 menit agar tidak membebani server.</li>
                <li><span className="font-bold text-fg-soft">2.</span> Validasi jumlah terhadap min/maks sebelum mengirim order.</li>
                <li><span className="font-bold text-fg-soft">3.</span> Tangani <code className="font-mono text-brand-400">IP_NOT_ALLOWED</code> dengan fallback manual ke admin.</li>
                <li><span className="font-bold text-fg-soft">4.</span> Simpan <code className="font-mono text-brand-400">orderId</code> untuk pengecekan status berkala.</li>
                <li><span className="font-bold text-fg-soft">5.</span> Batasi rate request (mis. 10 req/detik) agar tidak diblokir.</li>
              </ol>
            </div>

            <div className="rounded-3xl border border-brand-500/25 bg-brand-500/[0.07] p-5">
              <p className="text-[14px] font-extrabold text-fg">Butuh harga reseller?</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                Kirim volume order bulanan Anda, kami akan menyiapkan paket harga khusus + akses API pribadi.
              </p>
              <Button
                href={siteConfig.whatsappLink("Halo admin, saya ingin mengajukan kerja sama reseller & akses API.")}
                variant="whatsapp"
                size="md"
                className="mt-3.5 w-full"
              >
                <MessageCircle className="h-4 w-4" /> Ajukan kerja sama
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
