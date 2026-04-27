import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchSiteData } from "@/lib/api";
import { resolveColors } from "@/lib/colors";
import { getTheme } from "@/lib/themes";
import { getVariantStyle } from "@/lib/style-variants";
import { DynamicPageRenderer } from "@/components/dynamic-page-renderer";
import type { PageSchema, SiteData } from "@/lib/types";

interface Props {
  params: Promise<{ siteId: string; slug: string[] }>;
}

/**
 * Slug aliases that map to standard section routes.
 * Only used as redirects when no custom page with that slug exists.
 */
const SLUG_ALIASES: Record<string, string> = {
  // Swedish → English route
  "om-oss": "about",
  "om": "about",
  "tjanster": "services",
  "vara-tjanster": "services",
  "galleri": "gallery",
  "vanliga-fragor": "faq",
  "kontakt": "contact",
  "kontakta-oss": "contact",
  // English aliases
  "about-us": "about",
  "our-services": "services",
  "contact-us": "contact",
  "frequently-asked-questions": "faq",
};

/**
 * Legacy section keys that can be rendered as standalone pages
 * from top-level SiteData sections.
 */
const LEGACY_SECTIONS = ["about", "services", "gallery", "faq", "contact"] as const;
type LegacySection = typeof LEGACY_SECTIONS[number];

/** Build a virtual PageSchema from a top-level legacy section. */
function buildLegacyPage(data: SiteData, section: LegacySection): PageSchema | null {
  const TITLES: Record<LegacySection, string> = {
    about: data.about?.title || "Om oss",
    services: data.services?.title || "Tjänster",
    gallery: data.gallery?.title || "Galleri",
    faq: data.faq?.title || "Vanliga frågor",
    contact: data.contact?.title || "Kontakt",
  };

  switch (section) {
    case "about":
      if (!data.about) return null;
      return {
        slug: "about",
        title: TITLES.about,
        sections: [{ type: "about", data: { ...data.about, variant: "full" } as Record<string, unknown> }],
        show_in_nav: true,
        nav_order: 1,
      };

    case "services":
      if (!data.services?.items?.length) return null;
      return {
        slug: "services",
        title: TITLES.services,
        sections: [{ type: "services", data: { ...data.services, variant: "full" } as Record<string, unknown> }],
        show_in_nav: true,
        nav_order: 2,
      };

    case "gallery":
      if (!data.gallery?.images?.length) return null;
      return {
        slug: "gallery",
        title: TITLES.gallery,
        sections: [{ type: "gallery", data: { ...data.gallery } as Record<string, unknown> }],
        show_in_nav: true,
        nav_order: 3,
      };

    case "faq":
      if (!data.faq?.items?.length) return null;
      return {
        slug: "faq",
        title: TITLES.faq,
        sections: [{ type: "faq", data: { ...data.faq } as Record<string, unknown> }],
        show_in_nav: true,
        nav_order: 4,
      };

    case "contact": {
      const biz = data.business;
      if (!data.contact && !biz?.email && !biz?.phone) return null;
      return {
        slug: "contact",
        title: TITLES.contact,
        sections: [{ type: "contact", data: { ...data.contact, show_form: true, show_info: true } as Record<string, unknown> }],
        show_in_nav: true,
        nav_order: 5,
      };
    }

    default:
      return null;
  }
}

/** Find a page in the pages array by matching slug or parent_slug/slug. */
function findPage(pages: PageSchema[], fullSlug: string): PageSchema | null {
  // Direct slug match (top-level page)
  const direct = pages.find(p => !p.parent_slug && p.slug === fullSlug);
  if (direct) return direct;

  // Parent/child match: "parent/child"
  const parts = fullSlug.split("/");
  if (parts.length === 2) {
    const [parentSlug, childSlug] = parts;
    return pages.find(p => p.parent_slug === parentSlug && p.slug === childSlug) ?? null;
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteId, slug } = await params;
  const fullSlug = slug.join("/");
  const data = await fetchSiteData(siteId);
  if (!data) return {};

  // Check custom pages first
  if (data.pages) {
    const page = findPage(data.pages, fullSlug);
    if (page) {
      const siteTitle = data.meta?.title || "";
      const pageTitle = page.meta?.title || page.title;
      return {
        title: `${pageTitle} | ${siteTitle}`,
        description: page.meta?.description || "",
        openGraph: {
          title: pageTitle,
          description: page.meta?.description || "",
          images: page.meta?.og_image ? [page.meta.og_image] : [],
        },
        alternates: {
          canonical: page.parent_slug ? `/${page.parent_slug}/${page.slug}` : `/${page.slug}`,
        },
      };
    }
  }

  // Check legacy sections
  const legacyKey = (SLUG_ALIASES[fullSlug] || fullSlug) as LegacySection;
  if (LEGACY_SECTIONS.includes(legacyKey)) {
    const virtualPage = buildLegacyPage(data, legacyKey);
    if (virtualPage) {
      const siteTitle = data.meta?.title || "";
      return {
        title: `${virtualPage.title} | ${siteTitle}`,
        alternates: { canonical: `/${legacyKey}` },
      };
    }
  }

  return {};
}

export default async function DynamicPage({ params }: Props) {
  const { siteId, slug } = await params;
  const fullSlug = slug.join("/");
  const data = await fetchSiteData(siteId);

  const IS_PRODUCTION = process.env.NODE_ENV === "production";
  const base = IS_PRODUCTION ? "" : `/${siteId}`;

  // 1. Check for custom page first
  const page = data?.pages ? findPage(data.pages, fullSlug) : null;

  if (page && data) {
    const colors = resolveColors(data);
    const theme = getTheme(data.theme);
    const variantStyle = getVariantStyle(data.style_variant);

    // If this is a parent page, find its children for potential listing
    const children = data.pages?.filter(p => p.parent_slug === page.slug) ?? [];

    return (
      <>
        {page.sections.length > 0 ? (
          <DynamicPageRenderer
            page={page}
            siteData={data}
            colors={colors}
            theme={theme}
            variantStyle={variantStyle}
          />
        ) : children.length > 0 ? (
          // Parent page with no sections: show child pages listing
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {children
                .sort((a, b) => (a.nav_order ?? 0) - (b.nav_order ?? 0))
                .map((child) => (
                  <a
                    key={child.slug}
                    href={`/${page.slug}/${child.slug}`}
                    className="group rounded-xl border p-6 transition-all hover:shadow-lg"
                    style={{ borderColor: `${colors.primary}20`, background: colors.background }}
                  >
                    <h3
                      className="text-lg font-semibold transition-colors group-hover:opacity-80"
                      style={{ color: colors.text }}
                    >
                      {child.title}
                    </h3>
                    {child.meta?.description && (
                      <p className="mt-2 text-sm" style={{ color: colors.text, opacity: 0.6 }}>
                        {child.meta.description}
                      </p>
                    )}
                  </a>
                ))}
            </div>
          </div>
        ) : null}
      </>
    );
  }

  // 2. Check slug aliases — but only redirect if no custom page matches the alias target
  const aliasTarget = SLUG_ALIASES[fullSlug];
  if (aliasTarget && data) {
    // If there's a custom page with the alias target slug, it will be caught in step 1
    // on the redirect. If it's a legacy section, the redirect will hit this route again
    // and be caught in step 3.
    const hasCustomPage = data.pages?.some(p => p.slug === fullSlug && !p.parent_slug);
    if (!hasCustomPage) {
      redirect(`${base}/${aliasTarget}`);
    }
  }

  // 3. Legacy section handling: render top-level section data as virtual page
  if (data) {
    const legacyKey = fullSlug as LegacySection;
    if (LEGACY_SECTIONS.includes(legacyKey)) {
      const virtualPage = buildLegacyPage(data, legacyKey);
      if (virtualPage) {
        const colors = resolveColors(data);
        const theme = getTheme(data.theme);
        const variantStyle = getVariantStyle(data.style_variant);
        return (
          <DynamicPageRenderer
            page={virtualPage}
            siteData={data}
            colors={colors}
            theme={theme}
            variantStyle={variantStyle}
          />
        );
      }
    }
  }

  notFound();
}
