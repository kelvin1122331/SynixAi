import Link from "next/link";
import { FileText, MessageCircle } from "lucide-react";
import { PageHero } from "./page-hero";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export interface LegalSection {
  title: string;
  paragraphs?: string[];
  list?: string[];
}

/** Layout bersama untuk halaman legal (syarat, privasi, refund). */
export function LegalLayout({
  eyebrow,
  title,
  description,
  breadcrumb,
  sections,
  updatedAt = "11 September 2026",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  breadcrumb: string;
  sections: LegalSection[];
  updatedAt?: string;
}) {
  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        breadcrumbs={[{ label: breadcrumb }]}
        title={title}
        description={description}
      >
        <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-muted">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2/60 px-3 py-1 font-semibold">
            <FileText className="h-3.5 w-3.5 text-brand-400" /> Terakhir diperbarui: {updatedAt}
          </span>
          <span>Berlaku untuk seluruh layanan {siteConfig.name}.</span>
        </div>
      </PageHero>

      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[1fr_2.6fr]">
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <nav className="rounded-3xl border border-line bg-surface-2/50 p-5">
              <p className="text-[12px] font-bold tracking-wide text-muted uppercase">Daftar isi</p>
              <ol className="mt-3 space-y-2">
                {sections.map((section, index) => (
                  <li key={section.title}>
                    <a
                      href={`#bagian-${index + 1}`}
                      className="text-[12.5px] leading-snug text-fg-soft transition-colors hover:text-brand-400"
                    >
                      <span className="font-bold text-brand-400">{index + 1}.</span> {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-4 rounded-3xl border border-line bg-surface-2/50 p-5">
              <p className="text-[13px] font-bold text-fg">Ada pertanyaan hukum?</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                Hubungi admin untuk klarifikasi syarat, privasi, atau proses refund.
              </p>
              <Button href="/kontak" variant="secondary" size="sm" className="mt-3 w-full">
                Halaman kontak
              </Button>
            </div>
          </aside>

          <article className="space-y-6">
            {sections.map((section, index) => (
              <section
                key={section.title}
                id={`bagian-${index + 1}`}
                className="scroll-mt-24 rounded-3xl border border-line bg-surface-2/45 p-5 sm:p-6"
              >
                <h2 className="text-[17px] font-extrabold text-fg">
                  <span className="mr-2 text-brand-400">{index + 1}.</span>
                  {section.title}
                </h2>

                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-[13.5px] leading-relaxed text-muted">
                    {paragraph}
                  </p>
                ))}

                {section.list ? (
                  <ul className="mt-3 space-y-2">
                    {section.list.map((item) => (
                      <li key={item} className="flex gap-2.5 text-[13.5px] leading-relaxed text-muted">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-brand-500/25 bg-brand-500/[0.07] p-5">
              <p className="text-[13px] text-fg-soft">
                Butuh penjelasan lebih lanjut tentang dokumen ini?
              </p>
              <Button
                href={siteConfig.whatsappLink("Halo admin, saya ingin bertanya tentang dokumen legal website.")}
                variant="whatsapp"
                size="sm"
              >
                <MessageCircle className="h-4 w-4" /> Tanya admin
              </Button>
            </div>

            <p className="text-center text-[12px] text-muted">
              Lihat juga{" "}
              <Link href="/syarat" className="font-semibold text-brand-400 hover:underline">
                Syarat &amp; Ketentuan
              </Link>
              ,{" "}
              <Link href="/privasi" className="font-semibold text-brand-400 hover:underline">
                Kebijakan Privasi
              </Link>
              , dan{" "}
              <Link href="/refund" className="font-semibold text-brand-400 hover:underline">
                Kebijakan Refund
              </Link>
              .
            </p>
          </article>
        </div>
      </div>
    </>
  );
}
