import { siteConfig } from "./site-config";

/** Konten statis situs (fitur, langkah order, testimoni, FAQ). */

export const features = [
  {
    icon: "Zap",
    title: "Proses Otomatis 24 Jam",
    desc: "Sistem terhubung langsung ke provider, pesanan diproses tanpa menunggu admin. Rata-rata mulai dalam 1–5 menit.",
  },
  {
    icon: "Wallet",
    title: "Harga Reseller Termurah",
    desc: "Harga per 1.000 unit transparan dan jauh lebih murah dari harga pasaran. Cocok untuk dijual ulang.",
  },
  {
    icon: "ShieldCheck",
    title: "Garansi & Refill",
    desc: "Banyak layanan bergaransi R30, R60, R90, sampai Lifetime. Jika drop, tinggal ajukan refill gratis.",
  },
  {
    icon: "Lock",
    title: "Tanpa Password Akun",
    desc: "Kami hanya butuh link profil/postingan atau username. Kredensial akun Anda tetap aman 100%.",
  },
  {
    icon: "Headphones",
    title: "Support Cepat 24/7",
    desc: "Admin responsif via WhatsApp, live chat, dan tiket. Keluhan diproses cepat, bukan sekadar dibaca.",
  },
  {
    icon: "CreditCard",
    title: "Pembayaran Lokal Lengkap",
    desc: "QRIS, DANA, OVO, GoPay, ShopeePay, LinkAja, sampai transfer bank (BCA, BNI, BRI, Mandiri).",
  },
  {
    icon: "BadgeCheck",
    title: "Kualitas Real & HQ",
    desc: "Pilihan akun real, high quality, low drop, dan Indonesia. Anda bebas memilih sesuai kebutuhan.",
  },
  {
    icon: "BarChart3",
    title: "Pantau Status Real-time",
    desc: "Cek status pesanan kapan saja lewat halaman Cek Order: progress, start count, dan sisa jumlah.",
  },
] as const;

export const steps = [
  {
    title: "Pilih Layanan",
    desc: "Buka katalog, filter platform & kategori (followers, likes, views, komentar). Setiap layanan menampilkan harga per 1.000, minimal & maksimal order, serta badge garansi.",
  },
  {
    title: "Masukkan Link / Username",
    desc: "Tempel link profil, postingan, video, atau nama channel sesuai petunjuk target pada layanan. Contoh input tersedia di halaman panduan.",
  },
  {
    title: "Tentukan Jumlah & Bayar",
    desc: "Estimasi biaya otomatis muncul. Pilih metode pembayaran favorit (QRIS / e-wallet / bank transfer), lalu konfirmasi pesanan Anda.",
  },
  {
    title: "Pantau & Selesai",
    desc: "Simpan ID pesanan, pantau progresnya di halaman Cek Order. Jika drop pada layanan bergaransi, ajukan refill gratis.",
  },
] as const;

export const testimonials = [
  { name: "Raka Pratama", role: "Wirausaha", text: "Panel termurah yang pernah saya pakai. Followers masuk sesuai estimasi, admin fast response kalau ada kendala.", rating: 5 },
  { name: "Tomo Saputra", role: "Reseller", text: "Saya ambil harga reseller, jual lagi untungnya lumayan. Proses order otomatis jadi nggak perlu bangun jam 3 pagi.", rating: 5 },
  { name: "Yogi Arifin", role: "Penggemar Media Sosial", text: "Likes TikTok saya naik cepat, cuma nunggu beberapa menit. Recommended buat yang mau FYP.", rating: 5 },
  { name: "Taufiq Kurniawan", role: "Wiraswasta", text: "Sangat puas. Views YouTube aman buat monetisasi, tidak ada warning dari pihak platform.", rating: 4 },
  { name: "Thalita Putry", role: "Digital Marketer", text: "Panel terbaik untuk pemasaran media sosial klien saya. Laporan order rapi dan bisa dipantau kapan saja.", rating: 5 },
  { name: "Anggi Lestari", role: "Content Creator", text: "Rekomendasi banget! Banyak pilihan layanan dan metode pembayaran lengkap, dari QRIS sampai e-wallet.", rating: 5 },
  { name: "Nadia Kusuma", role: "Spesialis Media Sosial", text: "Sebagai orang yang kerja di sosmed, saya sangat terbantu. Engagement klien naik signifikan dan terukur.", rating: 5 },
  { name: "Sasmita Anggraini", role: "Business Owner", text: "Toko online saya jadi lebih dipercaya karena jumlah followers & ulasan bertambah. Terima kasih!", rating: 5 },
  { name: "Rudi Setiawan", role: "Entrepreneur", text: "Layanan bergaransi membuat saya tenang. Pernah drop dikit, langsung direfill tanpa drama.", rating: 5 },
] as const;

export const faqs = [
  {
    q: "Apa itu SMM Panel dan apa fungsinya?",
    a: "SMM Panel (Social Media Marketing Panel) adalah platform untuk membeli layanan pertumbuhan media sosial seperti followers, likes, views, komentar, subscriber, dan live stream viewers secara otomatis. Semua pesanan diproses sistem, bukan manual satu per satu, sehingga jauh lebih cepat dan hemat.",
  },
  {
    q: `Apa keuntungan order di ${siteConfig.name}?`,
    a: `Harga ${siteConfig.name} adalah harga reseller, jadi lebih murah dibanding panel retail. Selain itu ada banyak layanan bergaransi (refill gratis), pembayaran lokal lengkap, status pesanan bisa dipantau real-time, dan tim support siap membantu ${siteConfig.operationalHours}.`,
  },
  {
    q: "Bagaimana cara mulai memesan?",
    a: "Buka halaman Katalog Layanan, pilih platform dan layanan yang diinginkan, tempel link/username Anda, tentukan jumlah, lalu selesaikan pembayaran. Jika bingung, admin siap membantu lewat WhatsApp — kami bisa memandu sampai pesanan selesai.",
  },
  {
    q: "Apakah saya perlu memberikan password akun?",
    a: "Tidak, sama sekali tidak. Kami hanya memerlukan link profil/postingan atau username. Jangan pernah memberikan password Anda kepada siapa pun, termasuk kepada kami.",
  },
  {
    q: "Berapa lama pesanan mulai diproses?",
    a: "Layanan berlabel Instan umumnya mulai dalam 1–5 menit. Layanan real/HQ bisa memerlukan 10–60 menit tergantung antrean server. Kecepatan harian setiap layanan tercantum pada badge (contoh: 100K/hari).",
  },
  {
    q: "Apakah layanan di sini bergaransi?",
    a: "Ya. Layanan dengan label Garansi (R30, R60, R90, R365, atau Lifetime) bisa mengajukan refill gratis jika jumlah yang drop melebihi ketentuan. Baca deskripsi layanan untuk detail ketentuan garansi.",
  },
  {
    q: "Metode pembayaran apa saja yang tersedia?",
    a: "QRIS, DANA, OVO, GoPay, ShopeePay, LinkAja, serta transfer bank BCA, BNI, BRI, dan Mandiri. Semua pembayaran diverifikasi cepat sehingga pesanan tidak tertahan.",
  },
  {
    q: "Apakah aman untuk akun saya?",
    a: "Aman. Kami menggunakan provider yang sudah berpengalaman, tanpa meminta kredensial akun, dan menawarkan pilihan kualitas (Bot, Mix, Real, HQ) agar Anda bisa menentukan tingkat keamanan sesuai kebutuhan.",
  },
  {
    q: "Bisakah saya menjadi reseller?",
    a: "Bisa. Tersedia API reseller agar sistem Anda bisa terhubung langsung ke katalog dan proses order kami. Dokumentasi lengkap ada di halaman API Reseller.",
  },
  {
    q: "Bagaimana jika pesanan bermasalah?",
    a: `Simpan ID pesanan Anda, lalu hubungi admin melalui WhatsApp atau e-mail ${siteConfig.email}. Sertakan ID pesanan dan bukti screenshot agar penanganan lebih cepat. Kami membalas ${siteConfig.operationalHours}.`,
  },
] as const;

export const targetExamples = [
  { label: "Instagram Followers", value: "https://instagram.com/username.anda", note: "atau cukup: username.anda" },
  { label: "Instagram Likes / Views", value: "https://www.instagram.com/p/CIxYz123abc/", note: "link postingan/reels" },
  { label: "TikTok Followers", value: "https://www.tiktok.com/@username.anda", note: "atau cukup: @username.anda" },
  { label: "TikTok Likes / Views", value: "https://vt.tiktok.com/ZS12345abc/", note: "link video (share → copy link)", },
  { label: "TikTok Live Stream", value: "https://www.tiktok.com/@username/live", note: "saat live berlangsung" },
  { label: "YouTube Subscribe / Views", value: "https://youtu.be/dQw4w9WgXcQ", note: "link video/channel" },
  { label: "Facebook Page Likes", value: "https://facebook.com/nama.page", note: "link halaman/profil" },
  { label: "Telegram Members", value: "https://t.me/nama_channel", note: "link channel/grup publik" },
  { label: "WhatsApp Channel", value: "https://whatsapp.com/channel/xxxxxxxx", note: "link channel" },
  { label: "Shopee / Tokopedia", value: "https://shopee.co.id/produk.anda", note: "link toko atau produk" },
  { label: "Spotify Plays", value: "https://open.spotify.com/track/xxxx", note: "link lagu/album" },
  { label: "Google Reviews", value: "https://maps.app.goo.gl/xxxx", note: "link lokasi Google Maps" },
] as const;

export const orderStatusMeaning = [
  { status: "Pending", tone: "pending", desc: "Pesanan sudah masuk sistem dan sedang menunggu antrean provider." },
  { status: "In progress", tone: "progress", desc: "Pesanan sedang dikerjakan. Progress dan sisa jumlah bisa dilihat real-time." },
  { status: "Completed", tone: "success", desc: "Pesanan selesai 100%. Jumlah akhir sesuai pesanan." },
  { status: "Partial", tone: "progress", desc: "Sebagian pesanan selesai, sisanya tidak bisa dipenuhi provider (biasanya karena batas sistem platform)." },
  { status: "Canceled", tone: "error", desc: "Pesanan dibatalkan. Saldo biasanya dikembalikan sesuai ketentuan provider." },
  { status: "Refunded", tone: "error", desc: "Dana pesanan dikembalikan penuh karena layanan tidak dapat diproses." },
] as const;
