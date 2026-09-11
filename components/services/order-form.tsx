"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, ArrowRight, CheckCircle2, CreditCard, Info, Link2, Loader2, MessageCircle,
  Minus, Plus, Search, ShieldCheck, Sparkles, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, badgeTone } from "@/components/ui/badge";
import { Field, Input, Textarea } from "@/components/ui/field";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { useToast } from "@/components/ui/toast";
import { CopyButton } from "@/components/ui/misc";
import { compactNumber, formatRupiah } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/cn";
import type { Service } from "@/lib/types";

interface OrderFormProps {
  /** Daftar layanan lokal (dipakai bila katalog kecil). Kosongkan untuk mode pencarian server. */
  services?: Service[];
  initialService?: Service | null;
  /** Sembunyikan pemilih layanan (halaman detail layanan). */
  lockedService?: boolean;
  className?: string;
}

const QUICK_QUANTITIES = [100, 500, 1000, 5000, 10000, 50000];

export function OrderForm({ services = [], initialService, lockedService, className }: OrderFormProps) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Service | null>(initialService ?? null);
  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [remote, setRemote] = useState<Service[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [target, setTarget] = useState("");
  const [quantity, setQuantity] = useState<number>(initialService?.min ?? 100);
  const [comments, setComments] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FormResult | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  /* Tutup dropdown saat klik di luar */
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setListOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  /* Ambil layanan populer dari API saat pertama kali membuka daftar */
  const fetchRemote = useCallback(async (q: string) => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams({ perPage: "30" });
      if (q.trim()) params.set("q", q.trim());
      else params.set("sort", "populer");
      const res = await fetch(`/api/services?${params.toString()}`, { cache: "no-store" });
      const data = (await res.json()) as { data?: Service[] };
      setRemote(Array.isArray(data.data) ? data.data : []);
    } catch {
      setRemote([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!listOpen) return;
    if (services.length) return;
    const timer = setTimeout(() => void fetchRemote(query), query ? 320 : 0);
    return () => clearTimeout(timer);
  }, [listOpen, query, services.length, fetchRemote]);

  useEffect(() => {
    if (!selected) return;
    setQuantity((prev) => (prev >= selected.min && prev <= selected.max ? prev : selected.min));
  }, [selected]);

  const filtered = useMemo(() => {
    if (services.length) {
      const q = query.trim().toLowerCase();
      const base = q
        ? services.filter((s) =>
            `${s.name} ${s.category} ${s.variant} ${s.platformLabel} ${s.id}`.toLowerCase().includes(q),
          )
        : services;
      return base.slice(0, 40);
    }
    return remote;
  }, [services, remote, query]);

  const total = selected ? Math.round((selected.priceRetail / 1000) * quantity) : 0;
  const isValidTarget = target.trim().length >= 3;
  const isValidQuantity = selected ? quantity >= selected.min && quantity <= selected.max : false;
  const canSubmit = Boolean(selected && isValidTarget && isValidQuantity && agree && !submitting);

  function selectService(service: Service) {
    setSelected(service);
    setListOpen(false);
    setQuery("");
    setResult(null);
  }

  function adjustQuantity(direction: number) {
    if (!selected) return;
    const delta = Math.max(1, Math.round(quantity * 0.1)) * (direction > 0 ? 1 : -1);
    setQuantity(Math.min(selected.max, Math.max(selected.min, quantity + delta)));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || !canSubmit) return;
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: selected.id,
          target: target.trim(),
          quantity,
          comments: comments.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        mode?: "auto" | "manual" | "gateway";
        orderId?: string;
        reference?: string;
        needsPayment?: boolean;
        total?: number;
        expiresAt?: string;
        payment?: PaymentInfo;
        catalogSource?: string;
        gatewayError?: string;
        error?: string;
        code?: string;
      };

      if (data.ok && data.orderId) {
        // Mode instan: pesanan langsung diteruskan ke provider
        setResult({ kind: "auto", orderId: data.orderId, total: data.total ?? total });
        toast({
          title: "Pesanan berhasil dibuat 🎉",
          description: `ID Pesanan: ${data.orderId}`,
          tone: "success",
        });
        saveToHistory({
          id: data.orderId,
          serviceId: selected.id,
          serviceName: selected.name,
          platform: selected.platform,
          target: target.trim(),
          quantity,
          total: data.total ?? total,
          createdAt: new Date().toISOString(),
          status: "Pending",
        });
      } else if (data.ok && data.needsPayment && data.reference) {
        // Mode aman: pesanan menunggu pembayaran (kode referensi)
        setResult({
          kind: "manual",
          reference: data.reference,
          total: data.total ?? total,
          expiresAt: data.expiresAt,
          payment: data.payment,
          catalogSource: data.catalogSource,
          gatewayError: data.gatewayError,
        });
        toast({
          title: "Pesanan dibuat — menunggu pembayaran",
          description: `Kode referensi: ${data.reference}`,
          tone: "warning",
        });
        saveToHistory({
          id: data.reference,
          serviceId: selected.id,
          serviceName: selected.name,
          platform: selected.platform,
          target: target.trim(),
          quantity,
          total: data.total ?? total,
          createdAt: new Date().toISOString(),
          status: "Menunggu Pembayaran",
        });
      } else {
        setResult({
          kind: "error",
          code: data.code,
          message: data.error ?? "Pesanan gagal dibuat. Silakan coba lagi atau hubungi admin.",
        });
        toast({ title: "Pesanan gagal", description: data.error ?? "Terjadi kesalahan.", tone: "error" });
      }
    } catch (error) {
      setResult({ kind: "error", message: `Tidak dapat menghubungi server: ${(error as Error).message}` });
      toast({ title: "Koneksi gagal", description: "Periksa koneksi internet Anda.", tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  /* ------------------------------- Tampilan: menunggu pembayaran (aman) */
  if (result?.kind === "manual" && selected) {
    return (
      <PaymentPanel
        result={result}
        service={selected}
        target={target}
        quantity={quantity}
        className={className}
        onReset={() => {
          setResult(null);
          setTarget("");
          setComments("");
          setAgree(false);
        }}
      />
    );
  }

  /* ----------------------------- Tampilan: pesanan langsung dikirim (auto) */
  if (result?.kind === "auto" && selected) {
    return (
      <div className={cn("rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.07] p-5 sm:p-7", className)}>
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h2 className="text-[20px] font-extrabold text-fg">Pesanan berhasil dibuat!</h2>
            <p className="mt-1 text-[13.5px] text-muted">
              Sistem sudah meneruskan pesanan Anda ke provider. Proses biasanya mulai dalam 1–5 menit.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <InfoRow label="ID Pesanan" value={result.orderId} highlight />
          <InfoRow label="Layanan" value={selected.name} />
          <InfoRow label="Target" value={target} />
          <InfoRow label="Jumlah" value={`${quantity.toLocaleString("id-ID")} unit`} />
          <InfoRow label="Total" value={formatRupiah(result.total)} />
          <InfoRow label="Estimasi proses" value={selected.instant ? "1–5 menit (instan)" : "10–60 menit"} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={`/cek-order?order=${result.orderId}`} size="md">
            Pantau status pesanan <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            href={siteConfig.whatsappLink(
              `Halo admin, saya baru order melalui website.\n\nID Pesanan: ${result.orderId}\nLayanan: ${selected.name} (#${selected.id})\nTarget: ${target}\nJumlah: ${quantity}\nTotal: ${formatRupiah(total)}\n\nMohon dibantu prosesnya ya. Terima kasih!`,
            )}
            variant="whatsapp"
            size="md"
          >
            <MessageCircle className="h-4 w-4" /> Konfirmasi ke WhatsApp
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setResult(null);
              setTarget("");
              setComments("");
              setAgree(false);
            }}
          >
            Buat pesanan lain
          </Button>
        </div>

        <p className="mt-4 flex items-start gap-2 text-[12px] text-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
          Simpan ID pesanan Anda. Riwayat juga tersimpan otomatis di halaman{" "}
          <Link href="/riwayat" className="font-semibold text-brand-400 hover:underline">
            Riwayat Pesanan
          </Link>{" "}
          pada perangkat ini.
        </p>
      </div>
    );
  }

  /* --------------------------------------------------------------- Form */
  return (
    <form onSubmit={submit} className={cn("rounded-3xl border border-line bg-surface-2/55 p-5 sm:p-7", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[19px] font-extrabold text-fg">Form Pemesanan</h2>
          <p className="mt-0.5 text-[12.5px] text-muted">
            {lockedService ? "Tentukan jumlah & target, total dihitung otomatis." : "Pilih layanan, isi target, total dihitung otomatis."}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-500 dark:text-emerald-300">
          <Zap className="h-3.5 w-3.5" /> Proses otomatis
        </span>
      </div>

      {/* Pemilih layanan */}
      {!lockedService ? (
        <div className="mt-6" ref={boxRef}>
          <StepLabel index={1}>Pilih layanan</StepLabel>

          {selected ? (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-500/30 bg-brand-500/[0.07] p-3.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface-3">
                <PlatformIcon platform={selected.platform} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-fg">{selected.name}</p>
                <p className="truncate text-[11.5px] text-muted">
                  {selected.categoryRaw} · #{selected.id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-extrabold text-fg">{formatRupiah(selected.priceRetail)}</p>
                <p className="text-[11px] text-muted">per 1.000</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setListOpen(true);
                }}
                className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold text-fg-soft transition-colors hover:border-brand-400/50"
              >
                Ganti
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 z-10 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setListOpen(true);
                  setActiveIndex(0);
                }}
                onFocus={() => setListOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter" && listOpen && filtered[activeIndex]) {
                    e.preventDefault();
                    selectService(filtered[activeIndex]);
                  } else if (e.key === "Escape") {
                    setListOpen(false);
                  }
                }}
                placeholder="Cari layanan… contoh: tiktok followers instan"
                className="h-12 w-full rounded-xl border border-line bg-surface-2/70 pr-3 pl-10 text-[13.5px] text-fg outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
              />

              {listOpen ? (
                <div className="absolute z-30 mt-2 max-h-[360px] w-full overflow-y-auto rounded-2xl border border-line bg-bg-soft/97 p-1.5 shadow-2xl backdrop-blur-xl">
                  {loadingList ? (
                    <div className="flex items-center justify-center gap-2 px-3 py-6 text-[13px] text-muted">
                      <Loader2 className="h-4 w-4 animate-spin" /> Mencari layanan…
                    </div>
                  ) : filtered.length === 0 ? (
                    <p className="px-3 py-6 text-center text-[13px] text-muted">
                      Tidak ada layanan cocok. Coba kata kunci lain atau buka{" "}
                      <Link href="/layanan" className="font-semibold text-brand-400">
                        katalog lengkap
                      </Link>
                      .
                    </p>
                  ) : (
                    filtered.map((service, index) => (
                      <button
                        key={service.id}
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => selectService(service)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                          index === activeIndex ? "bg-brand-500/12" : "hover:bg-surface-3",
                        )}
                      >
                        <PlatformIcon platform={service.platform} className="h-4 w-4 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold text-fg">{service.name}</span>
                          <span className="block truncate text-[11px] text-muted">{service.categoryRaw}</span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-[12px] font-bold text-emerald-500 dark:text-emerald-300">
                            {formatRupiah(service.priceRetail)}
                          </span>
                          <span className="block text-[10.5px] text-muted">min {compactNumber(service.min)}</span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          )}

          {selected ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selected.badges.slice(0, 5).map((badge) => (
                <Badge key={badge} tone={badgeTone(badge)} size="sm">
                  {badge}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Target */}
      <div className="mt-6">
        <StepLabel index={lockedService ? 1 : 2}>Target pesanan</StepLabel>
        <Field hint={selected?.targetHint ? `Petunjuk: ${selected.targetHint}` : "Link atau username akun Anda"}>
          <div className="relative">
            <Link2 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={placeholderFor(selected)}
              className="h-12 pl-10"
              required
            />
          </div>
        </Field>
        <p className="mt-2 flex flex-wrap items-start gap-1.5 text-[11.5px] leading-snug text-muted">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
          Kami tidak pernah meminta password akun Anda — cukup link publik. Contoh input lengkap ada di{" "}
          <Link href="/page/contoh-target" className="font-semibold text-brand-400 hover:underline">
            panduan target
          </Link>
          .
        </p>
      </div>

      {/* Jumlah */}
      <div className="mt-6">
        <StepLabel index={lockedService ? 2 : 3}>
          Jumlah
          {selected ? (
            <span className="font-medium normal-case">
              {" "}
              (min {compactNumber(selected.min)} · maks {compactNumber(selected.max)})
            </span>
          ) : null}
        </StepLabel>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => adjustQuantity(-1)}
            disabled={!selected}
            aria-label="Kurangi jumlah"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-line bg-surface-2/70 text-fg-soft transition-colors hover:border-brand-400/50 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <Input
            type="number"
            inputMode="numeric"
            value={quantity}
            min={selected?.min ?? 1}
            max={selected?.max}
            onChange={(e) => setQuantity(Number(e.target.value.replace(/\D/g, "")) || 0)}
            disabled={!selected}
            className="h-12 text-center text-[16px] font-extrabold"
          />
          <button
            type="button"
            onClick={() => adjustQuantity(1)}
            disabled={!selected}
            aria-label="Tambah jumlah"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-line bg-surface-2/70 text-fg-soft transition-colors hover:border-brand-400/50 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {selected ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {QUICK_QUANTITIES.filter((q) => q >= selected.min && q <= selected.max)
              .slice(0, 6)
              .map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuantity(q)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-[11.5px] font-bold transition-colors",
                    quantity === q
                      ? "border-brand-400/60 bg-brand-500/12 text-brand-500 dark:text-brand-300"
                      : "border-line text-muted hover:border-brand-400/40 hover:text-fg",
                  )}
                >
                  {compactNumber(q)}
                </button>
              ))}
            <button
              type="button"
              onClick={() => setQuantity(selected.max)}
              className="rounded-lg border border-line px-2.5 py-1.5 text-[11.5px] font-bold text-muted transition-colors hover:border-brand-400/40 hover:text-fg"
            >
              Maks ({compactNumber(selected.max)})
            </button>
          </div>
        ) : null}

        {selected && !isValidQuantity ? (
          <p className="mt-2 text-[12px] font-medium text-amber-500 dark:text-amber-300">
            Jumlah harus antara {compactNumber(selected.min)} dan {compactNumber(selected.max)}.
          </p>
        ) : null}

        {selected?.type?.includes("comment") ? (
          <div className="mt-4">
            <Field label="Daftar komentar (opsional)" hint="Satu komentar per baris">
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={"Keren banget!\nMantap, lanjutkan!\nSuka dengan kontennya"}
              />
            </Field>
          </div>
        ) : null}
      </div>

      {/* Ringkasan biaya */}
      <div className="mt-6 rounded-2xl border border-line bg-surface-3/45 p-4">
        <div className="space-y-2 text-[13px]">
          <Row label="Harga per 1.000" value={selected ? formatRupiah(selected.priceRetail) : "—"} />
          <Row label="Jumlah" value={selected ? `${quantity.toLocaleString("id-ID")} unit` : "—"} />
          <Row label="Harga per unit" value={selected ? formatRupiah(selected.priceRetail / 1000) : "—"} />
          <div className="border-t border-line pt-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] font-bold text-fg">Total bayar</span>
              <span className="text-[20px] font-extrabold text-emerald-500 dark:text-emerald-300">
                {formatRupiah(total)}
              </span>
            </div>
          </div>
        </div>

        {selected ? (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
            <Badge tone={selected.instant ? "info" : "neutral"} size="sm">
              {selected.instant ? "⚡ Mulai instan" : "🕐 Antrean provider"}
            </Badge>
            <Badge tone={selected.refill ? "success" : "neutral"} size="sm">
              {selected.refill ? "🔁 Garansi refill" : "📄 Tanpa garansi"}
            </Badge>
            {selected.speed ? (
              <Badge tone="brand" size="sm">
                🚀 {selected.speed}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Persetujuan + submit */}
      <label className="mt-5 flex items-start gap-2.5 text-[12.5px] leading-snug text-muted">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-brand-500"
        />
        <span>
          Saya sudah membaca{" "}
          <Link href="/syarat" className="font-semibold text-brand-400 hover:underline">
            syarat &amp; ketentuan
          </Link>{" "}
          dan memahami bahwa layanan tanpa garansi tidak menerima komplain penurunan jumlah.
        </span>
      </label>

      <Button type="submit" size="lg" disabled={!canSubmit} className="mt-4 w-full">
        {submitting ? (
          <>
            <Loader2 className="h-4.5 w-4.5 animate-spin" /> Memproses pesanan…
          </>
        ) : (
          <>
            <Sparkles className="h-4.5 w-4.5" /> Buat Pesanan Sekarang
          </>
        )}
      </Button>

      {!canSubmit && !submitting ? (
        <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[11.5px] text-muted">
          <Info className="h-3.5 w-3.5" />
          {!selected
            ? "Pilih layanan terlebih dahulu"
            : !isValidTarget
              ? "Masukkan link / username tujuan"
              : !isValidQuantity
                ? "Periksa jumlah pesanan"
                : !agree
                  ? "Centang persetujuan syarat & ketentuan"
                  : ""}
        </p>
      ) : null}

      {result?.kind === "error" ? (
        <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/[0.08] p-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <div>
              <p className="text-[13px] font-bold text-fg">Pesanan belum bisa diproses otomatis</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{result.message}</p>
              <Button
                href={siteConfig.whatsappLink(
                  `Halo admin, saya mau pesan:\nLayanan: ${selected?.name ?? "-"} (#${selected?.id ?? "-"})\nTarget: ${target}\nJumlah: ${quantity}\nTotal: ${formatRupiah(total)}\n\nMohon dibantu prosesnya.`,
                )}
                variant="whatsapp"
                size="sm"
                className="mt-3"
              >
                <MessageCircle className="h-4 w-4" /> Lanjutkan via WhatsApp
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}

function StepLabel({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-2 text-[12px] font-bold tracking-wide text-muted uppercase">
      <span className="grid h-5 w-5 place-items-center rounded-full gradient-brand text-[10.5px] font-extrabold text-white">
        {index}
      </span>
      {children}
    </p>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-fg">{value}</span>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3.5 py-2.5",
        highlight ? "border-emerald-500/30 bg-emerald-500/10" : "border-line bg-surface-2/60",
      )}
    >
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{label}</p>
      <p className={cn("mt-0.5 truncate text-[13.5px] font-bold", highlight ? "text-emerald-500 dark:text-emerald-300" : "text-fg")}>
        {value}
      </p>
    </div>
  );
}

function placeholderFor(service: Service | null): string {
  if (!service) return "https://tiktok.com/@username atau username";
  const map: Record<string, string> = {
    instagram: "https://instagram.com/username",
    tiktok: "https://tiktok.com/@username",
    youtube: "https://youtu.be/VIDEO_ID",
    facebook: "https://facebook.com/nama.page",
    twitter: "https://x.com/username",
    telegram: "https://t.me/nama_channel",
    whatsapp: "https://whatsapp.com/channel/xxxx",
    shopee: "https://shopee.co.id/produk.anda",
    tokopedia: "https://tokopedia.com/toko",
    spotify: "https://open.spotify.com/track/xxxx",
    threads: "https://threads.net/@username",
    google: "https://maps.app.goo.gl/xxxx",
    website: "https://website-anda.com",
  };
  return map[service.platform] ?? "https://link-target-anda.com";
}

export interface HistoryItem {
  id: string;
  serviceId: number;
  serviceName: string;
  platform: string;
  target: string;
  quantity: number;
  total: number;
  createdAt: string;
  status?: string;
}

export const HISTORY_KEY = "synix-orders";

export function saveToHistory(item: HistoryItem) {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const list: HistoryItem[] = raw ? (JSON.parse(raw) as HistoryItem[]) : [];
    const next = [item, ...list.filter((entry) => entry.id !== item.id)].slice(0, 60);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* localStorage bisa diblokir — abaikan */
  }
}

export function readHistory(): HistoryItem[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

/* ==========================================================================
 *  Tipe hasil form & panel pembayaran
 * ========================================================================== */

export interface PaymentInfo {
  qrisName?: string;
  bank?: { name: string; account: string; holder: string };
  ewallet?: { label: string; number: string; holder: string };
  /** Info payment gateway (QRIS/VA/e-wallet otomatis) bila PAYMENT_PROVIDER aktif. */
  gateway?: {
    provider: string;
    channel: string;
    payUrl?: string | null;
    qrString?: string | null;
    payCode?: string | null;
    fee?: number;
    baseAmount?: number;
    simulated?: boolean;
    instructions?: string[];
  };
}

type FormResult =
  | { kind: "auto"; orderId: string; total: number }
  | {
      kind: "manual";
      reference: string;
      total: number;
      expiresAt?: string;
      payment?: PaymentInfo;
      catalogSource?: string;
      /** Terisi bila gateway aktif tetapi gagal membuat transaksi → instruksi manual. */
      gatewayError?: string;
    }
  | { kind: "error"; message: string; code?: string };

/**
 * Panel instruksi pembayaran.
 * Ditampilkan setelah customer mengirim pesanan pada mode aman
 * (ORDER_AUTO_SUBMIT=0) — pesanan baru dikirim ke provider setelah
 * pembayaran dikonfirmasi admin.
 */
function PaymentPanel({
  result,
  service,
  target,
  quantity,
  className,
  onReset,
}: {
  result: Extract<FormResult, { kind: "manual" }>;
  service: Service;
  target: string;
  quantity: number;
  className?: string;
  onReset: () => void;
}) {
  const bank = result.payment?.bank;
  const ewallet = result.payment?.ewallet;
  const gateway = result.payment?.gateway;
  const [paid, setPaid] = useState(false);

  /* Pantau status pembayaran otomatis (gateway) tiap 5 detik. */
  useEffect(() => {
    if (!gateway) return;
    let active = true;

    async function check() {
      try {
        const res = await fetch(`/api/status?order=${encodeURIComponent(result.reference)}`, { cache: "no-store" });
        const data = (await res.json()) as {
          data?: Array<{ statusLabel?: string | null; paid?: boolean; error?: string }>;
        };
        const row = data.data?.[0];
        if (!active || !row || row.error) return;
        const isPending = row.statusLabel === "Menunggu Pembayaran";
        if (row.paid || !isPending) setPaid(true);
      } catch {
        /* jaringan sedang putus — coba lagi pada interval berikutnya */
      }
    }

    void check();
    const timer = setInterval(check, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [gateway, result.reference]);

  const waMessage = [
    `Halo admin, saya sudah melakukan pembayaran.`,
    ``,
    `Kode Referensi : ${result.reference}`,
    `Layanan        : ${service.name} (#${service.id})`,
    `Target         : ${target}`,
    `Jumlah         : ${quantity.toLocaleString("id-ID")} unit`,
    `Total Bayar    : ${formatRupiah(result.total)}`,
    ``,
    `Mohon segera diproses ya. Bukti transfer saya lampirkan di chat ini.`,
  ].join("\n");

  return (
    <div className={cn("rounded-3xl border border-amber-500/35 bg-amber-500/[0.06] p-5 sm:p-7", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-500/15 text-[20px] text-amber-500 dark:text-amber-300">
            ⏳
          </span>
          <div>
            <h2 className="text-[20px] font-extrabold text-fg">Selesaikan pembayaran</h2>
            <p className="mt-1 max-w-md text-[13.5px] leading-relaxed text-muted">
              {gateway && !paid
                ? "Bayar sekali klik lewat halaman pembayaran aman di bawah. Sistem memproses pesanan otomatis begitu pembayaran terverifikasi — kamu tidak perlu kirim bukti transfer."
                : "Pesanan Anda sudah tercatat. Setelah pembayaran dikonfirmasi, pesanan otomatis dikirim ke provider dan bisa dipantau lewat kode referensi di bawah."}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface-2/70 px-4 py-3">
          <p className="text-[10.5px] font-bold tracking-wide text-muted uppercase">Kode Referensi</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-[17px] font-extrabold text-amber-600 dark:text-amber-300">
              {result.reference}
            </span>
            <CopyButton value={result.reference} label="Salin" />
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="mt-6 grid gap-3 sm:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-line bg-surface-3/50 p-4">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Total yang harus dibayar</p>
          <p className="mt-1 text-[28px] leading-none font-extrabold text-fg">{formatRupiah(result.total)}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <CopyButton value={String(result.total)} label="Salin nominal" />
            {result.expiresAt ? (
              <span className="text-[11.5px] text-muted">
                Berlaku sampai {new Date(result.expiresAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </span>
            ) : null}
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-line bg-surface-3/50 p-4 text-[12.5px]">
          <DetailRow label="Layanan" value={service.name} />
          <DetailRow label="Target" value={target} />
          <DetailRow label="Jumlah" value={`${quantity.toLocaleString("id-ID")} unit`} />
          <DetailRow label="Harga / 1.000" value={formatRupiah(service.priceRetail)} />
        </div>
      </div>

      {/* Pembayaran otomatis (payment gateway) */}
      {gateway && paid ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/35 bg-emerald-500/[0.09] p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500 dark:text-emerald-300" />
          <div className="text-[12.5px] leading-relaxed">
            <p className="font-bold text-fg">Pembayaran diterima — pesanan sedang diproses 🎉</p>
            <p className="mt-1 text-muted">
              Kami sudah menerima pembayaran Anda. Pesanan langsung diteruskan ke provider dan statusnya
              bisa dipantau memakai kode referensi di atas.
            </p>
          </div>
        </div>
      ) : gateway ? (
        <div className="mt-6 rounded-2xl border-2 border-brand-500/40 bg-brand-500/[0.07] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-extrabold text-fg">
                Pembayaran otomatis · {gateway.channel}
              </p>
              <p className="mt-1 text-[12px] text-muted">
                Diproses oleh <span className="font-semibold text-fg-soft">{gateway.provider}</span>
                {gateway.fee ? (
                  <>
                    {" "}· biaya layanan {formatRupiah(gateway.fee)} sudah termasuk di total
                  </>
                ) : null}
                .
              </p>
            </div>
            {gateway.payUrl ? (
              <Button href={gateway.payUrl} variant="primary" size="md">
                <CreditCard className="h-4 w-4" /> Bayar sekarang
              </Button>
            ) : null}
          </div>

          {gateway.qrString ? (
            <div className="mt-3 rounded-xl border border-line bg-surface-2/70 p-3">
              <p className="text-[11px] font-bold tracking-wide text-muted uppercase">QRIS (tempel di aplikasi bank/e-wallet)</p>
              <p className="mt-1 break-all font-mono text-[11px] text-fg-soft">{gateway.qrString}</p>
              <div className="mt-2">
                <CopyButton value={gateway.qrString} label="Salin kode QRIS" />
              </div>
            </div>
          ) : null}

          {gateway.payCode ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface-2/70 p-3">
              <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Kode bayar</span>
              <span className="font-mono text-[14px] font-extrabold text-fg">{gateway.payCode}</span>
              <CopyButton value={gateway.payCode} label="Salin" />
            </div>
          ) : null}

          {gateway.instructions?.length ? (
            <ol className="mt-3 space-y-1.5">
              {gateway.instructions.slice(0, 4).map((step, index) => (
                <li key={step} className="flex gap-2 text-[12px] leading-snug text-muted">
                  <span className="font-bold text-brand-400">{index + 1}.</span> {step}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-[12px] text-muted">
              Selesaikan pembayaran di halaman tersebut. Halaman ini otomatis diperbarui dalam beberapa
              detik setelah pembayaran masuk.
            </p>
          )}

          <p className="mt-3 flex items-center gap-2 text-[11.5px] text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-400" />
            Menunggu pembayaran… status diperbarui otomatis setiap 5 detik.
          </p>

          {gateway.simulated ? (
            <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.09] p-2.5 text-[11.5px] leading-relaxed text-muted">
              <span className="font-bold text-fg">Mode simulasi:</span> PAYMENT_PROVIDER masih <code className="font-mono">mock</code> —
              tidak ada uang yang benar-benar berpindah. Ganti ke provider asli sebelum website dipakai publik.
            </p>
          ) : null}
        </div>
      ) : null}

      {result.gatewayError ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-500/35 bg-amber-500/[0.09] p-3.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-300" />
          <p className="text-[12.5px] leading-relaxed text-muted">
            <span className="font-bold text-fg">Pembayaran otomatis sedang tidak tersedia.</span> Silakan
            bayar lewat kanal manual di bawah, lalu kirim bukti ke admin seperti biasa. Alasan teknis:{" "}
            <span className="font-mono text-[11.5px]">{result.gatewayError}</span>
          </p>
        </div>
      ) : null}

      {/* Kanal pembayaran */}
      <div className="mt-5">
        <p className="text-[12px] font-bold tracking-wide text-muted uppercase">
          {gateway ? "Atau bayar manual ke kanal berikut" : "Pilih kanal pembayaran"}
        </p>
        <div className="mt-2.5 grid gap-3 sm:grid-cols-3">
          <PayCard
            title="QRIS (semua e-wallet & m-banking)"
            lines={[`Merchant: ${result.payment?.qrisName ?? "Admin"}`]}
            copyValue={null}
            note="Scan QRIS yang dikirim admin via WhatsApp"
          />
          {bank ? (
            <PayCard
              title={`Transfer Bank ${bank.name}`}
              lines={[`No. Rek: ${bank.account}`, `a/n ${bank.holder}`]}
              copyValue={bank.account}
            />
          ) : null}
          {ewallet ? (
            <PayCard
              title={ewallet.label}
              lines={[`No: ${ewallet.number}`, `a/n ${ewallet.holder}`]}
              copyValue={ewallet.number}
            />
          ) : null}
        </div>
      </div>

      {result.catalogSource && result.catalogSource !== "panel" ? (
        <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/[0.08] p-3.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <p className="text-[12.5px] leading-relaxed text-muted">
            <span className="font-bold text-fg">Mode pratinjau:</span> server ini belum terhubung ke panel, sehingga
            harga di atas berasal dari data cadangan. Konfirmasi dulu harga final ke admin sebelum melakukan
            pembayaran.
          </p>
        </div>
      ) : null}

      {/* Langkah selanjutnya */}
      <div className="mt-5 rounded-2xl border border-line bg-surface-2/60 p-4">
        <p className="text-[12.5px] font-bold text-fg">Setelah membayar</p>
        <ol className="mt-2.5 space-y-2">
          {[
            `Kirim bukti transfer ke admin dengan menyebutkan kode referensi ${result.reference}.`,
            "Admin memverifikasi pembayaran (rata-rata < 5 menit pada jam sibuk).",
            "Pesanan otomatis diteruskan ke provider dan status dapat Anda pantau kapan saja.",
          ].map((step, index) => (
            <li key={step} className="flex gap-2.5 text-[12.5px] leading-snug text-muted">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full gradient-brand text-[10.5px] font-extrabold text-white">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {gateway ? null : (
          <Button href={siteConfig.whatsappLink(waMessage)} variant="whatsapp" size="md">
            <MessageCircle className="h-4 w-4" /> Kirim bukti & konfirmasi
          </Button>
        )}
        <Button href={`/cek-order?order=${result.reference}`} size="md">
          Pantau pesanan <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="md" onClick={onReset}>
          Buat pesanan lain
        </Button>
      </div>

      <p className="mt-4 flex items-start gap-2 text-[12px] text-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
        Pesanan tidak akan diproses sebelum pembayaran terkonfirmasi. Riwayat pesanan juga tersimpan di halaman{" "}
        <Link href="/riwayat" className="font-semibold text-brand-400 hover:underline">
          Riwayat Pesanan
        </Link>{" "}
        pada perangkat ini.
      </p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="truncate text-right font-semibold text-fg" title={value}>
        {value}
      </span>
    </div>
  );
}

function PayCard({
  title,
  lines,
  copyValue,
  note,
}: {
  title: string;
  lines: string[];
  copyValue: string | null;
  note?: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-surface-2/60 p-3.5">
      <p className="text-[12.5px] font-bold text-fg">{title}</p>
      <div className="mt-1.5 space-y-0.5">
        {lines.map((line) => (
          <p key={line} className="font-mono text-[12px] text-fg-soft">
            {line}
          </p>
        ))}
      </div>
      {note ? <p className="mt-1.5 text-[11px] leading-snug text-muted">{note}</p> : null}
      {copyValue ? (
        <div className="mt-2.5">
          <CopyButton value={copyValue} label="Salin nomor" />
        </div>
      ) : null}
    </div>
  );
}
