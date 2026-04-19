"use client";

import type { Colors, ProcessStep } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import { mixColor } from "@/lib/colors";
import { t } from "@/lib/i18n";
import { Reveal } from "./reveal";
import { SectionWrap } from "./section-wrap";

function TimelineLayout({
  steps,
  colors,
  variantStyle,
}: {
  steps: ProcessStep[];
  colors: Colors;
  variantStyle: VariantStyle;
}) {
  return (
    <div className="relative">
      <div
        className="absolute left-6 top-0 hidden h-full w-px sm:block"
        style={{ background: mixColor(colors.primary, colors.background, 0.8) }}
      />
      <div className="flex flex-col gap-8 sm:gap-10">
        {steps.map((step, i) => {
          const num = step.step_number || i + 1;
          return (
            <Reveal key={i} delay={i * 100}>
              <div className="flex gap-5 sm:gap-8">
                <div
                  className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                    boxShadow: `0 4px 12px ${colors.primary}30`,
                  }}
                >
                  {num}
                </div>
                <div
                  className={`flex-1 ${variantStyle.cardRadius} ${variantStyle.cardBorder ? "border" : ""} p-6 transition-all duration-300 ${variantStyle.hoverEffect} ${variantStyle.cardShadow} sm:p-7`}
                  style={{
                    background: colors.background,
                    ...(variantStyle.cardBorder ? { borderColor: mixColor(colors.text, colors.background, 0.93) } : {}),
                  }}
                >
                  <h3 className="mb-2 text-lg font-semibold" style={{ color: colors.text }}>
                    {step.title}
                  </h3>
                  <p
                    className="text-[15px] leading-relaxed"
                    style={{ color: mixColor(colors.text, colors.background, 0.35) }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function CardsLayout({
  steps,
  colors,
  variantStyle,
}: {
  steps: ProcessStep[];
  colors: Colors;
  variantStyle: VariantStyle;
}) {
  return (
    <div className={`grid gap-5 ${variantStyle.gridCols}`}>
      {steps.map((step, i) => {
        const num = step.step_number || i + 1;
        return (
          <Reveal key={i} delay={i * 80}>
            <div
              className={`h-full ${variantStyle.cardRadius} ${variantStyle.cardBorder ? "border" : ""} ${variantStyle.cardPadding} transition-all duration-300 ${variantStyle.hoverEffect} ${variantStyle.cardShadow}`}
              style={{
                background: colors.background,
                ...(variantStyle.cardBorder ? { borderColor: mixColor(colors.text, colors.background, 0.93) } : {}),
              }}
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center ${variantStyle.iconRadius} text-sm font-bold text-white`}
                style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
              >
                {num}
              </div>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: colors.text }}>
                {step.title}
              </h3>
              <p
                className="text-[15px] leading-relaxed"
                style={{ color: mixColor(colors.text, colors.background, 0.35) }}
              >
                {step.description}
              </p>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

function HorizontalLayout({
  steps,
  colors,
  variantStyle,
}: {
  steps: ProcessStep[];
  colors: Colors;
  variantStyle: VariantStyle;
}) {
  return (
    <div className="relative">
      {/* Horizontal connector line (hidden on mobile) */}
      <div
        className="absolute left-0 right-0 top-7 hidden h-px lg:block"
        style={{ background: mixColor(colors.primary, colors.background, 0.75) }}
      />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => {
          const num = step.step_number || i + 1;
          return (
            <Reveal key={i} delay={i * 100}>
              <div className="relative text-center">
                <div
                  className={`relative z-10 mx-auto mb-5 flex h-14 w-14 items-center justify-center ${variantStyle.iconRadius} text-lg font-bold text-white`}
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                    boxShadow: `0 4px 12px ${colors.primary}30`,
                  }}
                >
                  {num}
                </div>
                <h3 className="mb-2 text-lg font-semibold" style={{ color: colors.text }}>
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: mixColor(colors.text, colors.background, 0.35) }}
                >
                  {step.description}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

export function ProcessSection({
  title,
  subtitle,
  steps,
  colors,
  theme,
  lang,
  variantStyle,
}: {
  title?: string;
  subtitle?: string;
  steps?: ProcessStep[];
  colors: Colors;
  theme: Theme;
  lang?: string;
  variantStyle: VariantStyle;
}) {
  if (!steps?.length) return null;

  const isLeft = variantStyle.headerAlign === "left";
  const maxW = variantStyle.processLayout === "timeline" ? "max-w-4xl" : "max-w-6xl";

  return (
    <SectionWrap theme={theme} bg={colors.background}>
      <div className={`mx-auto ${maxW}`}>
        {title && (
          <Reveal>
            <div className={`mb-16 ${isLeft ? "text-left" : "text-center"}`}>
              <p
                className="mb-3 text-sm font-semibold uppercase tracking-widest"
                style={{ color: colors.primary }}
              >
                {t("section.process", lang)}
              </p>
              <h2
                className={`text-3xl ${theme.heading.weight} ${theme.heading.tracking} sm:text-4xl md:text-5xl`}
                style={{ color: colors.text }}
              >
                {title}
              </h2>
              {subtitle && (
                <p
                  className={`mt-5 max-w-lg text-lg leading-relaxed ${isLeft ? "" : "mx-auto"}`}
                  style={{ color: mixColor(colors.text, colors.background, 0.4) }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </Reveal>
        )}

        {variantStyle.processLayout === "timeline" && (
          <TimelineLayout steps={steps} colors={colors} variantStyle={variantStyle} />
        )}
        {variantStyle.processLayout === "cards" && (
          <CardsLayout steps={steps} colors={colors} variantStyle={variantStyle} />
        )}
        {variantStyle.processLayout === "horizontal" && (
          <HorizontalLayout steps={steps} colors={colors} variantStyle={variantStyle} />
        )}
      </div>
    </SectionWrap>
  );
}
