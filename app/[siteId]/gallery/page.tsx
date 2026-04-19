import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchSiteData } from "@/lib/api";
import { resolveColors } from "@/lib/colors";
import { getTheme } from "@/lib/themes";
import { t } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { GallerySection } from "@/components/gallery-section";
import { EditablePageWrapper } from "@/components/editable-page-wrapper";

interface Props {
  params: Promise<{ siteId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteId } = await params;
  const data = await fetchSiteData(siteId);
  if (!data?.gallery) return {};
  return {
    title: `${data.gallery.title || "Galleri"} | ${data.meta?.title || ""}`,
    alternates: { canonical: `/gallery` },
  };
}

export default async function GalleryPage({ params }: Props) {
  const { siteId } = await params;
  const data = await fetchSiteData(siteId);
  if (!data) notFound();

  const colors = resolveColors(data);
  const theme = getTheme(data.theme);
  const lang = data.meta?.language;

  if (!data.gallery?.images?.length) {
    return (
      <>
        <PageHeader
          title={t("nav.gallery", lang)}
          colors={colors}
          theme={theme}
        />
        <div className="py-20 text-center text-gray-500">
          <p>{t("gallery.empty", lang)}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={data.gallery.title || t("nav.gallery", lang)}
        colors={colors}
        theme={theme}
      />
      <EditablePageWrapper section="gallery">
        <GallerySection
          {...data.gallery}
          colors={colors}
          theme={theme}
          variant="full"
          lang={lang}
        />
      </EditablePageWrapper>
    </>
  );
}
