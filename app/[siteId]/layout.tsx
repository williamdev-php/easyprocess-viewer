import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchSiteResponse, fetchSiteMeta } from "@/lib/api";
import { resolveColors } from "@/lib/colors";
import { getTheme } from "@/lib/themes";
import { getVariantStyle } from "@/lib/style-variants";
import { buildNavigation } from "@/lib/navigation";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Analytics } from "@/components/analytics";
import { DraftBanner } from "@/components/draft-banner";

interface Props {
  params: Promise<{ siteId: string }>;
  children: ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteId } = await params;
  const meta = await fetchSiteMeta(siteId);
  if (!meta) return { title: "Sidan hittades inte" };

  return {
    title: meta.title || "Webbplats",
    description: meta.description || "",
    keywords: meta.keywords || [],
    openGraph: {
      title: meta.title,
      description: meta.description,
      images: meta.og_image ? [meta.og_image] : [],
      locale: meta.language === "sv" ? "sv_SE" : "en_US",
      type: "website",
    },
    robots: meta.robots || "index, follow",
    alternates: { canonical: `/` },
  };
}

export default async function SiteLayout({ params, children }: Props) {
  const { siteId } = await params;
  const siteResponse = await fetchSiteResponse(siteId);
  if (!siteResponse) notFound();

  const siteData = siteResponse.site_data;
  const isDraft = siteResponse.status === "DRAFT";
  const colors = resolveColors(siteData ?? {});
  const theme = getTheme(siteData?.theme);
  const variantStyle = getVariantStyle(siteData?.style_variant);
  const navItems = buildNavigation(siteData, siteId);
  const biz = siteData.business;

  const lang = siteData.meta?.language || "sv";
  const isProduction = process.env.NODE_ENV === "production";
  const base = isProduction ? "" : `/${siteId}`;
  const ctaHref = (biz?.email || biz?.phone || siteData.contact)
    ? `${base}/contact`
    : undefined;

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: siteData.branding?.fonts?.body
          ? `${siteData.branding.fonts.body}, -apple-system, BlinkMacSystemFont, sans-serif`
          : `Inter, -apple-system, BlinkMacSystemFont, sans-serif`,
        background: colors.background,
      }}
    >
      <Nav
        items={navItems}
        colors={colors}
        theme={theme}
        logoUrl={siteData.branding?.logo_url}
        businessName={biz?.name}
        ctaHref={ctaHref}
        lang={lang}
        variantStyle={variantStyle}
      />
      <Analytics siteId={siteId} />
      <main>{children}</main>
      {isDraft && (
        <DraftBanner
          claimToken={siteResponse.claim_token ?? undefined}
          createdAt={siteResponse.created_at ?? undefined}
          lang={lang}
        />
      )}
      <Footer
        businessName={biz?.name}
        email={biz?.email}
        phone={biz?.phone}
        address={biz?.address}
        socialLinks={biz?.social_links}
        navItems={navItems}
        colors={colors}
        theme={theme}
        lang={lang}
        variantStyle={variantStyle}
      />
    </div>
  );
}
