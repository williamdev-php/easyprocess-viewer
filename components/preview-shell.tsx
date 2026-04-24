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
import { PageContentSection } from "@/components/page-content-section";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ErrorBoundary } from "@/components/error-boundary";
import { sanitizeFontFamily } from "@/lib/sanitize";
import { buildNavigation } from "@/lib/navigation";
import { resolveVersion, getVersionRenderer } from "@/lib/version-registry";
import type { RenderContext } from "@/lib/version-registry";
import { renderSectionByType } from "@/lib/section-renderer";
import { PageHeader } from "@/components/page-header";

interface Props {
  initialData: SiteData;
  siteId: string;
}

const DEFAULT_ORDER = [
  "hero", "about", "features", "stats", "services", "process",
  "gallery", "team", "testimonials", "faq", "cta", "contact",
  "pricing", "video", "logo_cloud", "custom_content", "banner",
  "ranking", "page_content",
];

export function PreviewShell({ initialData, siteId }: Props) {
  const [data, setData] = useState<SiteData>(initialData);
  const [activePage, setActivePage] = useState<string | null>(null);
  const parentOriginRef = useRef<string | null>(null);

  // ------------------------------------------------------------------
  // postMessage: receive SITE_DATA_UPDATE from editor, send back events
  // ------------------------------------------------------------------
  useEffect(() => {
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_EDITOR_ORIGIN,
      process.env.NEXT_PUBLIC_FRONTEND_URL,
      "https://qvicko.com",
      "https://www.qvicko.com",
      "https://qvicko.se",
      "https://www.qvicko.se",
      window.location.origin,
    ].filter(Boolean) as string[];

    function isAllowedOrigin(origin: string) {
      if (allowedOrigins.includes(origin)) return true;
      // Allow localhost on any port for local development
      if (origin.startsWith("http://localhost:")) return true;
      return false;
    }

    function handleMessage(event: MessageEvent) {
      if (!isAllowedOrigin(event.origin)) return;

      if (event.data?.type === "SITE_DATA_UPDATE" && event.data.siteData) {
        if (!parentOriginRef.current) {
          parentOriginRef.current = event.origin;
        }
        setData(event.data.siteData);
        // Handle active page for multi-page preview
        if ("activePage" in event.data) {
          setActivePage(event.data.activePage ?? null);
        }
      }
    }

    window.addEventListener("message", handleMessage);

    // Send PREVIEW_READY to the parent. Use document.referrer to find
    // the actual parent origin, falling back to "*" so it always arrives.
    let targetOrigin = "*";
    try {
      if (document.referrer) {
        const referrerOrigin = new URL(document.referrer).origin;
        if (isAllowedOrigin(referrerOrigin)) {
          targetOrigin = referrerOrigin;
        }
      }
    } catch { /* ignore malformed referrer */ }

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
      const sanitized = sanitizeFontFamily(fontName);
      if (!sanitized) continue;
      const safeFont = sanitized.replace(/ /g, "+");
      const id = `gfont-${safeFont}`;
      if (document.getElementById(id)) continue;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(sanitized)}&display=swap`;
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
  const isProduction = process.env.NODE_ENV === "production";
  const base = isProduction ? "" : `/${siteId}`;
  const ctaHref = (biz?.email || biz?.phone || data.contact) ? `${base}/contact` : undefined;

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

  // Helper: resolve section type and data for a key (supports duplicates)
  const resolveSection = (key: string): { type: string; sectionData: Record<string, unknown> } | null => {
    if (key.includes("__dup_")) {
      const extra = data.extra_sections?.[key];
      if (!extra?.type || !extra?.data) return null;
      return { type: extra.type, sectionData: extra.data as Record<string, unknown> };
    }
    const sectionData = (data as Record<string, unknown>)[key];
    if (!sectionData || typeof sectionData !== "object") return null;
    return { type: key, sectionData: sectionData as Record<string, unknown> };
  };

  // v1 renderer — the original inline rendering
  const renderSection = (key: string) => {
    const resolved = resolveSection(key);
    if (!resolved) return null;
    const { type, sectionData } = resolved;

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

    switch (type) {
      case "hero":
        return wrap(
          <Hero
            headline={(sectionData as any).headline}
            subtitle={(sectionData as any).subtitle}
            cta={(sectionData as any).cta}
            background_image={(sectionData as any).background_image}
            show_cta={(sectionData as any).show_cta}
            fullscreen={(sectionData as any).fullscreen}
            show_gradient={(sectionData as any).show_gradient}
            colors={colors}
            theme={theme}
            lang={lang}
            variantStyle={variantStyle}
          />
        );
      case "about":
        return wrap(
          <AboutSection {...sectionData as any} colors={colors} theme={theme} variant="snippet" siteId={siteId} lang={lang} variantStyle={variantStyle} show_gradient={getGradient(key)} />
        );
      case "features":
        return wrap(
          <FeaturesSection {...sectionData as any} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} show_gradient={getGradient(key)} />
        );
      case "stats":
        return wrap(
          <StatsSection {...sectionData as any} colors={colors} theme={theme} variantStyle={variantStyle} show_gradient={getGradient(key)} />
        );
      case "services":
        return wrap(
          <ServicesSection {...sectionData as any} colors={colors} theme={theme} variant="snippet" siteId={siteId} lang={lang} variantStyle={variantStyle} show_gradient={getGradient(key)} />
        );
      case "process":
        return wrap(
          <ProcessSection {...sectionData as any} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} show_gradient={getGradient(key)} />
        );
      case "gallery":
        return wrap(
          <GallerySection {...sectionData as any} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} />
        );
      case "testimonials":
        return wrap(
          <TestimonialsSection {...sectionData as any} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} show_gradient={getGradient(key)} />
        );
      case "team":
        return wrap(
          <TeamSection {...sectionData as any} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} show_gradient={getGradient(key)} />
        );
      case "faq":
        return wrap(
          <FAQSection {...sectionData as any} colors={colors} theme={theme} variantStyle={variantStyle} />
        );
      case "cta":
        return wrap(
          <CTASection {...sectionData as any} colors={colors} theme={theme} variantStyle={variantStyle} show_gradient={getGradient(key)} />
        );
      case "contact":
        return wrap(
          <ContactSection
            {...sectionData as any}
            email={data.business?.email}
            phone={data.business?.phone}
            address={data.business?.address}
            colors={colors}
            theme={theme}
            lang={lang}
            siteId={siteId}
            variantStyle={variantStyle}
            show_gradient={getGradient(key)}
          />
        );
      case "pricing":
        return wrap(
          <PricingSection {...sectionData as any} colors={colors} theme={theme} variantStyle={variantStyle} animation={getAnim(key)} />
        );
      case "video":
        return wrap(
          <VideoSection {...sectionData as any} colors={colors} theme={theme} variantStyle={variantStyle} animation={getAnim(key)} />
        );
      case "logo_cloud":
        return wrap(
          <LogoCloudSection {...sectionData as any} colors={colors} theme={theme} variantStyle={variantStyle} animation={getAnim(key)} />
        );
      case "custom_content":
        return wrap(
          <CustomContentSection {...sectionData as any} colors={colors} theme={theme} variantStyle={variantStyle} animation={getAnim(key)} />
        );
      case "banner":
        return wrap(
          <BannerSection {...sectionData as any} colors={colors} theme={theme} variantStyle={variantStyle} animation={getAnim(key)} />
        );
      case "ranking":
        return wrap(
          <RankingSection {...sectionData as any} colors={colors} theme={theme} variantStyle={variantStyle} animation={getAnim(key)} />
        );
      case "page_content":
        return wrap(
          <PageContentSection {...sectionData as any} colors={colors} theme={theme} variantStyle={variantStyle} animation={getAnim(key)} />
        );
      default:
        return null;
    }
  };

  // Resolve active page for multi-page preview
  const activePageObj = activePage ? data.pages?.find(p => {
    if (activePage.includes("/")) {
      const [parent, slug] = activePage.split("/");
      return p.parent_slug === parent && p.slug === slug;
    }
    return p.slug === activePage && !p.parent_slug;
  }) : null;

  const renderPageSections = () => {
    if (!activePageObj) return null;
    const ctx = { colors, theme, variantStyle, lang, siteId, data };
    return (
      <>
        {activePageObj.sections.map((section, i) => {
          const node = renderSectionByType(section.type, section.data, ctx);
          if (!node) return null;
          return (
            <ErrorBoundary sectionName={`${section.type}-${i}`} key={`${section.type}-${i}`}>
              <div
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("a")) return;
                  e.preventDefault();
                  e.stopPropagation();
                  handleSectionClick(`__page_sec_${i}`);
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
      </>
    );
  };

  return (
    <div style={fontStyle}>
      <Nav items={navItems} colors={colors} theme={theme} logoUrl={data.branding?.logo_url} businessName={biz?.name} ctaHref={ctaHref} lang={lang} variantStyle={variantStyle} />
      <main>{activePageObj ? renderPageSections() : sectionOrder.map(renderSection)}</main>
      <Footer businessName={biz?.name} email={biz?.email} phone={biz?.phone} address={biz?.address} socialLinks={biz?.social_links} navItems={navItems} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} />
    </div>
  );
}
