import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/misc";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Hubungi Admin — Support 24 Jam",
  description:
    "Hubungi tim support SynixAI melalui WhatsApp, e-mail, atau formulir kontak. Kami online 24 jam untuk membantu pemesanan, komplain, dan pertanyaan seputar layanan SMM.",
  alternates: { canonical: "/kontak" },
};

const channels = [
  {
    icon: <MessageCircle className="h-5 w-5" />,
    title: "WhatsApp (tercepat)",
    value: `+${siteConfig.whatsapp}`,
    desc: "Balasan rata-rata < 5 menit. Cocok untuk pemesanan cepat, konsultasi, dan komplain.",
    href: siteConfig.whatsappLink("Halo admin, saya butuh bantuan."),
    action: "Chat sekarang",
    tone: "whatsapp" as const,
  },
  {
    icon: <Mail className="h-5 w-5" />,
    title: "E-mail",
    value: siteConfig.email,
    desc: "Untuk kerja sama, invoice, atau kebutuhan dokumen resmi.",
    href: `mailto:${siteConfig.email}`,
    action: "Kirim e-mail",
    tone: "secondary" as const,
  },
  {
    icon: <Send className="h-5 w-5" />,
    title: "Telegram",
    value: "@synixai_support",
    desc: "Alternatif chat jika WhatsApp sedang ramai.",
    href: "https://t.me/",
    action: "Buka Telegram",
    tone: "secondary" as const,
  },
];

export default function KontakPage() {
  return (
    <>
      <PageHero
        eyebrow="Kontak"
        breadcrumbs={[{ label: "Kontak" }]}
        title={
          <>
            Hubungi <span className="gradient-text">admin kami</span>
          </>
        }
        description="Ada pertanyaan sebelum memesan, ingin menjadi reseller, atau butuh bantuan menyelesaikan pesanan? Tim support kami siap membantu 24 jam sehari, 7 hari seminggu."
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="success">
            <Clock className="h-3.5 w-3.5" /> Online {siteConfig.operationalHours}
          </Badge>
          <Badge tone="brand">
            <ShieldCheck className="h-3.5 w-3.5" /> Kami tidak pernah meminta password akun
          </Badge>
          <Badge tone="info">
            <MapPin className="h-3.5 w-3.5" /> Berbasis di Indonesia
          </Badge>
        </div>
      </PageHero>

      <div className="container-page">
        <div className="grid gap-5 lg:grid-cols-3">
          {channels.map((channel) => (
            <div key={channel.title} className="flex flex-col rounded-3xl border border-line bg-surface-2/50 p-5 hover-lift">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-500/12 text-brand-500 dark:text-brand-300">
                {channel.icon}
              </span>
              <h2 className="mt-4 text-[15px] font-extrabold text-fg">{channel.title}</h2>
              <p className="mt-1 break-all font-mono text-[12.5px] font-semibold text-brand-400">{channel.value}</p>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted">{channel.desc}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button href={channel.href} variant={channel.tone} size="sm">
                  {channel.action}
                </Button>
                <CopyButton value={channel.value.replace(/^\+/, "")} label="Salin" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-3xl border border-line bg-surface-2/50 p-6">
            <h2 className="text-[17px] font-extrabold text-fg">Template pesan agar cepat ditangani</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Gunakan format di bawah saat menghubungi admin. Semakin lengkap informasinya, semakin cepat
              masalah Anda diselesaikan.
            </p>

            <div className="mt-4 space-y-3">
              <TemplateCard
                title="Pemesanan baru"
                body={`Halo admin, saya mau pesan:\nLayanan: (nama layanan / ID)\nTarget: (link atau username)\nJumlah: (jumlah pesanan)\n\nMohon dibantu prosesnya.`}
              />
              <TemplateCard
                title="Komplain / garansi"
                body={`Halo admin, saya mau komplain:\nID Pesanan: (nomor)\nLayanan: (nama layanan)\nMasalah: (jumlah drop / belum masuk / lainnya)\nBukti: (screenshot terlampir)`}
              />
              <TemplateCard
                title="Pertanyaan reseller / API"
                body={`Halo admin, saya ingin menjadi reseller.\nSkala order per bulan: (perkiraan)\nPlatform yang saya layani: (Instagram/TikTok/dll)\nMohon info harga reseller & akses API.`}
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-line bg-surface-2/50 p-5">
              <h2 className="text-[15px] font-extrabold text-fg">Jam operasional</h2>
              <div className="mt-3 space-y-2.5 text-[12.8px]">
                <Row label="Senin – Jumat" value="24 jam" />
                <Row label="Sabtu – Minggu" value="24 jam" />
                <Row label="Hari libur nasional" value="Admin standby via WhatsApp" />
              </div>
            </div>

            <div className="rounded-3xl border border-line bg-surface-2/50 p-5">
              <h2 className="text-[15px] font-extrabold text-fg">Sebelum menghubungi kami</h2>
              <ul className="mt-3 space-y-2 text-[12.5px] leading-snug text-muted">
                <li>• Sudah membaca halaman <a className="font-semibold text-brand-400 hover:underline" href="/faq">FAQ</a> — 90% pertanyaan terjawab di sana.</li>
                <li>• Sudah mengecek status pesanan di halaman <a className="font-semibold text-brand-400 hover:underline" href="/cek-order">Cek Order</a>.</li>
                <li>• Sudah menyiapkan ID pesanan & screenshot (untuk komplain).</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/[0.07] p-5">
              <p className="flex items-center gap-2 text-[13.5px] font-bold text-fg">
                <Phone className="h-4 w-4 text-emerald-400" /> Butuh respon instan?
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                WhatsApp adalah kanal tercepat. Sertakan detail pesanan Anda agar admin bisa langsung mengecek.
              </p>
              <Button href={siteConfig.whatsappLink("Halo admin, saya butuh bantuan secepatnya.")} variant="whatsapp" size="md" className="mt-3 w-full">
                <MessageCircle className="h-4 w-4" /> Chat WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TemplateCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-3/45 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-bold text-fg">{title}</p>
        <CopyButton value={body} label="Salin template" />
      </div>
      <pre className="mt-2.5 overflow-x-auto font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-muted">
        {body}
      </pre>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-fg">{value}</span>
    </div>
  );
}
