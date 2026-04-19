"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { resolveColors } from "@/lib/colors";
import { getTheme } from "@/lib/themes";
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
    function handleMessage(event: MessageEvent) {
      // Accept SITE_DATA_UPDATE from any origin — this page only runs
      // inside the editor iframe so there is no risk. We remember the
      // first origin that sends a valid message so we can reply to it.
      if (event.data?.type === "SITE_DATA_UPDATE" && event.data.siteData) {
        if (!parentOriginRef.current) {
          parentOriginRef.current = event.origin;
        }
        setData(event.data.siteData);
      }
    }

    window.addEventListener("message", handleMessage);

    // Tell the parent we're ready to receive data
    try {
      window.parent.postMessage({ type: "PREVIEW_READY" }, "*");
    } catch { /* not in iframe */ }

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Notify parent when user clicks a section
  const handleSectionClick = useCallback((section: string) => {
    const origin = parentOriginRef.current || "*";
    try {
      window.parent.postMessage({ type: "SECTION_CLICKED", section }, origin);
    } catch { /* ignore */ }
  }, []);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  const colors = resolveColors(data);
  const theme = getTheme(data.theme);
  const lang = data.meta?.language || "sv";
  const sectionOrder = data.section_order ?? DEFAULT_ORDER;

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
          />
        );
      case "about":
        return wrap(
          <AboutSection {...data.about!} colors={colors} theme={theme} variant="snippet" siteId={siteId} lang={lang} />
        );
      case "features":
        return wrap(
          <FeaturesSection {...data.features!} colors={colors} theme={theme} lang={lang} />
        );
      case "stats":
        return wrap(
          <StatsSection {...data.stats!} colors={colors} theme={theme} />
        );
      case "services":
        return wrap(
          <ServicesSection {...data.services!} colors={colors} theme={theme} variant="snippet" siteId={siteId} lang={lang} />
        );
      case "process":
        return wrap(
          <ProcessSection {...data.process!} colors={colors} theme={theme} lang={lang} />
        );
      case "gallery":
        return wrap(
          <GallerySection {...data.gallery!} colors={colors} theme={theme} lang={lang} />
        );
      case "testimonials":
        return wrap(
          <TestimonialsSection {...data.testimonials!} colors={colors} theme={theme} lang={lang} />
        );
      case "team":
        return wrap(
          <TeamSection {...data.team!} colors={colors} theme={theme} lang={lang} />
        );
      case "faq":
        return wrap(
          <FAQSection {...data.faq!} colors={colors} theme={theme} />
        );
      case "cta":
        return wrap(
          <CTASection {...data.cta!} colors={colors} theme={theme} />
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        fontFamily: data.branding?.fonts?.body
          ? `${data.branding.fonts.body}, -apple-system, BlinkMacSystemFont, sans-serif`
          : `Inter, -apple-system, BlinkMacSystemFont, sans-serif`,
        background: colors.background,
        minHeight: "100vh",
      }}
    >
      {sectionOrder.map(renderSection)}
    </div>
  );
}
