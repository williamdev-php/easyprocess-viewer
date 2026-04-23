"use client";

import type { Colors, StatItem } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import { mixColor } from "@/lib/colors";
import { Reveal } from "./reveal";

export function StatsSection({
  title,
  items,
  colors,
  theme,
  variantStyle,
  show_gradient = true,
}: {
  title?: string;
  items?: StatItem[];
  colors: Colors;
  theme: Theme;
  variantStyle: VariantStyle;
  show_gradient?: boolean;
}) {
  if (!items?.length) return null;

  const gridClass =
    items.length === 2
      ? "sm:grid-cols-2 max-w-2xl mx-auto"
      : items.length === 3
      ? "sm:grid-cols-3"
      : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section
      id="stats"
      className="relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28"
      style={{ background: colors.primary }}
    >
      {/* Decorative background */}
      {show_gradient && variantStyle.showDecorations && (
        <>
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, ${colors.accent}, transparent 50%), radial-gradient(circle at 80% 50%, ${colors.secondary}, transparent 50%)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40L40 0M-10 10L10-10M30 50L50 30' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
            }}
          />
        </>
      )}

      <div className="relative mx-auto max-w-6xl">
        {title && (
          <Reveal>
            <h2
              className={`mb-14 ${variantStyle.headerAlign === "left" ? "text-left" : "text-center"} text-3xl ${theme.heading.weight} ${theme.heading.tracking} text-white sm:text-4xl md:text-5xl`}
            >
              {title}
            </h2>
          </Reveal>
        )}

        <div className={`grid gap-6 ${gridClass}`}>
          {items.map((stat, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className={`${variantStyle.cardBorder ? `${variantStyle.cardRadius} border border-white/10 ${variantStyle.cardPadding}` : ""} text-center`}>
                <p
                  className={`font-extrabold tracking-tight text-white ${variantStyle.statValueSize}`}
                >
                  {stat.value}
                </p>
                <p className="mt-3 text-sm font-medium uppercase tracking-widest text-white/70">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
