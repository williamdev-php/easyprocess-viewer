import type { SiteData, NavItem } from "./types";
import { t } from "./i18n";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Build header navigation.
 * If the site defines custom header_nav, use that. Otherwise auto-generate.
 */
export function buildNavigation(data: SiteData, siteId: string, installedApps?: string[]): NavItem[] {
  const base = IS_PRODUCTION ? "" : `/${siteId}`;

  // Custom header nav — use as-is (prefix hrefs with base in dev)
  if (data.header_nav?.length) {
    return data.header_nav.map((item) => ({
      label: item.label,
      href: base && !item.href.startsWith("http") ? `${base}${item.href}` : item.href,
    }));
  }

  // Auto-generated nav (backward compatible)
  const lang = data.meta?.language;
  const items: NavItem[] = [{ label: t("nav.home", lang), href: base || "/" }];

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
  if (installedApps?.includes("blog")) {
    items.push({ label: t("nav.blog", lang), href: `${base}/blog` });
  }

  return items;
}

/**
 * Build footer navigation.
 * If the site defines custom footer_nav, use that. Otherwise fall back to header nav.
 */
export function buildFooterNavigation(data: SiteData, siteId: string, installedApps?: string[]): NavItem[] {
  const base = IS_PRODUCTION ? "" : `/${siteId}`;

  if (data.footer_nav?.length) {
    return data.footer_nav.map((item) => ({
      label: item.label,
      href: base && !item.href.startsWith("http") ? `${base}${item.href}` : item.href,
    }));
  }

  // Fall back to header nav
  return buildNavigation(data, siteId, installedApps);
}
