import type { MetadataRoute } from "next";

const BASE_DOMAIN = process.env.BASE_DOMAIN || "qvickosite.com";
const API_URL = process.env.API_URL || "http://localhost:8000";

interface SiteListItem {
  id: string;
  subdomain?: string;
  custom_domain?: string;
  updated_at?: string;
  slugs?: string[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${API_URL}/api/sites/published`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const sites: SiteListItem[] = await res.json();

    const entries: MetadataRoute.Sitemap = [];

    for (const site of sites) {
      if (!site.subdomain) continue;

      const lastMod = site.updated_at ? new Date(site.updated_at) : new Date();
      const siteBase = `https://${site.subdomain}.${BASE_DOMAIN}`;

      // Home page
      entries.push({
        url: siteBase,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 1.0,
      });

      // Sub-pages
      for (const slug of site.slugs || []) {
        entries.push({
          url: `${siteBase}/${slug}`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }

    return entries;
  } catch {
    return [];
  }
}
