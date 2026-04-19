"use client";

import { useState } from "react";
import Image from "next/image";
import type { Colors } from "@/lib/types";
import { mixColor } from "@/lib/colors";

export function FallbackImage({
  src,
  alt,
  width,
  height,
  className,
  colors,
  fallbackInitial,
  loading = "lazy",
  priority = false,
  sizes,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  colors: Colors;
  fallbackInitial?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  sizes?: string;
}) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={className}
        style={{
          background: `linear-gradient(135deg, ${mixColor(colors.primary, colors.background, 0.85)}, ${mixColor(colors.secondary, colors.background, 0.85)})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {fallbackInitial ? (
          <span className="text-5xl font-bold text-white/60">{fallbackInitial}</span>
        ) : (
          <svg
            className="h-12 w-12 opacity-30"
            style={{ color: colors.text }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
            />
          </svg>
        )}
      </div>
    );
  }

  // Compute responsive sizes if not explicitly provided
  const responsiveSizes = sizes || computeDefaultSizes(width);

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setError(true)}
      loading={priority ? undefined : loading}
      priority={priority}
      sizes={responsiveSizes}
      quality={80}
    />
  );
}

/**
 * Compute reasonable default sizes based on the intended display width.
 * This helps Next.js generate appropriate srcset variants.
 */
function computeDefaultSizes(width: number): string {
  if (width >= 800) {
    // Large images (hero, about): full width on mobile, constrained on desktop
    return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
  }
  if (width >= 400) {
    // Medium images (gallery, team): full width mobile, half on tablet, third on desktop
    return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
  }
  // Small images (thumbnails)
  return "(max-width: 640px) 50vw, 25vw";
}
