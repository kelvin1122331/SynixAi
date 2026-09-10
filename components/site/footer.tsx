import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone, ShieldCheck, Zap } from "lucide-react";
import { Logo } from "./logo";
import { footerLinks, siteConfig } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-line bg-bg-soft/60">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-muted">
              {siteConfig.name} adalah panel SMM Indonesia untuk menambah followers, likes, views,
              komentar, dan subscriber secara otomatis. Semua pesanan diproses oleh sistem otomatis
              24 jam dengan harga reseller termurah.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11.5px] font-semibold text-emerald-500 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" /> Garansi &amp; Refill
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11.5px] font-semibold text-brand-600 dark:text-brand-300">
                <Zap className="h-3.5 w-3.5" /> Proses Otomatis 24 Jam
              </span>
            </div>
          </div>

          <FooterColumn title="Layanan Populer" links={footerLinks.layanan} />
          <FooterColumn title="Bantuan" links={footerLinks.bantuan} />
          <FooterColumn title="Legal" links={footerLinks.legal} />
        </div>

        <div className="mt-12 grid gap-6 border-t border-line pt-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <p className="text-[12px] font-bold tracking-[0.14em] text-muted uppercase">Kontak &amp; Dukungan</p>
            <a href={siteConfig.whatsappLink("Halo admin, saya butuh bantuan.")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[13.5px] font-medium text-fg-soft transition-colors hover:text-brand-400">
              <Phone className="h-4 w-4 text-emerald-400" /> +{siteConfig.whatsapp}
            </a>
            <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 text-[13.5px] font-medium text-fg-soft transition-colors hover:text-brand-400">
              <Mail className="h-4 w-4 text-brand-400" /> {siteConfig.email}
            </a>
            <p className="flex items-center gap-2 text-[13.5px] font-medium text-muted">
              <MapPin className="h-4 w-4 text-fuchsia-400" /> Indonesia · Online {siteConfig.operationalHours}
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="text-[12px] font-bold tracking-[0.14em] text-muted uppercase">Metode Pembayaran</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {siteConfig.payments.map((p) => (
                <span
                  key={p.name}
                  className={`rounded-lg bg-gradient-to-br ${p.tone} px-3 py-1.5 text-[11.5px] font-bold text-white/95 shadow-sm`}
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-[12.5px] text-muted">
            © {year} {siteConfig.name}. Seluruh hak cipta dilindungi. Bukan situs resmi platform media sosial manapun.
          </p>
          <p className="text-[12.5px] text-muted">
            Dibuat dengan <span className="text-rose-400">♥</span> untuk content creator Indonesia.
          </p>
        </div>
      </div>

      <a
        href={siteConfig.whatsappLink("Halo admin, saya mau tanya soal layanan.")}
        target="_blank"
        rel="noopener noreferrer"
        className="sr-only"
      >
        Hubungi admin melalui WhatsApp <MessageCircle className="inline h-4 w-4" />
      </a>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-[12px] font-bold tracking-[0.14em] text-muted uppercase">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href} className="text-[13.5px] font-medium text-fg-soft transition-colors hover:text-brand-400">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
