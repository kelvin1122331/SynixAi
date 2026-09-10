/**
 * Konfigurasi situs yang aman dipakai di server maupun browser.
 * Semua nilai dapat diubah lewat environment variable.
 */

const waNumber = (process.env.NEXT_PUBLIC_WA_NUMBER || "6281234567890").replace(/[^\d]/g, "");

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "SynixAI",
  tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || "Panel SMM Termurah & Tercepat di Indonesia",
  description:
    "SynixAI adalah panel SMM Indonesia untuk menambah followers, likes, views, komentar, dan subscriber secara otomatis di Instagram, TikTok, YouTube, Facebook, Telegram, dan 20+ platform lainnya. Proses instan 24 jam, harga reseller, bergaransi.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://synixai.id",
  whatsapp: waNumber,
  whatsappLink: (text?: string) =>
    `https://wa.me/${waNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`,
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@synixai.id",
  operationalHours: "24 jam / 7 hari",
  stats: {
    ordersCompleted: 6_555_245,
    activeUsers: 65_905,
    uptime: 99.9,
    rating: 4.9,
  },
  payments: [
    { name: "QRIS", tone: "from-slate-700 to-slate-900" },
    { name: "BCA", tone: "from-blue-600 to-blue-800" },
    { name: "BNI", tone: "from-orange-500 to-amber-700" },
    { name: "BRI", tone: "from-blue-700 to-indigo-900" },
    { name: "Mandiri", tone: "from-yellow-500 to-amber-700" },
    { name: "DANA", tone: "from-sky-500 to-blue-700" },
    { name: "OVO", tone: "from-violet-500 to-purple-800" },
    { name: "GoPay", tone: "from-teal-500 to-emerald-700" },
    { name: "ShopeePay", tone: "from-orange-500 to-red-700" },
    { name: "LinkAja", tone: "from-rose-500 to-red-800" },
  ],
} as const;

export const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/layanan", label: "Katalog Layanan" },
  { href: "/order", label: "Pesan Sekarang" },
  { href: "/cek-order", label: "Cek Order" },
  { href: "/api-docs", label: "API Reseller" },
  { href: "/faq", label: "FAQ" },
  { href: "/kontak", label: "Kontak" },
] as const;

export const footerLinks = {
  layanan: [
    { href: "/layanan?platform=instagram", label: "Instagram" },
    { href: "/layanan?platform=tiktok", label: "TikTok" },
    { href: "/layanan?platform=youtube", label: "YouTube" },
    { href: "/layanan?platform=facebook", label: "Facebook" },
    { href: "/layanan?platform=telegram", label: "Telegram" },
    { href: "/layanan?platform=shopee", label: "Shopee" },
  ],
  bantuan: [
    { href: "/faq", label: "Pertanyaan Umum" },
    { href: "/cek-order", label: "Cek Status Order" },
    { href: "/riwayat", label: "Riwayat Pesanan Saya" },
    { href: "/kontak", label: "Hubungi Admin" },
    { href: "/api-docs", label: "Dokumentasi API" },
  ],
  legal: [
    { href: "/syarat", label: "Syarat & Ketentuan" },
    { href: "/privasi", label: "Kebijakan Privasi" },
    { href: "/refund", label: "Kebijakan Refund" },
    { href: "/status", label: "Status Sistem" },
  ],
} as const;
