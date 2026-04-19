"use client";

import type { Colors, FeatureItem } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import { mixColor } from "@/lib/colors";
import { t } from "@/lib/i18n";
import { Reveal } from "./reveal";
import { SectionWrap } from "./section-wrap";

const FEATURE_ICONS = [
  "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  "M21 8.25c0 2.485-2.099 4.5-4.688 4.5-1.935 0-3.597-1.126-4.312-2.733-.715 1.607-2.377 2.733-4.313 2.733C5.1 12.75 3 10.735 3 8.25 3 5.765 5.1 3.75 7.688 3.75c1.935 0 3.597 1.126 4.312 2.733.715-1.607 2.377-2.733 4.313-2.733C18.9 3.75 21 5.765 21 8.25z",
  "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
  "M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z",
  "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
];

function FeatureIcon({ index, colors, variantStyle }: { index: number; colors: Colors; variantStyle: VariantStyle }) {
  return (
    <div
      className={`mb-5 flex items-center justify-center ${variantStyle.iconRadius} ${variantStyle.iconSize}`}
      style={{
        background: `linear-gradient(135deg, ${mixColor(colors.primary, colors.background, 0.88)}, ${mixColor(colors.accent, colors.background, 0.85)})`,
      }}
    >
      <svg
        className="h-5 w-5"
        style={{ color: colors.primary }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={FEATURE_ICONS[index % FEATURE_ICONS.length]}
        />
      </svg>
    </div>
  );
}

export function FeaturesSection({
  title,
  subtitle,
  items,
  colors,
  theme,
  lang,
  variantStyle,
}: {
  title?: string;
  subtitle?: string;
  items?: FeatureItem[];
  colors: Colors;
  theme: Theme;
  lang?: string;
  variantStyle: VariantStyle;
}) {
  if (!items?.length) return null;

  const isLeft = variantStyle.headerAlign === "left";
  const borderStyle = variantStyle.cardBorder
    ? { borderColor: mixColor(colors.text, colors.background, 0.93) }
    : {};

  return (
    <SectionWrap theme={theme} bg={colors.background}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <Reveal>
            <div className={`mb-16 ${isLeft ? "text-left" : "text-center"}`}>
              <p
                className="mb-3 text-sm font-semibold uppercase tracking-widest"
                style={{ color: colors.primary }}
              >
                {t("section.features", lang)}
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

        <div className={`grid gap-5 ${variantStyle.gridCols}`}>
          {items.map((f, i) => (
            <Reveal key={i} delay={i * 70}>
              <div
                className={`group relative h-full overflow-hidden ${variantStyle.cardRadius} ${variantStyle.cardBorder ? "border" : ""} ${variantStyle.cardPadding} transition-all duration-300 ${variantStyle.hoverEffect} ${variantStyle.cardShadow}`}
                style={{
                  background: colors.background,
                  ...borderStyle,
                }}
              >
                {variantStyle.showDecorations && (
                  <div
                    className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: colors.accent }}
                  />
                )}

                <div className="relative">
                  {f.icon ? (
                    <div
                      className={`mb-5 flex items-center justify-center ${variantStyle.iconRadius} ${variantStyle.iconSize} text-2xl`}
                      style={{
                        background: `linear-gradient(135deg, ${mixColor(colors.primary, colors.background, 0.88)}, ${mixColor(colors.accent, colors.background, 0.85)})`,
                      }}
                    >
                      {f.icon}
                    </div>
                  ) : (
                    <FeatureIcon index={i} colors={colors} variantStyle={variantStyle} />
                  )}

                  <h3
                    className="mb-2.5 text-lg font-semibold"
                    style={{ color: colors.text }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-[15px] leading-relaxed"
                    style={{ color: mixColor(colors.text, colors.background, 0.4) }}
                  >
                    {f.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionWrap>
  );
}
