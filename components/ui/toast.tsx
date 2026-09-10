"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (input: { title: string; description?: string; tone?: ToastTone }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, { ring: string; icon: string; bg: string; symbol: string }> = {
  success: { ring: "border-emerald-400/40", icon: "text-emerald-400", bg: "bg-emerald-500/10", symbol: "✓" },
  error: { ring: "border-rose-400/40", icon: "text-rose-400", bg: "bg-rose-500/10", symbol: "!" },
  info: { ring: "border-cyan-400/40", icon: "text-cyan-400", bg: "bg-cyan-500/10", symbol: "i" },
  warning: { ring: "border-amber-400/40", icon: "text-amber-400", bg: "bg-amber-500/10", symbol: "!" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback<ToastContextValue["toast"]>(({ title, description, tone = "info" }) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, title, description, tone }].slice(-4));
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 6000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-3 bottom-24 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:items-end"
      >
        {items.map((item) => {
          const tone = toneStyles[item.tone];
          return (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-3.5 shadow-2xl backdrop-blur-xl glass",
                tone.ring,
              )}
            >
              <span className={cn("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[13px] font-bold", tone.bg, tone.icon)}>
                {tone.symbol}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-fg">{item.title}</p>
                {item.description ? <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{item.description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((t) => t.id !== item.id))}
                className="text-muted transition-colors hover:text-fg"
                aria-label="Tutup notifikasi"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  return ctx ?? { toast: () => undefined };
}
