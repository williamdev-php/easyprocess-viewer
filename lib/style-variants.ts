/**
 * Style variant system.
 *
 * Each generated site gets a random `style_variant` number (0–N).
 * All sections on the page share the same variant, giving the site
 * a cohesive but unique look without costing extra AI tokens.
 *
 * Variant 0 is the ORIGINAL design (before the variant system existed).
 *
 * To add a new variant:
 *   1. Add a new entry to VARIANTS below
 *   2. Increase TOTAL_STYLE_VARIANTS in backend/app/ai/generator.py
 *   3. Each section component reads `variantStyle` and applies the config
 */

export interface VariantStyle {
  /** Variant ID for display/debug */
  id: number;
  /** Human-readable name */
  name: string;
  /** Short description */
  description: string;
  /** Card border radius class */
  cardRadius: string;
  /** Card border */
  cardBorder: boolean;
  /** Card shadow class */
  cardShadow: string;
  /** Card padding class */
  cardPadding: string;
  /** Grid layout for item lists: "grid-cols" classes */
  gridCols: string;
  /** Header alignment */
  headerAlign: "center" | "left";
  /** Icon container radius class */
  iconRadius: string;
  /** Icon container size class */
  iconSize: string;
  /** Button radius class */
  buttonRadius: string;
  /** Whether to show decorative gradient blobs */
  showDecorations: boolean;
  /** Card hover effect class */
  hoverEffect: string;
  /** Stat value size class */
  statValueSize: string;
  /** Testimonial style */
  testimonialStyle: "card" | "quote" | "minimal";
  /** Process layout */
  processLayout: "timeline" | "cards" | "horizontal";
  /** FAQ style */
  faqStyle: "accordion" | "cards" | "two-column";
  /** Hero text alignment */
  heroAlign: "center" | "left";
  /** About layout when image present */
  aboutLayout: "image-right" | "image-left" | "image-top";
  /** Gallery grid style */
  galleryGrid: "uniform" | "masonry" | "featured";
  /** Team card style */
  teamStyle: "card" | "minimal" | "horizontal";
  /** CTA layout */
  ctaLayout: "centered" | "split" | "minimal";
  /** Contact layout */
  contactLayout: "centered" | "two-column" | "card";
  /** Nav layout */
  navStyle: "floating" | "sticky" | "minimal";
  /** Footer layout */
  footerStyle: "columns" | "centered" | "minimal";
}

/**
 * Variant 0 — Original
 * The original hardcoded design before the variant system.
 * Rounded-2xl cards, centered headers, gradient decorations, timeline process, accordion FAQ.
 */
const variant0: VariantStyle = {
  id: 0,
  name: "Original",
  description: "Den ursprungliga designen. Rundade kort med border, centrerade rubriker, dekorativa gradient-blobbar, vertikal timeline-process, accordion-FAQ, flytande pill-nav, kolumn-footer.",
  cardRadius: "rounded-2xl",
  cardBorder: true,
  cardShadow: "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
  cardPadding: "p-7 sm:p-8",
  gridCols: "sm:grid-cols-2 lg:grid-cols-3",
  headerAlign: "center",
  iconRadius: "rounded-xl",
  iconSize: "h-12 w-12",
  buttonRadius: "rounded-2xl",
  showDecorations: true,
  hoverEffect: "hover:-translate-y-1",
  statValueSize: "text-4xl sm:text-5xl lg:text-6xl",
  testimonialStyle: "card",
  processLayout: "timeline",
  faqStyle: "accordion",
  heroAlign: "center",
  aboutLayout: "image-right",
  galleryGrid: "uniform",
  teamStyle: "card",
  ctaLayout: "centered",
  contactLayout: "centered",
  navStyle: "floating",
  footerStyle: "columns",
};

/**
 * Variant 1 — Modern Cards
 * Similar to original but with softer shadows, 2-col grid, and card-style process.
 */
const variant1: VariantStyle = {
  id: 1,
  name: "Modern Cards",
  description: "Moderna kort med mjuka skuggor. 2-kolumnig layout, kort-baserad process, citat-testimonials, featured galleri med stor förstabild, sticky header, kolumn-footer.",
  cardRadius: "rounded-xl",
  cardBorder: true,
  cardShadow: "shadow-md shadow-black/[0.04]",
  cardPadding: "p-6 sm:p-7",
  gridCols: "sm:grid-cols-2 lg:grid-cols-2",
  headerAlign: "center",
  iconRadius: "rounded-lg",
  iconSize: "h-11 w-11",
  buttonRadius: "rounded-xl",
  showDecorations: true,
  hoverEffect: "hover:-translate-y-0.5 hover:shadow-lg",
  statValueSize: "text-4xl sm:text-5xl lg:text-6xl",
  testimonialStyle: "quote",
  processLayout: "cards",
  faqStyle: "accordion",
  heroAlign: "center",
  aboutLayout: "image-right",
  galleryGrid: "featured",
  teamStyle: "card",
  ctaLayout: "centered",
  contactLayout: "card",
  navStyle: "sticky",
  footerStyle: "columns",
};

/**
 * Variant 2 — Clean & Minimal
 * Subtle borders, left-aligned headers, no decorations, smaller radius.
 */
const variant2: VariantStyle = {
  id: 2,
  name: "Clean & Minimal",
  description: "Ren och minimalistisk. Vänsterjusterade rubriker, inga dekorationer, liten border-radius, tvåkolumns-FAQ, horisontella teamkort, split CTA-layout, minimal nav, minimal footer.",
  cardRadius: "rounded-lg",
  cardBorder: true,
  cardShadow: "shadow-none",
  cardPadding: "p-6",
  gridCols: "sm:grid-cols-2 lg:grid-cols-2",
  headerAlign: "left",
  iconRadius: "rounded-lg",
  iconSize: "h-10 w-10",
  buttonRadius: "rounded-lg",
  showDecorations: false,
  hoverEffect: "hover:shadow-md",
  statValueSize: "text-3xl sm:text-4xl lg:text-5xl",
  testimonialStyle: "quote",
  processLayout: "cards",
  faqStyle: "two-column",
  heroAlign: "left",
  aboutLayout: "image-left",
  galleryGrid: "featured",
  teamStyle: "horizontal",
  ctaLayout: "split",
  contactLayout: "two-column",
  navStyle: "minimal",
  footerStyle: "minimal",
};

/**
 * Variant 3 — Bold & Filled
 * No borders, bold shadows, filled backgrounds, large radius, pill buttons.
 */
const variant3: VariantStyle = {
  id: 3,
  name: "Bold & Filled",
  description: "Djärv och fyllig. Inga borders, stora skuggor, extra stor border-radius, pill-knappar, horisontell process, masonry-galleri, minimal testimonials, flytande pill-nav, centrerad footer.",
  cardRadius: "rounded-3xl",
  cardBorder: false,
  cardShadow: "shadow-lg shadow-black/[0.06]",
  cardPadding: "p-8 sm:p-10",
  gridCols: "sm:grid-cols-2 lg:grid-cols-3",
  headerAlign: "center",
  iconRadius: "rounded-2xl",
  iconSize: "h-14 w-14",
  buttonRadius: "rounded-full",
  showDecorations: true,
  hoverEffect: "hover:-translate-y-1.5 hover:shadow-xl",
  statValueSize: "text-5xl sm:text-6xl lg:text-7xl",
  testimonialStyle: "minimal",
  processLayout: "horizontal",
  faqStyle: "cards",
  heroAlign: "center",
  aboutLayout: "image-top",
  galleryGrid: "masonry",
  teamStyle: "minimal",
  ctaLayout: "minimal",
  contactLayout: "card",
  navStyle: "floating",
  footerStyle: "centered",
};

export const VARIANTS: Record<number, VariantStyle> = {
  0: variant0,
  1: variant1,
  2: variant2,
  3: variant3,
};

/** Total number of variants available */
export const VARIANT_COUNT = Object.keys(VARIANTS).length;

/**
 * Get the style variant config for a given variant number.
 * Falls back to variant 0 (original) if the number is unknown.
 */
export function getVariantStyle(variant?: number): VariantStyle {
  if (variant === undefined || variant === null || !(variant in VARIANTS)) return variant0;
  return VARIANTS[variant];
}

/** Valid values for nav_style / footer_style overrides */
const VALID_NAV_STYLES = new Set<VariantStyle["navStyle"]>(["floating", "sticky", "minimal"]);
const VALID_FOOTER_STYLES = new Set<VariantStyle["footerStyle"]>(["columns", "centered", "minimal"]);

/**
 * Apply user-chosen nav/footer style overrides on top of the base variant.
 * Empty string or invalid value = keep the variant default.
 */
export function applyLayoutOverrides(
  base: VariantStyle,
  navStyle?: string,
  footerStyle?: string,
): VariantStyle {
  const nav = navStyle && VALID_NAV_STYLES.has(navStyle as VariantStyle["navStyle"])
    ? (navStyle as VariantStyle["navStyle"])
    : base.navStyle;
  const footer = footerStyle && VALID_FOOTER_STYLES.has(footerStyle as VariantStyle["footerStyle"])
    ? (footerStyle as VariantStyle["footerStyle"])
    : base.footerStyle;
  if (nav === base.navStyle && footer === base.footerStyle) return base;
  return { ...base, navStyle: nav, footerStyle: footer };
}
