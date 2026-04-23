"use client";

import Link from "next/link";
import type { Colors, ServiceItem } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import { mixColor } from "@/lib/colors";
import { t } from "@/lib/i18n";
import { Reveal } from "./reveal";
import { SectionWrap } from "./section-wrap";

const SERVICE_ICONS = [
  "M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085",
  "M2.25 21h19.5M3.75 3v18m0-4.5h3.75M3.75 9h3.75m0 0V3m0 6h4.5m-4.5 0v4.5m4.5-4.5V3m0 6h4.5m-4.5 0v4.5m4.5-4.5V3m0 6h3.75m-3.75 0v4.5",
  "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636",
  "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21",
  "M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12",
];

export function ServicesSection({
  title,
  subtitle,
  items,
  colors,
  theme,
  variant = "full",
  siteId,
  lang,
  variantStyle,
  show_gradient = true,
}: {
  title?: string;
  subtitle?: string;
  items?: ServiceItem[];
  colors: Colors;
  theme: Theme;
  variant?: "snippet" | "full";
  siteId?: string;
  lang?: string;
  variantStyle: VariantStyle;
  show_gradient?: boolean;
}) {
  if (!items?.length) return null;

  const displayItems = variant === "snippet" ? items.slice(0, 3) : items;
  const hasMore = variant === "snippet" && items.length > 3;
  const tintBg = mixColor(colors.primary, colors.background, 0.97);
  const isLeft = variantStyle.headerAlign === "left";
  const borderStyle = variantStyle.cardBorder
    ? { borderColor: mixColor(colors.text, colors.background, 0.93) }
    : {};

  return (
    <SectionWrap theme={theme} bg={tintBg}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <Reveal>
            <div className={`mb-16 ${isLeft ? "text-left" : "text-center"}`}>
              <p
                className="mb-3 text-sm font-semibold uppercase tracking-widest"
                style={{ color: colors.primary }}
              >
                {t("section.services", lang)}
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
          {displayItems.map((svc, i) => (
            <Reveal key={i} delay={i * 70}>
              <div
                className={`group relative h-full overflow-hidden ${variantStyle.cardRadius} ${variantStyle.cardBorder ? "border" : ""} ${variantStyle.cardPadding} transition-all duration-300 ${variantStyle.hoverEffect} ${variantStyle.cardShadow}`}
                style={{
                  background: colors.background,
                  ...borderStyle,
                }}
              >
                {show_gradient && variantStyle.showDecorations && (
                  <div
                    className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: colors.primary }}
                  />
                )}

                <div className="relative">
                  <div
                    className={`mb-5 flex items-center justify-center ${variantStyle.iconRadius} ${variantStyle.iconSize}`}
                    style={{
                      background: show_gradient
                        ? `linear-gradient(135deg, ${mixColor(colors.primary, colors.background, 0.88)}, ${mixColor(colors.accent, colors.background, 0.85)})`
                        : mixColor(colors.primary, colors.background, 0.88),
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
                        d={SERVICE_ICONS[i % SERVICE_ICONS.length]}
                      />
                    </svg>
                  </div>

                  <h3
                    className="mb-2.5 text-lg font-semibold"
                    style={{ color: colors.text }}
                  >
                    {svc.title}
                  </h3>
                  <p
                    className="text-[15px] leading-relaxed"
                    style={{ color: mixColor(colors.text, colors.background, 0.4) }}
                  >
                    {svc.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {hasMore && siteId && (
          <Reveal delay={300}>
            <div className="mt-14 text-center">
              <Link
                href={`/${siteId}/services`}
                className={`group inline-flex items-center gap-2.5 ${variantStyle.buttonRadius} px-8 py-4 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] hover:brightness-110`}
                style={{
                  background: colors.primary,
                  color: "#fff",
                  boxShadow: `0 4px 16px ${colors.primary}30`,
                }}
              >
                {t("services.viewAll", lang)}
                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </SectionWrap>
  );
}
