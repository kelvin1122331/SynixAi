# SynixAI — Website SMM Panel Indonesia

Website storefront **panel SMM** (Social Media Marketing) yang terhubung langsung ke API **SMM Nusantara**
(`https://smmnusantara.id/api/...`). Pengunjung bisa melihat katalog layanan lengkap (followers, likes,
views, komentar, subscriber, live viewers), menghitung biaya otomatis, membuat pesanan, dan memantau
status pesanan — semuanya dalam satu situs yang responsif di HP maupun laptop.

> **Catatan penting:** kredensial panel (API ID & API KEY) **hanya** dipakai di sisi server.
> Kunci tidak pernah dikirim ke browser pengunjung.

---

## ✨ Fitur

### Halaman publik
| Halaman | Isi |
| --- | --- |
| `/` | Landing: hero + mock UI pesanan, statistik animasi, katalog populer per platform, keunggulan, tabel harga termurah per kategori, 4 langkah order, testimoni, FAQ, metode pembayaran, CTA |
| `/layanan` | Katalog lengkap: pencarian, filter platform/kategori/harga/garansi/instan, urutan (populer, termurah, termahal, min, maks, A–Z), tampilan grid & daftar, paginasi, 24/48/96 per halaman |
| `/layanan/[id]` | Detail layanan: spesifikasi lengkap, deskripsi bersih (tanpa boilerplate provider), form pesanan langsung, layanan serupa, JSON-LD Product untuk SEO |
| `/order` | Form pemesanan: pencarian layanan lintas katalog, validasi min/maks, ringkasan biaya otomatis, QC persetujuan, **panel pembayaran** (kode referensi, total, kanal QRIS/bank/e-wallet) |
| `/cek-order` | Cek status pesanan real-time (maks 20 ID sekaligus), progress bar, arti setiap status, opsi refresh otomatis 30 detik |
| `/riwayat` | Riwayat pesanan perangkat (localStorage), perbarui status (termasuk catatan dari admin), ekspor CSV, hapus |
| `/api-docs` | Dokumentasi API reseller dengan contoh kode cURL/PHP/Node.js/Python |
| `/faq`, `/kontak`, `/syarat`, `/privasi`, `/refund`, `/status`, `/page/contoh-target` | Pusat bantuan, kontak + template pesan, dokumen legal, status sistem, panduan input target |
| `/admin` | **Internal**: dashboard margin & laba, **antrean pembayaran** (kirim ke panel / batalkan), sinkron ulang katalog, tabel tier harga, audit margin terendah, probe saldo, checklist go-live (dilindungi `ADMIN_TOKEN`) |

### Alur pemesanan (bayar dulu → order dikirim admin)

Website ini **tidak** mengirim order ke panel secara otomatis, supaya saldo panel tidak terkuras oleh
pesanan yang belum dibayar. Alurnya:

1. Customer mengisi form di `/order` → server membuat **kode referensi** `SYN-XXXXXX` beserta
   total tagihan (harga jual bermargin) dan instruksi pembayaran (QRIS / transfer bank / e-wallet).
2. Customer membayar, lalu mengirim bukti + kode referensi ke admin (tombol WhatsApp sudah otomatis
   membawa teks pesanan).
3. Admin membuka `/admin?token=…` → tab **Antrean pembayaran** → tombol **Kirim ke panel**.
4. Sistem mengirim order ke API panel memakai modal (harga panel), mencatat ID order panel + laba bersih,
   dan pesanan berubah status menjadi *Terkirim*.
5. Customer memantau lewat `/cek-order` atau `/riwayat` — catatan admin (`note`) tampil di halaman status.

Menghendaki mode instan (order langsung dikirim ke panel tanpa verifikasi pembayaran)? Setel
`ORDER_AUTO_SUBMIT=1`. Mode ini hanya cocok bila pembayaran sudah pasti (mis. saldo deposit) karena
setiap order langsung memotong saldo panel.

---

### API internal (untuk reseller / integrasi)
| Method | Endpoint | Fungsi |
| --- | --- | --- |
| GET | `/api/services` | Katalog (filter, sort, paginasi, facet) |
| GET | `/api/services/{id}` | Detail layanan + rekomendasi |
| POST | `/api/order` | Buat pesanan: mode manual (buat kode referensi + tagihan) atau instan (`ORDER_AUTO_SUBMIT=1`) |
| GET | `/api/status?order=ID` / `?orders=1,2,3` | Cek status pesanan |
| POST | `/api/admin/quotes` | **Admin** (butuh `ADMIN_TOKEN`): `action: list \| submit \| cancel \| sync` pada antrean pembayaran |
| GET | `/api/health[?probe=1]` | Status sistem & uji saldo panel |

### UX / Desain
- **Responsif penuh** — mobile bottom-nav, drawer navbar, kartu bertumpuk, tabel yang berubah jadi kartu di HP.
- **Dark & light mode** (default gelap) dengan penyimpanan preferensi tema, tanpa flash saat load.
- Glassmorphism, gradient violet → fuchsia → cyan, animasi halus, marquee, counter animasi,
  skeleton loading, empty state, toast notification, dan `prefers-reduced-motion` dihormati.
- Ikon brand asli (Simple Icons) — Instagram, TikTok, YouTube, Facebook, X, Telegram, WhatsApp, Shopee,
  Spotify, Threads, Discord, Google, Netflix, Twitch, dll. Semua aset **self-hosted** (tanpa CDN).
- SEO: metadata per halaman, Open Graph (gambar `public/og.png`), JSON-LD, `robots.txt`, `sitemap.xml` dinamis.

---

## 🧱 Teknologi

| Bagian | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) + React 19 |
| Bahasa | TypeScript (strict) |
| Styling | Tailwind CSS v4 (`@theme`, token semantik `:root`/`.dark`) |
| Ikon | lucide-react + simple-icons |
| Font | Plus Jakarta Sans (self-host, `@fontsource-variable`) |
| Data | API SMM Nusantara + snapshot JSON lokal (fallback) |

---

## 🚀 Menjalankan proyek

```bash
# 1. Install dependency
npm install

# 2. Siapkan environment
cp .env.example .env.local
# lalu isi SMM_API_ID, SMM_API_KEY, nomor WhatsApp, dll.

# 3. Jalankan mode pengembangan
npm run dev
# → http://localhost:3000

# Build produksi
npm run build && npm start
```

### Environment variable

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `SMM_API_URL` | ✅ | Base URL panel, mis. `https://smmnusantara.id` |
| `SMM_API_ID` | ✅ | API ID akun panel Anda |
| `SMM_API_KEY` | ✅ | API KEY akun panel Anda |
| `NEXT_PUBLIC_SITE_NAME` | – | Nama brand di navbar/footer/SEO |
| `NEXT_PUBLIC_WA_NUMBER` | – | Nomor WhatsApp admin, format `62…` tanpa `+` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | – | E-mail support |
| `NEXT_PUBLIC_SITE_URL` | – | Domain publik (dipakai sitemap & contoh kode API) |
| `PRICING_TIERS` | – | Override tier markup: JSON `[[batas, pengali], …]` (lihat bagian 💰 Margin harga) |
| `PRICING_MIN_PROFIT` | – | Laba minimum per 1.000 unit (default `1000`); harga jual dinaikkan bila laba di bawah ini |
| `PRICING_ROUND_STEP` | – | Langkah pembulatan harga jual; `0` = otomatis (100 → 500 → 1.000 → 10.000 → 100.000) |
| `NEXT_PUBLIC_PRICE_MARKUP` | – | Paksa markup tunggal (mis. `80` = ×1,8). `0` = pakai tier bertingkat (default) |
| `NEXT_PUBLIC_PRICE_ROUNDING` | – | Pembulatan ke atas harga jual (mis. `100` → kelipatan Rp 100) |
| `ORDER_AUTO_SUBMIT` | – | `1` = order langsung dikirim ke panel (default `0` = bayar dulu, dikirim admin) |
| `NEXT_PUBLIC_PAYMENT_QRIS_NAME` | – | Nama merchant QRIS yang ditampilkan di panel pembayaran |
| `NEXT_PUBLIC_PAYMENT_BANK_NAME` / `_NUMBER` / `_HOLDER` | – | Rekening transfer bank |
| `NEXT_PUBLIC_PAYMENT_EWALLET_LABEL` / `_NUMBER` / `_HOLDER` | – | E-wallet (mis. DANA/OVO/GoPay) |
| `NEXT_PUBLIC_PAYMENT_VALIDITY_MINUTES` | – | Masa berlaku kode pembayaran (default `120` menit) |
| `CATALOG_REVALIDATE_SECONDS` | – | Lama cache katalog (default `600` detik) |
| `CATALOG_FORCE_OFFLINE` | – | `1` = selalu pakai `data/services.json` (tanpa request ke panel) |
| `ADMIN_TOKEN` | – | Token halaman `/admin`. Kosongkan untuk menonaktifkan proteksi |

> `.env.local` sudah masuk `.gitignore`. **Jangan pernah commit kredensial panel ke repo publik** —
> siapa pun yang memegang API KEY dapat memakai saldo panel Anda.

---

## 🔌 Integrasi API SMM Nusantara

Endpoint yang dipakai (semua POST form-urlencoded, otomatis fallback ke GET bila perlu):

```
POST {SMM_API_URL}/api/services   → { "status": true, "services": [ { id, name, type, category, price, min, max, refill, description } ] }
POST {SMM_API_URL}/api/order      → api_id, api_key, service, target, quantity           → { "status": true, "data": { "id": ... } }
POST {SMM_API_URL}/api/status     → api_id, api_key, id                                  → { "status": true, "data": { "status", "start_count", "remains" } }
POST {SMM_API_URL}/api/balance    → api_id, api_key                                      → { "status": true, "data": { "balance", "currency" } }
```

Beberapa detail hasil pengujian langsung yang perlu diketahui:

1. **Parameter target bernama `target`**, bukan `data` (panel akan menjawab *"Isian Target diperlukan."*
   bila salah nama parameter).
2. **Kredensial terdiri dari dua bagian**: `api_id` *dan* `api_key`. Tanpa `api_id` panel menjawab
   *"Isian API ID diperlukan."*.
3. **`/api/services` bisa diakses tanpa whitelist IP**, tetapi **`/api/order`, `/api/status`, dan
   `/api/balance` membutuhkan IP server yang diizinkan.** Bila belum, responsnya:
   `{"status":false,"msg":"IP x.x.x.x tidak diizinkan."}`
   → Tambahkan IP outbound server Anda di dashboard panel (menu **API / Pengaturan API → IP Whitelist**).
4. Nama layanan dari panel masih membawa emoji & boilerplate; website ini membersihkannya otomatis
   (badge “Rekomendasi”, “Instan”, “Garansi R30”, “Maks 10M”, kecepatan “100K/hari”, dsb) dan menyimpan
   nama aslinya untuk halaman detail.

### Sumber data katalog & mode cadangan

`lib/catalog.ts` memilih data dengan urutan:

1. **Cache memori** (masih segar) — default 10 menit.
2. **API panel** (real-time) → katalog 2.200+ layanan dengan harga terbaru.
3. **`data/services.json`** — hasil `npm run sync:catalog` (snapshot).
4. **`data/services.sample.json`** — data contoh (mode pratinjau). Website menampilkan banner
   "Mode pratinjau" dan menolak pembuatan pesanan otomatis (`DEMO_MODE`) agar tidak ada order palsu.

Untuk membuat snapshot katalog (opsional, menjalankan di komputer/VPS yang punya akses ke panel):

```bash
npm run sync:catalog      # menulis data/services.json
npm run generate:sample   # menulis ulang data contoh (katalog demo)
```

---

## 💰 Margin harga (keuntungan Anda)

Harga katalog panel = **harga modal**. Harga yang dilihat customer = harga modal **dinaikkan otomatis**
oleh `lib/pricing.ts` sehingga Anda selalu untung. Semua harga per **1.000 unit**.

### Tier markup bawaan (makin murah modalnya, makin besar pengalinya)

| Harga modal / 1.000 | Pengali | Contoh modal | Harga jual |
| --- | --- | --- | --- |
| ≤ Rp 3.000 | ×2,8 | Rp 1.820 | Rp 5.100 |
| ≤ Rp 8.000 | ×2,4 | Rp 5.500 | Rp 13.200 |
| ≤ Rp 20.000 | ×2,0 | Rp 19.215 | Rp 38.500 |
| ≤ Rp 50.000 | ×1,7 | Rp 30.568 | Rp 52.000 |
| ≤ Rp 150.000 | ×1,5 | Rp 120.000 | Rp 180.000 |
| ≤ Rp 500.000 | ×1,4 | Rp 300.000 | Rp 420.000 |
| > Rp 500.000 | ×1,3 | Rp 900.000 | Rp 1.170.000 |

Dua pengaman tambahan:

- **Laba minimum** `PRICING_MIN_PROFIT` (default Rp 1.000 per 1.000 unit) — harga jual otomatis
  dinaikkan bila pengali tier menghasilkan laba di bawah ambang ini.
- **Pembulatan otomatis** agar angka enak dibaca: 100 (di bawah Rp 10rb) → 500 (< Rp 100rb)
  → 1.000 (< Rp 1jt) → 10.000 (< Rp 10jt) → 100.000 (di atasnya). Bisa dipaksa lewat
  `PRICING_ROUND_STEP`.

Contoh nyata dari data panel: layanan #6807 (modal Rp 30.568/1.000) dijual **Rp 52.000/1.000**
→ laba **Rp 21.432/1.000**. Layanan termurah di katalog contoh (modal Rp 1.820) dijual **Rp 5.100**.

### Mengubah strategi harga

```bash
# A) Biarkan tier bertingkat (default, disarankan) — cukup atur laba minimum
PRICING_MIN_PROFIT=1500

# B) Markup tunggal untuk semua layanan: modal × (1 + 80/100) = ×1,8
NEXT_PUBLIC_PRICE_MARKUP=80

# C) Tier kustom: [[batas_maks_harga_modal, pengali], …] — terakhir = penangkap sisa
PRICING_TIERS=[[5000,3.5],[20000,2.2],[100000,1.6],[Infinity,1.35]]
```

Harga modal panel **tidak pernah** dikirim ke browser (`toPublicServices()` di `lib/catalog.ts`
membuang field `price`). Untuk audit margin, buka `/admin?token=…` → metrik laba, tabel tier, dan
daftar 10 layanan dengan margin terendah.

## 🌐 Deploy

### Vercel (paling mudah)
1. Push repo ini, lalu *Import Project* di Vercel.
2. Tambahkan environment variable: `SMM_API_URL`, `SMM_API_ID`, `SMM_API_KEY`,
   `NEXT_PUBLIC_WA_NUMBER`, `NEXT_PUBLIC_SITE_URL`, (opsional) `NEXT_PUBLIC_PRICE_MARKUP`,
   `ADMIN_TOKEN`.
3. Deploy, lalu **whitelist IP keluar Vercel** di panel (lihat panduan berikut).

### VPS (Node.js)
```bash
npm ci && npm run build
pm2 start npm --name synixai -- start    # atau systemd/docker
```
Pastikan reverse proxy (Nginx/Caddy) meneruskan header `X-Forwarded-For` dan mengaktifkan HTTPS.

### Menemukan IP yang perlu di-whitelist
Buka `/admin?token=<ADMIN_TOKEN>` lalu klik **“Uji saldo panel (probe)”**.
- Jika muncul pesan `IP x.x.x.x tidak diizinkan` → daftarkan IP tersebut di dashboard panel.
- Jika saldo muncul → pembuatan pesanan otomatis sudah aktif.

---

## 🧪 Pemeriksaan kualitas

```bash
npm run typecheck   # TypeScript strict
npm run build       # build produksi + pengecekan tipe
```

Semua halaman & endpoint juga dapat dicek cepat:

```bash
for r in / /layanan /order /cek-order /riwayat /api-docs /faq /kontak /status /admin /page/contoh-target; do
  curl -s -o /dev/null -w "%{http_code} $r\n" "http://localhost:3000$r"
done
```

---

## 🗂️ Struktur proyek

```
app/
  layout.tsx globals.css page.tsx        # kerangka, design system, landing
  layanan/ (page + [id] + loading)       # katalog & detail layanan
  order/ cek-order/ riwayat/             # pemesanan & pemantauan
  api-docs/ faq/ kontak/ status/ admin/  # dokumentasi, bantuan, diagnosa
  syarat/ privasi/ refund/               # halaman legal
  page/contoh-target/                    # panduan target pesanan
  api/                                   # services, order, status, health, admin/quotes
  robots.ts sitemap.ts not-found.tsx
components/
  site/      navbar, footer, logo, page-hero, mobile-nav, WA FAB, legal-layout
  ui/        button, badge, field, toast, misc (counter/accordion/copy/dll), platform-icon, brand-icon
  services/  service-card, service-filters, order-form, order-status-checker, order-history, catalog-notice
  admin/     quote-actions (tombol kirim/batal/sinkron di dashboard)
  landing/   hero, sections, popular-services, price-table, faq-section
  docs/      api-tabs
lib/
  smm.ts          klien API panel (POST+GET fallback, timeout, pesan error ramah)
  pricing.ts      mesin margin: tier markup, laba minimum, pembulatan
  quotes.ts       antrean pembayaran (kode referensi SYN-, status, catatan admin)
  catalog.ts      normalisasi layanan, cache, filter, agregasi
  platforms.ts    metadata platform (label, warna, ikon)
  format.ts       format Rupiah/angka/tanggal, status pesanan
  site-config.ts  konfigurasi brand & navigasi
  content.ts      fitur, langkah order, testimoni, FAQ, contoh target
scripts/
  sync-catalog.mjs generate-sample.mjs
data/
  services.sample.json                    # katalog contoh (fallback)
  # services.json                         # dibuat oleh `npm run sync:catalog`
```

---

## 🛠️ Kustomisasi cepat

| Ingin mengubah… | File |
| --- | --- |
| Nama brand, tagline, deskripsi SEO | `.env.local` + `lib/site-config.ts` |
| Nomor WhatsApp / e-mail | `.env.local` (`NEXT_PUBLIC_WA_NUMBER`, `NEXT_PUBLIC_SUPPORT_EMAIL`) |
| Warna & tema | `app/globals.css` (blok `@theme` dan token `:root` / `.dark`) |
| Fitur, langkah order, testimoni, FAQ | `lib/content.ts` |
| Strategi harga / markup | `.env.local` (`PRICING_*`, `NEXT_PUBLIC_PRICE_MARKUP`) + `lib/pricing.ts` |
| Rekening & kanal pembayaran | `.env.local` (`NEXT_PUBLIC_PAYMENT_*`) + `lib/site-config.ts` |
| Mode bayar-dulu vs instan | `.env.local` (`ORDER_AUTO_SUBMIT=0` / `1`) |
| Alur antrean pembayaran | `lib/quotes.ts`, `app/api/admin/quotes/route.ts` |
| Logo / favicon | `components/site/logo.tsx`, `public/icon.svg` |
| Gambar sosial (OG) | `public/og.png` |

---

## ❓ Troubleshooting

| Gejala | Penyebab & solusi |
| --- | --- |
| Banner “Mode pratinjau” muncul | Server tidak bisa menjangkau panel (offline/ firewall) atau kredensial belum diisi. Isi `.env.local` lalu buka `/admin` → **Sinkronkan sekarang**. |
| Order gagal: *“IP … tidak diizinkan”* | Whitelist IP server di dashboard panel (menu API). Cek IP-nya lewat `/admin` → probe. |
| Order gagal: *“Saldo panel tidak cukup”* | Top-up saldo akun panel Anda. |
| Status customer tetap “Menunggu Pembayaran” | Normal pada mode default: kirim order dari `/admin` → **Antrean pembayaran** setelah pembayaran masuk. |
| Tombol **Kirim ke panel** gagal (502) | Server tidak bisa menjangkau API panel atau IP belum di-whitelist; pesan alasannya tercatat otomatis di catatan pesanan customer. |
| Kode referensi `SYN-…` hilang setelah restart | Antrean pembayaran disimpan di memori (default). Untuk produksi serius, ganti `lib/quotes.ts` dengan database. |
| Katalog kosong / layanan hilang | Panel sedang maintenance, atau layanan dinonaktifkan di panel. Coba sinkron ulang. |
| Harga tidak berubah setelah markup diubah | Harga di-cache. Tunggu `CATALOG_REVALIDATE_SECONDS` atau klik sinkron di `/admin`. |
| Gambar/ikon tidak muncul | Semua aset self-hosted; pastikan `public/` ikut ter-deploy. |

---

## ⚠️ Disclaimer

Proyek ini adalah **storefront pihak ketiga** yang terhubung ke API SMM Nusantara. Bukan afiliasi resmi
platform media sosial manapun (Instagram, TikTok, YouTube, Facebook, X, Telegram, WhatsApp, Shopee,
Tokopedia, Spotify, dll). Gunakan secara bertanggung jawab dan patuhi syarat & ketentuan masing-masing
platform serta hukum yang berlaku di Indonesia.
