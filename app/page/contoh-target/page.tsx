import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardList, MessageCircle, ShieldCheck, XCircle } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/misc";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { targetExamples } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Panduan & Contoh Input Target Pesanan",
  description:
    "Cara mengisi kolom target saat memesan layanan SMM: contoh link profil, postingan, video, live stream, channel Telegram/WhatsApp, hingga marketplace Shopee & Tokopedia.",
  alternates: { canonical: "/page/contoh-target" },
};

const platformKeyMap: Record<string, string> = {
  Instagram: "instagram",
  TikTok: "tiktok",
  "TikTok Live Stream": "tiktok",
  YouTube: "youtube",
  Facebook: "facebook",
  Telegram: "telegram",
  WhatsApp: "whatsapp",
  "Shopee / Tokopedia": "shopee",
  Spotify: "spotify",
  "Google Reviews": "google",
};

export default function ContohTargetPage() {
  return (
    <>
      <PageHero
        eyebrow="Panduan"
        breadcrumbs={[{ label: "Panduan Input Target" }]}
        title={
          <>
            Contoh input <span className="gradient-text">link &amp; username</span>
          </>
        }
        description="Salah memasukkan target adalah penyebab paling umum pesanan gagal. Ikuti panduan berikut agar pesanan Anda langsung diproses tanpa revisi."
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="success">
            <ShieldCheck className="h-3.5 w-3.5" /> Tanpa password akun
          </Badge>
          <Badge tone="brand">
            <ClipboardList className="h-3.5 w-3.5" /> {targetExamples.length} contoh siap pakai
          </Badge>
        </div>
      </PageHero>

      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <section>
            <div className="overflow-hidden rounded-3xl border border-line bg-surface-2/45">
              {targetExamples.map((example) => {
                const platform = platformKeyMap[example.label] ?? "lainnya";
                return (
                  <div key={example.label} className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-4 last:border-0 sm:px-5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line bg-surface-3">
                      <PlatformIcon platform={platform} className="h-4 w-4" />
                    </span>
                    <div className="min-w-[180px] flex-1">
                      <p className="text-[13.5px] font-bold text-fg">{example.label}</p>
                      <p className="text-[11.5px] text-muted">{example.note}</p>
                    </div>
                    <code className="order-last w-full truncate rounded-lg border border-line bg-surface-3/60 px-3 py-2 font-mono text-[11.5px] text-brand-400 sm:order-none sm:w-auto sm:max-w-[45%]">
                      {example.value}
                    </code>
                    <CopyButton value={example.value} label="Salin" />
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/[0.07] p-5">
                <p className="flex items-center gap-2 text-[14px] font-extrabold text-fg">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" /> Contoh benar
                </p>
                <ul className="mt-3 space-y-2 font-mono text-[11.5px] leading-relaxed text-fg-soft">
                  <li>instagram.com/username.anda</li>
                  <li>tiktok.com/@username.anda</li>
                  <li>@username.anda (khusus followers)</li>
                  <li>youtu.be/VIDEO_ID</li>
                  <li>t.me/nama_channel</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-rose-500/25 bg-rose-500/[0.07] p-5">
                <p className="flex items-center gap-2 text-[14px] font-extrabold text-fg">
                  <XCircle className="h-4.5 w-4.5 text-rose-400" /> Sering gagal karena
                </p>
                <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-fg-soft">
                  <li>• Akun di-private saat pesanan diproses.</li>
                  <li>• Link screenshot / bukan link asli.</li>
                  <li>• Salah menempel link channel padahal butuh link video.</li>
                  <li>• Mengganti username saat pesanan berjalan.</li>
                  <li>• Memesan dua layanan sejenis di link yang sama bersamaan.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-line bg-surface-2/50 p-5 sm:p-6">
              <h2 className="text-[16px] font-extrabold text-fg">Cara menyalin link dengan benar</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Postingan / video",
                    steps: [
                      "Buka postingan/video yang dituju",
                      "Ketuk ikon bagikan (share)",
                      "Pilih “Salin link / Copy link”",
                      "Tempel di kolom target pemesanan",
                    ],
                  },
                  {
                    title: "Profil / akun",
                    steps: [
                      "Buka halaman profil akun",
                      "Ketuk ikon bagikan atau titik tiga",
                      "Pilih “Salin profil / Copy URL”",
                      "Alternatif: tulis username-nya saja",
                    ],
                  },
                ].map((group) => (
                  <div key={group.title} className="rounded-2xl border border-line bg-surface-3/45 p-4">
                    <p className="text-[13px] font-bold text-fg">{group.title}</p>
                    <ol className="mt-2.5 space-y-1.5">
                      {group.steps.map((step, index) => (
                        <li key={step} className="flex gap-2 text-[12.5px] leading-snug text-muted">
                          <span className="font-bold text-brand-400">{index + 1}.</span> {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-amber-500/25 bg-amber-500/[0.08] p-5">
              <p className="flex items-center gap-2 text-[13.5px] font-bold text-fg">
                <AlertTriangle className="h-4 w-4 text-amber-400" /> Ingat!
              </p>
              <ul className="mt-2.5 space-y-2 text-[12.5px] leading-relaxed text-muted">
                <li>• Kami tidak pernah meminta password, OTP, atau kode verifikasi akun Anda.</li>
                <li>• Pastikan target publik minimal sampai pesanan selesai.</li>
                <li>• Untuk layanan live stream, pesanan diproses saat Anda sedang live.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-line bg-surface-2/50 p-5">
              <p className="text-[13.5px] font-bold text-fg">Petunjuk target di katalog</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                Setiap layanan punya keterangan target (misalnya <em>“Target : Link VT”</em> untuk video
                TikTok atau <em>“Link/Username”</em> untuk followers). Petunjuk ini otomatis muncul di form
                pemesanan saat Anda memilih layanan.
              </p>
              <Link href="/layanan" className="mt-3 inline-block text-[12.5px] font-bold text-brand-400 hover:underline">
                Buka katalog layanan →
              </Link>
            </div>

            <div className="rounded-3xl border border-brand-500/25 bg-brand-500/[0.07] p-5">
              <p className="text-[13.5px] font-bold text-fg">Masih bingung?</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                Kirim link Anda ke admin, kami cek layanan apa yang paling cocok dan aman.
              </p>
              <Button
                href={siteConfig.whatsappLink("Halo admin, mohon dibantu cek target/link pesanan saya.")}
                variant="whatsapp"
                size="md"
                className="mt-3 w-full"
              >
                <MessageCircle className="h-4 w-4" /> Tanya Admin
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
