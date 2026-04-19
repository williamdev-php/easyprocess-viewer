import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchSiteData } from "@/lib/api";
import { resolveColors } from "@/lib/colors";
import { getTheme } from "@/lib/themes";
import { getVariantStyle } from "@/lib/style-variants";
import { t } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { ServicesSection } from "@/components/services-section";
import { EditablePageWrapper } from "@/components/editable-page-wrapper";

interface Props {
  params: Promise<{ siteId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteId } = await params;
  const data = await fetchSiteData(siteId);
  if (!data?.services) return {};
  return {
    title: `${data.services.title || "Tjänster"} | ${data.meta?.title || ""}`,
    alternates: { canonical: `/services` },
  };
}

export default async function ServicesPage({ params }: Props) {
  const { siteId } = await params;
  const data = await fetchSiteData(siteId);
  if (!data) notFound();

  const colors = resolveColors(data);
  const theme = getTheme(data.theme);
  const variantStyle = getVariantStyle(data.style_variant);
  const lang = data.meta?.language;

  if (!data.services?.items?.length) {
    return (
      <>
        <PageHeader
          title={t("nav.services", lang)}
          colors={colors}
          theme={theme}
          variantStyle={variantStyle}
        />
        <div className="py-20 text-center text-gray-500">
          <p>{t("services.empty", lang)}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={data.services.title || t("nav.services", lang)}
        subtitle={data.services.subtitle}
        colors={colors}
        theme={theme}
        variantStyle={variantStyle}
      />
      <EditablePageWrapper section="services">
        <ServicesSection
          {...data.services}
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
