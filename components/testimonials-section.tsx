"use client";

import type { Colors, TestimonialItem } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import { mixColor } from "@/lib/colors";
import { t } from "@/lib/i18n";
import { Reveal } from "./reveal";
import { SectionWrap } from "./section-wrap";

function StarRating({ color }: { color: string }) {
  return (
    <div className="mb-4 flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="h-4 w-4" style={{ color }} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection({
  title,
  items,
  colors,
  theme,
  lang,
  show_ratings = true,
}: {
  title?: string;
  items?: TestimonialItem[];
  colors: Colors;
  theme: Theme;
  lang?: string;
  show_ratings?: boolean;
}) {
  if (!items?.length) return null;

  const tintBg = mixColor(colors.primary, colors.background, 0.97);

  return (
    <SectionWrap theme={theme} bg={tintBg}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <Reveal>
            <div className="mb-16 text-center">
              <p
                className="mb-3 text-sm font-semibold uppercase tracking-widest"
                style={{ color: colors.primary }}
              >
                {t("section.testimonials", lang)}
              </p>
              <h2
                className={`text-3xl ${theme.heading.weight} ${theme.heading.tracking} sm:text-4xl md:text-5xl`}
                style={{ color: colors.text }}
              >
                {title}
              </h2>
            </div>
          </Reveal>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((t, i) => (
            <Reveal key={i} delay={i * 80}>
              <div
                className="group h-full rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-0.5 sm:p-8"
                style={{
                  background: colors.background,
                  borderColor: mixColor(colors.text, colors.background, 0.93),
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                {show_ratings && <StarRating color={colors.accent} />}
                <p
                  className="mb-7 text-[15px] leading-relaxed"
                  style={{ color: mixColor(colors.text, colors.background, 0.25) }}
                >
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                    }}
                  >
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: colors.text }}>
                      {t.author}
                    </p>
                    {t.role && (
                      <p className="text-xs" style={{ color: mixColor(colors.text, colors.background, 0.5) }}>
                        {t.role}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionWrap>
  );
}
