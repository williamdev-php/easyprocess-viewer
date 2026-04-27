import type { SiteData, NavItem } from "./types";
import { t } from "./i18n";
import { sanitizeUrl } from "./sanitize";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

/** Max nav items in header (including Home). */
const MAX_HEADER_LINKS = 8;

/** Max characters for a nav label. */
const MAX_LABEL_LENGTH = 25;

/** Truncate a label to MAX_LABEL_LENGTH, stripping " | SiteName" suffix. */
function trimLabel(label: string): string {
  const pipeIdx = label.indexOf(" | ");
  const clean = pipeIdx > 0 ? label.slice(0, pipeIdx) : label;
  if (clean.length <= MAX_LABEL_LENGTH) return clean;
  return clean.slice(0, MAX_LABEL_LENGTH - 1).trimEnd() + "…";
}

/**
 * Build header navigation.
 *
 * There are exactly THREE modes, checked in order:
 *
 * 1. **Explicit header_nav** — site owner set custom nav links → use as-is.
 * 2. **Custom pages exist** — nav is built ONLY from `data.pages` + installed
 *    apps.  Standard sections (about, services, etc.) do NOT add nav items.
 *    This is the mode for all newly generated sites.
 * 3. **Legacy fallback** — no pages at all → auto-generate from top-level
 *    sections (backward compatible for old sites).
 *
 * By using a SINGLE source per mode, duplicates are impossible.
 */
export function buildNavigation(data: SiteData, siteId: string, installedApps?: string[]): NavItem[] {
  const base = IS_PRODUCTION ? "" : `/${siteId}`;
  const lang = data.meta?.language;

  // ── Mode 1: Explicit custom header nav ──────────────────────────────
  if (data.header_nav?.length) {
    return data.header_nav
      .filter((item) => sanitizeUrl(item.href))
      .map((item) => ({
        label: trimLabel(item.label),
        href: base && !item.href.startsWith("http") ? `${base}${sanitizeUrl(item.href)!}` : sanitizeUrl(item.href)!,
      }));
  }

  const items: NavItem[] = [{ label: t("nav.home", lang), href: base || "/" }];
  const hasPages = data.pages?.some(p => !p.parent_slug);

  if (hasPages) {
    // ── Mode 2: Pages-driven nav (new sites) ────────────────────────
    // Nav comes ONLY from pages with show_in_nav !== false.
    // Standard sections are NOT a nav source — they're just data for
    // the home-page snippets and the hardcoded /about, /services routes.
    const topPages = data.pages!
      .filter(p => !p.parent_slug && p.show_in_nav !== false)
      .sort((a, b) => (a.nav_order ?? 0) - (b.nav_order ?? 0));

    for (const page of topPages) {
      // Strip leading slashes from slug to prevent "//slug" → protocol-relative URL
      const slug = page.slug.replace(/^\/+/, "");
      const navItem: NavItem = { label: trimLabel(page.title), href: `${base}/${slug}` };

      // Build nested children from child pages
      const childPages = data.pages!
        .filter(p => p.parent_slug === page.slug && p.show_in_nav !== false)
        .sort((a, b) => (a.nav_order ?? 0) - (b.nav_order ?? 0));
      if (childPages.length > 0) {
        navItem.children = childPages.map(child => {
          const childSlug = child.slug.replace(/^\/+/, "");
          return { label: trimLabel(child.title), href: `${base}/${slug}/${childSlug}` };
        });
      }

      items.push(navItem);
    }
  } else {
    // ── Mode 3: Legacy auto-generated nav (no pages) ────────────────
    if (data.about) {
      items.push({ label: t("nav.about", lang), href: `${base}/about` });
    }
    if (data.services?.items?.length) {
      items.push({ label: t("nav.services", lang), href: `${base}/services` });
    }
    if (data.gallery?.images?.length) {
      items.push({ label: t("nav.gallery", lang), href: `${base}/gallery` });
    }
    if (data.faq?.items?.length) {
      items.push({ label: t("nav.faq", lang), href: `${base}/faq` });
    }
    if (data.business?.email || data.business?.phone || data.contact) {
      items.push({ label: t("nav.contact", lang), href: `${base}/contact` });
    }
  }

  // Installed apps always get a nav item (both modes)
  if (installedApps?.includes("blog")) {
    items.push({ label: t("nav.blog", lang), href: `${base}/blog` });
  }
  if (installedApps?.includes("bookings")) {
    items.push({ label: t("nav.bookings", lang), href: `${base}/bookings` });
  }

  return items.slice(0, MAX_HEADER_LINKS);
}

/**
 * Build footer navigation.
 * If the site defines custom footer_nav, use that. Otherwise fall back to header nav.
 */
export function buildFooterNavigation(data: SiteData, siteId: string, installedApps?: string[]): NavItem[] {
  const base = IS_PRODUCTION ? "" : `/${siteId}`;

  if (data.footer_nav?.length) {
    return data.footer_nav
      .filter((item) => sanitizeUrl(item.href))
      .map((item) => ({
        label: item.label,
        href: base && !item.href.startsWith("http") ? `${base}${sanitizeUrl(item.href)!}` : sanitizeUrl(item.href)!,
      }));
  }

  // Fall back to header nav
  return buildNavigation(data, siteId, installedApps);
}
