import type { Metadata } from "next";
import { History, MessageCircle, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { OrderHistory } from "@/components/services/order-history";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Riwayat Pesanan Saya",
  description:
    "Daftar pesanan SMM yang pernah Anda buat dari perangkat ini, lengkap dengan status, target, jumlah, dan total biaya. Bisa diekspor ke CSV.",
  alternates: { canonical: "/riwayat" },
};

export default function RiwayatPage() {
  return (
    <>
      <PageHero
        eyebrow="Riwayat"
        breadcrumbs={[{ label: "Riwayat Pesanan" }]}
        title={
          <>
            Riwayat <span className="gradient-text">pesanan Anda</span>
          </>
        }
        description="Semua pesanan yang dibuat melalui website ini tersimpan otomatis di perangkat Anda (localStorage) — bukan di server kami. Anda bisa memperbarui status, mengekspor ke CSV, atau menghapusnya kapan saja."
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="success">
            <ShieldCheck className="h-3.5 w-3.5" /> Data tersimpan di perangkat Anda
          </Badge>
          <Badge tone="info">
            <History className="h-3.5 w-3.5" /> Maksimal 60 pesanan terakhir
          </Badge>
        </div>
      </PageHero>

      <div className="container-page">
        <OrderHistory />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-surface-2/50 p-5 sm:p-6">
          <div>
            <h2 className="text-[16px] font-extrabold text-fg">Ingin arsip lengkap semua pesanan?</h2>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted">
              Untuk reseller dengan volume tinggi, kami menyediakan laporan pesanan lengkap lewat WhatsApp
              admin — cukup sebutkan periode yang diinginkan (harian, mingguan, atau bulanan).
            </p>
          </div>
          <Button
            href={siteConfig.whatsappLink("Halo admin, saya ingin meminta rekap laporan pesanan saya.")}
            variant="whatsapp"
            size="md"
          >
            <MessageCircle className="h-4 w-4" /> Minta laporan pesanan
          </Button>
        </div>
      </div>
    </>
  );
}
