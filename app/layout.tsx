import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { ToastProvider } from "@/components/ui/toast";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "smm panel", "panel smm indonesia", "jual followers", "beli followers instagram",
    "tambah followers tiktok", "jual likes", "jual views", "suntik followers",
    "panel sosial media murah", "smm nusantara",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#06091a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/** Script kecil untuk menerapkan tema sebelum paint (mencegah flash). */
const themeScript = `(function(){try{var t=localStorage.getItem('synix-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='light'){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <ToastProvider>
          <div className="relative flex min-h-dvh flex-col">
            {/* Latar dekoratif global */}
            <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-40 -left-32 h-[32rem] w-[32rem] rounded-full bg-brand-600/20 blur-[120px] dark:bg-brand-600/25" />
              <div className="absolute top-1/3 -right-40 h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/15 blur-[130px]" />
              <div className="absolute bottom-0 left-1/4 h-[26rem] w-[26rem] rounded-full bg-cyan-400/10 blur-[120px]" />
              <div className="absolute inset-0 grid-pattern opacity-[0.18] dark:opacity-[0.12]" />
            </div>

            <Suspense fallback={<div className="h-16" />}>
              <Navbar />
            </Suspense>

            <main className="flex-1 pb-20 md:pb-0">{children}</main>

            <Footer />
            <WhatsAppFab />
            <MobileBottomNav />
          </div>
        </ToastProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: siteConfig.name,
              url: siteConfig.url,
              description: siteConfig.description,
              contactPoint: {
                "@type": "ContactPoint",
                telephone: `+${siteConfig.whatsapp}`,
                contactType: "customer service",
                areaServed: "ID",
                availableLanguage: ["id"],
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
