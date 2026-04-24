/**
 * Shared section renderer used by both:
 *  - live-preview-wrapper.tsx (home page)
 *  - dynamic-page-renderer.tsx (multi-page)
 *  - preview-shell.tsx (editor preview)
 *
 * Renders a single section by type using the component library.
 */

import type { ReactNode } from "react";
import type { SiteData, Colors } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import type { AnimationType } from "@/components/animate";

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

export interface SectionRenderContext {
  colors: Colors;
  theme: Theme;
  variantStyle: VariantStyle;
  lang: string;
  siteId: string;
  data: SiteData;
}

/**
 * Render a single section by type with provided data.
 * Returns null for unknown section types.
 */
export function renderSectionByType(
  type: string,
  sectionData: Record<string, unknown>,
  ctx: SectionRenderContext,
  opts?: { animation?: AnimationType; showGradient?: boolean },
): ReactNode | null {
  const { colors, theme, variantStyle, lang, siteId, data } = ctx;
  const anim = opts?.animation ?? "fade-up";
  const showGradient = opts?.showGradient ?? true;

  switch (type) {
    case "hero":
      return (
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
      return (
        <AboutSection
          {...(sectionData as any)}
          colors={colors}
          theme={theme}
          variant="snippet"
          siteId={siteId}
          lang={lang}
          variantStyle={variantStyle}
          show_gradient={showGradient}
        />
      );
    case "features":
      return <FeaturesSection {...(sectionData as any)} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} show_gradient={showGradient} />;
    case "stats":
      return <StatsSection {...(sectionData as any)} colors={colors} theme={theme} variantStyle={variantStyle} show_gradient={showGradient} />;
    case "services":
      return <ServicesSection {...(sectionData as any)} colors={colors} theme={theme} variant="snippet" siteId={siteId} lang={lang} variantStyle={variantStyle} show_gradient={showGradient} />;
    case "process":
      return <ProcessSection {...(sectionData as any)} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} show_gradient={showGradient} />;
    case "gallery":
      return <GallerySection {...(sectionData as any)} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} />;
    case "testimonials":
      return <TestimonialsSection {...(sectionData as any)} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} show_gradient={showGradient} />;
    case "team":
      return <TeamSection {...(sectionData as any)} colors={colors} theme={theme} lang={lang} variantStyle={variantStyle} show_gradient={showGradient} />;
    case "faq":
      return <FAQSection {...(sectionData as any)} colors={colors} theme={theme} variantStyle={variantStyle} />;
    case "cta":
      return <CTASection {...(sectionData as any)} colors={colors} theme={theme} variantStyle={variantStyle} show_gradient={showGradient} />;
    case "contact":
      return (
        <ContactSection
          {...(sectionData as any)}
          email={data.business?.email}
          phone={data.business?.phone}
          address={data.business?.address}
          colors={colors}
          theme={theme}
          lang={lang}
          siteId={siteId}
          variantStyle={variantStyle}
          show_gradient={showGradient}
        />
      );
    case "pricing":
      return <PricingSection {...(sectionData as any)} colors={colors} theme={theme} variantStyle={variantStyle} animation={anim} />;
    case "video":
      return <VideoSection {...(sectionData as any)} colors={colors} theme={theme} variantStyle={variantStyle} animation={anim} />;
    case "logo_cloud":
      return <LogoCloudSection {...(sectionData as any)} colors={colors} theme={theme} variantStyle={variantStyle} animation={anim} />;
    case "custom_content":
      return <CustomContentSection {...(sectionData as any)} colors={colors} theme={theme} variantStyle={variantStyle} animation={anim} />;
    case "banner":
      return <BannerSection {...(sectionData as any)} colors={colors} theme={theme} variantStyle={variantStyle} animation={anim} />;
    case "ranking":
      return <RankingSection {...(sectionData as any)} colors={colors} theme={theme} variantStyle={variantStyle} animation={anim} />;
    default:
      return null;
  }
}
