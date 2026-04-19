"use client";

import type { Colors, GalleryImage } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
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
  variantStyle,
}: {
  title?: string;
  images?: GalleryImage[];
  colors: Colors;
  theme: Theme;
  variant?: "snippet" | "full";
  lang?: string;
  variantStyle: VariantStyle;
}) {
  if (!images?.length) return null;

  const displayImages = variant === "snippet" ? images.slice(0, 6) : images;
  const isLeft = variantStyle.headerAlign === "left";

  // Grid class based on gallery style
  let gridClass: string;
  switch (variantStyle.galleryGrid) {
    case "featured":
      // First image larger
      gridClass = "grid-cols-1 sm:grid-cols-2";
      break;
    case "masonry":
      gridClass = "sm:grid-cols-2 lg:grid-cols-3";
      break;
    default:
      gridClass = "sm:grid-cols-2 lg:grid-cols-3";
  }

  return (
    <SectionWrap theme={theme} bg={colors.background}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <Reveal>
            <div className={`mb-16 ${isLeft ? "text-left" : "text-center"}`}>
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
        <div className={`grid gap-4 ${gridClass}`}>
          {displayImages.map((img, i) => {
            // For "featured" layout, first image spans 2 columns
            const isFeatured = variantStyle.galleryGrid === "featured" && i === 0;
            // For "masonry", alternate aspect ratios
            const isTall = variantStyle.galleryGrid === "masonry" && i % 3 === 0;

            return (
              <Reveal key={i} delay={i * 60}>
                <div
                  className={`group overflow-hidden ${variantStyle.cardRadius} ${isFeatured ? "sm:col-span-2" : ""}`}
                >
                  <FallbackImage
                    src={sanitizeImageUrl(img.url) || ""}
                    alt={img.alt || ""}
                    width={isFeatured ? 1200 : 600}
                    height={isFeatured ? 600 : isTall ? 600 : 450}
                    className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      isFeatured
                        ? "aspect-[2/1]"
                        : isTall
                        ? "aspect-[3/4]"
                        : "aspect-[4/3]"
                    }`}
                    colors={colors}
                    sizes={isFeatured ? "100vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
                  />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </SectionWrap>
  );
}
