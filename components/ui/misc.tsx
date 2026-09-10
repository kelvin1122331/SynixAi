"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Copy, Inbox, Star } from "lucide-react";
import { cn } from "@/lib/cn";

/* ---------------------------------------------------------------- Skeleton */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-surface-3", className)} />;
}

/* ------------------------------------------------------------ Empty state */
export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-line-strong bg-surface-2/40 px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/12 text-brand-500">
        {icon ?? <Inbox className="h-6 w-6" />}
      </span>
      <div>
        <p className="text-base font-semibold text-fg">{title}</p>
        {description ? <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* --------------------------------------------------------- Animated counter */
export function Counter({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 1800,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(value * eased);
          if (progress < 1) requestAnimationFrame(tick);
          else setDisplay(value);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------- Copy button */
export function CopyButton({
  value,
  label = "Salin",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2/70 px-2.5 py-1.5 text-[12px] font-semibold text-fg-soft transition-colors hover:border-brand-400/50 hover:text-fg",
        className,
      )}
      aria-label={copied ? "Tersalin" : label}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Tersalin" : label}
    </button>
  );
}

/* --------------------------------------------------------------- Accordion */
export function Accordion({
  items,
  className,
  defaultOpen = -1,
}: {
  items: Array<{ q: string; a: React.ReactNode }>;
  className?: string;
  defaultOpen?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface-2/40", className)}>
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-3/60 sm:px-6"
            >
              <span className={cn("text-[14.5px] font-semibold transition-colors", isOpen ? "text-brand-500 dark:text-brand-300" : "text-fg")}>
                {item.q}
              </span>
              <ChevronDown className={cn("h-5 w-5 shrink-0 text-muted transition-transform duration-300", isOpen && "rotate-180 text-brand-400")} />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 text-[13.5px] leading-relaxed text-muted sm:px-6">{item.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------- Stars */
export function Stars({ value = 5, className }: { value?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`Rating ${value} dari 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("h-3.5 w-3.5", i < Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted/40")}
        />
      ))}
    </span>
  );
}

/* ---------------------------------------------------------------- Marquee */
export function Marquee({
  children,
  reverse = false,
  className,
  speed = 45,
}: {
  children: React.ReactNode;
  reverse?: boolean;
  className?: string;
  speed?: number;
}) {
  return (
    <div className={cn("group relative flex overflow-hidden mask-fade-x", className)}>
      <div
        className={cn("flex w-max shrink-0 items-center gap-3 pr-3", reverse ? "animate-marquee-reverse" : "animate-marquee", "group-hover:[animation-play-state:paused]")}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
