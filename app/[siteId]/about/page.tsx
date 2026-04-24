import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchSiteData } from "@/lib/api";
import { resolveColors } from "@/lib/colors";
import { getTheme } from "@/lib/themes";
import { getVariantStyle } from "@/lib/style-variants";
import { t } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { AboutSection } from "@/components/about-section";
import { EditablePageWrapper } from "@/components/editable-page-wrapper";
import { DynamicPageRenderer } from "@/components/dynamic-page-renderer";

interface Props {
  params: Promise<{ siteId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteId } = await params;
  const data = await fetchSiteData(siteId);
  if (!data?.about) {
    const page = data?.pages?.find(p => p.slug === "about" && !p.parent_slug);
    if (page) {
      return {
        title: `${page.meta?.title || page.title} | ${data?.meta?.title || ""}`,
        alternates: { canonical: `/about` },
      };
    }
    return {};
  }
  return {
    title: `${data.about.title || "Om oss"} | ${data.meta?.title || ""}`,
    alternates: { canonical: `/about` },
  };
}

export default async function AboutPage({ params }: Props) {
  const { siteId } = await params;
  const data = await fetchSiteData(siteId);
  if (!data?.about) {
    // Fallback: check if there's a page with slug "about"
    const page = data?.pages?.find(p => p.slug === "about" && !p.parent_slug);
    if (page && data) {
      const colors = resolveColors(data);
      const theme = getTheme(data.theme);
      const variantStyle = getVariantStyle(data.style_variant);
      return (
        <>
          <PageHeader title={page.title} colors={colors} theme={theme} variantStyle={variantStyle} />
          <DynamicPageRenderer page={page} siteData={data} colors={colors} theme={theme} variantStyle={variantStyle} />
        </>
      );
    }
    notFound();
  }

  const colors = resolveColors(data);
  const theme = getTheme(data.theme);
  const variantStyle = getVariantStyle(data.style_variant);
  const lang = data.meta?.language;

  return (
    <>
      <PageHeader
        title={data.about.title || t("nav.about", lang)}
        subtitle={data.business?.tagline}
        colors={colors}
        theme={theme}
        variantStyle={variantStyle}
      />
      <EditablePageWrapper section="about">
        <AboutSection
          {...data.about}
          colors={colors}
          theme={theme}
          variant="full"
          lang={lang}
          variantStyle={variantStyle}
        />
      </EditablePageWrapper>
    </>
  );
}
