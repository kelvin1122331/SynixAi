import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Header halaman dengan breadcrumb + judul + deskripsi. */
export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: Array<{ href?: string; label: string }>;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative pt-8 pb-6 sm:pt-12", className)}>
      <div className="container-page">
        {breadcrumbs.length ? (
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-[12px] text-muted">
            <Link href="/" className="transition-colors hover:text-brand-400">
              Beranda
            </Link>
            {breadcrumbs.map((crumb) => (
              <span key={crumb.label} className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                {crumb.href ? (
                  <Link href={crumb.href} className="transition-colors hover:text-brand-400">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-fg-soft">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}

        {eyebrow ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-brand-600 uppercase dark:text-brand-300">
            {eyebrow}
          </span>
        ) : null}

        <h1 className="text-balance-pretty mt-3 text-[28px] leading-tight font-extrabold tracking-tight sm:text-[36px]">
          {title}
        </h1>

        {description ? (
          <p className="mt-3.5 max-w-3xl text-[14.5px] leading-relaxed text-muted">{description}</p>
        ) : null}

        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
