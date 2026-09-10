"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/misc";
import { cn } from "@/lib/cn";

export interface CodeSample {
  language: string;
  code: string;
}

/** Tab contoh kode API dengan tombol salin. */
export function CodeTabs({ samples, className }: { samples: CodeSample[]; className?: string }) {
  const [active, setActive] = useState(0);
  const current = samples[active];

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-line bg-[#080c18]/95", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 px-2.5 py-2">
        {samples.map((sample, index) => (
          <button
            key={sample.language}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors",
              index === active ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200",
            )}
          >
            {sample.language}
          </button>
        ))}
        <span className="ml-auto">
          <CopyButton value={current.code} label="Salin kode" />
        </span>
      </div>
      <pre className="max-h-[420px] overflow-auto p-4 font-mono text-[11.5px] leading-relaxed text-slate-200">
        <code>{current.code}</code>
      </pre>
    </div>
  );
}
