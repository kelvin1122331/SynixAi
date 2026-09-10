import Link from "next/link";
import { ArrowUpRight, Info, Shield, Zap } from "lucide-react";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { Badge, badgeTone } from "@/components/ui/badge";
import { compactNumber, formatRupiah } from "@/lib/format";
import type { Service } from "@/lib/types";
import { cn } from "@/lib/cn";

export function ServiceCard({ service, className }: { service: Service; className?: string }) {
  const visibleBadges = service.badges.slice(0, 4);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface-2/55 p-4 backdrop-blur-sm hover-lift",
        className,
      )}
    >
      {/* Aksen gradient di atas */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] scale-x-0 gradient-brand transition-transform duration-500 group-hover:scale-x-100" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-line bg-surface-3">
            <PlatformIcon platform={service.platform} className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold tracking-wide text-muted uppercase">{service.platformLabel}</p>
            <p className="truncate text-[11.5px] font-semibold text-brand-500 dark:text-brand-300">
              {service.category}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-lg border border-line bg-surface-3/80 px-2 py-1 text-[10.5px] font-bold text-muted">
          #{service.id}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-[14.5px] leading-snug font-bold text-fg" title={service.fullName}>
        {service.name}
      </h3>

      {service.variant ? (
        <p className="mt-1 line-clamp-1 text-[11.5px] font-medium text-muted">{service.variant}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {visibleBadges.map((badge) => (
          <Badge key={badge} tone={badgeTone(badge)} size="sm">
            {badge}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-3.5">
        <div>
          <p className="text-[10.5px] font-semibold tracking-wide text-muted uppercase">Harga / 1.000</p>
          <p className="text-[19px] leading-tight font-extrabold text-fg">
            {formatRupiah(service.priceRetail)}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-muted">
            ≈ {formatRupiah(service.priceRetail / 1000)} / unit
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10.5px] font-semibold tracking-wide text-muted uppercase">Min / Maks</p>
          <p className="text-[12.5px] font-bold text-fg-soft">
            {compactNumber(service.min)} – {compactNumber(service.max)}
          </p>
          <div className="mt-1 flex items-center justify-end gap-1.5">
            {service.instant ? (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-cyan-500 dark:text-cyan-300">
                <Zap className="h-3 w-3" /> Instan
              </span>
            ) : null}
            {service.refill ? (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-500 dark:text-emerald-300">
                <Shield className="h-3 w-3" /> Garansi
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-2">
        <Link
          href={`/order?service=${service.id}`}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl gradient-brand text-[13px] font-bold text-white shadow-md shadow-brand-600/25 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
        >
          Pesan Sekarang
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link
          href={`/layanan/${service.id}`}
          aria-label={`Detail layanan ${service.name}`}
          className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface-3 text-fg-soft transition-colors hover:border-brand-400/50 hover:text-fg"
        >
          <Info className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

/** Versi ringkas (baris) untuk tampilan daftar padat. */
export function ServiceRow({ service }: { service: Service }) {
  return (
    <div className="group flex flex-col gap-3 border-b border-line px-4 py-4 transition-colors last:border-0 hover:bg-surface-3/40 lg:flex-row lg:items-center lg:gap-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-surface-3">
        <PlatformIcon platform={service.platform} className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-bold text-fg" title={service.fullName}>
          {service.name}
        </p>
        <p className="truncate text-[11.5px] text-muted">
          {service.platformLabel} · {service.category}
          {service.variant ? ` · ${service.variant}` : ""} · #{service.id}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {service.badges.slice(0, 3).map((badge) => (
            <Badge key={badge} tone={badgeTone(badge)} size="sm">
              {badge}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 lg:w-[330px] lg:shrink-0">
        <div>
          <p className="text-[10.5px] font-semibold tracking-wide text-muted uppercase">Harga / 1K</p>
          <p className="text-[14px] font-extrabold text-emerald-500 dark:text-emerald-300">
            {formatRupiah(service.priceRetail)}
          </p>
        </div>
        <div>
          <p className="text-[10.5px] font-semibold tracking-wide text-muted uppercase">Min</p>
          <p className="text-[12.5px] font-bold text-fg-soft">{compactNumber(service.min)}</p>
        </div>
        <div>
          <p className="text-[10.5px] font-semibold tracking-wide text-muted uppercase">Maks</p>
          <p className="text-[12.5px] font-bold text-fg-soft">{compactNumber(service.max)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:shrink-0">
        <Link
          href={`/order?service=${service.id}`}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl gradient-brand px-4 text-[13px] font-bold text-white shadow-md shadow-brand-600/25 transition-transform duration-200 hover:scale-[1.02] lg:flex-none"
        >
          Pesan
        </Link>
        <Link
          href={`/layanan/${service.id}`}
          aria-label={`Detail layanan ${service.name}`}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-surface-3 text-fg-soft transition-colors hover:border-brand-400/50 hover:text-fg"
        >
          <Info className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
