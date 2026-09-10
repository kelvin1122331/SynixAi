import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, MessageCircle, Search } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { FaqSection } from "@/components/landing/faq-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { faqs } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Pertanyaan Umum (FAQ) Layanan SMM",
  description:
    "Jawaban lengkap seputar SMM panel: cara order, keamanan akun, garansi & refill, metode pembayaran, waktu proses, hingga cara menjadi reseller.",
  alternates: { canonical: "/faq" },
};

const categories = [
  { title: "Pemesanan", items: ["Bagaimana cara mulai memesan?", "Berapa lama pesanan mulai diproses?"] },
  { title: "Keamanan", items: ["Apakah saya perlu memberikan password akun?", "Apakah aman untuk akun saya?"] },
  { title: "Garansi", items: ["Apakah layanan di sini bergaransi?", "Bagaimana jika pesanan bermasalah?"] },
  { title: "Pembayaran", items: ["Metode pembayaran apa saja yang tersedia?"] },
  { title: "Reseller", items: ["Bisakah saya menjadi reseller?"] },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Pusat bantuan"
        breadcrumbs={[{ label: "FAQ" }]}
        title={
          <>
            Pertanyaan yang <span className="gradient-text">sering ditanyakan</span>
          </>
        }
        description={`Kumpulan ${faqs.length} pertanyaan populer seputar layanan ${siteConfig.name}. Jika jawabannya belum ada di sini, admin kami siap membantu ${siteConfig.operationalHours} lewat WhatsApp.`}
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">
            <BookOpen className="h-3.5 w-3.5" /> {faqs.length} pertanyaan
          </Badge>
          <Badge tone="success">
            <MessageCircle className="h-3.5 w-3.5" /> Support 24 jam
          </Badge>
          <Badge tone="info">
            <Search className="h-3.5 w-3.5" /> Panduan order lengkap
          </Badge>
        </div>
      </PageHero>

      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-[1fr_2.2fr]">
          <aside className="space-y-4">
            <div className="rounded-3xl border border-line bg-surface-2/50 p-5">
              <h2 className="text-[15px] font-extrabold text-fg">Topik bantuan</h2>
              <div className="mt-3.5 space-y-3">
                {categories.map((category) => (
                  <div key={category.title}>
                    <p className="text-[11.5px] font-bold tracking-wide text-muted uppercase">{category.title}</p>
                    <ul className="mt-1.5 space-y-1">
                      {category.items.map((item) => (
                        <li key={item} className="text-[12.5px] leading-snug text-fg-soft">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-line bg-surface-2/50 p-5">
              <h2 className="text-[15px] font-extrabold text-fg">Panduan cepat</h2>
              <div className="mt-3 flex flex-col gap-2">
                <Link href="/page/contoh-target" className="text-[12.8px] font-semibold text-brand-400 hover:underline">
                  → Contoh input link & username
                </Link>
                <Link href="/cek-order" className="text-[12.8px] font-semibold text-brand-400 hover:underline">
                  → Cara cek status pesanan
                </Link>
                <Link href="/api-docs" className="text-[12.8px] font-semibold text-brand-400 hover:underline">
                  → Dokumentasi API reseller
                </Link>
                <Link href="/refund" className="text-[12.8px] font-semibold text-brand-400 hover:underline">
                  → Kebijakan refund & komplain
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-brand-500/25 bg-brand-500/[0.07] p-5">
              <p className="text-[13.5px] font-bold text-fg">Belum terjawab?</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                Kirim pertanyaan Anda, kami balas rata-rata di bawah 5 menit pada jam sibuk.
              </p>
              <Button
                href={siteConfig.whatsappLink("Halo admin, saya punya pertanyaan seputar layanan.")}
                variant="whatsapp"
                size="md"
                className="mt-3 w-full"
              >
                <MessageCircle className="h-4 w-4" /> Chat Admin
              </Button>
            </div>
          </aside>

          <div>
            <FaqSection />
          </div>
        </div>
      </div>
    </>
  );
}
