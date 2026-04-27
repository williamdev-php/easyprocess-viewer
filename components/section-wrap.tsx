import type { ReactNode } from "react";
import type { Theme } from "@/lib/themes";
import type { SectionSpacing, SectionBorder } from "@/lib/types";

const SPACING_MAP: Record<string, string> = {
  "0": "0px", "1": "0.25rem", "2": "0.5rem", "4": "1rem", "6": "1.5rem",
  "8": "2rem", "10": "2.5rem", "12": "3rem", "16": "4rem", "20": "5rem",
  "24": "6rem", "32": "8rem",
};

const RADIUS_MAP: Record<string, string> = {
  "none": "0px", "sm": "0.125rem", "md": "0.375rem", "lg": "0.5rem",
  "xl": "0.75rem", "2xl": "1rem", "full": "9999px",
};

function resolveSpacing(val?: string): string | undefined {
  if (!val) return undefined;
  return SPACING_MAP[val] ?? undefined;
}

function buildBorderStyle(border?: SectionBorder): React.CSSProperties {
  if (!border?.enabled) return {};
  const color = border.color || "#e5e7eb";
  const width = border.width ? `${border.width}px` : "1px";
  const style = border.style || "solid";
  const radius = border.radius ? RADIUS_MAP[border.radius] : undefined;

  const sides = border.sides;
  if (sides && sides.length > 0 && sides.length < 4) {
    const result: React.CSSProperties = {};
    if (radius) result.borderRadius = radius;
    for (const side of sides) {
      const prop = `border${side.charAt(0).toUpperCase() + side.slice(1)}` as
        "borderTop" | "borderBottom" | "borderLeft" | "borderRight";
      result[prop] = `${width} ${style} ${color}`;
    }
    return result;
  }

  return {
    border: `${width} ${style} ${color}`,
    ...(radius ? { borderRadius: radius } : {}),
  };
}

export function SectionWrap({
  children,
  theme,
  bg,
  className = "",
  id,
  spacing,
  border,
}: {
  children: ReactNode;
  theme: Theme;
  bg?: string;
  className?: string;
  id?: string;
  spacing?: SectionSpacing;
  border?: SectionBorder;
}) {
  const spacingStyle: React.CSSProperties = {};
  if (spacing?.padding_top) spacingStyle.paddingTop = resolveSpacing(spacing.padding_top);
  if (spacing?.padding_bottom) spacingStyle.paddingBottom = resolveSpacing(spacing.padding_bottom);
  if (spacing?.padding_x) {
    spacingStyle.paddingLeft = resolveSpacing(spacing.padding_x);
    spacingStyle.paddingRight = resolveSpacing(spacing.padding_x);
  }
  if (spacing?.margin_top) spacingStyle.marginTop = resolveSpacing(spacing.margin_top);
  if (spacing?.margin_bottom) spacingStyle.marginBottom = resolveSpacing(spacing.margin_bottom);

  const borderStyle = buildBorderStyle(border);
  const hasCustomPadding = spacing?.padding_top || spacing?.padding_bottom;

  return (
    <section
      id={id}
      className={`relative ${!spacing?.padding_x ? "px-5 sm:px-8" : ""} ${!hasCustomPadding ? theme.sectionPadding : ""} ${className}`}
      style={{ background: bg, ...spacingStyle, ...borderStyle }}
    >
      {theme.sectionDivider && (
        <div className="absolute inset-x-0 top-0 mx-auto h-px max-w-6xl bg-black/[0.06]" />
      )}
      {children}
    </section>
  );
}
