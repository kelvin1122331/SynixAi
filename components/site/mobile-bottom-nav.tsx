"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, MessageCircle, PlusCircle, SearchCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/site-config";

const items = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/layanan", label: "Katalog", icon: LayoutGrid },
  { href: "/order", label: "Pesan", icon: PlusCircle, primary: true },
  { href: "/cek-order", label: "Cek Order", icon: SearchCheck },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line glass pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5 items-center">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          if (item.primary) {
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center py-1.5">
                <span className="grid h-12 w-12 -translate-y-3 place-items-center rounded-2xl gradient-brand text-white shadow-xl shadow-brand-600/40">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="-mt-2 text-[10.5px] font-bold text-brand-400">{item.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-semibold transition-colors",
                active ? "text-brand-400" : "text-muted",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <a
          href={siteConfig.whatsappLink("Halo admin, saya mau tanya soal layanan.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-semibold text-emerald-400"
        >
          <MessageCircle className="h-5 w-5" />
          Admin
        </a>
      </div>
    </nav>
  );
}
