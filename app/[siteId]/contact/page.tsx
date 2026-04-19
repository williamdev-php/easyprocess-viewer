import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchSiteData } from "@/lib/api";
import { resolveColors } from "@/lib/colors";
import { getTheme } from "@/lib/themes";
import { getVariantStyle } from "@/lib/style-variants";
import { t } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { ContactSection } from "@/components/contact-section";
import { EditablePageWrapper } from "@/components/editable-page-wrapper";

interface Props {
  params: Promise<{ siteId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteId } = await params;
  const data = await fetchSiteData(siteId);
  return {
    title: `Kontakt | ${data?.meta?.title || ""}`,
    alternates: { canonical: `/contact` },
  };
}

export default async function ContactPage({ params }: Props) {
  const { siteId } = await params;
  const data = await fetchSiteData(siteId);
  if (!data) notFound();

  const biz = data.business;
  if (!biz?.email && !biz?.phone && !data.contact) notFound();

  const colors = resolveColors(data);
  const theme = getTheme(data.theme);
  const variantStyle = getVariantStyle(data.style_variant);
  const lang = data.meta?.language;

  return (
    <>
      <PageHeader
        title={data.contact?.title || t("contact.contactUs", lang)}
        colors={colors}
        theme={theme}
        variantStyle={variantStyle}
      />
      <EditablePageWrapper section="contact">
        <ContactSection
          title={data.contact?.title || t("contact.contactUs", lang)}
          text={data.contact?.text}
          email={biz?.email}
          phone={biz?.phone}
          address={biz?.address}
          colors={colors}
          theme={theme}
          lang={lang}
          siteId={siteId}
          variantStyle={variantStyle}
        />
      </EditablePageWrapper>
    </>
  );
}
