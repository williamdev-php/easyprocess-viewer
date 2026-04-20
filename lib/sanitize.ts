/** Maximum number of items allowed per section array to prevent DoS. */
const MAX_SECTION_ITEMS = 50;

/**
 * Truncate arrays within site_data sections to prevent excessive rendering.
 * Mutates the object in place for performance.
 */
export function limitSectionArrays(data: Record<string, unknown>): void {
  const arrayFields: [string, string][] = [
    ["features", "items"],
    ["services", "items"],
    ["testimonials", "items"],
    ["faq", "items"],
    ["stats", "items"],
    ["gallery", "images"],
    ["team", "members"],
    ["process", "steps"],
    ["about", "highlights"],
  ];
  for (const [section, field] of arrayFields) {
    const sec = data[section];
    if (sec && typeof sec === "object" && !Array.isArray(sec)) {
      const obj = sec as Record<string, unknown>;
      if (Array.isArray(obj[field]) && (obj[field] as unknown[]).length > MAX_SECTION_ITEMS) {
        obj[field] = (obj[field] as unknown[]).slice(0, MAX_SECTION_ITEMS);
      }
    }
  }
}

/**
 * Sanitize a URL to prevent XSS via javascript:, data:, or vbscript: protocols.
 */
export function sanitizeUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:")
  ) {
    return undefined;
  }
  return url;
}

/**
 * Sanitize a font family name to prevent CSS injection.
 * Only allows alphanumeric characters, spaces, hyphens, and commas.
 */
const SAFE_FONT_RE = /^[a-zA-Z0-9\s\-,'.]+$/;
export function sanitizeFontFamily(font: string | undefined | null): string | undefined {
  if (!font) return undefined;
  const trimmed = font.trim();
  if (!trimmed || trimmed.length > 200) return undefined;
  if (!SAFE_FONT_RE.test(trimmed)) return undefined;
  return trimmed;
}

/**
 * Sanitize an email address for use in mailto: links.
 * Returns undefined if the value doesn't look like a valid email.
 */
const EMAIL_FORMAT_RE = /^[^\s@<>'"]+@[^\s@<>'"]+\.[^\s@<>'"]+$/;
export function sanitizeEmail(email: string | undefined | null): string | undefined {
  if (!email) return undefined;
  const trimmed = email.trim();
  if (trimmed.length > 254 || !EMAIL_FORMAT_RE.test(trimmed)) return undefined;
  return trimmed;
}

/**
 * Sanitize a phone number for use in tel: links.
 * Only allows digits, spaces, hyphens, parentheses, dots, and leading +.
 */
const PHONE_FORMAT_RE = /^\+?[\d\s\-().]+$/;
export function sanitizePhone(phone: string | undefined | null): string | undefined {
  if (!phone) return undefined;
  const trimmed = phone.trim();
  if (trimmed.length > 30 || !PHONE_FORMAT_RE.test(trimmed)) return undefined;
  return trimmed;
}

/**
 * Sanitize a URL for use as an image src.
 * Only allows http:, https:, and relative URLs.
 */
export function sanitizeImageUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith(".")
  ) {
    return url;
  }
  return undefined;
}
