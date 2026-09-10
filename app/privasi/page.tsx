import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/legal-layout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi SynixAI: data apa yang kami kumpulkan, bagaimana penggunaannya, penyimpanan riwayat pesanan di perangkat Anda, serta hak Anda atas data.",
  alternates: { canonical: "/privasi" },
};

export default function PrivasiPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      breadcrumb="Kebijakan Privasi"
      title={
        <>
          Kebijakan <span className="gradient-text">Privasi</span>
        </>
      }
      description={`Kami berkomitmen menjaga data Anda. Halaman ini menjelaskan data apa saja yang kami proses, tujuannya, dan bagaimana Anda dapat mengendalikannya.`}
      sections={[
        {
          title: "Data yang kami kumpulkan",
          list: [
            "Data pesanan: link/username target, jumlah pesanan, ID layanan, ID pesanan, dan total biaya.",
            "Data komunikasi: isi percakapan dengan admin (WhatsApp/email) bila Anda menghubungi kami.",
            "Data teknis terbatas: alamat IP dan user-agent yang digunakan untuk proteksi penyalahgunaan (rate limit) serta keamanan sistem.",
            "Data yang TIDAK kami minta: password akun media sosial, OTP, kode verifikasi, data kartu kredit/debit, atau dokumen identitas.",
          ],
        },
        {
          title: "Riwayat pesanan di perangkat Anda",
          paragraphs: [
            "Halaman Riwayat Pesanan menggunakan localStorage browser Anda. Artinya riwayat pesanan hanya tersimpan di perangkat Anda sendiri dan tidak dikirim ke server kami. Anda dapat menghapusnya kapan saja melalui tombol \"Hapus semua\", atau dengan membersihkan data browser.",
          ],
        },
        {
          title: "Penggunaan data",
          list: [
            "Memproses dan meneruskan pesanan Anda ke penyedia layanan (provider).",
            "Menampilkan status pesanan dan memberi dukungan/komplain bila terjadi kendala.",
            "Mencegah penyalahgunaan seperti spam pemesanan atau percobaan penipuan.",
            "Menyusun laporan internal dan statistik anonim untuk meningkatkan kualitas layanan.",
          ],
        },
        {
          title: "Berbagi data dengan pihak ketiga",
          paragraphs: [
            "Data target (link/username) dan jumlah pesanan diteruskan kepada provider layanan agar pesanan dapat diproses. Provider hanya menerima data yang diperlukan untuk menyelesaikan pesanan tersebut.",
            "Kami tidak menjual, menyewakan, atau memperdagangkan data pelanggan kepada pihak lain untuk tujuan pemasaran.",
            "Kami dapat mengungkapkan data apabila diwajibkan oleh hukum atau permintaan resmi dari otoritas yang berwenang.",
          ],
        },
        {
          title: "Keamanan data",
          list: [
            "Kredensial API panel hanya disimpan sebagai environment variable di server dan tidak pernah dikirim ke browser pengunjung.",
            "Seluruh lalu lintas data antara browser dan server kami disarankan menggunakan HTTPS.",
            "Akses internal ke data pesanan dibatasi hanya untuk personel yang membutuhkannya.",
          ],
        },
        {
          title: "Cookie & teknologi serupa",
          paragraphs: [
            "Kami menggunakan penyimpanan lokal (localStorage) untuk menyimpan preferensi tema tampilan dan riwayat pesanan di perangkat Anda. Kami tidak menggunakan cookie iklan pelacak pihak ketiga untuk profil pengguna.",
          ],
        },
        {
          title: "Hak Anda",
          list: [
            "Meminta informasi mengenai data pesanan yang kami simpan terkait Anda.",
            "Meminta penghapusan data pesanan dari sistem kami (selama tidak bertentangan dengan kewajiban pembukuan).",
            "Menolak memberikan data yang tidak diperlukan untuk proses pemesanan.",
          ],
        },
        {
          title: "Perubahan & kontak",
          paragraphs: [
            `Kebijakan ini dapat diperbarui sewaktu-waktu. Pertanyaan mengenai privasi dapat disampaikan ke ${siteConfig.email} atau melalui WhatsApp admin +${siteConfig.whatsapp}.`,
          ],
        },
      ]}
    />
  );
}
