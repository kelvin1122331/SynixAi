import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/legal-layout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan penggunaan layanan SMM SynixAI: ketentuan pemesanan, larangan penggunaan, garansi, pembatalan, serta tanggung jawab pengguna.",
  alternates: { canonical: "/syarat" },
};

export default function SyaratPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      breadcrumb="Syarat & Ketentuan"
      title={
        <>
          Syarat &amp; <span className="gradient-text">Ketentuan</span>
        </>
      }
      description={`Dengan melakukan pemesanan di ${siteConfig.name}, Anda dianggap telah membaca, memahami, dan menyetujui seluruh ketentuan berikut.`}
      sections={[
        {
          title: "Definisi & ruang lingkup",
          paragraphs: [
            `${siteConfig.name} ("kami") menyediakan jasa pemasaran media sosial (Social Media Marketing) berupa penambahan followers, likes, views, komentar, subscriber, dan sejenisnya melalui sistem otomatis yang terhubung ke penyedia layanan pihak ketiga ("provider").`,
            "Seluruh layanan bersifat non-resmi: kami bukan afiliasi, perwakilan, atau mitra resmi dari Instagram, TikTok, YouTube, Facebook, X/Twitter, Telegram, WhatsApp, Shopee, Tokopedia, Spotify, atau platform lain yang disebutkan dalam katalog.",
          ],
        },
        {
          title: "Ketentuan pemesanan",
          list: [
            "Pemesan wajib memasukkan link/username target yang benar dan sudah bersifat publik (bukan private).",
            "Kami tidak pernah meminta password, OTP, atau kode verifikasi akun Anda. Jangan pernah memberikannya kepada siapa pun, termasuk kepada pihak yang mengaku sebagai admin kami.",
            "Jumlah pesanan harus berada di antara batas minimum dan maksimum yang tertera pada layanan.",
            "Pesanan dianggap sah setelah pembayaran dikonfirmasi dan/atau ID pesanan diterbitkan oleh sistem.",
            "Simpan ID pesanan Anda untuk keperluan pengecekan status maupun komplain.",
          ],
        },
        {
          title: "Waktu proses & hasil",
          paragraphs: [
            "Estimasi waktu proses yang ditampilkan (misalnya 1–5 menit untuk layanan instan atau 10–60 menit untuk layanan real) bersifat perkiraan. Kecepatan aktual dipengaruhi kondisi server provider, antrean order, dan pembatasan platform.",
            "Jumlah hasil akhir dapat berkurang sebagian (drop) setelah pesanan selesai. Penurunan pada layanan tanpa garansi bukan merupakan objek komplain, sedangkan layanan bergaransi dapat mengajukan refill sesuai ketentuan garansi masing-masing layanan.",
          ],
        },
        {
          title: "Larangan penggunaan",
          list: [
            "Menggunakan layanan untuk aktivitas penipuan, penyebaran konten ilegal, ujaran kebencian, atau pelanggaran hukum di Indonesia.",
            "Menargetkan akun milik pihak lain tanpa izin pemiliknya.",
            "Melakukan pemesanan ganda pada link yang sama secara bersamaan yang berpotensi merusak hasil layanan.",
            "Menggunakan layanan untuk memalsukan bukti transaksi atau manipulasi sistem pembayaran.",
            "Melakukan spam pemesanan dengan tujuan mengganggu sistem kami (termasuk penggunaan bot tanpa persetujuan reseller).",
          ],
        },
        {
          title: "Pembayaran",
          paragraphs: [
            "Pembayaran dilakukan melalui kanal yang kami sediakan (QRIS, dompet digital, atau transfer bank). Pastikan nominal dan kode unik (jika ada) sesuai dengan instruksi.",
            "Kesalahan pengisian nominal atau pengiriman bukti transfer yang tidak valid dapat menyebabkan keterlambatan proses. Pembayaran yang tidak dapat diverifikasi akan direfund sesuai kebijakan refund.",
          ],
        },
        {
          title: "Pembatalan & refund",
          paragraphs: [
            "Pesanan yang masih berstatus Pending dapat dibatalkan dengan pengembalian dana penuh. Pesanan yang sudah In Progress umumnya tidak dapat dibatalkan karena sudah dikirim ke provider.",
            "Refund diberikan penuh apabila pesanan gagal diproses oleh provider (misalnya layanan dinonaktifkan) atau tidak ada hasil sama sekali setelah 3×24 jam. Ketentuan lebih lengkap ada pada halaman Kebijakan Refund.",
          ],
        },
        {
          title: "Garansi refill",
          list: [
            "Garansi hanya berlaku pada layanan yang ditandai bergaransi (R30, R60, R90, R365, atau Lifetime).",
            "Klaim refill harus diajukan dalam masa garansi dengan menyertakan ID pesanan dan bukti penurunan jumlah.",
            "Satu ID pesanan hanya dapat diajukan refill satu kali kecuali disetujui lain oleh provider.",
            "Refill tidak berlaku apabila target diubah (username/handle berganti), akun menjadi private, atau konten dihapus.",
          ],
        },
        {
          title: "Batasan tanggung jawab",
          paragraphs: [
            "Kami berupaya maksimal menjaga kualitas layanan, namun tidak bertanggung jawab atas tindakan platform (penalti, shadowban, pembatasan akun) yang timbul akibat pemesanan layanan pihak ketiga, maupun atas kerugian tidak langsung seperti kehilangan keuntungan atau reputasi.",
            "Tanggung jawab maksimal kami atas suatu pesanan dibatasi sebesar nilai pembayaran pesanan tersebut.",
          ],
        },
        {
          title: "Perubahan ketentuan",
          paragraphs: [
            "Kami dapat memperbarui syarat dan ketentuan ini sewaktu-waktu agar sesuai dengan perubahan kebijakan provider maupun regulasi. Versi terbaru selalu tersedia di halaman ini dan berlaku sejak tanggal pembaruan.",
            "Dengan terus menggunakan layanan setelah pembaruan, Anda dianggap menyetujui ketentuan yang berlaku.",
          ],
        },
      ]}
    />
  );
}
