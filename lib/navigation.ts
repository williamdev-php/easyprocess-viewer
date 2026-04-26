import type { SiteData, NavItem } from "./types";
import { t } from "./i18n";
import { sanitizeUrl } from "./sanitize";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

/** Max nav items in header (including Home). */
const MAX_HEADER_LINKS = 8;

/** Max characters for a nav label. */
const MAX_LABEL_LENGTH = 25;

/**
 * Slugs that map to standard section routes, per language.
 * Add new languages here to support i18n slug matching.
 */
const SECTION_SLUGS_BY_LANG: Record<string, Record<string, string[]>> = {
  sv: {
    about: ["om-oss", "om"],
    services: ["tjanster", "vara-tjanster"],
    gallery: ["galleri"],
    faq: ["vanliga-fragor"],
    contact: ["kontakt", "kontakta-oss"],
  },
  en: {
    about: ["about-us", "about"],
    services: ["services", "our-services"],
    gallery: ["gallery"],
    faq: ["faq", "frequently-asked-questions"],
    contact: ["contact", "contact-us"],
  },
};

/** Build the full slug list for a section, combining the English base slug with language-specific variants. */
function getSectionSlugs(sectionKey: string, lang?: string): string[] {
  const slugs = new Set<string>();
  // Always include the English/route key as a valid slug
  slugs.add(sectionKey);
  // Add language-specific variants
  const locale = lang === "en" ? "en" : "sv";
  const langSlugs = SECTION_SLUGS_BY_LANG[locale]?.[sectionKey];
  if (langSlugs) langSlugs.forEach(s => slugs.add(s));
  // Also include all other languages as fallback (a Swedish slug on an English site still matches)
  for (const l of Object.keys(SECTION_SLUGS_BY_LANG)) {
    const variants = SECTION_SLUGS_BY_LANG[l]?.[sectionKey];
    if (variants) variants.forEach(s => slugs.add(s));
  }
  return Array.from(slugs);
}

/** Truncate a label to MAX_LABEL_LENGTH, adding ellipsis if needed. */
function trimLabel(label: string): string {
  // Strip " | SiteName" suffix if present
  const pipeIdx = label.indexOf(" | ");
  const clean = pipeIdx > 0 ? label.slice(0, pipeIdx) : label;
  if (clean.length <= MAX_LABEL_LENGTH) return clean;
  return clean.slice(0, MAX_LABEL_LENGTH - 1).trimEnd() + "…";
}

/**
 * Check if a custom page covers the same topic as a standard section.
 */
function customPageCoversSection(
  pages: SiteData["pages"],
  sectionKey: string,
  lang?: string,
): { slug: string; label: string } | null {
  if (!pages?.length) return null;
  const slugVariants = getSectionSlugs(sectionKey, lang);

  for (const page of pages) {
    if (page.parent_slug) continue;
    if (page.show_in_nav === false) continue;
    if (slugVariants.includes(page.slug)) {
      return { slug: page.slug, label: trimLabel(page.title) };
    }
  }
  return null;
}

/**
 * Build header navigation.
 * If the site defines custom header_nav, use that. Otherwise auto-generate.
 *
 * Custom pages that cover the same topic as a standard section replace
 * the standard link (no duplicates).
 */
export function buildNavigation(data: SiteData, siteId: string, installedApps?: string[]): NavItem[] {
  const base = IS_PRODUCTION ? "" : `/${siteId}`;

  // Custom header nav — sanitize hrefs to prevent javascript: links
  if (data.header_nav?.length) {
    return data.header_nav
      .filter((item) => sanitizeUrl(item.href))
      .map((item) => ({
        label: trimLabel(item.label),
        href: base && !item.href.startsWith("http") ? `${base}${sanitizeUrl(item.href)!}` : sanitizeUrl(item.href)!,
      }));
  }

  // Track which custom-page slugs are already consumed (to avoid adding them again)
  const consumedPageSlugs = new Set<string>();

  // Auto-generated nav (backward compatible)
  const lang = data.meta?.language;
  const items: NavItem[] = [{ label: t("nav.home", lang), href: base || "/" }];

  // Helper: add standard section OR its custom-page replacement
  const addSection = (sectionKey: string, hasSection: boolean, defaultLabel: string, standardRoute: string) => {
    const customMatch = customPageCoversSection(data.pages, sectionKey, lang);
    if (customMatch) {
      // Custom page replaces the standard section link
      items.push({ label: customMatch.label, href: `${base}/${customMatch.slug}` });
      consumedPageSlugs.add(customMatch.slug);
    } else if (hasSection) {
      items.push({ label: defaultLabel, href: `${base}/${standardRoute}` });
    }
  };

  addSection("about", !!data.about, t("nav.about", lang), "about");
  addSection("services", !!(data.services?.items?.length), t("nav.services", lang), "services");
  addSection("gallery", !!(data.gallery?.images?.length), t("nav.gallery", lang), "gallery");
  addSection("faq", !!(data.faq?.items?.length), t("nav.faq", lang), "faq");
  addSection("contact", !!(data.business?.email || data.business?.phone || data.contact), t("nav.contact", lang), "contact");

  if (installedApps?.includes("blog")) {
    items.push({ label: t("nav.blog", lang), href: `${base}/blog` });
  }
  if (installedApps?.includes("bookings")) {
    items.push({ label: t("nav.bookings", lang), href: `${base}/bookings` });
  }

  // Multi-page support: add remaining top-level pages (skip already consumed ones)
  if (data.pages?.length) {
    const topPages = data.pages
      .filter(p => !p.parent_slug && p.show_in_nav !== false && !consumedPageSlugs.has(p.slug))
      .sort((a, b) => (a.nav_order ?? 0) - (b.nav_order ?? 0));
    for (const page of topPages) {
      items.push({ label: trimLabel(page.title), href: `${base}/${page.slug}` });
    }
  }

  // Cap total items to prevent overly crowded headers
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
