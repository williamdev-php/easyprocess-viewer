import type { SiteData, SiteMeta, SiteResponse, BlogPost, BlogPostList, BlogCategory } from "./types";
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
      next: { revalidate: 3600 },
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
      installed_apps: data.installed_apps ?? [],
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

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export async function fetchBlogPosts(
  siteId: string,
  page: number = 1,
  pageSize: number = 10,
  category?: string,
): Promise<BlogPostList | null> {
  try {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (category) params.set("category", category);
    const res = await fetchWithTimeout(
      `${API_URL}/api/sites/${siteId}/blog/posts?${params}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as BlogPostList;
  } catch {
    return null;
  }
}

export async function fetchBlogPost(
  siteId: string,
  slug: string,
): Promise<BlogPost | null> {
  try {
    const res = await fetchWithTimeout(
      `${API_URL}/api/sites/${siteId}/blog/posts/${encodeURIComponent(slug)}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as BlogPost;
  } catch {
    return null;
  }
}

export async function fetchBlogCategories(
  siteId: string,
): Promise<BlogCategory[] | null> {
  try {
    const res = await fetchWithTimeout(
      `${API_URL}/api/sites/${siteId}/blog/categories`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as BlogCategory[];
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export async function fetchBookingServices(siteId: string) {
  try {
    const res = await fetchWithTimeout(
      `${API_URL}/api/sites/${siteId}/bookings/services`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchBookingFormFields(siteId: string) {
  try {
    const res = await fetchWithTimeout(
      `${API_URL}/api/sites/${siteId}/bookings/form-fields`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchBookingPaymentMethods(siteId: string) {
  try {
    const res = await fetchWithTimeout(
      `${API_URL}/api/sites/${siteId}/bookings/payment-methods`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function submitBooking(siteId: string, data: Record<string, unknown>) {
  // Fetch CSRF token before submitting. See contact-section.tsx for details.
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const csrfRes = await fetch(`${API_URL}/api/sites/${siteId}/csrf-token`, {
      credentials: "include",
    });
    if (csrfRes.ok) {
      const csrfData = await csrfRes.json();
      if (csrfData.token) headers["X-CSRF-Token"] = csrfData.token;
    }
  } catch {
    // CSRF endpoint not available yet — proceed without token.
    // TODO: implement the backend CSRF endpoint and remove this fallback.
  }

  const res = await fetch(`${API_URL}/api/sites/${siteId}/bookings`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

