import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Pagination berbasis URL (SEO friendly, tanpa JS). */
export function Pagination({
  page,
  totalPages,
  buildHref,
  className,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <nav className={cn("flex flex-wrap items-center justify-center gap-1.5", className)} aria-label="Navigasi halaman">
      <PageLink href={buildHref(page - 1)} disabled={page <= 1} aria-label="Halaman sebelumnya">
        <ChevronLeft className="h-4 w-4" />
      </PageLink>

      {pages.map((item, index) =>
        item === "…" ? (
          <span key={`gap-${index}`} className="px-2 text-muted">
            …
          </span>
        ) : (
          <PageLink key={item} href={buildHref(item)} active={item === page}>
            {item}
          </PageLink>
        ),
      )}

      <PageLink href={buildHref(page + 1)} disabled={page >= totalPages} aria-label="Halaman berikutnya">
        <ChevronRight className="h-4 w-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  active,
  disabled,
  children,
  ...rest
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.AriaAttributes) {
  const base =
    "grid h-10 min-w-10 place-items-center rounded-xl border px-3 text-[13px] font-bold transition-colors";
  if (disabled) {
    return <span className={cn(base, "cursor-not-allowed border-line text-muted/50")}>{children}</span>;
  }
  return (
    <Link
      href={href}
      className={cn(
        base,
        active
          ? "border-transparent gradient-brand text-white shadow-md shadow-brand-600/25"
          : "border-line bg-surface-2/60 text-fg-soft hover:border-brand-400/50 hover:text-fg",
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}

function buildPageList(page: number, totalPages: number): Array<number | "…"> {
  const pages: Array<number | "…"> = [];
  const push = (value: number | "…") => pages.push(value);

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) push(i);
    return pages;
  }

  push(1);
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) push("…");
  for (let i = start; i <= end; i += 1) push(i);
  if (end < totalPages - 1) push("…");
  push(totalPages);
  return pages;
}
