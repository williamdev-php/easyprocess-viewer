"use client";

import type { Colors, TestimonialItem } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
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

function CardTestimonial({
  item,
  colors,
  variantStyle,
  show_ratings,
  delay,
  show_gradient = true,
}: {
  item: TestimonialItem;
  colors: Colors;
  variantStyle: VariantStyle;
  show_ratings: boolean;
  delay: number;
  show_gradient?: boolean;
}) {
  return (
    <Reveal delay={delay}>
      <div
        className={`group h-full ${variantStyle.cardRadius} ${variantStyle.cardBorder ? "border" : ""} ${variantStyle.cardPadding} transition-all duration-300 ${variantStyle.hoverEffect} ${variantStyle.cardShadow}`}
        style={{
          background: colors.background,
          ...(variantStyle.cardBorder ? { borderColor: mixColor(colors.text, colors.background, 0.93) } : {}),
        }}
      >
        {show_ratings && <StarRating color={colors.accent} />}
        <p
          className="mb-7 text-[15px] leading-relaxed"
          style={{ color: mixColor(colors.text, colors.background, 0.25) }}
        >
          &ldquo;{item.text}&rdquo;
        </p>
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center ${variantStyle.iconRadius} text-sm font-bold text-white`}
            style={{
              background: show_gradient ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` : colors.primary,
            }}
          >
            {item.author.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: colors.text }}>
              {item.author}
            </p>
            {item.role && (
              <p className="text-xs" style={{ color: mixColor(colors.text, colors.background, 0.5) }}>
                {item.role}
              </p>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function QuoteTestimonial({
  item,
  colors,
  show_ratings,
  delay,
}: {
  item: TestimonialItem;
  colors: Colors;
  show_ratings: boolean;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="h-full border-l-4 py-2 pl-6" style={{ borderColor: colors.primary }}>
        {show_ratings && <StarRating color={colors.accent} />}
        <p
          className="mb-5 text-lg font-medium italic leading-relaxed"
          style={{ color: mixColor(colors.text, colors.background, 0.2) }}
        >
          &ldquo;{item.text}&rdquo;
        </p>
        <p className="text-sm font-semibold" style={{ color: colors.text }}>
          {item.author}
          {item.role && (
            <span className="font-normal" style={{ color: mixColor(colors.text, colors.background, 0.5) }}>
              {" "}&mdash; {item.role}
            </span>
          )}
        </p>
      </div>
    </Reveal>
  );
}

function MinimalTestimonial({
  item,
  colors,
  show_ratings,
  delay,
  show_gradient = true,
}: {
  item: TestimonialItem;
  colors: Colors;
  show_ratings: boolean;
  delay: number;
  show_gradient?: boolean;
}) {
  return (
    <Reveal delay={delay}>
      <div className="h-full text-center">
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
          style={{ background: show_gradient ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` : colors.primary }}
        >
          {item.author.charAt(0)}
        </div>
        {show_ratings && <div className="flex justify-center"><StarRating color={colors.accent} /></div>}
        <p
          className="mb-4 text-base leading-relaxed"
          style={{ color: mixColor(colors.text, colors.background, 0.25) }}
        >
          &ldquo;{item.text}&rdquo;
        </p>
        <p className="text-sm font-semibold" style={{ color: colors.text }}>
          {item.author}
        </p>
        {item.role && (
          <p className="text-xs" style={{ color: mixColor(colors.text, colors.background, 0.5) }}>
            {item.role}
          </p>
        )}
      </div>
    </Reveal>
  );
}

export function TestimonialsSection({
  title,
  items,
  colors,
  theme,
  lang,
  show_ratings = true,
  variantStyle,
  show_gradient = true,
}: {
  title?: string;
  items?: TestimonialItem[];
  colors: Colors;
  theme: Theme;
  lang?: string;
  show_ratings?: boolean;
  variantStyle: VariantStyle;
  show_gradient?: boolean;
}) {
  if (!items?.length) return null;

  const tintBg = mixColor(colors.primary, colors.background, 0.97);
  const isLeft = variantStyle.headerAlign === "left";

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

        <div className={`grid gap-5 ${variantStyle.testimonialStyle === "minimal" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}>
          {items.map((item, i) => {
            switch (variantStyle.testimonialStyle) {
              case "quote":
                return <QuoteTestimonial key={i} item={item} colors={colors} show_ratings={show_ratings} delay={i * 80} />;
              case "minimal":
                return <MinimalTestimonial key={i} item={item} colors={colors} show_ratings={show_ratings} delay={i * 80} show_gradient={show_gradient} />;
              default:
                return <CardTestimonial key={i} item={item} colors={colors} variantStyle={variantStyle} show_ratings={show_ratings} delay={i * 80} show_gradient={show_gradient} />;
            }
          })}
        </div>
      </div>
    </SectionWrap>
  );
}
