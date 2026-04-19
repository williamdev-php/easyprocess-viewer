"use client";

import type { Colors } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import { adjustColor, mixColor } from "@/lib/colors";
import { Reveal } from "./reveal";

export function PageHeader({
  title,
  subtitle,
  colors,
  theme,
}: {
  title: string;
  subtitle?: string;
  colors: Colors;
  theme: Theme;
}) {
  return (
    <section
      className="relative overflow-hidden px-5 pb-20 pt-32 text-center sm:px-8 sm:pb-24 sm:pt-36"
      style={{ background: colors.primary }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 80% 20%, ${adjustColor(colors.primary, 25)} 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 20% 80%, ${colors.secondary} 0%, transparent 50%),
            linear-gradient(160deg, ${colors.primary} 0%, ${adjustColor(colors.secondary, -25)} 100%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="absolute -right-32 -top-32 h-80 w-80 rounded-full opacity-15 blur-[100px]"
        style={{ background: colors.accent }}
      />

      <div className="relative z-10 mx-auto max-w-3xl">
        <Reveal>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={100}>
            <p className="mt-5 text-lg text-white/70">{subtitle}</p>
          </Reveal>
        )}
      </div>

      {/* Bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 h-16"
        style={{
          background: `linear-gradient(to top, ${colors.background}, transparent)`,
        }}
      />
    </section>
  );
}
