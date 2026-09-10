import type { NextConfig } from "next";

/**
 * Konfigurasi Next.js untuk SynixAI — Website SMM Panel.
 *
 * Catatan penting untuk hosting/preview:
 * - `allowedDevOrigins` wajib memuat domain preview (mis. *.e2b.app) supaya
 *   dev-server tidak memblokir request lintas-origin dari browser user.
 * - Semua request ke API panel SMM Nusantara dilakukan dari sisi server
 *   (route handler), jadi API key TIDAK pernah bocor ke browser.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  allowedDevOrigins: [
    "*.e2b.app",
    "*.e2b.dev",
    "*.vercel.app",
    "localhost",
    "127.0.0.1",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "smmnusantara.id" },
      { protocol: "https", hostname: "smmnusantara.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
