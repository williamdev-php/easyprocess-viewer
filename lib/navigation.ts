import type { SiteData, NavItem } from "./types";
import { t } from "./i18n";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export function buildNavigation(data: SiteData, siteId: string): NavItem[] {
  const lang = data.meta?.language;
  const base = IS_PRODUCTION ? "" : `/${siteId}`;
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

  return items;
}
