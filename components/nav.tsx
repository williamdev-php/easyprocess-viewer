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

// ---------------------------------------------------------------------------
// Shared props & helpers
// ---------------------------------------------------------------------------

export interface NavProps {
  items: NavItem[];
  colors: Colors;
  theme: Theme;
  logoUrl?: string | null;
  businessName?: string;
  ctaHref?: string;
  lang?: string;
  variantStyle: VariantStyle;
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

function useNavColors(colors: Colors) {
  const borderScrolled = useMemo(() => mixColor(colors.text, colors.background, 0.92), [colors.text, colors.background]);
  const borderDefault = useMemo(() => mixColor(colors.text, colors.background, 0.88), [colors.text, colors.background]);
  const navTextColor = useMemo(() => mixColor(colors.text, colors.background, 0.3), [colors.text, colors.background]);
  const mobileBg = useMemo(() => mixColor(colors.background, colors.text, 0.97), [colors.background, colors.text]);
  const mobileBorder = useMemo(() => mixColor(colors.text, colors.background, 0.92), [colors.text, colors.background]);
  return { borderScrolled, borderDefault, navTextColor, mobileBg, mobileBorder };
}

function LogoOrName({
  logoUrl,
  businessName,
  colors,
  href,
}: {
  logoUrl?: string | null;
  businessName?: string;
  colors: Colors;
  href: string;
}) {
  const [logoError, setLogoError] = useState(false);
  const logo = sanitizeImageUrl(logoUrl ?? undefined);
  const showLogo = logo && !logoError;

  return (
    <Link href={href} className="flex items-center gap-2.5">
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
  );
}

function MobileMenu({
  open,
  items,
  ctaHref,
  colors,
  lang,
  onClose,
  menuRadius,
  linkRadius,
  ctaRadius,
  hasBorder,
  mobileBg,
  mobileBorder,
}: {
  open: boolean;
  items: NavItem[];
  ctaHref?: string;
  colors: Colors;
  lang?: string;
  onClose: () => void;
  menuRadius: string;
  linkRadius: string;
  ctaRadius: string;
  hasBorder: boolean;
  mobileBg: string;
  mobileBorder: string;
}) {
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${
        open ? "mt-3 max-h-[400px] opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div
        className={`mx-3 ${menuRadius} ${hasBorder ? "border" : ""} p-1.5`}
        style={{ background: mobileBg, borderColor: mobileBorder }}
      >
        {items.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            onClick={onClose}
            className={`block ${linkRadius} px-4 py-2.5 text-[14px] font-medium transition-colors hover:bg-black/[0.04]`}
            style={{ color: colors.text }}
          >
            {item.label}
          </Link>
        ))}
        {ctaHref && (
          <Link
            href={ctaHref}
            onClick={onClose}
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
  );
}

function Burger({
  open,
  onToggle,
  colors,
  lang,
  radius,
}: {
  open: boolean;
  onToggle: () => void;
  colors: Colors;
  lang?: string;
  radius: string;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex h-9 w-9 items-center justify-center ${radius} transition-colors hover:bg-black/[0.05] md:hidden`}
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
  );
}

// ---------------------------------------------------------------------------
// FloatingNav — Original floating pill (variant 0, 3)
// ---------------------------------------------------------------------------

function FloatingNav({
  items,
  colors,
  theme,
  logoUrl,
  businessName,
  ctaHref,
  lang,
  variantStyle,
}: NavProps) {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled();
  const { borderScrolled, borderDefault, navTextColor, mobileBg, mobileBorder } = useNavColors(colors);

  const navRadius = variantStyle.cardRadius;
  const navLinkRadius = variantStyle.iconRadius;
  const ctaRadius = variantStyle.buttonRadius;
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
          background: scrolled ? `${colors.background}e8` : `${colors.background}c0`,
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
          <LogoOrName logoUrl={logoUrl} businessName={businessName} colors={colors} href={items[0]?.href || "/"} />

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

          <Burger open={open} onToggle={() => setOpen(!open)} colors={colors} lang={lang} radius={navLinkRadius} />
        </div>

        <MobileMenu
          open={open}
          items={items}
          ctaHref={ctaHref}
          colors={colors}
          lang={lang}
          onClose={() => setOpen(false)}
          menuRadius={variantStyle.cardRadius}
          linkRadius={variantStyle.iconRadius}
          ctaRadius={ctaRadius}
          hasBorder={hasBorder}
          mobileBg={mobileBg}
          mobileBorder={mobileBorder}
        />
      </header>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StickyNav — Traditional sticky header (variant 1)
// ---------------------------------------------------------------------------

function StickyNav({
  items,
  colors,
  theme,
  logoUrl,
  businessName,
  ctaHref,
  lang,
  variantStyle,
}: NavProps) {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled();
  const { borderScrolled, navTextColor, mobileBg, mobileBorder } = useNavColors(colors);

  const linkRadius = variantStyle.iconRadius;
  const ctaRadius = variantStyle.buttonRadius;
  const hasBorder = variantStyle.cardBorder;

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <header
        className={`w-full transition-all duration-300 ${hasBorder ? "border-b" : ""} py-3`}
        style={{
          background: scrolled ? `${colors.background}f2` : colors.background,
          backdropFilter: scrolled ? "blur(16px) saturate(1.4)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px) saturate(1.4)" : "none",
          borderColor: borderScrolled,
          boxShadow: scrolled ? "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-6">
          <LogoOrName logoUrl={logoUrl} businessName={businessName} colors={colors} href={items[0]?.href || "/"} />

          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className={`${linkRadius} px-3.5 py-2 text-[13px] font-medium transition-all duration-200 hover:bg-black/[0.05]`}
                style={{ color: navTextColor }}
              >
                {item.label}
              </Link>
            ))}
            {ctaHref && (
              <Link
                href={ctaHref}
                className={`ml-3 ${ctaRadius} px-5 py-2 text-[13px] font-semibold transition-all duration-200 hover:brightness-110`}
                style={{
                  background: colors.primary,
                  color: "#fff",
                }}
              >
                {t("nav.contactUs", lang)}
              </Link>
            )}
          </nav>

          <Burger open={open} onToggle={() => setOpen(!open)} colors={colors} lang={lang} radius={linkRadius} />
        </div>

        <MobileMenu
          open={open}
          items={items}
          ctaHref={ctaHref}
          colors={colors}
          lang={lang}
          onClose={() => setOpen(false)}
          menuRadius={variantStyle.cardRadius}
          linkRadius={linkRadius}
          ctaRadius={ctaRadius}
          hasBorder={hasBorder}
          mobileBg={mobileBg}
          mobileBorder={mobileBorder}
        />
      </header>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MinimalNav — Clean compact bar (variant 2)
// ---------------------------------------------------------------------------

function MinimalNav({
  items,
  colors,
  theme,
  logoUrl,
  businessName,
  ctaHref,
  lang,
  variantStyle,
}: NavProps) {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled();
  const { navTextColor, mobileBg, mobileBorder } = useNavColors(colors);

  const linkRadius = variantStyle.iconRadius;

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <header
        className="w-full transition-all duration-300 py-2.5"
        style={{
          background: scrolled ? `${colors.background}f0` : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-6">
          <LogoOrName logoUrl={logoUrl} businessName={businessName} colors={colors} href={items[0]?.href || "/"} />

          <nav className="hidden items-center gap-0.5 md:flex">
            {items.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className={`${linkRadius} px-3 py-1.5 text-[12px] font-medium transition-colors duration-200 hover:bg-black/[0.04]`}
                style={{ color: navTextColor }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Burger open={open} onToggle={() => setOpen(!open)} colors={colors} lang={lang} radius={linkRadius} />
        </div>

        <MobileMenu
          open={open}
          items={items}
          ctaHref={undefined}
          colors={colors}
          lang={lang}
          onClose={() => setOpen(false)}
          menuRadius={variantStyle.cardRadius}
          linkRadius={linkRadius}
          ctaRadius={variantStyle.buttonRadius}
          hasBorder={false}
          mobileBg={mobileBg}
          mobileBorder={mobileBorder}
        />
      </header>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export function Nav(props: NavProps) {
  switch (props.variantStyle.navStyle) {
    case "sticky":
      return <StickyNav {...props} />;
    case "minimal":
      return <MinimalNav {...props} />;
    default:
      return <FloatingNav {...props} />;
  }
}
