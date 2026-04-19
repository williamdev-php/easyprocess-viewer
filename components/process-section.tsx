"use client";

import type { Colors, ProcessStep } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import { mixColor } from "@/lib/colors";
import { t } from "@/lib/i18n";
import { Reveal } from "./reveal";
import { SectionWrap } from "./section-wrap";

export function ProcessSection({
  title,
  subtitle,
  steps,
  colors,
  theme,
  lang,
}: {
  title?: string;
  subtitle?: string;
  steps?: ProcessStep[];
  colors: Colors;
  theme: Theme;
  lang?: string;
}) {
  if (!steps?.length) return null;

  return (
    <SectionWrap theme={theme} bg={colors.background}>
      <div className="mx-auto max-w-4xl">
        {title && (
          <Reveal>
            <div className="mb-16 text-center">
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
                  className="mx-auto mt-5 max-w-lg text-lg leading-relaxed"
                  style={{ color: mixColor(colors.text, colors.background, 0.4) }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </Reveal>
        )}

        <div className="relative">
          {/* Vertical line */}
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
                    {/* Step number */}
                    <div
                      className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                        boxShadow: `0 4px 12px ${colors.primary}30`,
                      }}
                    >
                      {num}
                    </div>

                    {/* Content */}
                    <div
                      className="flex-1 rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5 sm:p-7"
                      style={{
                        background: colors.background,
                        borderColor: mixColor(colors.text, colors.background, 0.93),
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      }}
                    >
                      <h3
                        className="mb-2 text-lg font-semibold"
                        style={{ color: colors.text }}
                      >
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
      </div>
    </SectionWrap>
  );
}
