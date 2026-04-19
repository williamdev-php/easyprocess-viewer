import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from any HTTPS domain (generated sites have images from various sources).
  // HTTP is only permitted in development for local testing.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      ...(process.env.NODE_ENV !== "production"
        ? [{ protocol: "http" as const, hostname: "localhost" }]
        : []),
    ],
  },
  // In production, allow any hostname (subdomains + custom domains)
  // The middleware handles subdomain → siteId resolution
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        // Favicon and public assets — cache for 1 day
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
      {
        // Allow embedding in iframes from the main app (dashboard editor)
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://qvicko.se https://*.qvicko.se https://qvicko.com https://*.qvicko.com " + (process.env.FRONTEND_URL || "http://localhost:3000"),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
