import Link from "next/link";
import { HelpCircle, MessageCircle } from "lucide-react";
import { Accordion } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./sections";
import { faqs } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export function FaqSection({ limit }: { limit?: number }) {
  const items = (limit ? faqs.slice(0, limit) : faqs).map((f) => ({ q: f.q, a: f.a }));

  return (
    <section id="faq" className="scroll-mt-24 py-16 sm:py-20">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-14">
          <div>
            <SectionHeading
              align="left"
              eyebrow="FAQ"
              title={<>Pertanyaan yang <span className="gradient-text">sering ditanyakan</span></>}
              description="Belum menemukan jawabannya? Tanya langsung ke admin, kami balas cepat dan ramah."
            />
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-surface-2/50 p-5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-500/12 text-brand-500 dark:text-brand-300">
                <HelpCircle className="h-5 w-5" />
              </span>
              <p className="text-[13.5px] font-semibold text-fg">Masih ada pertanyaan?</p>
              <p className="text-[12.5px] leading-relaxed text-muted">
                Tim support kami online {siteConfig.operationalHours}. Anda juga bisa membaca
                panduan lengkap cara order dan contoh input link.
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                <Button
                  href={siteConfig.whatsappLink("Halo admin, saya mau tanya seputar layanan.")}
                  variant="whatsapp"
                  size="sm"
                >
                  <MessageCircle className="h-4 w-4" /> Tanya Admin
                </Button>
                <Link
                  href="/page/contoh-target"
                  className="inline-flex h-9 items-center rounded-xl border border-line px-3.5 text-[12.5px] font-bold text-fg-soft transition-colors hover:border-brand-400/50 hover:text-fg"
                >
                  Contoh Input Link
                </Link>
              </div>
            </div>
          </div>

          <div>
            <Accordion items={items} defaultOpen={0} />
            {limit && faqs.length > limit ? (
              <div className="mt-4 text-center lg:text-left">
                <Link href="/faq" className="text-[13px] font-bold text-brand-400 hover:underline">
                  Lihat semua {faqs.length} pertanyaan →
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
