import type { NextConfig } from "next";

const editorOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_EDITOR_ORIGIN || process.env.FRONTEND_URL || "http://localhost:3000";
  // Ensure the origin always has a protocol (FRONTEND_URL may be bare domain)
  if (raw && !raw.startsWith("http")) return `https://${raw}`;
  return raw;
})();

const nextConfig: NextConfig = {
  // isomorphic-dompurify depends on jsdom which is ESM-only (v29+).
  // Mark them as external so Next.js doesn't try to bundle/require() them.
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
  // Allow images from any HTTPS domain (generated sites have images from various sources).
  // HTTP is only permitted in development for local testing.
  images: {
    formats: ["image/avif", "image/webp"],
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
        // Global security headers
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            // SAMEORIGIN allows the editor iframe embedding while blocking
            // third-party clickjacking. The CSP frame-ancestors directive
            // provides more granular control and takes precedence in modern
            // browsers, but X-Frame-Options is kept for legacy browser support.
            value: "SAMEORIGIN",
          },
        ],
      },
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
        // Sitemap — cache for 1 hour, allow stale while revalidating
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600",
          },
        ],
      },
      {
        // Preview pages (loaded in editor iframe) — permissive CSP
        // NOTE: unsafe-inline is required for preview because the editor injects
        // dynamic style attributes and inline event handlers via postMessage-driven
        // updates. unsafe-eval has been removed to prevent arbitrary code execution.
        source: "/preview/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
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
