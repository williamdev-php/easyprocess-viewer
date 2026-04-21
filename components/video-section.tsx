"use client";

import { Animate } from "@/components/animate";
import type { AnimationType } from "@/components/animate";
import { SectionWrap } from "@/components/section-wrap";
import { mixColor } from "@/lib/colors";
import type { Colors } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";

interface Props {
  title?: string;
  subtitle?: string;
  video_url?: string;
  caption?: string;
  colors: Colors;
  theme: Theme;
  variantStyle: VariantStyle;
  animation?: AnimationType;
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

export function VideoSection({
  title,
  subtitle,
  video_url = "",
  caption,
  colors,
  theme,
  variantStyle,
  animation = "fade-up",
}: Props) {
  const embedUrl = getEmbedUrl(video_url);
  if (!embedUrl) return null;

  const bg = colors.background;
  const text = colors.text;

  return (
    <SectionWrap id="video" theme={theme}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
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
        <Animate animation={animation} delay={80}>
          <div className="relative overflow-hidden rounded-2xl shadow-lg" style={{ aspectRatio: "16/9" }}>
            <iframe
              src={embedUrl}
              title={title || "Video"}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
          {caption && (
            <p className="mt-3 text-center text-sm" style={{ color: mixColor(text, bg, 0.4) }}>
              {caption}
            </p>
          )}
        </Animate>
      </div>
    </SectionWrap>
  );
}
