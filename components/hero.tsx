"use client";

import Image from "next/image";
import type { Colors } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import { adjustColor, mixColor } from "@/lib/colors";
import { sanitizeUrl, sanitizeImageUrl } from "@/lib/sanitize";
import { t } from "@/lib/i18n";
import { Reveal } from "./reveal";

export function Hero({
  headline,
  subtitle,
  cta,
  background_image,
  colors,
  theme,
  lang,
  show_cta = true,
  variantStyle,
}: {
  headline: string;
  subtitle?: string;
  cta?: { label: string; href: string } | null;
  background_image?: string | null;
  colors: Colors;
  theme: Theme;
  lang?: string;
  show_cta?: boolean;
  variantStyle: VariantStyle;
}) {
  const bgImg = sanitizeImageUrl(background_image ?? undefined);
  const accentSoft = mixColor(colors.accent, colors.primary, 0.3);
  const isLeft = variantStyle.heroAlign === "left";

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 sm:px-8"
      style={{
        background: bgImg ? "transparent" : colors.primary,
      }}
    >
      {/* Background image with Next.js Image for optimized LCP */}
      {bgImg && (
        <>
          <Image
            src={bgImg}
            alt=""
            fill
            priority
            sizes="100vw"
            quality={75}
            className="object-cover"
          />
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background: "linear-gradient(170deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.5) 100%)",
            }}
          />
        </>
      )}
      {/* Animated gradient mesh (no-image variant) */}
      {!bgImg && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 10% 90%, ${colors.secondary} 0%, transparent 60%),
                radial-gradient(ellipse 60% 80% at 85% 20%, ${adjustColor(colors.primary, 30)} 0%, transparent 50%),
                radial-gradient(ellipse 50% 50% at 50% 50%, ${colors.primary} 0%, transparent 80%),
                linear-gradient(160deg, ${colors.primary} 0%, ${adjustColor(colors.secondary, -25)} 100%)
              `,
            }}
          />
          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
              `,
              backgroundSize: "64px 64px",
            }}
          />
          {/* Large glow orbs */}
          {variantStyle.showDecorations && (
            <>
              <div
                className="absolute -top-40 right-1/4 h-[600px] w-[600px] rounded-full opacity-20 blur-[120px]"
                style={{ background: colors.accent }}
              />
              <div
                className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full opacity-15 blur-[100px]"
                style={{ background: accentSoft }}
              />
              <div
                className="absolute right-0 top-1/3 h-[300px] w-[300px] rounded-full opacity-10 blur-[80px]"
                style={{ background: colors.background }}
              />
            </>
          )}
        </>
      )}

      {/* Content */}
      <div className={`relative z-10 mx-auto max-w-4xl ${isLeft ? "text-left" : "text-center"}`}>
        {/* Optional badge */}
        <Reveal>
          <div className={`mb-8 ${isLeft ? "" : "inline-flex"} items-center gap-2 ${variantStyle.buttonRadius} border border-white/15 bg-white/[0.08] px-4 py-2 text-[13px] font-medium text-white/80 backdrop-blur-sm ${isLeft ? "inline-flex" : ""}`}>
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: colors.accent }}
            />
            {t("hero.badge", lang)}
          </div>
        </Reveal>

        <Reveal delay={60}>
          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
            {headline}
          </h1>
        </Reveal>

        {subtitle && (
          <Reveal delay={140}>
            <p className={`mt-7 text-lg leading-relaxed text-white/70 sm:mt-8 sm:text-xl ${isLeft ? "max-w-2xl" : "mx-auto max-w-2xl"}`}>
              {subtitle}
            </p>
          </Reveal>
        )}

        {show_cta && cta && (
          <Reveal delay={220}>
            <div className={`mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:gap-5 ${isLeft ? "items-start" : "items-center sm:justify-center"}`}>
              <a
                href={sanitizeUrl(cta.href) || "#contact"}
                className={`group inline-flex items-center gap-2.5 ${variantStyle.buttonRadius} px-8 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.03] sm:px-9 sm:py-4.5`}
                style={{
                  background: colors.accent,
                  color: colors.text,
                  boxShadow: `0 4px 20px ${colors.accent}50, 0 2px 8px ${colors.accent}30`,
                }}
              >
                {cta.label}
                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="#about"
                className={`inline-flex items-center gap-2 ${variantStyle.buttonRadius} border border-white/20 bg-white/[0.06] px-7 py-4 text-base font-medium text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/[0.1]`}
              >
                {t("hero.readMore", lang)}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </Reveal>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background: `linear-gradient(to top, ${colors.background} 0%, ${colors.background}80 40%, transparent 100%)`,
        }}
      />

      {/* Scroll indicator */}
      <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center">
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/20 p-1.5">
          <div
            className="h-2 w-1 animate-bounce rounded-full"
            style={{ background: colors.accent }}
          />
        </div>
      </div>
    </section>
  );
}
