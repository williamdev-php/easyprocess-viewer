"use client";

import { Animate } from "@/components/animate";
import type { AnimationType } from "@/components/animate";
import { SectionWrap } from "@/components/section-wrap";
import { mixColor } from "@/lib/colors";
import type { Colors } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import { sanitizeUrl, sanitizeImageUrl } from "@/lib/sanitize";

interface ContentBlock {
  type: string;
  content?: string;
  url?: string;
  alt?: string;
  label?: string;
  href?: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  layout?: string;
  blocks?: ContentBlock[];
  colors: Colors;
  theme: Theme;
  variantStyle: VariantStyle;
  animation?: AnimationType;
}

export function CustomContentSection({
  title,
  subtitle,
  layout = "one-column",
  blocks = [],
  colors,
  theme,
  variantStyle,
  animation = "fade-up",
}: Props) {
  if (!blocks.length) return null;

  const bg = colors.background;
  const text = colors.text;
  const primary = colors.primary;

  const renderBlock = (block: ContentBlock, i: number) => {
    switch (block.type) {
      case "heading":
        return (
          <h3 key={i} className="text-xl font-bold sm:text-2xl" style={{ color: text }}>
            {block.content}
          </h3>
        );
      case "text":
        return (
          <p key={i} className="text-base leading-relaxed" style={{ color: mixColor(text, bg, 0.25) }}>
            {block.content}
          </p>
        );
      case "image": {
        const src = sanitizeImageUrl(block.url);
        if (!src) return null;
        return (
          <img
            key={i}
            src={src}
            alt={block.alt || ""}
            className="rounded-xl w-full object-cover"
            loading="lazy"
          />
        );
      }
      case "button": {
        const href = sanitizeUrl(block.href);
        if (!href || !block.label) return null;
        return (
          <a
            key={i}
            href={href}
            className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: primary }}
          >
            {block.label}
          </a>
        );
      }
      default:
        return null;
    }
  };

  return (
    <SectionWrap id="custom-content" theme={theme}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {title && (
          <Animate animation={animation}>
            <div className={`mb-8 ${variantStyle.headerAlign === "left" ? "text-left" : "text-center"}`}>
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
        <Animate animation={animation} delay={60}>
          <div className={`space-y-6 ${layout === "two-column" ? "md:grid md:grid-cols-2 md:gap-8 md:space-y-0" : ""}`}>
            {blocks.map(renderBlock)}
          </div>
        </Animate>
      </div>
    </SectionWrap>
  );
}
