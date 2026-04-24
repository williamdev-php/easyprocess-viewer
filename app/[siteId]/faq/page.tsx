import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchSiteData } from "@/lib/api";
import { resolveColors } from "@/lib/colors";
import { getTheme } from "@/lib/themes";
import { getVariantStyle } from "@/lib/style-variants";
import { t } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { FAQSection } from "@/components/faq-section";
import { EditablePageWrapper } from "@/components/editable-page-wrapper";
import { DynamicPageRenderer } from "@/components/dynamic-page-renderer";

interface Props {
  params: Promise<{ siteId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteId } = await params;
  const data = await fetchSiteData(siteId);
  if (!data?.faq) return {};
  return {
    title: `${data.faq.title || "Vanliga frågor"} | ${data.meta?.title || ""}`,
    alternates: { canonical: `/faq` },
  };
}

export default async function FAQPage({ params }: Props) {
  const { siteId } = await params;
  const data = await fetchSiteData(siteId);
  if (!data) notFound();

  const colors = resolveColors(data);
  const theme = getTheme(data.theme);
  const variantStyle = getVariantStyle(data.style_variant);
  const lang = data.meta?.language;

  if (!data.faq?.items?.length) {
    const page = data.pages?.find(p => p.slug === "faq" && !p.parent_slug);
    if (page) {
      return (
        <>
          <PageHeader title={page.title} colors={colors} theme={theme} variantStyle={variantStyle} />
          <DynamicPageRenderer page={page} siteData={data} colors={colors} theme={theme} variantStyle={variantStyle} />
        </>
      );
    }
    return (
      <>
        <PageHeader
          title={t("nav.faq", lang)}
          colors={colors}
          theme={theme}
          variantStyle={variantStyle}
        />
        <div className="py-20 text-center text-gray-500">
          <p>{t("faq.empty", lang)}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={data.faq.title || t("nav.faq", lang)}
        subtitle={data.faq.subtitle}
        colors={colors}
        theme={theme}
        variantStyle={variantStyle}
      />
      <EditablePageWrapper section="faq">
        <FAQSection
          {...data.faq}
          colors={colors}
          theme={theme}
          variantStyle={variantStyle}
        />
      </EditablePageWrapper>
    </>
  );
}
