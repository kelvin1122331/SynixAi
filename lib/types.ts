/** Tipe data bersama untuk seluruh aplikasi SynixAI. */

/** Satu layanan mentah dari API panel SMM Nusantara (`/api/services`). */
export interface RawPanelService {
  id: number | string;
  name: string;
  type?: string;
  category: string;
  price: number | string;
  min: number | string;
  max: number | string;
  refill?: number | boolean | string;
  description?: string | null;
}

/** Layanan hasil normalisasi yang dipakai di UI. */
export interface Service {
  id: number;
  /** Nama pendek yang enak dibaca, mis. "TikTok Followers S-8". */
  name: string;
  /** Nama asli dari panel apa adanya (disimpan untuk detail). */
  fullName: string;
  /** Kategori lengkap dari panel, mis. "Tiktok - Followers | Garansi (SuperFast)". */
  categoryRaw: string;
  /** Key platform: tiktok, instagram, youtube, dst. */
  platform: string;
  /** Nama tampilan platform: "TikTok". */
  platformLabel: string;
  /** Kelompok layanan, mis. "Followers", "Likes", "Views". */
  category: string;
  /** Varian/kualitas, mis. "Garansi (SuperFast)". */
  variant: string;
  /** Tipe layanan dari panel (default, custom_comments, dst). */
  type: string;
  /** Harga panel per 1000 (IDR). */
  price: number;
  /** Harga jual ke customer per 1000 (IDR) — sudah termasuk markup. */
  priceRetail: number;
  /** Jumlah minimal pemesanan. */
  min: number;
  /** Jumlah maksimal pemesanan. */
  max: number;
  /** Apakah layanan bergaransi / bisa refill. */
  refill: boolean;
  /** Lama garansi dalam hari (bila terdeteksi dari nama, mis. R30 = 30). */
  refillDays: number | null;
  /** Proses instan / super instant. */
  instant: boolean;
  /** Kecepatan proses, mis. "100K/hari". */
  speed: string | null;
  /** Badge ringkas untuk kartu layanan. */
  badges: string[];
  /** Kata kunci kualitas: HQ, Real, Bot, Old, Mix, dll. */
  quality: string[];
  /** Deskripsi bersih (teks saja, tanpa tag HTML & boilerplate panel). */
  description: string;
  /** Petunjuk target dari deskripsi, mis. "Link/Username", "Link POST". */
  targetHint: string | null;
  /** Skor pencarian/popularitas sederhana. */
  score: number;
}

/** Sumber data katalog yang sedang dipakai. */
export type CatalogSource = "panel" | "snapshot" | "demo";

export interface Catalog {
  services: Service[];
  source: CatalogSource;
  fetchedAt: string;
  /** Pesan error bila penarikan dari panel gagal (untuk halaman diagnosa). */
  error?: string | null;
}

export interface PlatformMeta {
  key: string;
  label: string;
  /** Warna utama (hex) untuk aksen. */
  color: string;
  /** Kelas gradient Tailwind untuk logo chip. */
  gradient: string;
  /** Nama ikon lucide yang dipakai. */
  icon: string;
}

/** Hasil pemanggilan API panel. */
export type PanelResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; raw?: unknown };

export interface OrderResponse {
  orderId: string;
  raw: unknown;
}

export interface OrderStatus {
  id: string;
  status: string;
  startCount: string | null;
  remains: string | null;
  charge?: string | null;
  currency?: string | null;
}
