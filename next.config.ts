import type { NextConfig } from "next";

const editorOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_EDITOR_ORIGIN || process.env.FRONTEND_URL || "http://localhost:3000";
  // Ensure the origin always has a protocol (FRONTEND_URL may be bare domain)
  if (raw && !raw.startsWith("http")) return `https://${raw}`;
  return raw;
})();

const nextConfig: NextConfig = {
  // Allow images from any HTTPS domain (generated sites have images from various sources).
  // HTTP is only permitted in development for local testing.
  images: {
    qualities: [75, 80],
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
    const frameAncestors = `frame-ancestors 'self' https://qvicko.se https://*.qvicko.se https://qvicko.com https://*.qvicko.com http://localhost:* ${editorOrigin}`;
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
        // Preview pages (loaded in editor iframe) — permissive CSP
        source: "/preview/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' https: data: blob:",
              "connect-src 'self' https: http://localhost:*",
              frameAncestors,
            ].join("; "),
          },
        ],
      },
      {
        // All other pages — allow Google Fonts + iframe embedding from editor
        // unsafe-inline needed for user analytics scripts; unsafe-eval NOT needed here
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://bat.bing.com https://clarity.ms https://www.clarity.ms https://snap.licdn.com https://analytics.tiktok.com https://static.hotjar.com https://plausible.io https://cdn.matomo.cloud https://client.crisp.chat https://widget.intercom.io https://cdn.cookielaw.org https://js.hs-scripts.com https://js.hs-analytics.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' https: data: blob:",
              "connect-src 'self' https: http://localhost:*",
              frameAncestors,
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
