import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/legal-layout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Kebijakan Refund & Komplain",
  description:
    "Ketentuan refund dan komplain SynixAI: kondisi yang memenuhi syarat pengembalian dana, alur pengajuan komplain, dan estimasi waktu penyelesaian.",
  alternates: { canonical: "/refund" },
};

export default function RefundPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      breadcrumb="Kebijakan Refund"
      title={
        <>
          Kebijakan <span className="gradient-text">Refund &amp; Komplain</span>
        </>
      }
      description="Kami ingin setiap pesanan berjalan lancar. Bila terjadi kendala, berikut ketentuan dan alur pengajuan yang berlaku."
      sections={[
        {
          title: "Kondisi yang memenuhi syarat refund penuh",
          list: [
            "Pesanan berstatus Pending dan belum diproses provider, lalu dibatalkan atas permintaan Anda.",
            "Provider menonaktifkan layanan setelah pesanan dibuat sehingga pesanan tidak dapat diproses.",
            "Tidak ada hasil sama sekali setelah 3×24 jam dan provider menyatakan pesanan gagal.",
          ],
        },
        {
          title: "Kondisi yang TIDAK memenuhi syarat refund",
          list: [
            "Pesanan sudah berstatus Completed (selesai) dengan jumlah sesuai.",
            "Penurunan jumlah (drop) pada layanan tanpa garansi.",
            "Kesalahan target dari pihak pembeli, misalnya salah link, akun berubah menjadi private, atau konten dihapus setelah pesanan.",
            "Pesanan tidak berjalan karena akun/target dibatasi oleh platform.",
            "Pesanan yang dibatalkan sendiri oleh Anda saat status sudah In Progress.",
          ],
        },
        {
          title: "Refund sebagian (Partial)",
          paragraphs: [
            "Jika provider hanya menyelesaikan sebagian pesanan (status Partial), kami mengembalikan dana sesuai porsi yang tidak terkirim, sesuai kebijakan provider. Besaran pengembalian akan kami informasikan terlebih dahulu sebelum diproses.",
          ],
        },
        {
          title: "Alur pengajuan komplain",
          list: [
            `Hubungi admin melalui WhatsApp +${siteConfig.whatsapp} atau email ${siteConfig.email} maksimal 3×24 jam setelah pesanan selesai.`,
            "Sertakan ID pesanan, nama layanan, jumlah yang dipesan, dan penjelasan singkat masalahnya.",
            "Lampirkan bukti screenshot sebelum dan sesudah pesanan (contoh: jumlah follower awal dan akhir).",
            "Admin akan meneruskan komplain ke provider dan memberi kabar perkembangan maksimal 1×24 jam.",
          ],
        },
        {
          title: "Waktu penyelesaian",
          list: [
            "Komplain refill (layanan bergaransi): 1×24 jam sampai 3×24 jam tergantung respons provider.",
            "Refund dana: 1×24 jam setelah provider menyetujui pengembalian.",
            "Untuk pengembalian melalui transfer bank, dana masuk biasanya dalam 1 hari kerja. E-wallet umumnya lebih cepat.",
          ],
        },
        {
          title: "Pengembalian dalam bentuk saldo",
          paragraphs: [
            "Untuk mempercepat proses, sebagian refund dapat dikembalikan dalam bentuk saldo yang bisa langsung dipakai untuk pesanan lain. Anda dapat memilih pengembalian ke rekening/e-wallet bila menginginkan dana tunai.",
          ],
        },
        {
          title: "Catatan penting",
          paragraphs: [
            "Kami selalu mengutamakan penyelesaian yang adil. Namun keputusan akhir mengenai dapat atau tidaknya refund/refill bergantung pada kebijakan provider layanan. Kami akan selalu menginformasikan alasan secara transparan.",
            "Penyalahgunaan kebijakan komplain (misalnya klaim berulang tanpa bukti valid) dapat menyebabkan akun pelanggan dibatasi dari layanan garansi.",
          ],
        },
      ]}
    />
  );
}
