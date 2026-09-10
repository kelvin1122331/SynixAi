import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, History, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { OrderStatusChecker } from "@/components/services/order-status-checker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { orderStatusMeaning } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Cek Status Pesanan SMM",
  description:
    "Pantau status pesanan SMM Anda secara real-time: status pengerjaan, start count, dan sisa jumlah. Masukkan ID pesanan yang Anda terima saat melakukan pemesanan.",
  alternates: { canonical: "/cek-order" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const toneMap: Record<string, "pending" | "info" | "success" | "danger"> = {
  pending: "pending",
  progress: "info",
  success: "success",
  error: "danger",
};

export default async function CekOrderPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const initialOrder = Array.isArray(sp.order) ? sp.order[0] : sp.order;

  return (
    <>
      <PageHero
        eyebrow="Cek order"
        breadcrumbs={[{ label: "Cek Status Order" }]}
        title={
          <>
            Pantau <span className="gradient-text">status pesanan</span> Anda
          </>
        }
        description="Masukkan ID pesanan (contoh: 12345) untuk melihat status pengerjaan, jumlah awal sebelum pesanan masuk, dan sisa jumlah yang sedang diproses. Bisa cek beberapa ID sekaligus dengan memisahkan koma."
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="success">Status real-time dari provider</Badge>
          <Badge tone="info">Bisa cek hingga 20 ID sekaligus</Badge>
          <Badge tone="brand">
            <History className="h-3.5 w-3.5" />
            <Link href="/riwayat" className="hover:underline">
              Lihat riwayat pesanan saya
            </Link>
          </Badge>
        </div>
      </PageHero>

      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <OrderStatusChecker initialOrder={initialOrder} />

            <div className="mt-6 rounded-3xl border border-line bg-surface-2/45 p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-fg">
                <HelpCircle className="h-4.5 w-4.5 text-brand-400" /> Arti status pesanan
              </h2>
              <div className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line">
                {orderStatusMeaning.map((item) => (
                  <div key={item.status} className="flex flex-col gap-1.5 bg-surface-2/40 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                    <span className="w-fit shrink-0">
                      <Badge tone={toneMap[item.tone] ?? "neutral"}>{item.status}</Badge>
                    </span>
                    <span className="text-[12.8px] leading-snug text-muted">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-line bg-surface-2/55 p-5">
              <h2 className="text-[15px] font-extrabold text-fg">Tidak menemukan ID pesanan?</h2>
              <ul className="mt-3 space-y-2.5 text-[12.8px] leading-snug text-muted">
                <li>ID pesanan dikirim otomatis tepat setelah Anda menyelesaikan pemesanan.</li>
                <li>Jika membeli lewat WhatsApp, admin akan mengirimkan ID beserta detailnya.</li>
                <li>
                  Riwayat pesanan juga tersimpan di perangkat Anda pada halaman{" "}
                  <Link href="/riwayat" className="font-semibold text-brand-400 hover:underline">
                    Riwayat Pesanan
                  </Link>
                  .
                </li>
              </ul>
              <Button
                href={siteConfig.whatsappLink("Halo admin, saya ingin menanyakan status pesanan saya. ID pesanan: ")}
                variant="whatsapp"
                size="md"
                className="mt-4 w-full"
              >
                <MessageCircle className="h-4 w-4" /> Tanya status via WhatsApp
              </Button>
            </div>

            <div className="rounded-3xl border border-line bg-surface-2/55 p-5">
              <h2 className="text-[15px] font-extrabold text-fg">Pesanan bermasalah?</h2>
              <p className="mt-2 text-[12.8px] leading-relaxed text-muted">
                Jika status <span className="font-semibold text-fg">Canceled</span> atau jumlah tidak sesuai,
                kirimkan ID pesanan + screenshot ke admin. Untuk layanan bergaransi, tim kami akan mengajukan
                refill gratis ke provider.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button href="/refund" variant="secondary" size="sm">
                  Kebijakan refund
                </Button>
                <Button href="/kontak" variant="secondary" size="sm">
                  Hubungi admin
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
