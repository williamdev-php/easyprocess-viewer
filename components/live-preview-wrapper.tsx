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
                fullscreen={data.hero.fullscreen}
                show_gradient={data.hero.show_gradient}
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
                show_gradient={getGradient("about")}
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
                show_gradient={getGradient("features")}
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
                show_gradient={getGradient("stats")}
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
                show_gradient={getGradient("services")}
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
                show_gradient={getGradient("process")}
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
                show_gradient={getGradient("testimonials")}
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
                show_gradient={getGradient("team")}
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
                show_gradient={getGradient("cta")}
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
                show_gradient={getGradient("contact")}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      case "pricing":
        return data.pricing ? (
          <ErrorBoundary sectionName="pricing" key="pricing">
            <EditableSection section="pricing" isEditing={isEditing}>
              <PricingSection
                {...data.pricing}
                colors={colors}
                theme={theme}
                variantStyle={variantStyle}
                animation={getAnim("pricing")}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      case "video":
        return data.video ? (
          <ErrorBoundary sectionName="video" key="video">
            <EditableSection section="video" isEditing={isEditing}>
              <VideoSection
                {...data.video}
                colors={colors}
                theme={theme}
                variantStyle={variantStyle}
                animation={getAnim("video")}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      case "logo_cloud":
        return data.logo_cloud ? (
          <ErrorBoundary sectionName="logo_cloud" key="logo_cloud">
            <EditableSection section="logo_cloud" isEditing={isEditing}>
              <LogoCloudSection
                {...data.logo_cloud}
                colors={colors}
                theme={theme}
                variantStyle={variantStyle}
                animation={getAnim("logo_cloud")}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      case "custom_content":
        return data.custom_content ? (
          <ErrorBoundary sectionName="custom_content" key="custom_content">
            <EditableSection section="custom_content" isEditing={isEditing}>
              <CustomContentSection
                {...data.custom_content}
                colors={colors}
                theme={theme}
                variantStyle={variantStyle}
                animation={getAnim("custom_content")}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      case "banner":
        return data.banner ? (
          <ErrorBoundary sectionName="banner" key="banner">
            <EditableSection section="banner" isEditing={isEditing}>
              <BannerSection
                {...data.banner}
                colors={colors}
                theme={theme}
                variantStyle={variantStyle}
                animation={getAnim("banner")}
              />
            </EditableSection>
          </ErrorBoundary>
        ) : null;
      case "ranking":
        return data.ranking ? (
          <ErrorBoundary sectionName="ranking" key="ranking">
            <EditableSection section="ranking" isEditing={isEditing}>
              <RankingSection
                {...data.ranking}
                colors={colors}
                theme={theme}
                variantStyle={variantStyle}
                animation={getAnim("ranking")}
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
