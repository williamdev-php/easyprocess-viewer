"use client";

import { Animate } from "@/components/animate";
import type { AnimationType } from "@/components/animate";
import { mixColor } from "@/lib/colors";
import type { Colors } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import { sanitizeUrl } from "@/lib/sanitize";

interface Props {
  text?: string;
  button?: { label: string; href: string } | null;
  background_color?: string;
  colors: Colors;
  theme: Theme;
  variantStyle: VariantStyle;
  animation?: AnimationType;
}

export function BannerSection({
  text,
  button,
  background_color,
  colors,
  theme,
  variantStyle,
  animation = "fade-in",
}: Props) {
  if (!text) return null;

  const primary = colors.primary;
  const bg = background_color || primary;

  return (
    <Animate animation={animation}>
      <div className="w-full py-4 px-4 sm:px-6" style={{ backgroundColor: bg }}>
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
          <p className="text-center text-sm font-medium text-white sm:text-base">{text}</p>
          {button && sanitizeUrl(button.href) && (
            <a
              href={sanitizeUrl(button.href)}
              className={`shrink-0 ${variantStyle.buttonRadius} bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/30`}
            >
              {button.label}
            </a>
          )}
        </div>
      </div>
    </Animate>
  );
}
