"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select, Switch } from "@/components/ui/field";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { cn } from "@/lib/cn";

export interface FilterFacets {
  platforms: Array<{ key: string; label: string; count: number; color: string }>;
  categories: Array<{ name: string; count: number }>;
  priceRange: { min: number; max: number };
}

const SORTS = [
  { value: "populer", label: "Paling populer" },
  { value: "termurah", label: "Harga termurah" },
  { value: "termahal", label: "Harga termahal" },
  { value: "min", label: "Minimal order terkecil" },
  { value: "maks", label: "Maksimal order terbesar" },
  { value: "az", label: "Nama A–Z" },
];

const PER_PAGE = [24, 48, 96];

export function ServiceFilters({ facets, total }: { facets: FilterFacets; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const current = useMemo(() => {
    return {
      q: params.get("q") ?? "",
      platform: params.get("platform") ?? "semua",
      category: params.get("category") ?? "",
      sort: params.get("sort") ?? "populer",
      minPrice: params.get("minPrice") ?? "",
      maxPrice: params.get("maxPrice") ?? "",
      refill: params.get("refill") === "1",
      instant: params.get("instant") === "1",
      perPage: params.get("perPage") ?? "24",
    };
  }, [params]);

  const [searchValue, setSearchValue] = useState(current.q);

  useEffect(() => {
    setSearchValue(current.q);
  }, [current.q]);

  function push(next: Record<string, string | null>) {
    const nextParams = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "semua" || value === "0") nextParams.delete(key);
      else nextParams.set(key, value);
    }
    nextParams.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${nextParams.toString()}`, { scroll: false });
    });
  }

  // Debounce pencarian
  useEffect(() => {
    if (searchValue === current.q) return;
    const timer = setTimeout(() => push({ q: searchValue || null }), 420);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const activeCount =
    (current.platform !== "semua" ? 1 : 0) +
    (current.category ? 1 : 0) +
    (current.minPrice ? 1 : 0) +
    (current.maxPrice ? 1 : 0) +
    (current.refill ? 1 : 0) +
    (current.instant ? 1 : 0) +
    (current.q ? 1 : 0);

  function resetAll() {
    setSearchValue("");
    startTransition(() => router.push(pathname, { scroll: false }));
  }

  return (
    <section className="sticky top-16 z-40 -mx-4 mb-6 border-b border-line glass px-4 py-3.5 lg:static lg:mx-0 lg:rounded-3xl lg:border lg:px-5 lg:py-4 lg:shadow-lg lg:shadow-black/5">
      {/* Baris 1: pencarian + tombol filter */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Cari layanan… contoh: followers tiktok indonesia, likes ig murah"
            aria-label="Cari layanan"
            className="h-11 w-full rounded-xl border border-line bg-surface-2/70 pr-10 pl-10 text-[13.5px] text-fg outline-none transition-colors placeholder:text-muted/80 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
          />
          {searchValue ? (
            <button
              type="button"
              onClick={() => setSearchValue("")}
              aria-label="Bersihkan pencarian"
              className="absolute top-1/2 right-3 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-surface-3 text-muted hover:text-fg"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-xl border px-3.5 text-[13px] font-bold transition-colors",
              showAdvanced || activeCount > 0
                ? "border-brand-400/50 bg-brand-500/10 text-brand-500 dark:text-brand-300"
                : "border-line bg-surface-2/60 text-fg-soft hover:border-line-strong",
            )}
            aria-expanded={showAdvanced}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            {activeCount > 0 ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full gradient-brand px-1 text-[10.5px] font-extrabold text-white">
                {activeCount}
              </span>
            ) : null}
          </button>

          <Select
            value={current.sort}
            onChange={(e) => push({ sort: e.target.value })}
            aria-label="Urutkan"
            className="w-full sm:w-[190px]"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Baris 2: chip platform */}
      <div className="mt-3 -mx-4 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:px-0">
        <div className="flex min-w-max items-center gap-2">
          <PlatformPill
            active={current.platform === "semua"}
            onClick={() => push({ platform: null, category: null })}
            label="Semua platform"
            count={facets.platforms.reduce((sum, p) => sum + p.count, 0)}
          />
          {facets.platforms.map((p) => (
            <PlatformPill
              key={p.key}
              active={current.platform === p.key}
              onClick={() => push({ platform: p.key, category: null })}
              label={p.label}
              count={p.count}
              platform={p.key}
            />
          ))}
        </div>
      </div>

      {/* Panel filter lanjutan */}
      {showAdvanced ? (
        <div className="mt-3 grid gap-4 rounded-2xl border border-line bg-surface-2/60 p-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <div>
            <p className="mb-1.5 text-[12px] font-bold text-fg-soft">Kategori layanan</p>
            <Select value={current.category} onChange={(e) => push({ category: e.target.value || null })}>
              <option value="">Semua kategori</option>
              {facets.categories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.count})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <p className="mb-1.5 text-[12px] font-bold text-fg-soft">Rentang harga per 1.000</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                placeholder={`Min (${facets.priceRange.min})`}
                defaultValue={current.minPrice}
                onBlur={(e) => push({ minPrice: e.target.value || null })}
                className="h-11"
              />
              <span className="text-muted">–</span>
              <Input
                type="number"
                inputMode="numeric"
                placeholder={`Maks (${facets.priceRange.max})`}
                defaultValue={current.maxPrice}
                onBlur={(e) => push({ maxPrice: e.target.value || null })}
                className="h-11"
              />
            </div>
          </div>

          <div className="flex flex-col justify-end gap-2.5">
            <Switch checked={current.refill} onChange={(v) => push({ refill: v ? "1" : null })} label="Hanya bergaransi / refill" />
            <Switch checked={current.instant} onChange={(v) => push({ instant: v ? "1" : null })} label="Hanya proses instan" />
          </div>

          <div className="flex items-end gap-2">
            <Button variant="secondary" size="md" onClick={resetAll} type="button">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
      ) : null}

      {/* Ringkasan aktif */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-muted">
        <span className="inline-flex items-center gap-1.5 font-semibold text-fg-soft">
          <Filter className="h-3.5 w-3.5 text-brand-400" />
          {pending ? "Memuat…" : `${total.toLocaleString("id-ID")} layanan ditemukan`}
        </span>
        {current.q ? <ActiveChip label={`"${current.q}"`} onRemove={() => setSearchValue("")} /> : null}
        {current.category ? <ActiveChip label={current.category} onRemove={() => push({ category: null })} /> : null}
        {current.refill ? <ActiveChip label="Bergaransi" onRemove={() => push({ refill: null })} /> : null}
        {current.instant ? <ActiveChip label="Instan" onRemove={() => push({ instant: null })} /> : null}
        {current.minPrice ? <ActiveChip label={`≥ Rp ${Number(current.minPrice).toLocaleString("id-ID")}`} onRemove={() => push({ minPrice: null })} /> : null}
        {current.maxPrice ? <ActiveChip label={`≤ Rp ${Number(current.maxPrice).toLocaleString("id-ID")}`} onRemove={() => push({ maxPrice: null })} /> : null}
        {activeCount > 1 ? (
          <button type="button" onClick={resetAll} className="font-bold text-brand-400 hover:underline">
            bersihkan semua
          </button>
        ) : null}
      </div>
    </section>
  );
}

function PlatformPill({
  active,
  onClick,
  label,
  count,
  platform,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  platform?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[12.5px] font-bold whitespace-nowrap transition-all duration-200",
        active
          ? "border-transparent gradient-brand text-white shadow-md shadow-brand-600/25"
          : "border-line bg-surface-2/60 text-fg-soft hover:border-brand-400/40 hover:text-fg",
      )}
    >
      {platform ? (
        <PlatformIcon platform={platform} colored={!active} className="h-4 w-4" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {label}
      <span className={cn("text-[11px] font-semibold", active ? "text-white/80" : "text-muted")}>{count}</span>
    </button>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge tone="brand" className="gap-1.5">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Hapus filter ${label}`} className="hover:text-rose-400">
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

export { PER_PAGE };
