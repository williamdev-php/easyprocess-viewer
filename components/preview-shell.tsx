"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { resolveColors } from "@/lib/colors";
import { getTheme } from "@/lib/themes";
import { getVariantStyle } from "@/lib/style-variants";
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
import { ErrorBoundary } from "@/components/error-boundary";
import { sanitizeFontFamily } from "@/lib/sanitize";
import { resolveVersion, getVersionRenderer } from "@/lib/version-registry";
import type { RenderContext } from "@/lib/version-registry";

interface Props {
  initialData: SiteData;
  siteId: string;
}

const DEFAULT_ORDER = [
  "hero", "about", "features", "stats", "services", "process",
  "gallery", "team", "testimonials", "faq", "cta", "contact",
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
  // Render
  // ------------------------------------------------------------------
  const colors = resolveColors(data);
  const theme = getTheme(data.theme);
  const variantStyle = getVariantStyle(data.style_variant);
  const lang = data.meta?.language || "sv";
  const sectionOrder = data.section_order ?? DEFAULT_ORDER;

  // Check if this site uses a non-v1 version with a dedicated renderer
  const version = resolveVersion(data);
  const versionRenderer = getVersionRenderer(version);

  if (versionRenderer) {
    // Future versions (v2+) use their own renderer from the version registry
    const ctx: RenderContext = { data, colors, theme, variantStyle, lang, siteId };
    return (
      <div
        style={{
          fontFamily: sanitizeFontFamily(data.branding?.fonts?.body)
            ? `${sanitizeFontFamily(data.branding?.fonts?.body)}, -apple-system, BlinkMacSystemFont, sans-serif`
            : `Inter, -apple-system, BlinkMacSystemFont, sans-serif`,
          background: colors.background,
          minHeight: "100vh",
        }}
      >
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
      </div>
    );
  }

  // v1 renderer — the original inline rendering (frozen after production launch)
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
            colors={colors}
            theme={theme}
            lang={lang}
            variantStyle={variantStyle}
          />
        );
      case "about":
        return wrap(
          <AboutSection {...data.about!} colors={colors} theme={theme} variant="snippet" siteId={siteId} lang={lang} variantStyle={variantStyle} />
        );
      case "features":
        return wrap(
          <FeaturesSection {...data.features!} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} />
        );
      case "stats":
        return wrap(
          <StatsSection {...data.stats!} colors={colors} theme={theme} variantStyle={variantStyle} />
        );
      case "services":
        return wrap(
          <ServicesSection {...data.services!} colors={colors} theme={theme} variant="snippet" siteId={siteId} lang={lang} variantStyle={variantStyle} />
        );
      case "process":
        return wrap(
          <ProcessSection {...data.process!} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} />
        );
      case "gallery":
        return wrap(
          <GallerySection {...data.gallery!} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} />
        );
      case "testimonials":
        return wrap(
          <TestimonialsSection {...data.testimonials!} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} />
        );
      case "team":
        return wrap(
          <TeamSection {...data.team!} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} />
        );
      case "faq":
        return wrap(
          <FAQSection {...data.faq!} colors={colors} theme={theme} variantStyle={variantStyle} />
        );
      case "cta":
        return wrap(
          <CTASection {...data.cta!} colors={colors} theme={theme} variantStyle={variantStyle} />
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        fontFamily: sanitizeFontFamily(data.branding?.fonts?.body)
          ? `${sanitizeFontFamily(data.branding?.fonts?.body)}, -apple-system, BlinkMacSystemFont, sans-serif`
          : `Inter, -apple-system, BlinkMacSystemFont, sans-serif`,
        background: colors.background,
        minHeight: "100vh",
      }}
    >
      {sectionOrder.map(renderSection)}
    </div>
  );
}
