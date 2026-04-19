"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Colors, NavItem } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import { mixColor } from "@/lib/colors";
import { sanitizeImageUrl } from "@/lib/sanitize";
import { t } from "@/lib/i18n";

export function Nav({
  items,
  colors,
  theme,
  logoUrl,
  businessName,
  ctaHref,
  lang,
  variantStyle,
}: {
  items: NavItem[];
  colors: Colors;
  theme: Theme;
  logoUrl?: string | null;
  businessName?: string;
  ctaHref?: string;
  lang?: string;
  variantStyle: VariantStyle;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logo = sanitizeImageUrl(logoUrl ?? undefined);
  const showLogo = logo && !logoError;

  const borderScrolled = useMemo(() => mixColor(colors.text, colors.background, 0.92), [colors.text, colors.background]);
  const borderDefault = useMemo(() => mixColor(colors.text, colors.background, 0.88), [colors.text, colors.background]);
  const navTextColor = useMemo(() => mixColor(colors.text, colors.background, 0.3), [colors.text, colors.background]);
  const mobileBg = useMemo(() => mixColor(colors.background, colors.text, 0.97), [colors.background, colors.text]);
  const mobileBorder = useMemo(() => mixColor(colors.text, colors.background, 0.92), [colors.text, colors.background]);

  // Variant-driven radius for the floating nav pill
  const navRadius = variantStyle.cardRadius;
  const navLinkRadius = variantStyle.iconRadius;
  const ctaRadius = variantStyle.buttonRadius;
  const mobileMenuRadius = variantStyle.cardRadius;
  const mobileLinkRadius = variantStyle.iconRadius;
  const hasBorder = variantStyle.cardBorder;

  return (
    <div className={`fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ${scrolled ? "px-0" : "px-4 sm:px-6"}`}>
      <header
        className={`mx-auto transition-all duration-500 ease-out ${
          scrolled
            ? `mt-0 max-w-full rounded-none ${hasBorder ? "border-b" : ""} py-3`
            : `mt-4 max-w-5xl ${navRadius} ${hasBorder ? "border" : ""} py-3 sm:mt-5`
        }`}
        style={{
          background: scrolled
            ? `${colors.background}e8`
            : `${colors.background}c0`,
          backdropFilter: "blur(20px) saturate(1.5)",
          WebkitBackdropFilter: "blur(20px) saturate(1.5)",
          borderColor: scrolled ? borderScrolled : borderDefault,
          boxShadow: scrolled
            ? "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)"
            : hasBorder
            ? "0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"
            : variantStyle.cardShadow.includes("shadow-lg")
            ? "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)"
            : "0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-5">
          {/* Logo / business name */}
          <Link href={items[0]?.href || "/"} className="flex items-center gap-2.5">
            {showLogo ? (
              <Image
                src={logo}
                alt={businessName || "Logo"}
                width={120}
                height={32}
                className="h-8 w-auto"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span
                className="text-[15px] font-bold tracking-tight sm:text-base"
                style={{ color: colors.text }}
              >
                {businessName || ""}
              </span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {items.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className={`${navLinkRadius} px-3.5 py-2 text-[13px] font-medium transition-all duration-200 hover:bg-black/[0.05]`}
                style={{ color: navTextColor }}
              >
                {item.label}
              </Link>
            ))}
            {ctaHref && (
              <Link
                href={ctaHref}
                className={`ml-2 ${ctaRadius} px-5 py-2 text-[13px] font-semibold transition-all duration-200 hover:scale-[1.02] hover:brightness-110`}
                style={{
                  background: colors.primary,
                  color: "#fff",
                  boxShadow: `0 2px 8px ${colors.primary}40`,
                }}
              >
                {t("nav.contactUs", lang)}
              </Link>
            )}
          </nav>

          {/* Mobile burger */}
          <button
            onClick={() => setOpen(!open)}
            className={`flex h-9 w-9 items-center justify-center ${navLinkRadius} transition-colors hover:bg-black/[0.05] md:hidden`}
            aria-label={t("nav.menu", lang)}
          >
            <div className="relative h-4 w-5">
              <span
                className={`absolute left-0 h-[1.5px] w-5 rounded-full transition-all duration-300 ${open ? "top-[7.5px] rotate-45" : "top-0"}`}
                style={{ background: colors.text }}
              />
              <span
                className={`absolute left-0 top-[7.5px] h-[1.5px] w-5 rounded-full transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
                style={{ background: colors.text }}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-5 rounded-full transition-all duration-300 ${open ? "top-[7.5px] -rotate-45" : "top-[15px]"}`}
                style={{ background: colors.text }}
              />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${
            open ? "mt-3 max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className={`mx-3 ${mobileMenuRadius} ${hasBorder ? "border" : ""} p-1.5`}
            style={{
              background: mobileBg,
              borderColor: mobileBorder,
            }}
          >
            {items.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block ${mobileLinkRadius} px-4 py-2.5 text-[14px] font-medium transition-colors hover:bg-black/[0.04]`}
                style={{ color: colors.text }}
              >
                {item.label}
              </Link>
            ))}
            {ctaHref && (
              <Link
                href={ctaHref}
                onClick={() => setOpen(false)}
                className={`mt-1 block ${ctaRadius} py-2.5 text-center text-[14px] font-semibold text-white`}
                style={{
                  background: colors.primary,
                  boxShadow: `0 2px 8px ${colors.primary}30`,
                }}
              >
                {t("nav.contactUs", lang)}
              </Link>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
