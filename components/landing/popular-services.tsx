"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { ServiceCard } from "@/components/services/service-card";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { SectionHeading } from "./sections";
import { cn } from "@/lib/cn";
import type { Service } from "@/lib/types";

interface Group {
  platform: string;
  label: string;
  items: Service[];
}

export function PopularServices({ groups }: { groups: Group[] }) {
  const [active, setActive] = useState(groups[0]?.platform ?? "");
  const current = groups.find((g) => g.platform === active) ?? groups[0];

  if (!groups.length) return null;

  return (
    <section id="layanan-populer" className="scroll-mt-24 py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Layanan terpopuler"
          align="left"
          title={<>Paling sering dipesan <span className="gradient-text">minggu ini</span></>}
          description="Dipilih otomatis berdasarkan rating layanan, kecepatan proses, garansi, dan kualitas. Semua harga adalah harga per 1.000 unit."
          action={
            <Link
              href="/layanan"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-brand-400/40 px-4 py-2.5 text-[13px] font-bold text-brand-500 transition-colors hover:bg-brand-500/10 dark:text-brand-300"
            >
              Lihat semua layanan <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        {/* Tab platform */}
        <div className="mt-8 -mx-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:px-0">
          <div className="flex min-w-max items-center gap-2">
            {groups.map((group) => {
              const isActive = group.platform === active;
              return (
                <button
                  key={group.platform}
                  type="button"
                  onClick={() => setActive(group.platform)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[13px] font-bold transition-all duration-200",
                    isActive
                      ? "border-transparent gradient-brand text-white shadow-lg shadow-brand-600/25"
                      : "border-line bg-surface-2/60 text-fg-soft hover:border-brand-400/40 hover:text-fg",
                  )}
                >
                  <PlatformIcon platform={group.platform} colored={!isActive} className="h-4 w-4" />
                  {group.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {current?.items.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[12.5px] text-muted">
          <Flame className="h-4 w-4 text-amber-400" />
          Menampilkan {current?.items.length ?? 0} layanan terbaik dari kategori {current?.label}
        </div>
      </div>
    </section>
  );
}
