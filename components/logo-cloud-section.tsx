"use client";

import { Animate } from "@/components/animate";
import type { AnimationType } from "@/components/animate";
import { SectionWrap } from "@/components/section-wrap";
import { mixColor } from "@/lib/colors";
import type { Colors } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import Image from "next/image";
import { sanitizeImageUrl } from "@/lib/sanitize";

interface LogoItem {
  name: string;
  image_url?: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  logos?: LogoItem[];
  colors: Colors;
  theme: Theme;
  variantStyle: VariantStyle;
  animation?: AnimationType;
}

export function LogoCloudSection({
  title = "Våra partners",
  subtitle,
  logos = [],
  colors,
  theme,
  variantStyle,
  animation = "fade-up",
}: Props) {
  if (!logos.length) return null;

  const bg = colors.background;
  const text = colors.text;

  return (
    <SectionWrap id="logo-cloud" theme={theme} bg={colors.background}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {title && (
          <Animate animation={animation}>
            <div className={`mb-10 ${variantStyle.headerAlign === "left" ? "text-left" : "text-center"}`}>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: text }}>
                {title}
              </h2>
              {subtitle && (
                <p className="mt-2 text-base" style={{ color: mixColor(text, bg, 0.4) }}>
                  {subtitle}
                </p>
              )}
            </div>
          </Animate>
        )}
        <Animate animation={animation} delay={60}>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {logos.map((logo, i) => {
              const safeImgUrl = sanitizeImageUrl(logo.image_url);
              return (
              <div key={i} className="flex flex-col items-center gap-2">
                {safeImgUrl ? (
                  <Image
                    src={safeImgUrl}
                    alt={logo.name}
                    width={120}
                    height={48}
                    className="h-10 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0 sm:h-12"
                    sizes="120px"
                  />
                ) : (
                  <span
                    className="text-sm font-medium"
                    style={{ color: mixColor(text, bg, 0.45) }}
                  >
                    {logo.name}
                  </span>
                )}
              </div>
            );
            })}
          </div>
        </Animate>
      </div>
    </SectionWrap>
  );
}
