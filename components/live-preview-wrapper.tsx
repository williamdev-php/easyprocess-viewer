"use client";

import { useEffect, useState, useCallback } from "react";
import { resolveColors } from "@/lib/colors";
import { getTheme } from "@/lib/themes";
import { getVariantStyle, applyLayoutOverrides } from "@/lib/style-variants";
import type { SiteData } from "@/lib/types";
import dynamic from "next/dynamic";
import { Hero } from "@/components/hero";

const AboutSection = dynamic(() => import("@/components/about-section").then(m => ({ default: m.AboutSection })));
const FeaturesSection = dynamic(() => import("@/components/features-section").then(m => ({ default: m.FeaturesSection })));
const StatsSection = dynamic(() => import("@/components/stats-section").then(m => ({ default: m.StatsSection })));
const ServicesSection = dynamic(() => import("@/components/services-section").then(m => ({ default: m.ServicesSection })));
const ProcessSection = dynamic(() => import("@/components/process-section").then(m => ({ default: m.ProcessSection })));
const TestimonialsSection = dynamic(() => import("@/components/testimonials-section").then(m => ({ default: m.TestimonialsSection })));
const TeamSection = dynamic(() => import("@/components/team-section").then(m => ({ default: m.TeamSection })));
const FAQSection = dynamic(() => import("@/components/faq-section").then(m => ({ default: m.FAQSection })));
const CTASection = dynamic(() => import("@/components/cta-section").then(m => ({ default: m.CTASection })));
const GallerySection = dynamic(() => import("@/components/gallery-section").then(m => ({ default: m.GallerySection })));
const ContactSection = dynamic(() => import("@/components/contact-section").then(m => ({ default: m.ContactSection })));
const PricingSection = dynamic(() => import("@/components/pricing-section").then(m => ({ default: m.PricingSection })));
const VideoSection = dynamic(() => import("@/components/video-section").then(m => ({ default: m.VideoSection })));
const LogoCloudSection = dynamic(() => import("@/components/logo-cloud-section").then(m => ({ default: m.LogoCloudSection })));
const CustomContentSection = dynamic(() => import("@/components/custom-content-section").then(m => ({ default: m.CustomContentSection })));
const BannerSection = dynamic(() => import("@/components/banner-section").then(m => ({ default: m.BannerSection })));
const RankingSection = dynamic(() => import("@/components/ranking-section").then(m => ({ default: m.RankingSection })));
import { ErrorBoundary } from "@/components/error-boundary";
import { t } from "@/lib/i18n";
import { resolveVersion, getVersionRenderer } from "@/lib/version-registry";
import type { RenderContext } from "@/lib/version-registry";
import { renderSectionByType } from "@/lib/section-renderer";
import { PageHeader } from "@/components/page-header";

interface Props {
  initialData: SiteData;
  siteId: string;
}

function EditableSection({
  section,
  isEditing,
  children,
}: {
  section: string;
  isEditing: boolean;
  children: React.ReactNode;
}) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isEditing) return;
      // Don't hijack link clicks
      if ((e.target as HTMLElement).closest("a")) return;
      e.preventDefault();
      e.stopPropagation();
      const targetOrigin = process.env.NEXT_PUBLIC_EDITOR_ORIGIN || window.location.origin;
      window.parent.postMessage({ type: "SECTION_CLICKED", section }, targetOrigin);
    },
    [section, isEditing]
  );

  if (!isEditing) return <>{children}</>;

  return (
    <div
      onClick={handleClick}
      className="relative cursor-pointer transition-all duration-150 hover:outline hover:outline-2 hover:outline-blue-400/60 hover:outline-offset-[-2px] hover:rounded"
    >
      {/* Hover label */}
      <div className="pointer-events-none absolute top-2 right-2 z-50 rounded bg-blue-500 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity [div:hover>&]:opacity-100 shadow-sm">
        {t("editor.edit")}
      </div>
      {children}
    </div>
  );
}

export function LivePreviewWrapper({ initialData, siteId }: Props) {
  const [data, setData] = useState<SiteData>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [activePage, setActivePage] = useState<string | null>(null);

  useEffect(() => {
    // Detect if we're inside an iframe (editor mode)
    setIsEditing(window !== window.parent);

    // Allowed editor origins for postMessage validation.
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_EDITOR_ORIGIN,
      window.location.origin,
    ].filter(Boolean) as string[];

    function handleMessage(event: MessageEvent) {
      // Only accept messages from known editor origins to prevent XSS.
      if (!allowedOrigins.includes(event.origin)) return;

      if (event.data?.type === "SITE_DATA_UPDATE" && event.data.siteData) {
        setData(event.data.siteData);
        if ("activePage" in event.data) {
          setActivePage(event.data.activePage ?? null);
        }
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const colors = resolveColors(data);
  const theme = getTheme(data.theme);
  const variantStyle = applyLayoutOverrides(
    getVariantStyle(data.style_variant),
    data.nav_style,
    data.footer_style,
  );

  const lang = data.meta?.language || "sv";

  const DEFAULT_ORDER = [
    "hero", "about", "features", "stats", "services", "process",
    "gallery", "team", "testimonials", "faq", "cta", "contact",
    "pricing", "video", "logo_cloud", "custom_content", "banner",
    "ranking",
  ];
  const sectionOrder = (() => {
    const order = data.section_order;
    if (!order || !Array.isArray(order) || order.length === 0) return DEFAULT_ORDER;
    const result = [...order];
    for (const k of DEFAULT_ORDER) {
      if (!result.includes(k)) result.push(k);
    }
    return result;
  })();

  // Helper to get animation for a section from section_settings
  const getAnim = (key: string) =>
    (data.section_settings?.[key]?.animation as import("@/components/animate").AnimationType) || "fade-up";
  const getGradient = (key: string) =>
    data.section_settings?.[key]?.show_gradient !== false;

  // Check if this site uses a non-v1 version with a dedicated renderer
  const version = resolveVersion(data);
  const versionRenderer = getVersionRenderer(version);

  if (versionRenderer) {
    // Future versions (v2+) use their own renderer from the version registry
    const ctx: RenderContext = { data, colors, theme, variantStyle, lang, siteId };
    return (
      <>
        {sectionOrder.map((key) => {
          const node = versionRenderer(key, ctx);
          if (!node) return null;
          return (
            <ErrorBoundary sectionName={key} key={key}>
              <EditableSection section={key} isEditing={isEditing}>
                {node}
              </EditableSection>
            </ErrorBoundary>
          );
        })}
      </>
    );
  }

  // Helper: resolve section type and data for a key (supports duplicates)
  const resolveSection = (key: string): { type: string; sectionData: Record<string, unknown> } | null => {
    // Duplicate section: "about__dup_1700000000"
    if (key.includes("__dup_")) {
      const extra = data.extra_sections?.[key];
      if (!extra?.type || !extra?.data) return null;
      return { type: extra.type, sectionData: extra.data as Record<string, unknown> };
    }
    // Regular section
    const sectionData = (data as Record<string, unknown>)[key];
    if (!sectionData || typeof sectionData !== "object") return null;
    return { type: key, sectionData: sectionData as Record<string, unknown> };
  };

  // v1 renderer — the original inline rendering (frozen after production launch)
  const renderSection = (key: string) => {
    const resolved = resolveSection(key);
    if (!resolved) return null;
    const { type, sectionData } = resolved;

    const wrap = (children: React.ReactNode) => (
      <ErrorBoundary sectionName={key} key={key}>
        <EditableSection section={key} isEditing={isEditing}>
          {children}
        </EditableSection>
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
          <AboutSection
            {...sectionData as any}
            colors={colors}
            theme={theme}
            variant="snippet"
            siteId={siteId}
            lang={lang}
            variantStyle={variantStyle}
            show_gradient={getGradient(key)}
          />
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
      default:
        return null;
    }
  };

  // Multi-page preview: if activePage is set, render that page's sections
  if (activePage && data.pages?.length) {
    const pageObj = data.pages.find(p => {
      if (activePage.includes("/")) {
        const [parent, slug] = activePage.split("/");
        return p.parent_slug === parent && p.slug === slug;
      }
      return p.slug === activePage && !p.parent_slug;
    });
    if (pageObj) {
      const ctx = { colors, theme, variantStyle, lang, siteId, data };
      return (
        <>
          {pageObj.sections.map((section, i) => {
            const node = renderSectionByType(section.type, section.data, ctx);
            if (!node) return null;
            return (
              <ErrorBoundary sectionName={`${section.type}-${i}`} key={`${section.type}-${i}`}>
                <EditableSection section={`__page_sec_${i}`} isEditing={isEditing}>
                  {node}
                </EditableSection>
              </ErrorBoundary>
            );
          })}
        </>
      );
    }
  }

  return <>{sectionOrder.map(renderSection)}</>;
}
