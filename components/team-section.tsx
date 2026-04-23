"use client";

import type { Colors, TeamMember } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import { mixColor } from "@/lib/colors";
import { sanitizeImageUrl } from "@/lib/sanitize";
import { t } from "@/lib/i18n";
import { Reveal } from "./reveal";
import { SectionWrap } from "./section-wrap";
import { FallbackImage } from "./fallback-image";

function CardTeamMember({
  member,
  colors,
  variantStyle,
  delay,
  totalMembers,
  show_gradient = true,
}: {
  member: TeamMember;
  colors: Colors;
  variantStyle: VariantStyle;
  delay: number;
  totalMembers: number;
  show_gradient?: boolean;
}) {
  const safeImg = member.image ? sanitizeImageUrl(member.image) : null;

  return (
    <Reveal delay={delay}>
      <div
        className={`group h-full overflow-hidden ${variantStyle.cardRadius} ${variantStyle.cardBorder ? "border" : ""} text-center transition-all duration-300 ${variantStyle.hoverEffect} ${variantStyle.cardShadow}`}
        style={{
          background: colors.background,
          ...(variantStyle.cardBorder ? { borderColor: mixColor(colors.text, colors.background, 0.93) } : {}),
        }}
      >
        {safeImg ? (
          <div className="aspect-[3/4] overflow-hidden">
            <FallbackImage
              src={safeImg}
              alt={member.name}
              width={400}
              height={533}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              colors={colors}
              fallbackInitial={member.name.charAt(0)}
              sizes={totalMembers <= 3 ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
            />
          </div>
        ) : (
          <div
            className="flex aspect-[3/4] items-center justify-center"
            style={{
              background: show_gradient ? `linear-gradient(135deg, ${mixColor(colors.primary, colors.background, 0.85)}, ${mixColor(colors.secondary, colors.background, 0.85)})` : mixColor(colors.primary, colors.background, 0.85),
            }}
          >
            <span className="text-5xl font-bold text-white/60">
              {member.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="p-6">
          <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
            {member.name}
          </h3>
          {member.role && (
            <p className="mt-1 text-sm font-medium" style={{ color: colors.primary }}>
              {member.role}
            </p>
          )}
          {member.bio && (
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: mixColor(colors.text, colors.background, 0.4) }}
            >
              {member.bio}
            </p>
          )}
        </div>
      </div>
    </Reveal>
  );
}

function HorizontalTeamMember({
  member,
  colors,
  variantStyle,
  delay,
  show_gradient = true,
}: {
  member: TeamMember;
  colors: Colors;
  variantStyle: VariantStyle;
  delay: number;
  show_gradient?: boolean;
}) {
  const safeImg = member.image ? sanitizeImageUrl(member.image) : null;

  return (
    <Reveal delay={delay}>
      <div
        className={`group flex h-full gap-5 overflow-hidden ${variantStyle.cardRadius} ${variantStyle.cardBorder ? "border" : ""} ${variantStyle.cardPadding} transition-all duration-300 ${variantStyle.hoverEffect} ${variantStyle.cardShadow}`}
        style={{
          background: colors.background,
          ...(variantStyle.cardBorder ? { borderColor: mixColor(colors.text, colors.background, 0.93) } : {}),
        }}
      >
        {safeImg ? (
          <div className={`h-20 w-20 shrink-0 overflow-hidden ${variantStyle.iconRadius}`}>
            <FallbackImage
              src={safeImg}
              alt={member.name}
              width={80}
              height={80}
              className="h-full w-full object-cover"
              colors={colors}
              fallbackInitial={member.name.charAt(0)}
              sizes="80px"
            />
          </div>
        ) : (
          <div
            className={`flex h-20 w-20 shrink-0 items-center justify-center ${variantStyle.iconRadius}`}
            style={{
              background: show_gradient ? `linear-gradient(135deg, ${mixColor(colors.primary, colors.background, 0.85)}, ${mixColor(colors.secondary, colors.background, 0.85)})` : mixColor(colors.primary, colors.background, 0.85),
            }}
          >
            <span className="text-2xl font-bold text-white/60">{member.name.charAt(0)}</span>
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
            {member.name}
          </h3>
          {member.role && (
            <p className="mt-0.5 text-sm font-medium" style={{ color: colors.primary }}>
              {member.role}
            </p>
          )}
          {member.bio && (
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: mixColor(colors.text, colors.background, 0.4) }}
            >
              {member.bio}
            </p>
          )}
        </div>
      </div>
    </Reveal>
  );
}

function MinimalTeamMember({
  member,
  colors,
  delay,
  show_gradient = true,
}: {
  member: TeamMember;
  colors: Colors;
  delay: number;
  show_gradient?: boolean;
}) {
  const safeImg = member.image ? sanitizeImageUrl(member.image) : null;

  return (
    <Reveal delay={delay}>
      <div className="text-center">
        {safeImg ? (
          <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full">
            <FallbackImage
              src={safeImg}
              alt={member.name}
              width={96}
              height={96}
              className="h-full w-full object-cover"
              colors={colors}
              fallbackInitial={member.name.charAt(0)}
              sizes="96px"
            />
          </div>
        ) : (
          <div
            className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full"
            style={{
              background: show_gradient ? `linear-gradient(135deg, ${mixColor(colors.primary, colors.background, 0.85)}, ${mixColor(colors.secondary, colors.background, 0.85)})` : mixColor(colors.primary, colors.background, 0.85),
            }}
          >
            <span className="text-3xl font-bold text-white/60">{member.name.charAt(0)}</span>
          </div>
        )}
        <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
          {member.name}
        </h3>
        {member.role && (
          <p className="mt-1 text-sm font-medium" style={{ color: colors.primary }}>
            {member.role}
          </p>
        )}
      </div>
    </Reveal>
  );
}

export function TeamSection({
  title,
  subtitle,
  members,
  colors,
  theme,
  lang,
  variantStyle,
  show_gradient = true,
}: {
  title?: string;
  subtitle?: string;
  members?: TeamMember[];
  colors: Colors;
  theme: Theme;
  lang?: string;
  variantStyle: VariantStyle;
  show_gradient?: boolean;
}) {
  if (!members?.length) return null;

  const tintBg = mixColor(colors.primary, colors.background, 0.97);
  const isLeft = variantStyle.headerAlign === "left";

  const gridClass =
    variantStyle.teamStyle === "horizontal"
      ? "sm:grid-cols-2"
      : members.length <= 3
      ? "sm:grid-cols-2 lg:grid-cols-3"
      : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <SectionWrap theme={theme} bg={tintBg}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <Reveal>
            <div className={`mb-16 ${isLeft ? "text-left" : "text-center"}`}>
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
                  className={`mt-5 max-w-lg text-lg leading-relaxed ${isLeft ? "" : "mx-auto"}`}
                  style={{ color: mixColor(colors.text, colors.background, 0.4) }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </Reveal>
        )}

        <div className={`grid gap-6 ${gridClass}`}>
          {members.map((m, i) => {
            switch (variantStyle.teamStyle) {
              case "horizontal":
                return <HorizontalTeamMember key={i} member={m} colors={colors} variantStyle={variantStyle} delay={i * 80} show_gradient={show_gradient} />;
              case "minimal":
                return <MinimalTeamMember key={i} member={m} colors={colors} delay={i * 80} show_gradient={show_gradient} />;
              default:
                return <CardTeamMember key={i} member={m} colors={colors} variantStyle={variantStyle} delay={i * 80} totalMembers={members.length} show_gradient={show_gradient} />;
            }
          })}
        </div>
      </div>
    </SectionWrap>
  );
}
