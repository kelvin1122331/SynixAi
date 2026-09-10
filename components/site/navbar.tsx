"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, Sparkles, X } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { navLinks, siteConfig } from "@/lib/site-config";

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/layanan?q=${encodeURIComponent(q)}` : "/layanan");
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled ? "glass border-b border-line shadow-lg shadow-black/5" : "border-b border-transparent",
        )}
      >
        <div className="container-page flex h-16 items-center gap-3 lg:h-[68px]">
          <Logo />

          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors",
                    active ? "text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {link.label}
                  {active ? (
                    <span className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full gradient-brand" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <form onSubmit={submitSearch} className="ml-auto hidden max-w-[260px] flex-1 md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari layanan… (followers, likes)"
                aria-label="Cari layanan"
                className="h-10 w-full rounded-xl border border-line bg-surface-2/60 pr-3 pl-9 text-[13px] text-fg outline-none transition-colors placeholder:text-muted/80 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <ThemeToggle className="hidden sm:grid" />
            <Button href={siteConfig.whatsappLink(`Halo admin ${siteConfig.name}, saya mau tanya-tanya soal layanan SMM.`)} variant="whatsapp" size="sm" className="hidden lg:inline-flex">
              <Sparkles className="h-4 w-4" />
              Chat Admin
            </Button>
            <Button href="/order" size="sm" className="hidden sm:inline-flex">
              Pesan Sekarang
            </Button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Buka menu"
              className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface-2/60 text-fg lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer mobile */}
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn("absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
        />
        <aside
          className={cn(
            "absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col gap-4 overflow-y-auto border-l border-line bg-bg-soft p-5 transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup menu"
              className="grid h-10 w-10 place-items-center rounded-xl border border-line text-fg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={submitSearch} className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari layanan…"
              className="h-11 w-full rounded-xl border border-line bg-surface-2/60 pr-3 pl-9 text-sm text-fg outline-none focus:border-brand-400"
            />
          </form>

          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3.5 py-3 text-[14px] font-semibold transition-colors",
                    active ? "bg-brand-500/12 text-brand-600 dark:text-brand-200" : "text-fg-soft hover:bg-surface-3",
                  )}
                >
                  {link.label}
                  <span className="text-muted">›</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-2.5 border-t border-line pt-4">
            <Button href="/order" size="lg" className="w-full">
              Pesan Sekarang
            </Button>
            <Button
              href={siteConfig.whatsappLink(`Halo admin ${siteConfig.name}, saya butuh bantuan.`)}
              variant="whatsapp"
              size="lg"
              className="w-full"
            >
              Chat Admin (WhatsApp)
            </Button>
            <div className="flex items-center justify-between rounded-xl border border-line bg-surface-2/50 px-3.5 py-2.5">
              <span className="text-[13px] font-medium text-muted">Tampilan</span>
              <ThemeToggle />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
