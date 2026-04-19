"use client";

import type { Colors, CTAButton as CTAButtonType } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import { adjustColor, mixColor } from "@/lib/colors";
import { sanitizeUrl } from "@/lib/sanitize";
import { Reveal } from "./reveal";

function CTAButtonEl({
  button,
  colors,
  variantStyle,
}: {
  button: CTAButtonType;
  colors: Colors;
  variantStyle: VariantStyle;
}) {
  return (
    <a
      href={sanitizeUrl(button.href) || "#contact"}
      className={`group inline-flex items-center gap-2.5 ${variantStyle.buttonRadius} px-9 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.03]`}
      style={{
        background: colors.accent,
        color: colors.text,
        boxShadow: `0 4px 20px ${colors.accent}50, 0 2px 8px ${colors.accent}30`,
      }}
    >
      {button.label}
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
  );
}

function CenteredLayout({
  title,
  text,
  button,
  colors,
  theme,
  variantStyle,
  show_button,
}: {
  title: string;
  text?: string;
  button?: { label: string; href: string } | null;
  colors: Colors;
  theme: Theme;
  variantStyle: VariantStyle;
  show_button: boolean;
}) {
  return (
    <div className="relative z-10 mx-auto max-w-2xl text-center">
      <Reveal>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          {title}
        </h2>
      </Reveal>
      {text && (
        <Reveal delay={80}>
          <p className="mt-6 text-lg leading-relaxed text-white/75">{text}</p>
        </Reveal>
      )}
      {show_button && button && (
        <Reveal delay={160}>
          <div className="mt-10">
            <CTAButtonEl button={button} colors={colors} variantStyle={variantStyle} />
          </div>
        </Reveal>
      )}
    </div>
  );
}

function SplitLayout({
  title,
  text,
  button,
  colors,
  variantStyle,
  show_button,
}: {
  title: string;
  text?: string;
  button?: { label: string; href: string } | null;
  colors: Colors;
  variantStyle: VariantStyle;
  show_button: boolean;
}) {
  return (
    <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 sm:flex-row sm:justify-between">
      <div className="max-w-xl">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
        </Reveal>
        {text && (
          <Reveal delay={80}>
            <p className="mt-4 text-lg leading-relaxed text-white/75">{text}</p>
          </Reveal>
        )}
      </div>
      {show_button && button && (
        <Reveal delay={160}>
          <CTAButtonEl button={button} colors={colors} variantStyle={variantStyle} />
        </Reveal>
      )}
    </div>
  );
}

function MinimalLayout({
  title,
  text,
  button,
  colors,
  variantStyle,
  show_button,
}: {
  title: string;
  text?: string;
  button?: { label: string; href: string } | null;
  colors: Colors;
  variantStyle: VariantStyle;
  show_button: boolean;
}) {
  return (
    <div className="relative z-10 mx-auto max-w-3xl text-center">
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
      </Reveal>
      {text && (
        <Reveal delay={80}>
          <p className="mt-4 text-base leading-relaxed text-white/70">{text}</p>
        </Reveal>
      )}
      {show_button && button && (
        <Reveal delay={160}>
          <div className="mt-8">
            <a
              href={sanitizeUrl(button.href) || "#contact"}
              className={`inline-flex items-center gap-2 ${variantStyle.buttonRadius} border border-white/30 bg-white/10 px-7 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20`}
            >
              {button.label}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </Reveal>
      )}
    </div>
  );
}

export function CTASection({
  title,
  text,
  button,
  colors,
  theme,
  show_button = true,
  variantStyle,
}: {
  title?: string;
  text?: string;
  button?: CTAButtonType | null;
  colors: Colors;
  theme: Theme;
  show_button?: boolean;
  variantStyle: VariantStyle;
}) {
  if (!title) return null;

  return (
    <section
      className={`relative overflow-hidden px-5 sm:px-8 ${theme.sectionPadding}`}
      style={{
        background: colors.primary,
      }}
    >
      {/* Background layers */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 80% 20%, ${adjustColor(colors.primary, 25)} 0%, transparent 60%),
            radial-gradient(ellipse 60% 70% at 20% 80%, ${colors.secondary} 0%, transparent 50%),
            linear-gradient(160deg, ${colors.primary} 0%, ${adjustColor(colors.secondary, -25)} 100%)
          `,
        }}
      />
      {variantStyle.showDecorations && (
        <>
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />
          <div
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-[100px]"
            style={{ background: colors.accent }}
          />
          <div
            className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full opacity-10 blur-[100px]"
            style={{ background: colors.background }}
          />
        </>
      )}

      {variantStyle.ctaLayout === "centered" && (
        <CenteredLayout title={title} text={text} button={button} colors={colors} theme={theme} variantStyle={variantStyle} show_button={show_button} />
      )}
      {variantStyle.ctaLayout === "split" && (
        <SplitLayout title={title} text={text} button={button} colors={colors} variantStyle={variantStyle} show_button={show_button} />
      )}
      {variantStyle.ctaLayout === "minimal" && (
        <MinimalLayout title={title} text={text} button={button} colors={colors} variantStyle={variantStyle} show_button={show_button} />
      )}
    </section>
  );
}
