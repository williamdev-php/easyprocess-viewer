"use client";

import { Animate } from "@/components/animate";
import type { AnimationType } from "@/components/animate";
import { SectionWrap } from "@/components/section-wrap";
import { mixColor } from "@/lib/colors";
import type { Colors } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import Image from "next/image";
import { sanitizeUrl, sanitizeImageUrl } from "@/lib/sanitize";

interface ContentBlock {
  type: string;
  content?: string;
  url?: string;
  alt?: string;
  label?: string;
  href?: string;
  /** Column span for grid layouts (1-4, default 1) */
  col_span?: number;
  /** Row span for grid layouts (1-3, default 1) */
  row_span?: number;
}

interface Props {
  title?: string;
  subtitle?: string;
  /** Layout mode: "one-column" | "two-column" | "three-column" | "grid-2" | "grid-3" | "grid-4" | "masonry" | "sidebar-left" | "sidebar-right" */
  layout?: string;
  blocks?: ContentBlock[];
  /** Number of grid columns (2-4) -- used when layout is "grid-*" */
  grid_columns?: number;
  /** Gap between grid items: "sm" | "md" | "lg" */
  grid_gap?: string;
  colors: Colors;
  theme: Theme;
  variantStyle: VariantStyle;
  animation?: AnimationType;
}

const GAP_MAP: Record<string, string> = {
  sm: "gap-4",
  md: "gap-6 md:gap-8",
  lg: "gap-8 md:gap-12",
};

function getColSpanClass(span?: number): string {
  if (!span || span <= 1) return "";
  if (span === 2) return "md:col-span-2";
  if (span === 3) return "md:col-span-3";
  return "md:col-span-4";
}

function getRowSpanClass(span?: number): string {
  if (!span || span <= 1) return "";
  if (span === 2) return "md:row-span-2";
  return "md:row-span-3";
}

function getLayoutClasses(layout: string, gridColumns?: number): string {
  switch (layout) {
    case "two-column":
      return "md:grid md:grid-cols-2 md:gap-8 md:space-y-0";
    case "three-column":
      return "md:grid md:grid-cols-3 md:gap-6 md:space-y-0";
    case "grid-2":
      return "grid grid-cols-1 sm:grid-cols-2 gap-6";
    case "grid-3":
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
    case "grid-4":
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6";
    case "masonry":
      return "columns-1 sm:columns-2 lg:columns-3 gap-6 [&>*]:mb-6 [&>*]:break-inside-avoid";
    case "sidebar-left":
      return "md:grid md:grid-cols-[280px_1fr] md:gap-8 md:space-y-0";
    case "sidebar-right":
      return "md:grid md:grid-cols-[1fr_280px] md:gap-8 md:space-y-0";
    default: {
      // Support dynamic grid columns via grid_columns prop
      if (gridColumns && gridColumns >= 2) {
        const cols = Math.min(gridColumns, 4);
        if (cols === 2) return "grid grid-cols-1 sm:grid-cols-2 gap-6";
        if (cols === 3) return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6";
      }
      return "space-y-6";
    }
  }
}

export function CustomContentSection({
  title,
  subtitle,
  layout = "one-column",
  blocks = [],
  grid_columns,
  grid_gap = "md",
  colors,
  theme,
  variantStyle,
  animation = "fade-up",
}: Props) {
  if (!blocks.length) return null;

  const bg = colors.background;
  const text = colors.text;
  const primary = colors.primary;

  const isGridLayout = layout.startsWith("grid-") || layout === "masonry" || (grid_columns && grid_columns >= 2);

  const renderBlock = (block: ContentBlock, i: number) => {
    const colSpan = getColSpanClass(block.col_span);
    const rowSpan = getRowSpanClass(block.row_span);
    const spanClasses = isGridLayout ? `${colSpan} ${rowSpan}`.trim() : "";

    const wrapWithSpan = (node: React.ReactNode) =>
      spanClasses ? <div key={i} className={spanClasses}>{node}</div> : node;

    switch (block.type) {
      case "heading":
        return wrapWithSpan(
          <h3 key={spanClasses ? undefined : i} className="text-xl font-bold sm:text-2xl" style={{ color: text }}>
            {block.content}
          </h3>
        );
      case "text":
        return wrapWithSpan(
          <p key={spanClasses ? undefined : i} className="text-base leading-relaxed" style={{ color: mixColor(text, bg, 0.25) }}>
            {block.content}
          </p>
        );
      case "image": {
        const src = sanitizeImageUrl(block.url);
        if (!src) return null;
        return wrapWithSpan(
          <Image
            key={spanClasses ? undefined : i}
            src={src}
            alt={block.alt || ""}
            width={800}
            height={450}
            className="rounded-xl w-full object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
          />
        );
      }
      case "button": {
        const href = sanitizeUrl(block.href);
        if (!href || !block.label) return null;
        return wrapWithSpan(
          <a
            key={spanClasses ? undefined : i}
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

  const gapClass = GAP_MAP[grid_gap] || GAP_MAP.md;
  const layoutClasses = getLayoutClasses(layout, grid_columns);
  // For grid layouts, replace default gap with user-specified gap
  const finalLayoutClasses = isGridLayout
    ? layoutClasses.replace(/gap-\d+/g, "").trim() + " " + gapClass
    : layoutClasses;

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
          <div className={finalLayoutClasses}>
            {blocks.map(renderBlock)}
          </div>
        </Animate>
      </div>
    </SectionWrap>
  );
}
