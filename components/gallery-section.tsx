"use client";

import type { Colors, GalleryImage } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import { mixColor } from "@/lib/colors";
import { sanitizeImageUrl } from "@/lib/sanitize";
import { t } from "@/lib/i18n";
import { Reveal } from "./reveal";
import { SectionWrap } from "./section-wrap";
import { FallbackImage } from "./fallback-image";

export function GallerySection({
  title,
  images,
  colors,
  theme,
  variant = "full",
  lang,
}: {
  title?: string;
  images?: GalleryImage[];
  colors: Colors;
  theme: Theme;
  variant?: "snippet" | "full";
  lang?: string;
}) {
  if (!images?.length) return null;

  const displayImages = variant === "snippet" ? images.slice(0, 6) : images;

  return (
    <SectionWrap theme={theme} bg={colors.background}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <Reveal>
            <div className="mb-16 text-center">
              <p
                className="mb-3 text-sm font-semibold uppercase tracking-widest"
                style={{ color: colors.primary }}
              >
                {t("section.gallery", lang)}
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayImages.map((img, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="group overflow-hidden rounded-2xl">
                <FallbackImage
                  src={sanitizeImageUrl(img.url) || ""}
                  alt={img.alt || ""}
                  width={600}
                  height={450}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  colors={colors}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionWrap>
  );
}
