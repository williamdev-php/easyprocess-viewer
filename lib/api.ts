import type { SiteData, SiteMeta, SiteResponse } from "./types";
import { limitSectionArrays } from "./sanitize";

/** Centralised API base URL — single source of truth for all fetch calls. */
export const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Default fetch timeout in milliseconds. */
const FETCH_TIMEOUT_MS = 8_000;

/** fetch wrapper that aborts after `timeoutMs` to prevent hanging requests. */
async function fetchWithTimeout(
  url: string,
  init?: RequestInit & { next?: { revalidate?: number } },
  timeoutMs: number = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Minimal runtime check that the API returned a plausible SiteData object. */
function isSiteData(v: unknown): v is SiteData {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export async function fetchSiteData(siteId: string): Promise<SiteData | null> {
  const response = await fetchSiteResponse(siteId);
  return response?.site_data ?? null;
}

export async function fetchSiteResponse(siteId: string): Promise<SiteResponse | null> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/sites/${siteId}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!isSiteData(data.site_data)) return null;
    const siteData = data.site_data as SiteData;
    // Limit array sizes to prevent DoS from oversized payloads
    limitSectionArrays(siteData as unknown as Record<string, unknown>);
    // Merge template field as theme fallback
    if (!siteData.theme && data.template && data.template !== "default") {
      siteData.theme = data.template;
    }
    return {
      site_data: siteData,
      template: data.template,
      status: data.status,
      created_at: data.created_at,
      claim_token: data.claim_token,
    };
  } catch {
    return null;
  }
}

export async function fetchSiteMeta(siteId: string): Promise<SiteMeta | null> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/sites/${siteId}/meta`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as SiteMeta;
  } catch {
    return null;
  }
}

export async function resolveSiteBySubdomain(
  subdomain: string
): Promise<{ id: string; redirect_to?: string | null } | null> {
  try {
    const res = await fetchWithTimeout(
      `${API_URL}/api/sites/resolve?subdomain=${encodeURIComponent(subdomain)}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as { id: string; redirect_to?: string | null };
  } catch {
    return null;
  }
}

export async function resolveSiteByDomain(
  domain: string
): Promise<{ id: string } | null> {
  try {
    const res = await fetchWithTimeout(
      `${API_URL}/api/sites/resolve?domain=${encodeURIComponent(domain)}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as { id: string };
  } catch {
    return null;
  }
}

