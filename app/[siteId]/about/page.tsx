import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchSiteData } from "@/lib/api";
import { resolveColors } from "@/lib/colors";
import { getTheme } from "@/lib/themes";
import { t } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { AboutSection } from "@/components/about-section";
import { EditablePageWrapper } from "@/components/editable-page-wrapper";

interface Props {
  params: Promise<{ siteId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteId } = await params;
  const data = await fetchSiteData(siteId);
  if (!data?.about) return {};
  return {
    title: `${data.about.title || "Om oss"} | ${data.meta?.title || ""}`,
    alternates: { canonical: `/about` },
  };
}

export default async function AboutPage({ params }: Props) {
  const { siteId } = await params;
  const data = await fetchSiteData(siteId);
  if (!data?.about) notFound();

  const colors = resolveColors(data);
  const theme = getTheme(data.theme);
  const lang = data.meta?.language;

  return (
    <>
      <PageHeader
        title={data.about.title || t("nav.about", lang)}
        subtitle={data.business?.tagline}
        colors={colors}
        theme={theme}
      />
      <EditablePageWrapper section="about">
        <AboutSection
          {...data.about}
          colors={colors}
          theme={theme}
          variant="full"
          lang={lang}
        />
      </EditablePageWrapper>
    </>
  );
}
