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

export function resolveColors(data: { branding?: { colors?: Partial<Colors> } }): Colors {
  return { ...DEFAULT_COLORS, ...sanitizePartialColors(data?.branding?.colors) };
}
