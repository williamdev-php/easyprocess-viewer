"use client";

import { useEffect, useState, useCallback } from "react";
import { resolveColors } from "@/lib/colors";
import { getTheme } from "@/lib/themes";
import { getVariantStyle } from "@/lib/style-variants";
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
import { ErrorBoundary } from "@/components/error-boundary";
import { t } from "@/lib/i18n";
import { resolveVersion, getVersionRenderer } from "@/lib/version-registry";
import type { RenderContext } from "@/lib/version-registry";

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
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const colors = resolveColors(data);
  const theme = getTheme(data.theme);
  const variantStyle = getVariantStyle(data.style_variant);

  const lang = data.meta?.language || "sv";

  const DEFAULT_ORDER = [
    "hero", "about", "features", "stats", "services", "process",
    "gallery", "team", "testimonials", "faq", "cta", "contact",
  ];
  const sectionOrder = data.section_order ?? DEFAULT_ORDER;

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

  // v1 renderer — the original inline rendering (frozen after production launch)
  const renderSection = (key: string) => {
    switch (key) {
      case "hero":
        return data.hero ? (
          <ErrorBoundary sectionName="hero" key="hero">
            <EditableSection section="hero" isEditing={isEditing}>
              <Hero
                headline={data.hero.headline}
                subtitle={data.hero.subtitle}
                cta={data.hero.cta}
                background_image={data.hero.background_image}
                show_cta={data.hero.show_cta}
                colors={colors}
                theme={theme}
                lang={lang}
                variantStyle={variantStyle}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      case "about":
        return data.about ? (
          <ErrorBoundary sectionName="about" key="about">
            <EditableSection section="about" isEditing={isEditing}>
              <AboutSection
                {...data.about}
                colors={colors}
                theme={theme}
                variant="snippet"
                siteId={siteId}
                lang={lang}
                variantStyle={variantStyle}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      case "features":
        return data.features ? (
          <ErrorBoundary sectionName="features" key="features">
            <EditableSection section="features" isEditing={isEditing}>
              <FeaturesSection
                {...data.features}
                colors={colors}
                theme={theme}
                lang={lang}
                variantStyle={variantStyle}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      case "stats":
        return data.stats ? (
          <ErrorBoundary sectionName="stats" key="stats">
            <EditableSection section="stats" isEditing={isEditing}>
              <StatsSection
                {...data.stats}
                colors={colors}
                theme={theme}
                variantStyle={variantStyle}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      case "services":
        return data.services ? (
          <ErrorBoundary sectionName="services" key="services">
            <EditableSection section="services" isEditing={isEditing}>
              <ServicesSection
                {...data.services}
                colors={colors}
                theme={theme}
                variant="snippet"
                siteId={siteId}
                lang={lang}
                variantStyle={variantStyle}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      case "process":
        return data.process ? (
          <ErrorBoundary sectionName="process" key="process">
            <EditableSection section="process" isEditing={isEditing}>
              <ProcessSection
                {...data.process}
                colors={colors}
                theme={theme}
                lang={lang}
                variantStyle={variantStyle}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      case "gallery":
        return data.gallery ? (
          <ErrorBoundary sectionName="gallery" key="gallery">
            <EditableSection section="gallery" isEditing={isEditing}>
              <GallerySection
                {...data.gallery}
                colors={colors}
                theme={theme}
                lang={lang}
                variantStyle={variantStyle}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      case "testimonials":
        return data.testimonials ? (
          <ErrorBoundary sectionName="testimonials" key="testimonials">
            <EditableSection section="testimonials" isEditing={isEditing}>
              <TestimonialsSection
                {...data.testimonials}
                colors={colors}
                theme={theme}
                lang={lang}
                variantStyle={variantStyle}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      case "team":
        return data.team ? (
          <ErrorBoundary sectionName="team" key="team">
            <EditableSection section="team" isEditing={isEditing}>
              <TeamSection
                {...data.team}
                colors={colors}
                theme={theme}
                lang={lang}
                variantStyle={variantStyle}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      case "faq":
        return data.faq ? (
          <ErrorBoundary sectionName="faq" key="faq">
            <EditableSection section="faq" isEditing={isEditing}>
              <FAQSection
                {...data.faq}
                colors={colors}
                theme={theme}
                variantStyle={variantStyle}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      case "cta":
        return data.cta ? (
          <ErrorBoundary sectionName="cta" key="cta">
            <EditableSection section="cta" isEditing={isEditing}>
              <CTASection
                {...data.cta}
                colors={colors}
                theme={theme}
                variantStyle={variantStyle}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      case "contact":
        return data.contact ? (
          <ErrorBoundary sectionName="contact" key="contact">
            <EditableSection section="contact" isEditing={isEditing}>
              <ContactSection
                {...data.contact}
                email={data.business?.email}
                phone={data.business?.phone}
                address={data.business?.address}
                colors={colors}
                theme={theme}
                lang={lang}
                siteId={siteId}
                variantStyle={variantStyle}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      default:
        return null;
    }
  };

  return <>{sectionOrder.map(renderSection)}</>;
}
