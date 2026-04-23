"use client";

import Link from "next/link";
import type { Colors, Highlight } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import { mixColor } from "@/lib/colors";
import { sanitizeImageUrl } from "@/lib/sanitize";
import { t } from "@/lib/i18n";
import { Reveal } from "./reveal";
import { SectionWrap } from "./section-wrap";
import { FallbackImage } from "./fallback-image";

export function AboutSection({
  title,
  text,
  image,
  highlights,
  colors,
  theme,
  variant = "full",
  siteId,
  lang,
  show_highlights = true,
  variantStyle,
  show_gradient = true,
}: {
  title?: string;
  text?: string;
  image?: string | null;
  highlights?: Highlight[] | null;
  colors: Colors;
  theme: Theme;
  variant?: "snippet" | "full";
  siteId?: string;
  lang?: string;
  show_highlights?: boolean;
  variantStyle: VariantStyle;
  show_gradient?: boolean;
}) {
  if (!title && !text) return null;

  const img = sanitizeImageUrl(image ?? undefined);
  const displayText =
    variant === "snippet" && text && text.length > 280
      ? text.slice(0, 280).replace(/\s\S*$/, "") + "..."
      : text;

  const isLeft = variantStyle.headerAlign === "left";
  const aboutLayout = variantStyle.aboutLayout;

  // Determine flex direction based on variant
  const flexDir =
    aboutLayout === "image-left"
      ? "lg:flex-row-reverse"
      : aboutLayout === "image-top"
      ? "flex-col"
      : "lg:flex-row";

  return (
    <SectionWrap theme={theme} bg={colors.background} id="about">
      <div className="mx-auto max-w-6xl">
        {/* Section label */}
        <Reveal>
          <p
            className={`mb-3 text-sm font-semibold uppercase tracking-widest ${isLeft ? "text-left" : "text-center"}`}
            style={{ color: colors.primary }}
          >
            {t("section.about", lang)}
          </p>
        </Reveal>

        <div className={`flex flex-col gap-14 lg:gap-20 ${img && aboutLayout !== "image-top" ? flexDir + " lg:items-center" : ""}`}>
          {/* Image on top for image-top layout */}
          {img && aboutLayout === "image-top" && (
            <Reveal>
              <div className="relative">
                <div
                  className={`overflow-hidden ${variantStyle.cardRadius}`}
                  style={{
                    boxShadow: `0 8px 40px ${mixColor(colors.primary, "#000000", 0.5)}20`,
                  }}
                >
                  <FallbackImage
                    src={img}
                    alt={title || ""}
                    width={1200}
                    height={500}
                    className="aspect-[21/9] w-full object-cover"
                    colors={colors}
                    sizes="100vw"
                  />
                </div>
              </div>
            </Reveal>
          )}

          <div className={img && aboutLayout !== "image-top" ? "lg:w-1/2" : `mx-auto max-w-2xl ${isLeft ? "" : "text-center"}`}>
            {title && (
              <Reveal>
                <h2
                  className={`text-3xl ${theme.heading.weight} ${theme.heading.tracking} sm:text-4xl md:text-5xl`}
                  style={{ color: colors.text }}
                >
                  {title}
                </h2>
              </Reveal>
            )}
            {displayText && (
              <Reveal delay={80}>
                <p
                  className="mt-6 text-lg leading-relaxed"
                  style={{ color: mixColor(colors.text, colors.background, 0.35) }}
                >
                  {displayText}
                </p>
              </Reveal>
            )}

            {/* Highlights (full variant only) */}
            {show_highlights && variant === "full" && highlights && highlights.length > 0 && (
              <Reveal delay={160}>
                <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
                  {highlights.map((h, i) => (
                    <div
                      key={i}
                      className={`${variantStyle.cardRadius} ${variantStyle.cardBorder ? "border" : ""} p-4 text-center ${variantStyle.cardShadow}`}
                      style={{
                        ...(variantStyle.cardBorder ? { borderColor: mixColor(colors.text, colors.background, 0.92) } : {}),
                        background: mixColor(colors.primary, colors.background, 0.97),
                      }}
                    >
                      <p
                        className="text-2xl font-bold"
                        style={{ color: colors.primary }}
                      >
                        {h.value}
                      </p>
                      <p
                        className="mt-1 text-sm"
                        style={{ color: mixColor(colors.text, colors.background, 0.45) }}
                      >
                        {h.label}
                      </p>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {/* "Read more" link (snippet only) */}
            {variant === "snippet" && siteId && (
              <Reveal delay={160}>
                <Link
                  href={`/${siteId}/about`}
                  className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:brightness-110"
                  style={{ color: colors.primary }}
                >
                  {t("about.readMore", lang)}
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
              </Reveal>
            )}
          </div>

          {img && aboutLayout !== "image-top" && (
            <Reveal className="lg:w-1/2">
              <div className="relative">
                <div
                  className={`overflow-hidden ${variantStyle.cardRadius}`}
                  style={{
                    boxShadow: `0 8px 40px ${mixColor(colors.primary, "#000000", 0.5)}20`,
                  }}
                >
                  <FallbackImage
                    src={img}
                    alt={title || ""}
                    width={800}
                    height={600}
                    className="aspect-[4/3] w-full object-cover"
                    colors={colors}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                {/* Decorative accent */}
                {show_gradient && variantStyle.showDecorations && (
                  <div
                    className={`absolute -bottom-3 -right-3 -z-10 h-full w-full ${variantStyle.cardRadius}`}
                    style={{
                      background: `linear-gradient(135deg, ${mixColor(colors.primary, colors.background, 0.85)}, ${mixColor(colors.accent, colors.background, 0.85)})`,
                    }}
                  />
                )}
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </SectionWrap>
  );
}
