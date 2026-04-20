import Link from "next/link";
import type { Colors, NavItem } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import { adjustColor, mixColor } from "@/lib/colors";
import { sanitizeUrl, sanitizeEmail, sanitizePhone } from "@/lib/sanitize";
import { t } from "@/lib/i18n";

// ---------------------------------------------------------------------------
// Shared props & helpers
// ---------------------------------------------------------------------------

export interface FooterProps {
  businessName?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  socialLinks?: Record<string, string>;
  navItems: NavItem[];
  colors: Colors;
  theme: Theme;
  lang?: string;
  variantStyle: VariantStyle;
}

const SOCIAL_ICONS: Record<string, string> = {
  facebook:
    "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
  instagram:
    "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z",
  linkedin:
    "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 110 4 2 2 0 010-4z",
};

function useFooterColors(colors: Colors) {
  const footerBg = adjustColor(colors.text, -10);
  const textMuted = mixColor(colors.background, colors.text, 0.45);
  const textDim = mixColor(colors.background, colors.text, 0.65);
  return { footerBg, textMuted, textDim };
}

function SocialIcons({
  socialLinks,
  colors,
  footerBg,
  iconRadius,
}: {
  socialLinks?: Record<string, string>;
  colors: Colors;
  footerBg: string;
  iconRadius: string;
}) {
  const socials = Object.entries(socialLinks || {});
  if (socials.length === 0) return null;

  return (
    <div className="flex gap-3">
      {socials.map(([platform, url], i) => {
        const iconPath = SOCIAL_ICONS[platform.toLowerCase()];
        return (
          <a
            key={i}
            href={sanitizeUrl(url) || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex h-10 w-10 items-center justify-center ${iconRadius} text-sm transition-all duration-200 hover:scale-105 hover:brightness-125`}
            style={{
              background: mixColor(colors.background, footerBg, 0.88),
              color: colors.background,
            }}
            title={platform}
          >
            {iconPath ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d={iconPath} />
              </svg>
            ) : (
              platform.charAt(0).toUpperCase()
            )}
          </a>
        );
      })}
    </div>
  );
}

function Decorations({ colors, footerBg }: { colors: Colors; footerBg: string }) {
  return (
    <>
      <div
        className="absolute -left-32 -top-32 h-64 w-64 rounded-full opacity-[0.04] blur-[80px]"
        style={{ background: colors.primary }}
      />
      <div
        className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full opacity-[0.03] blur-[60px]"
        style={{ background: colors.accent }}
      />
    </>
  );
}

function TopGradient({ colors, footerBg }: { colors: Colors; footerBg: string }) {
  return (
    <div
      className="absolute inset-x-0 top-0 h-px"
      style={{
        background: `linear-gradient(90deg, transparent, ${mixColor(colors.primary, footerBg, 0.5)}, transparent)`,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// ColumnsFooter — Original 4-column grid (variant 0, 1)
// ---------------------------------------------------------------------------

function ColumnsFooter({
  businessName,
  email,
  phone,
  address,
  socialLinks,
  navItems,
  colors,
  lang,
  variantStyle,
}: FooterProps) {
  const { footerBg, textMuted, textDim } = useFooterColors(colors);

  return (
    <footer className="relative overflow-hidden px-5 py-20 sm:px-8" style={{ background: footerBg }}>
      <TopGradient colors={colors} footerBg={footerBg} />
      {variantStyle.showDecorations && <Decorations colors={colors} footerBg={footerBg} />}

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <p className="text-xl font-bold" style={{ color: colors.background }}>
              {businessName}
            </p>
            {address && (
              <p className="mt-3 text-sm leading-relaxed" style={{ color: textMuted }}>
                {address}
              </p>
            )}
          </div>

          {/* Nav links */}
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
              {t("footer.pages", lang)}
            </p>
            <nav className="flex flex-col gap-2.5">
              {navItems.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="text-sm transition-colors duration-200 hover:text-white"
                  style={{ color: textMuted }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact info */}
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
              {t("footer.contact", lang)}
            </p>
            <div className="flex flex-col gap-2.5 text-sm" style={{ color: textMuted }}>
              {sanitizeEmail(email) && (
                <a href={`mailto:${sanitizeEmail(email)}`} className="transition-colors duration-200 hover:text-white">
                  {sanitizeEmail(email)}
                </a>
              )}
              {sanitizePhone(phone) && (
                <a href={`tel:${sanitizePhone(phone)}`} className="transition-colors duration-200 hover:text-white">
                  {sanitizePhone(phone)}
                </a>
              )}
            </div>
          </div>

          {/* Social links */}
          {Object.keys(socialLinks || {}).length > 0 && (
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
                {t("footer.social", lang)}
              </p>
              <SocialIcons socialLinks={socialLinks} colors={colors} footerBg={footerBg} iconRadius={variantStyle.iconRadius} />
            </div>
          )}
        </div>

        <div
          className="mt-16 border-t pt-8 text-center text-sm"
          style={{ borderColor: mixColor(colors.background, footerBg, 0.9), color: textDim }}
        >
          {`\u00a9 ${new Date().getFullYear()} ${businessName}. ${t("footer.rights", lang)}`}
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// CenteredFooter — Everything centered and stacked (variant 3)
// ---------------------------------------------------------------------------

function CenteredFooter({
  businessName,
  email,
  phone,
  address,
  socialLinks,
  navItems,
  colors,
  lang,
  variantStyle,
}: FooterProps) {
  const { footerBg, textMuted, textDim } = useFooterColors(colors);

  return (
    <footer className="relative overflow-hidden px-5 py-20 sm:px-8" style={{ background: footerBg }}>
      <TopGradient colors={colors} footerBg={footerBg} />
      {variantStyle.showDecorations && <Decorations colors={colors} footerBg={footerBg} />}

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Business name */}
        <p className="text-2xl font-bold sm:text-3xl" style={{ color: colors.background }}>
          {businessName}
        </p>

        {address && (
          <p className="mt-3 text-sm" style={{ color: textMuted }}>
            {address}
          </p>
        )}

        {/* Nav links in a row */}
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {navItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="text-sm transition-colors duration-200 hover:text-white"
              style={{ color: textMuted }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Contact */}
        {(sanitizeEmail(email) || sanitizePhone(phone)) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm" style={{ color: textMuted }}>
            {sanitizeEmail(email) && (
              <a href={`mailto:${sanitizeEmail(email)}`} className="transition-colors duration-200 hover:text-white">
                {sanitizeEmail(email)}
              </a>
            )}
            {sanitizePhone(phone) && (
              <a href={`tel:${sanitizePhone(phone)}`} className="transition-colors duration-200 hover:text-white">
                {sanitizePhone(phone)}
              </a>
            )}
          </div>
        )}

        {/* Social icons */}
        {Object.keys(socialLinks || {}).length > 0 && (
          <div className="mt-8 flex justify-center">
            <SocialIcons socialLinks={socialLinks} colors={colors} footerBg={footerBg} iconRadius={variantStyle.iconRadius} />
          </div>
        )}

        {/* Copyright */}
        <div
          className="mt-14 border-t pt-8 text-sm"
          style={{ borderColor: mixColor(colors.background, footerBg, 0.9), color: textDim }}
        >
          {`\u00a9 ${new Date().getFullYear()} ${businessName}. ${t("footer.rights", lang)}`}
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// MinimalFooter — Compact single-row (variant 2)
// ---------------------------------------------------------------------------

function MinimalFooter({
  businessName,
  email,
  phone,
  socialLinks,
  colors,
  lang,
  variantStyle,
}: FooterProps) {
  const { footerBg, textMuted, textDim } = useFooterColors(colors);

  return (
    <footer className="relative px-5 py-8 sm:px-8" style={{ background: footerBg }}>
      <TopGradient colors={colors} footerBg={footerBg} />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        {/* Left: copyright */}
        <p className="text-sm" style={{ color: textDim }}>
          {`\u00a9 ${new Date().getFullYear()} ${businessName}. ${t("footer.rights", lang)}`}
        </p>

        {/* Center: contact links */}
        {(sanitizeEmail(email) || sanitizePhone(phone)) && (
          <div className="flex items-center gap-4 text-sm" style={{ color: textMuted }}>
            {sanitizeEmail(email) && (
              <a href={`mailto:${sanitizeEmail(email)}`} className="transition-colors duration-200 hover:text-white">
                {sanitizeEmail(email)}
              </a>
            )}
            {sanitizePhone(phone) && (
              <a href={`tel:${sanitizePhone(phone)}`} className="transition-colors duration-200 hover:text-white">
                {sanitizePhone(phone)}
              </a>
            )}
          </div>
        )}

        {/* Right: social icons */}
        <SocialIcons socialLinks={socialLinks} colors={colors} footerBg={footerBg} iconRadius={variantStyle.iconRadius} />
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export function Footer(props: FooterProps) {
  if (!props.businessName) return null;

  switch (props.variantStyle.footerStyle) {
    case "centered":
      return <CenteredFooter {...props} />;
    case "minimal":
      return <MinimalFooter {...props} />;
    default:
      return <ColumnsFooter {...props} />;
  }
}
