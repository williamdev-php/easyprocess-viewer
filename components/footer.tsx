import Link from "next/link";
import type { Colors, NavItem } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import { adjustColor, mixColor } from "@/lib/colors";
import { sanitizeUrl } from "@/lib/sanitize";
import { t } from "@/lib/i18n";

const SOCIAL_ICONS: Record<string, string> = {
  facebook:
    "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
  instagram:
    "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z",
  linkedin:
    "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 110 4 2 2 0 010-4z",
};

export function Footer({
  businessName,
  email,
  phone,
  address,
  socialLinks,
  navItems,
  colors,
  theme,
  lang,
  variantStyle,
}: {
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
}) {
  if (!businessName) return null;

  const footerBg = adjustColor(colors.text, -10);
  const textMuted = mixColor(colors.background, colors.text, 0.45);
  const textDim = mixColor(colors.background, colors.text, 0.65);
  const socials = Object.entries(socialLinks || {});

  const socialIconRadius = variantStyle.iconRadius;
  const isLeft = variantStyle.headerAlign === "left";

  return (
    <footer className="relative overflow-hidden px-5 py-20 sm:px-8" style={{ background: footerBg }}>
      {/* Subtle top gradient */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${mixColor(colors.primary, footerBg, 0.5)}, transparent)`,
        }}
      />

      {/* Decorative blobs for variants that use decorations */}
      {variantStyle.showDecorations && (
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
      )}

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
              {email && (
                <a href={`mailto:${email}`} className="transition-colors duration-200 hover:text-white">
                  {email}
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} className="transition-colors duration-200 hover:text-white">
                  {phone}
                </a>
              )}
            </div>
          </div>

          {/* Social links */}
          {socials.length > 0 && (
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
                {t("footer.social", lang)}
              </p>
              <div className="flex gap-3">
                {socials.map(([platform, url], i) => {
                  const iconPath = SOCIAL_ICONS[platform.toLowerCase()];
                  return (
                    <a
                      key={i}
                      href={sanitizeUrl(url) || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex h-10 w-10 items-center justify-center ${socialIconRadius} text-sm transition-all duration-200 hover:scale-105 hover:brightness-125`}
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
            </div>
          )}
        </div>

        {/* Bottom: copyright */}
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
