"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { resolveColors } from "@/lib/colors";
import { getTheme } from "@/lib/themes";
import { getVariantStyle, applyLayoutOverrides } from "@/lib/style-variants";
import type { SiteData } from "@/lib/types";

import { Hero } from "@/components/hero";
import { AboutSection } from "@/components/about-section";
import { FeaturesSection } from "@/components/features-section";
import { StatsSection } from "@/components/stats-section";
import { ServicesSection } from "@/components/services-section";
import { ProcessSection } from "@/components/process-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { TeamSection } from "@/components/team-section";
import { FAQSection } from "@/components/faq-section";
import { CTASection } from "@/components/cta-section";
import { GallerySection } from "@/components/gallery-section";
import { ContactSection } from "@/components/contact-section";
import { PricingSection } from "@/components/pricing-section";
import { VideoSection } from "@/components/video-section";
import { LogoCloudSection } from "@/components/logo-cloud-section";
import { CustomContentSection } from "@/components/custom-content-section";
import { BannerSection } from "@/components/banner-section";
import { RankingSection } from "@/components/ranking-section";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ErrorBoundary } from "@/components/error-boundary";
import { sanitizeFontFamily } from "@/lib/sanitize";
import { buildNavigation } from "@/lib/navigation";
import { resolveVersion, getVersionRenderer } from "@/lib/version-registry";
import type { RenderContext } from "@/lib/version-registry";

interface Props {
  initialData: SiteData;
  siteId: string;
}

const DEFAULT_ORDER = [
  "hero", "about", "features", "stats", "services", "process",
  "gallery", "team", "testimonials", "faq", "cta", "contact",
  "pricing", "video", "logo_cloud", "custom_content", "banner",
  "ranking",
];

export function PreviewShell({ initialData, siteId }: Props) {
  const [data, setData] = useState<SiteData>(initialData);
  const parentOriginRef = useRef<string | null>(null);

  // ------------------------------------------------------------------
  // postMessage: receive SITE_DATA_UPDATE from editor, send back events
  // ------------------------------------------------------------------
  useEffect(() => {
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_EDITOR_ORIGIN,
      process.env.NEXT_PUBLIC_FRONTEND_URL,
      window.location.origin,
    ].filter(Boolean) as string[];

    function handleMessage(event: MessageEvent) {
      if (!allowedOrigins.includes(event.origin)) return;

      if (event.data?.type === "SITE_DATA_UPDATE" && event.data.siteData) {
        if (!parentOriginRef.current) {
          parentOriginRef.current = event.origin;
        }
        setData(event.data.siteData);
      }
    }

    window.addEventListener("message", handleMessage);

    // Tell the parent we're ready to receive data
    const targetOrigin = allowedOrigins[0] || window.location.origin;
    try {
      window.parent.postMessage({ type: "PREVIEW_READY" }, targetOrigin);
    } catch { /* not in iframe */ }

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Notify parent when user clicks a section
  const handleSectionClick = useCallback((section: string) => {
    if (!parentOriginRef.current) return;
    try {
      window.parent.postMessage({ type: "SECTION_CLICKED", section }, parentOriginRef.current);
    } catch { /* ignore */ }
  }, []);

  // ------------------------------------------------------------------
  // Load Google Fonts dynamically when font changes
  // ------------------------------------------------------------------
  useEffect(() => {
    const bodyFont = data.branding?.fonts?.body;
    const headingFont = data.branding?.fonts?.heading;
    const fontsToLoad = new Set<string>();
    if (bodyFont && bodyFont !== "Inter") fontsToLoad.add(bodyFont);
    if (headingFont && headingFont !== "Inter" && headingFont !== bodyFont) fontsToLoad.add(headingFont);

    for (const fontName of fontsToLoad) {
      const safeFont = fontName.replace(/ /g, "+");
      const id = `gfont-${safeFont}`;
      if (document.getElementById(id)) continue;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${safeFont}&display=swap`;
      document.head.appendChild(link);
    }
  }, [data.branding?.fonts?.body, data.branding?.fonts?.heading]);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  const colors = resolveColors(data);
  const theme = getTheme(data.theme);
  const variantStyle = applyLayoutOverrides(
    getVariantStyle(data.style_variant),
    data.nav_style,
    data.footer_style,
  );
  const lang = data.meta?.language || "sv";
  const sectionOrder = (() => {
    const order = data.section_order;
    if (!order || !Array.isArray(order) || order.length === 0) return DEFAULT_ORDER;
    const result = [...order];
    for (const k of DEFAULT_ORDER) {
      if (!result.includes(k)) result.push(k);
    }
    return result;
  })();
  const biz = data.business;
  const navItems = buildNavigation(data, siteId);
  const ctaHref = (biz?.email || biz?.phone || data.contact) ? `/${siteId}/contact` : undefined;

  const getAnim = (key: string) =>
    (data.section_settings?.[key]?.animation as import("@/components/animate").AnimationType) || "fade-up";
  const getGradient = (key: string) =>
    data.section_settings?.[key]?.show_gradient !== false;

  // Check if this site uses a non-v1 version with a dedicated renderer
  const version = resolveVersion(data);
  const versionRenderer = getVersionRenderer(version);

  // Shared font style for both renderers
  // Use backgroundColor (not background shorthand) to avoid hydration mismatch —
  // browsers expand the shorthand into multiple properties which React can't match.
  const fontStyle = {
    fontFamily: sanitizeFontFamily(data.branding?.fonts?.body)
      ? `${sanitizeFontFamily(data.branding?.fonts?.body)}, -apple-system, BlinkMacSystemFont, sans-serif`
      : `Inter, -apple-system, BlinkMacSystemFont, sans-serif`,
    backgroundColor: colors.background,
    minHeight: "100vh",
  };

  if (versionRenderer) {
    // Future versions (v2+) use their own renderer from the version registry
    const ctx: RenderContext = { data, colors, theme, variantStyle, lang, siteId };
    return (
      <div style={fontStyle}>
        <Nav items={navItems} colors={colors} theme={theme} logoUrl={data.branding?.logo_url} businessName={biz?.name} ctaHref={ctaHref} lang={lang} variantStyle={variantStyle} />
        <main>
          {sectionOrder.map((key) => {
            const node = versionRenderer(key, ctx);
            if (!node) return null;
            return (
              <ErrorBoundary sectionName={key} key={key}>
                <div
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("a")) return;
                    e.preventDefault();
                    e.stopPropagation();
                    handleSectionClick(key);
                  }}
                  className="relative cursor-pointer transition-all duration-150 hover:outline hover:outline-2 hover:outline-blue-400/60 hover:outline-offset-[-2px]"
                >
                  <div className="pointer-events-none absolute top-2 right-2 z-50 rounded bg-blue-500 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity [div:hover>&]:opacity-100 shadow-sm">
                    Redigera
                  </div>
                  {node}
                </div>
              </ErrorBoundary>
            );
          })}
        </main>
        <Footer businessName={biz?.name} email={biz?.email} phone={biz?.phone} address={biz?.address} socialLinks={biz?.social_links} navItems={navItems} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} />
      </div>
    );
  }

  // v1 renderer — the original inline rendering
  const renderSection = (key: string) => {
    const sectionData = (data as Record<string, any>)[key];
    if (!sectionData) return null;

    const wrap = (children: React.ReactNode) => (
      <ErrorBoundary sectionName={key} key={key}>
        <div
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) return;
            e.preventDefault();
            e.stopPropagation();
            handleSectionClick(key);
          }}
          className="relative cursor-pointer transition-all duration-150 hover:outline hover:outline-2 hover:outline-blue-400/60 hover:outline-offset-[-2px]"
        >
          <div className="pointer-events-none absolute top-2 right-2 z-50 rounded bg-blue-500 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity [div:hover>&]:opacity-100 shadow-sm">
            Redigera
          </div>
          {children}
        </div>
      </ErrorBoundary>
    );

    switch (key) {
      case "hero":
        return wrap(
          <Hero
            headline={data.hero!.headline}
            subtitle={data.hero!.subtitle}
            cta={data.hero!.cta}
            background_image={data.hero!.background_image}
            show_cta={data.hero!.show_cta}
            fullscreen={data.hero!.fullscreen}
            show_gradient={data.hero!.show_gradient}
            colors={colors}
            theme={theme}
            lang={lang}
            variantStyle={variantStyle}
          />
        );
      case "about":
        return wrap(
          <AboutSection {...data.about!} colors={colors} theme={theme} variant="snippet" siteId={siteId} lang={lang} variantStyle={variantStyle} show_gradient={getGradient("about")} />
        );
      case "features":
        return wrap(
          <FeaturesSection {...data.features!} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} show_gradient={getGradient("features")} />
        );
      case "stats":
        return wrap(
          <StatsSection {...data.stats!} colors={colors} theme={theme} variantStyle={variantStyle} show_gradient={getGradient("stats")} />
        );
      case "services":
        return wrap(
          <ServicesSection {...data.services!} colors={colors} theme={theme} variant="snippet" siteId={siteId} lang={lang} variantStyle={variantStyle} show_gradient={getGradient("services")} />
        );
      case "process":
        return wrap(
          <ProcessSection {...data.process!} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} show_gradient={getGradient("process")} />
        );
      case "gallery":
        return wrap(
          <GallerySection {...data.gallery!} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} />
        );
      case "testimonials":
        return wrap(
          <TestimonialsSection {...data.testimonials!} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} show_gradient={getGradient("testimonials")} />
        );
      case "team":
        return wrap(
          <TeamSection {...data.team!} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} show_gradient={getGradient("team")} />
        );
      case "faq":
        return wrap(
          <FAQSection {...data.faq!} colors={colors} theme={theme} variantStyle={variantStyle} />

        );
      case "cta":
        return wrap(
          <CTASection {...data.cta!} colors={colors} theme={theme} variantStyle={variantStyle} show_gradient={getGradient("cta")} />
        );
      case "contact":
        return wrap(
          <ContactSection
            {...data.contact!}
            email={data.business?.email}
            phone={data.business?.phone}
            address={data.business?.address}
            colors={colors}
            theme={theme}
            lang={lang}
            siteId={siteId}
            variantStyle={variantStyle}
            show_gradient={getGradient("contact")}
          />
        );
      case "pricing":
        return wrap(
          <PricingSection {...data.pricing!} colors={colors} theme={theme} variantStyle={variantStyle} animation={getAnim("pricing")} />
        );
      case "video":
        return wrap(
          <VideoSection {...data.video!} colors={colors} theme={theme} variantStyle={variantStyle} animation={getAnim("video")} />
        );
      case "logo_cloud":
        return wrap(
          <LogoCloudSection {...data.logo_cloud!} colors={colors} theme={theme} variantStyle={variantStyle} animation={getAnim("logo_cloud")} />
        );
      case "custom_content":
        return wrap(
          <CustomContentSection {...data.custom_content!} colors={colors} theme={theme} variantStyle={variantStyle} animation={getAnim("custom_content")} />
        );
      case "banner":
        return wrap(
          <BannerSection {...data.banner!} colors={colors} theme={theme} variantStyle={variantStyle} animation={getAnim("banner")} />
        );
      case "ranking":
        return wrap(
          <RankingSection {...data.ranking!} colors={colors} theme={theme} variantStyle={variantStyle} animation={getAnim("ranking")} />
        );
      default:
        return null;
    }
  };

  return (
    <div style={fontStyle}>
      <Nav items={navItems} colors={colors} theme={theme} logoUrl={data.branding?.logo_url} businessName={biz?.name} ctaHref={ctaHref} lang={lang} variantStyle={variantStyle} />
      <main>{sectionOrder.map(renderSection)}</main>
      <Footer businessName={biz?.name} email={biz?.email} phone={biz?.phone} address={biz?.address} socialLinks={biz?.social_links} navItems={navItems} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} />
    </div>
  );
}
