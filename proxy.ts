import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Base domain for subdomains (e.g. "qvickosite.com").
 * Requests to <slug>.qvickosite.com are resolved via the API.
 */
const BASE_DOMAIN = process.env.BASE_DOMAIN ?? "qvickosite.com";

/**
 * Simple in-memory cache for subdomain/domain → API response.
 * Avoids hitting the backend on every single request.
 * TTL: 60 seconds. Max 500 entries (LRU eviction on overflow).
 */
const RESOLVE_CACHE_TTL = 60_000;
const RESOLVE_CACHE_MAX = 500;
const resolveCache = new Map<string, { data: Record<string, unknown>; ts: number }>();

function getCachedResolve(key: string): Record<string, unknown> | null {
  const entry = resolveCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > RESOLVE_CACHE_TTL) {
    resolveCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedResolve(key: string, data: Record<string, unknown>) {
  // Evict oldest entries if cache is full
  if (resolveCache.size >= RESOLVE_CACHE_MAX) {
    const oldest = resolveCache.keys().next().value;
    if (oldest !== undefined) resolveCache.delete(oldest);
  }
  resolveCache.set(key, { data, ts: Date.now() });
}

/**
 * Proxy that handles subdomain and custom domain routing:
 *
 * 1. Redirect bare qvickosite.com → qvicko.com
 * 2. Extract subdomain from hostname (e.g. "acme" from "acme.qvickosite.com")
 * 3. Resolve via backend API → get siteId + optional redirect_to
 * 4. If redirect_to is set (active custom domain), redirect there
 * 5. Otherwise, rewrite to /[siteId]/... so the app routes handle rendering
 */
export async function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Skip internal Next.js paths and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // --- Subdomain detection ---
  const hostWithoutPort = hostname.split(":")[0];
  let subdomain: string | null = null;
  let customDomain: string | null = null;

  if (hostWithoutPort.endsWith(`.${BASE_DOMAIN}`)) {
    const sub = hostWithoutPort.replace(`.${BASE_DOMAIN}`, "");
    if (sub && sub !== "www") {
      subdomain = sub;
    }
  } else if (
    hostWithoutPort !== BASE_DOMAIN &&
    hostWithoutPort !== `www.${BASE_DOMAIN}` &&
    hostWithoutPort !== "localhost" &&
    !hostWithoutPort.endsWith(".vercel.app")
  ) {
    // Treat as custom domain
    customDomain = hostWithoutPort;
  }

  // Redirect bare qvickosite.com (and www) to qvicko.com
  if (
    !subdomain &&
    !customDomain &&
    (hostWithoutPort === BASE_DOMAIN || hostWithoutPort === `www.${BASE_DOMAIN}`)
  ) {
    const redirectUrl = new URL(`https://qvicko.com${pathname}`);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl, 301);
  }

  if (!subdomain && !customDomain) {
    return NextResponse.next();
  }

  // --- Resolve via API (with caching) ---
  try {
    const cacheKey = subdomain ? `sub:${subdomain}` : `dom:${customDomain}`;
    let data = getCachedResolve(cacheKey) as Record<string, unknown> | null;

    if (!data) {
      const param = subdomain
        ? `subdomain=${encodeURIComponent(subdomain)}`
        : `domain=${encodeURIComponent(customDomain!)}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${API_URL}/api/sites/resolve?${param}`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return NextResponse.next();
      }

      data = await res.json();
      setCachedResolve(cacheKey, data as Record<string, unknown>);
    }

    // If accessing via subdomain and a custom domain is active, redirect
    if (subdomain && data.redirect_to) {
      try {
        const redirectUrl = new URL(data.redirect_to);
        // Only allow HTTPS redirects to prevent open redirect
        if (redirectUrl.protocol !== "https:") {
          return NextResponse.next();
        }
        redirectUrl.pathname = pathname;
        redirectUrl.search = request.nextUrl.search;
        return NextResponse.redirect(redirectUrl, 301);
      } catch {
        // Invalid redirect URL from API — skip redirect
        return NextResponse.next();
      }
    }

    // Rewrite to /[siteId]/... so the app routes handle rendering
    if (data.id) {
      const url = request.nextUrl.clone();
      url.pathname = `/${data.id}${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }
  } catch {
    // API unreachable — fall through to default routing
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
