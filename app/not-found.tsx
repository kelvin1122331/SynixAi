import Link from "next/link";
import { Compass, Home, LayoutGrid, MessageCircle, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-brand-500/12 text-brand-500 dark:text-brand-300">
        <SearchX className="h-7 w-7" />
      </span>
      <p className="mt-6 text-[13px] font-bold tracking-[0.16em] text-brand-400 uppercase">Error 404</p>
      <h1 className="mt-3 text-[30px] leading-tight font-extrabold sm:text-[38px]">
        Halaman <span className="gradient-text">tidak ditemukan</span>
      </h1>
      <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-muted">
        Halaman yang Anda cari mungkin sudah dipindahkan atau tautannya salah. Coba kembali ke beranda, atau
        telusuri katalog layanan kami — ada {siteConfig.name} siap membantu.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button href="/" size="lg">
          <Home className="h-4.5 w-4.5" /> Kembali ke beranda
        </Button>
        <Button href="/layanan" variant="secondary" size="lg">
          <LayoutGrid className="h-4.5 w-4.5" /> Buka katalog
        </Button>
        <Button
          href={siteConfig.whatsappLink("Halo admin, saya tidak menemukan halaman yang saya cari.")}
          variant="whatsapp"
          size="lg"
        >
          <MessageCircle className="h-4.5 w-4.5" /> Tanya admin
        </Button>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-[12.5px] text-muted">
        <Compass className="h-4 w-4 text-brand-400" />
        Halaman populer:
        {[
          { href: "/layanan", label: "Katalog layanan" },
          { href: "/order", label: "Pesan sekarang" },
          { href: "/cek-order", label: "Cek order" },
          { href: "/api-docs", label: "API reseller" },
          { href: "/faq", label: "FAQ" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-line bg-surface-2/60 px-3 py-1 font-semibold transition-colors hover:border-brand-400/50 hover:text-fg"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
