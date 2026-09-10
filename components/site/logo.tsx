import Link from "next/link";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/site-config";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label={siteConfig.name}>
      <span className="relative grid h-10 w-10 place-items-center rounded-2xl gradient-brand shadow-lg shadow-brand-600/30 transition-transform duration-300 group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-5.5 w-5.5" fill="none" aria-hidden>
          <path d="M13.5 2.5 4.8 13.2h5.1l-1.4 8.3 8.7-10.7h-5.1l1.4-8.3Z" fill="white" fillOpacity="0.95" />
        </svg>
        <span className="absolute inset-0 rounded-2xl ring-1 ring-white/25" />
      </span>
      {showText ? (
        <span className="flex flex-col leading-none">
          <span className="text-[17px] font-extrabold tracking-tight text-fg">
            {siteConfig.name.slice(0, 4)}
            <span className="gradient-text">{siteConfig.name.slice(4)}</span>
          </span>
          <span className="mt-0.5 text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">SMM Panel</span>
        </span>
      ) : null}
    </Link>
  );
}
