"use client";

import Image from "next/image";
import { Animate } from "@/components/animate";
import type { AnimationType } from "@/components/animate";
import { SectionWrap } from "@/components/section-wrap";
import { mixColor } from "@/lib/colors";
import { sanitizeUrl, sanitizeImageUrl } from "@/lib/sanitize";
import type { Colors, RankingItem } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";

interface Props {
  title?: string;
  subtitle?: string;
  items?: RankingItem[];
  colors: Colors;
  theme: Theme;
  variantStyle: VariantStyle;
  animation?: AnimationType;
}

export function RankingSection({
  title = "Topplista",
  subtitle,
  items = [],
  colors,
  theme,
  variantStyle,
  animation = "fade-up",
}: Props) {
  if (!items.length) return null;

  const bg = colors.background;
  const text = colors.text;
  const primary = colors.primary;
  const accent = colors.accent;

  return (
    <SectionWrap id="ranking" theme={theme}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {title && (
          <Animate animation={animation}>
            <div className={`mb-12 ${variantStyle.headerAlign === "left" ? "text-left" : "text-center"}`}>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: text }}>
                {title}
              </h2>
              {subtitle && (
                <p className="mt-3 text-lg" style={{ color: mixColor(text, bg, 0.4) }}>
                  {subtitle}
                </p>
              )}
            </div>
          </Animate>
        )}

        <div className="space-y-4 sm:space-y-5">
          {items.map((item, i) => {
            const rank = item.rank || i + 1;
            const imgSrc = sanitizeImageUrl(item.image ?? undefined);
            const linkHref = item.link ? sanitizeUrl(item.link.href) : undefined;
            const isTop3 = rank <= 3;

            return (
              <Animate key={i} animation={animation} delay={i * 60}>
                <div
                  className={`group relative flex items-center gap-4 sm:gap-6 overflow-hidden ${variantStyle.cardRadius} border p-4 sm:p-5 transition-shadow hover:shadow-md`}
                  style={{
                    borderColor: isTop3 ? mixColor(primary, bg, 0.7) : mixColor(text, bg, 0.9),
                    backgroundColor: isTop3 ? mixColor(primary, bg, 0.97) : bg,
                  }}
                >
                  {/* Rank number */}
                  <div
                    className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full text-lg sm:text-xl font-extrabold"
                    style={{
                      backgroundColor: isTop3 ? primary : mixColor(text, bg, 0.85),
                      color: isTop3 ? "#fff" : mixColor(text, bg, 0.3),
                    }}
                  >
                    {rank}
                  </div>

                  {/* Image */}
                  {imgSrc && (
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={imgSrc}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-bold leading-tight" style={{ color: text }}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-1 text-sm leading-relaxed line-clamp-2" style={{ color: mixColor(text, bg, 0.35) }}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* External link button */}
                  {item.link && linkHref && (
                    <a
                      href={linkHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`shrink-0 inline-flex items-center gap-1.5 ${variantStyle.buttonRadius} px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-85`}
                      style={{
                        backgroundColor: accent,
                        color: text,
                      }}
                    >
                      {item.link.label}
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </Animate>
            );
          })}
        </div>
      </div>
    </SectionWrap>
  );
}
