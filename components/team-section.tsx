"use client";

import type { Colors, TeamMember } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import { mixColor } from "@/lib/colors";
import { sanitizeImageUrl } from "@/lib/sanitize";
import { t } from "@/lib/i18n";
import { Reveal } from "./reveal";
import { SectionWrap } from "./section-wrap";
import { FallbackImage } from "./fallback-image";

export function TeamSection({
  title,
  subtitle,
  members,
  colors,
  theme,
  lang,
}: {
  title?: string;
  subtitle?: string;
  members?: TeamMember[];
  colors: Colors;
  theme: Theme;
  lang?: string;
}) {
  if (!members?.length) return null;

  const tintBg = mixColor(colors.primary, colors.background, 0.97);

  return (
    <SectionWrap theme={theme} bg={tintBg}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <Reveal>
            <div className="mb-16 text-center">
              <p
                className="mb-3 text-sm font-semibold uppercase tracking-widest"
                style={{ color: colors.primary }}
              >
                {t("section.team", lang)}
              </p>
              <h2
                className={`text-3xl ${theme.heading.weight} ${theme.heading.tracking} sm:text-4xl md:text-5xl`}
                style={{ color: colors.text }}
              >
                {title}
              </h2>
              {subtitle && (
                <p
                  className="mx-auto mt-5 max-w-lg text-lg leading-relaxed"
                  style={{ color: mixColor(colors.text, colors.background, 0.4) }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </Reveal>
        )}

        <div
          className={`grid gap-6 ${
            members.length <= 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {members.map((m, i) => {
            const safeImg = m.image ? sanitizeImageUrl(m.image) : null;
            return (
              <Reveal key={i} delay={i * 80}>
                <div
                  className="group h-full overflow-hidden rounded-2xl border text-center transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: colors.background,
                    borderColor: mixColor(colors.text, colors.background, 0.93),
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                >
                  {safeImg ? (
                    <div className="aspect-[3/4] overflow-hidden">
                      <FallbackImage
                        src={safeImg}
                        alt={m.name}
                        width={400}
                        height={533}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        colors={colors}
                        fallbackInitial={m.name.charAt(0)}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                  ) : (
                    <div
                      className="flex aspect-[3/4] items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${mixColor(colors.primary, colors.background, 0.85)}, ${mixColor(colors.secondary, colors.background, 0.85)})`,
                      }}
                    >
                      <span className="text-5xl font-bold text-white/60">
                        {m.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="p-6">
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: colors.text }}
                    >
                      {m.name}
                    </h3>
                    {m.role && (
                      <p
                        className="mt-1 text-sm font-medium"
                        style={{ color: colors.primary }}
                      >
                        {m.role}
                      </p>
                    )}
                    {m.bio && (
                      <p
                        className="mt-3 text-sm leading-relaxed"
                        style={{ color: mixColor(colors.text, colors.background, 0.4) }}
                      >
                        {m.bio}
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </SectionWrap>
  );
}
