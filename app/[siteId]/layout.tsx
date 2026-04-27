import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchSiteResponse, fetchSiteMeta } from "@/lib/api";
import { resolveColors } from "@/lib/colors";
import { getTheme } from "@/lib/themes";
import { getVariantStyle, applyLayoutOverrides } from "@/lib/style-variants";
import { buildNavigation } from "@/lib/navigation";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Analytics } from "@/components/analytics";
import { DraftBanner } from "@/components/draft-banner";
import { ChatWidget } from "@/components/chat-widget";
import Script from "next/script";
import { sanitizeFontFamily, sanitizeHeadScripts } from "@/lib/sanitize";
import { resolveVersion, getNavRenderer, getFooterRenderer } from "@/lib/version-registry";
import { headers } from "next/headers";

interface Props {
  params: Promise<{ siteId: string }>;
  children: ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteId } = await params;
  const [meta, headersList] = await Promise.all([fetchSiteMeta(siteId), headers()]);
  if (!meta) return { title: "Sidan hittades inte" };

  // Build canonical URL from the request host and path
  const host = headersList.get("host") || "localhost:3001";
  const proto = headersList.get("x-forwarded-proto") || "https";
  const pathname = headersList.get("x-invoke-path") || headersList.get("x-next-url") || `/${siteId}`;
  // In production, strip the /[siteId] prefix since sites are served on their own subdomain
  const isProduction = process.env.NODE_ENV === "production";
  const canonicalPath = isProduction ? pathname.replace(new RegExp(`^/${siteId}`), "") || "/" : pathname;
  const canonicalUrl = `${proto}://${host}${canonicalPath}`;

  const siteName = meta.business_name || meta.title || "";

  return {
    title: meta.title || "Webbplats",
    description: meta.description || "",
    keywords: meta.keywords || [],
    openGraph: {
      title: meta.title,
      description: meta.description || "",
      siteName,
      images: meta.og_image ? [meta.og_image] : [],
      locale: meta.language === "sv" ? "sv_SE" : "en_US",
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: meta.og_image ? "summary_large_image" : "summary",
      title: meta.title,
      description: meta.description || "",
      ...(meta.og_image ? { images: [meta.og_image] } : {}),
    },
    robots: meta.robots || "index, follow",
    alternates: { canonical: canonicalUrl },
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
  const variantStyle = applyLayoutOverrides(
    getVariantStyle(siteData?.style_variant),
    siteData?.nav_style,
    siteData?.footer_style,
  );
  const navItems = buildNavigation(siteData, siteId, siteResponse.installed_apps);
  const biz = siteData.business;

  const lang = siteData.meta?.language || "sv";
  const isProduction = process.env.NODE_ENV === "production";
  const base = isProduction ? "" : `/${siteId}`;
  const ctaHref = (biz?.email || biz?.phone || siteData.contact)
    ? `${base}/contact`
    : undefined;

  // Version-aware rendering for Nav/Footer
  const version = resolveVersion(siteData);
  const customNavRenderer = getNavRenderer(version);
  const customFooterRenderer = getFooterRenderer(version);

  const renderCtx = { data: siteData, colors, theme, variantStyle, lang, siteId };

  // Build Google Font URLs for custom fonts
  // Validate and sanitize user-added head scripts (defense-in-depth)
  const headScripts = sanitizeHeadScripts(siteData.head_scripts);

  const bodyFont = sanitizeFontFamily(siteData.branding?.fonts?.body);
  const headingFont = sanitizeFontFamily(siteData.branding?.fonts?.heading);
  const fontsToLoad = new Set<string>();
  if (bodyFont && bodyFont !== "Inter") fontsToLoad.add(bodyFont);
  if (headingFont && headingFont !== "Inter" && headingFont !== bodyFont) fontsToLoad.add(headingFont);

  return (
    <>
      {fontsToLoad.size > 0 && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?${[...fontsToLoad].map(f => `family=${f.replace(/ /g, "+")}`).join("&")}&display=swap`}
        />
      )}
      {/* User-added verification meta tags */}
      {headScripts?.meta_tags?.map((meta, i) => (
        <meta key={`hm-${i}`} name={meta.name} content={meta.content} />
      ))}
      {/* User-added analytics/tracking scripts */}
      {headScripts?.scripts?.map((script, i) =>
        script.src ? (
          <Script
            key={`hs-${i}`}
            src={script.src}
            strategy="afterInteractive"
            {...(script.async_attr !== false ? { async: true } : {})}
            {...(script.defer ? { defer: true } : {})}
          />
        ) : script.content ? (
          <Script
            key={`hs-${i}`}
            id={`head-script-${siteId}-${i}`}
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: script.content }}
          />
        ) : null,
      )}
      <div
        className="flex min-h-screen flex-col"
        style={{
          fontFamily: bodyFont
            ? `${bodyFont}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
            : `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
          '--heading-font': headingFont
            ? `${headingFont}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
            : bodyFont
              ? `${bodyFont}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
              : `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
          background: colors.background,
          // CSS custom properties for branded 404 and child components
          '--brand-primary': colors.primary,
          '--brand-text': colors.text,
          '--brand-bg': colors.background,
        } as React.CSSProperties}
        data-lang={lang}
      >
      {customNavRenderer
        ? customNavRenderer({ ...renderCtx, items: navItems, logoUrl: siteData.branding?.logo_url, businessName: biz?.name, ctaHref })
        : (
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
        )
      }
      <Analytics siteId={siteId} />
      <main className="flex-1">{children}</main>
      {isDraft && (
        <DraftBanner
          createdAt={siteResponse.created_at ?? undefined}
          lang={lang}
          claimToken={siteResponse.claim_token}
          siteId={siteId}
        />
      )}
      {customFooterRenderer
        ? customFooterRenderer({ ...renderCtx, businessName: biz?.name, email: biz?.email, phone: biz?.phone, address: biz?.address, socialLinks: biz?.social_links, navItems })
        : (
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
        )
      }
      {siteResponse.installed_apps?.includes("chat") && (
        <ChatWidget
          siteId={siteId}
          lang={lang}
          accentColor={colors.primary}
        />
      )}
    </div>
    </>
  );
}
