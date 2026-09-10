import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { siteConfig } from "@/lib/site-config";

const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/layanan", priority: 0.95 },
  { path: "/order", priority: 0.9 },
  { path: "/cek-order", priority: 0.7 },
  { path: "/api-docs", priority: 0.7 },
  { path: "/faq", priority: 0.6 },
  { path: "/kontak", priority: 0.6 },
  { path: "/page/contoh-target", priority: 0.6 },
  { path: "/riwayat", priority: 0.4 },
  { path: "/status", priority: 0.4 },
  { path: "/syarat", priority: 0.3 },
  { path: "/privasi", priority: 0.3 },
  { path: "/refund", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCatalog();
  const now = new Date();

  // Halaman layanan dibatasi agar sitemap tetap ringkas & relevan:
  // ambil layanan paling populer (skor tertinggi) hingga 500 URL.
  const topServices = [...catalog.services]
    .sort((a, b) => b.score - a.score)
    .slice(0, 500)
    .map((service) => ({
      url: `${siteConfig.url}/layanan/${service.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteConfig.url}${route.path}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: route.priority,
    })),
    ...topServices,
  ];
}
