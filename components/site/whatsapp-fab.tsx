"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/cn";

export function WhatsAppFab() {
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTip(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed right-4 bottom-24 z-50 hidden flex-col items-end gap-2 md:bottom-6 md:flex">
      {showTip ? (
        <div className="relative max-w-[248px] animate-fade-up rounded-2xl rounded-br-sm border border-line bg-surface-2/95 p-3.5 shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setShowTip(false)}
            aria-label="Tutup"
            className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full border border-line bg-bg-soft text-muted hover:text-fg"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <p className="text-[12.5px] font-semibold text-fg">Butuh bantuan memilih layanan? 👋</p>
          <p className="mt-1 text-[11.5px] leading-snug text-muted">
            Admin online 24 jam. Tanya dulu, bayar belakangan — gratis konsultasi!
          </p>
        </div>
      ) : null}

      <a
        href={siteConfig.whatsappLink(`Halo admin ${siteConfig.name}, saya mau tanya soal layanan SMM.`)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat admin via WhatsApp"
        className={cn(
          "group flex items-center gap-2.5 rounded-full bg-[#25D366] py-3 pr-5 pl-4 font-bold text-[#04301a] shadow-2xl shadow-emerald-500/30 transition-transform duration-300 hover:scale-105",
          "animate-pulse-ring",
        )}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-[13.5px]">Chat Admin</span>
      </a>
    </div>
  );
}
