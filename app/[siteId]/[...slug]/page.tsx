import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchSiteData } from "@/lib/api";
import { resolveColors } from "@/lib/colors";
import { getTheme } from "@/lib/themes";
import { getVariantStyle } from "@/lib/style-variants";
import { PageHeader } from "@/components/page-header";
import { DynamicPageRenderer } from "@/components/dynamic-page-renderer";
import type { PageSchema } from "@/lib/types";

interface Props {
  params: Promise<{ siteId: string; slug: string[] }>;
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
  if (!data?.pages) return {};

  const page = findPage(data.pages, fullSlug);
  if (!page) return {};

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

export default async function DynamicPage({ params }: Props) {
  const { siteId, slug } = await params;
  const fullSlug = slug.join("/");
  const data = await fetchSiteData(siteId);
  if (!data?.pages) notFound();

  const page = findPage(data.pages, fullSlug);
  if (!page) notFound();

  const colors = resolveColors(data);
  const theme = getTheme(data.theme);
  const variantStyle = getVariantStyle(data.style_variant);

  // If this is a parent page, find its children for potential listing
  const children = data.pages.filter(p => p.parent_slug === page.slug);

  return (
    <>
      <PageHeader
        title={page.title}
        colors={colors}
        theme={theme}
        variantStyle={variantStyle}
      />
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
