import type { Colors } from "./types";

export const DEFAULT_COLORS: Colors = {
  primary: "#2563eb",
  secondary: "#1e40af",
  accent: "#f59e0b",
  background: "#ffffff",
  text: "#111827",
};

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** Validate hex color string — returns safe fallback on invalid input. */
function safeHex(hex: string, fallback = "#000000"): string {
  if (typeof hex !== "string") return fallback;
  const trimmed = hex.trim();
  return HEX_RE.test(trimmed) ? trimmed : fallback;
}

/** Parse hex to RGB tuple */
function hexToRgb(hex: string): [number, number, number] {
  const safe = safeHex(hex);
  const n = parseInt(safe.replace("#", ""), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

/** Convert RGB tuple to hex */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${((Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).padStart(6, "0")}`;
}

/** Convert RGB to HSL (h: 0-360, s: 0-1, l: 0-1) */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

/** Convert HSL to RGB */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

/**
 * Compute relative luminance of a hex color per WCAG 2.1.
 * Returns a value between 0 (black) and 1 (white).
 */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Compute contrast ratio between two hex colors.
 * Returns a value >= 1 (identical) up to 21 (black/white).
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Ensure a text color meets WCAG AA contrast against a background.
 * @param textHex   — the text color to check/adjust
 * @param bgHex     — the background color
 * @param minRatio  — minimum contrast ratio (4.5 for normal text, 3 for large text)
 * @returns the original textHex if it passes, otherwise an adjusted version
 */
export function ensureContrast(textHex: string, bgHex: string, minRatio = 4.5): string {
  if (contrastRatio(textHex, bgHex) >= minRatio) return safeHex(textHex);

  // Determine whether to lighten or darken based on background luminance
  const bgLum = relativeLuminance(bgHex);
  const [r, g, b] = hexToRgb(textHex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const direction = bgLum > 0.5 ? -1 : 1; // darken on light bg, lighten on dark bg

  // Binary search for a lightness that meets the ratio
  let lo = direction > 0 ? l : 0;
  let hi = direction > 0 ? 1 : l;
  let bestL = direction > 0 ? 1 : 0;

  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const [tr, tg, tb] = hslToRgb(h, s, mid);
    const candidate = rgbToHex(tr, tg, tb);
    if (contrastRatio(candidate, bgHex) >= minRatio) {
      bestL = mid;
      if (direction > 0) hi = mid; else lo = mid;
    } else {
      if (direction > 0) lo = mid; else hi = mid;
    }
  }

  const [fr, fg, fb] = hslToRgb(h, s, bestL);
  return rgbToHex(fr, fg, fb);
}

/** Lighten (positive) or darken (negative) a hex color */
export function adjustColor(hex: string, amount: number): string {
  const safe = safeHex(hex);
  const h = safe.replace("#", "");
  const num = parseInt(h, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/** Mix two hex colors by ratio (0 = first, 1 = second) */
export function mixColor(hex1: string, hex2: string, ratio: number): string {
  const h1 = safeHex(hex1).replace("#", "");
  const h2 = safeHex(hex2, "#ffffff").replace("#", "");
  const n1 = parseInt(h1, 16);
  const n2 = parseInt(h2, 16);
  const r = Math.round(((n1 >> 16) & 0xff) * (1 - ratio) + ((n2 >> 16) & 0xff) * ratio);
  const g = Math.round(((n1 >> 8) & 0xff) * (1 - ratio) + ((n2 >> 8) & 0xff) * ratio);
  const b = Math.round((n1 & 0xff) * (1 - ratio) + (n2 & 0xff) * ratio);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/** Validate a partial Colors object — only accept valid hex values. */
function sanitizePartialColors(raw?: Partial<Colors>): Partial<Colors> {
  if (!raw || typeof raw !== "object") return {};
  const result: Partial<Colors> = {};
  for (const key of Object.keys(DEFAULT_COLORS) as (keyof Colors)[]) {
    const v = raw[key];
    if (typeof v === "string" && HEX_RE.test(v.trim())) {
      result[key] = v.trim();
    }
  }
  return result;
}

/**
 * Derive a secondary color from a primary using HSL manipulation.
 * For dark primaries (lightness < 0.35), lighten and shift hue slightly.
 * For light primaries, darken and shift hue in the opposite direction.
 * This produces a harmonious analogous color that works as a gradient pair.
 */
function deriveSecondary(primaryHex: string): string {
  const [r, g, b] = hexToRgb(primaryHex);
  const [h, s, l] = rgbToHsl(r, g, b);

  let newH: number;
  let newS: number;
  let newL: number;

  if (l < 0.35) {
    // Dark primary: shift hue +25deg analogous, boost lightness
    newH = h + 25;
    newS = Math.min(1, s * 1.1);
    newL = Math.min(0.55, l + 0.15);
  } else if (l > 0.7) {
    // Very light primary: shift hue -20deg, darken moderately
    newH = h - 20;
    newS = Math.min(1, s * 1.05);
    newL = Math.max(0.3, l - 0.2);
  } else {
    // Mid-range: shift hue -15deg, darken slightly
    newH = h - 15;
    newS = Math.min(1, s * 1.05);
    newL = Math.max(0.2, l - 0.1);
  }

  const [sr, sg, sb] = hslToRgb(newH, newS, newL);
  return rgbToHex(sr, sg, sb);
}

export function resolveColors(data: { branding?: { colors?: Partial<Colors> } }): Colors {
  const custom = sanitizePartialColors(data?.branding?.colors);
  const merged = { ...DEFAULT_COLORS, ...custom };

  // If primary was customized but secondary was NOT, derive secondary from
  // primary so the hero gradient stays visually consistent with the brand.
  // Without this, the hero shows a blue gradient when primary is e.g. pink.
  if (custom.primary && !custom.secondary) {
    merged.secondary = deriveSecondary(custom.primary);
  }

  // Ensure text color meets WCAG AA contrast (4.5:1) against background
  merged.text = ensureContrast(merged.text, merged.background, 4.5);

  return merged;
}

// ---------------------------------------------------------------------------
// Opacity helpers
// ---------------------------------------------------------------------------

/** Add hex opacity to a hex color. opacity: 0-1 */
export function withOpacity(hex: string, opacity: number): string {
  const safe = safeHex(hex);
  const alpha = Math.round(Math.min(1, Math.max(0, opacity)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${safe}${alpha}`;
}

/** Convert a hex color to an rgba() string. opacity: 0-1 */
export function hexToRgba(hex: string, opacity: number = 1): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${Math.min(1, Math.max(0, opacity))})`;
}

// ---------------------------------------------------------------------------
// Gradient generation
// ---------------------------------------------------------------------------

export type GradientDirection =
  | "to-right"
  | "to-left"
  | "to-bottom"
  | "to-top"
  | "to-bottom-right"
  | "to-bottom-left"
  | "to-top-right"
  | "to-top-left"
  | "radial";

const DIRECTION_MAP: Record<string, string> = {
  "to-right": "to right",
  "to-left": "to left",
  "to-bottom": "to bottom",
  "to-top": "to top",
  "to-bottom-right": "to bottom right",
  "to-bottom-left": "to bottom left",
  "to-top-right": "to top right",
  "to-top-left": "to top left",
};

/** Generate a CSS gradient string from two or more hex colors. */
export function generateGradient(
  colors: string[],
  direction: GradientDirection = "to-right",
): string {
  const safeColors = colors.map((c) => safeHex(c));
  if (safeColors.length < 2) return safeColors[0] || "#000000";
  if (direction === "radial") {
    return `radial-gradient(circle, ${safeColors.join(", ")})`;
  }
  return `linear-gradient(${DIRECTION_MAP[direction] || "to right"}, ${safeColors.join(", ")})`;
}

/** Generate a gradient from the primary to secondary brand colors. */
export function brandGradient(
  resolved: Colors,
  direction: GradientDirection = "to-right",
): string {
  return generateGradient([resolved.primary, resolved.secondary], direction);
}

/** Generate a subtle section-background gradient using brand primary at low opacity. */
export function sectionGradient(
  resolved: Colors,
  direction: GradientDirection = "to-bottom",
  opacity: number = 0.05,
): string {
  const from = hexToRgba(resolved.primary, opacity);
  const to = hexToRgba(resolved.background, 0);
  if (direction === "radial") {
    return `radial-gradient(circle, ${from}, ${to})`;
  }
  return `linear-gradient(${DIRECTION_MAP[direction] || "to bottom"}, ${from}, ${to})`;
}

// ---------------------------------------------------------------------------
// Per-section color overrides
// ---------------------------------------------------------------------------

export interface SectionColorOverrides {
  background?: string;
  text?: string;
  primary?: string;
  accent?: string;
  opacity?: number;
}

/**
 * Resolve colors for a specific section, applying per-section overrides on top
 * of the site-wide resolved colors.
 */
export function resolveSectionColors(
  base: Colors,
  overrides?: SectionColorOverrides,
): Colors & { backgroundStyle: string } {
  if (!overrides) {
    return { ...base, backgroundStyle: base.background };
  }
  const sanitized = sanitizePartialColors(overrides as Partial<Colors>);
  const merged = { ...base, ...sanitized };

  // If an override specifies opacity, apply it to the background
  const bgOpacity = overrides.opacity ?? 1;
  const backgroundStyle =
    bgOpacity < 1
      ? hexToRgba(merged.background, bgOpacity)
      : merged.background;

  return { ...merged, backgroundStyle };
}
