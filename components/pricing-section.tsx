"use client";

import { Animate } from "@/components/animate";
import type { AnimationType } from "@/components/animate";
import { SectionWrap } from "@/components/section-wrap";
import { mixColor } from "@/lib/colors";
import type { Colors } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";

interface PricingTier {
  name: string;
  price: string;
  description?: string;
  features?: string[];
  highlighted?: boolean;
  cta?: { label: string; href: string } | null;
}

interface Props {
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
  colors: Colors;
  theme: Theme;
  variantStyle: VariantStyle;
  animation?: AnimationType;
}

export function PricingSection({
  title = "Priser",
  subtitle,
  tiers = [],
  colors,
  theme,
  variantStyle,
  animation = "fade-up",
}: Props) {
  if (!tiers.length) return null;
  const bg = colors.background;
  const text = colors.text;
  const primary = colors.primary;

  return (
    <SectionWrap id="pricing" theme={theme}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
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
        <div className={`grid gap-6 ${tiers.length === 1 ? "max-w-md mx-auto" : tiers.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "md:grid-cols-3"}`}>
          {tiers.map((tier, i) => (
            <Animate key={i} animation={animation} delay={i * 80}>
              <div
                className={`relative flex flex-col rounded-2xl p-6 sm:p-8 transition-shadow ${
                  tier.highlighted
                    ? "ring-2 shadow-lg"
                    : "border shadow-sm"
                }`}
                style={{
                  borderColor: tier.highlighted ? primary : mixColor(text, bg, 0.9),
                  ["--tw-ring-color" as string]: tier.highlighted ? primary : undefined,
                  backgroundColor: tier.highlighted ? mixColor(primary, bg, 0.97) : bg,
                }}
              >
                {tier.highlighted && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: primary }}
                  >
                    Populärast
                  </div>
                )}
                <h3 className="text-lg font-bold" style={{ color: text }}>{tier.name}</h3>
                <div className="mt-2 text-3xl font-extrabold" style={{ color: primary }}>{tier.price}</div>
                {tier.description && (
                  <p className="mt-2 text-sm" style={{ color: mixColor(text, bg, 0.4) }}>{tier.description}</p>
                )}
                {tier.features && tier.features.length > 0 && (
                  <ul className="mt-6 flex-1 space-y-2">
                    {tier.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm" style={{ color: mixColor(text, bg, 0.25) }}>
                        <svg className="mt-0.5 h-4 w-4 shrink-0" style={{ color: primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                {tier.cta && (
                  <a
                    href={tier.cta.href}
                    className="mt-6 block rounded-xl px-4 py-3 text-center text-sm font-semibold transition hover:opacity-90"
                    style={{
                      backgroundColor: tier.highlighted ? primary : "transparent",
                      color: tier.highlighted ? "#fff" : primary,
                      border: tier.highlighted ? "none" : `2px solid ${primary}`,
                    }}
                  >
                    {tier.cta.label}
                  </a>
                )}
              </div>
            </Animate>
          ))}
        </div>
      </div>
    </SectionWrap>
  );
}
