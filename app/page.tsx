import type { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { PopularServices } from "@/components/landing/popular-services";
import { PriceTable } from "@/components/landing/price-table";
import {
  CTASection, Features, PaymentMethods, PlatformStrip, Steps, Testimonials,
} from "@/components/landing/sections";
import { FaqSection } from "@/components/landing/faq-section";
import { CatalogNotice } from "@/components/services/catalog-notice";
import { getCatalog, getCatalogStats, getCheapestByCategory, getTopByPlatform } from "@/lib/catalog";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const catalog = await getCatalog();
  const stats = getCatalogStats(catalog.services);
  const groups = getTopByPlatform(catalog.services, 4, 6);
  const cheapest = getCheapestByCategory(catalog.services, 8);

  return (
    <>
      <Hero
        totalServices={stats.totalServices}
        totalPlatforms={stats.totalPlatforms}
        priceFrom={stats.priceFrom}
        demoMode={catalog.source === "demo"}
      />
      <CatalogNotice catalog={catalog} />
      <PlatformStrip />
      <PopularServices groups={groups} />
      <Features />
      <PriceTable services={cheapest} />
      <Steps />
      <Testimonials />
      <FaqSection limit={6} />
      <PaymentMethods />
      <CTASection />
    </>
  );
}
