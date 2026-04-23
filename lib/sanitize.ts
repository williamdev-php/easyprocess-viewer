import type { HeadScripts, HeadScript, HeadMeta } from "./types";

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
    ["pricing", "tiers"],
    ["logo_cloud", "logos"],
    ["custom_content", "blocks"],
    ["ranking", "items"],
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

  // Also limit arrays inside extra_sections (duplicated sections)
  const extras = data.extra_sections;
  if (extras && typeof extras === "object" && !Array.isArray(extras)) {
    for (const entry of Object.values(extras as Record<string, { type?: string; data?: Record<string, unknown> }>)) {
      if (!entry?.type || !entry?.data) continue;
      for (const [section, field] of arrayFields) {
        if (entry.type !== section) continue;
        const arr = entry.data[field];
        if (Array.isArray(arr) && arr.length > MAX_SECTION_ITEMS) {
          entry.data[field] = arr.slice(0, MAX_SECTION_ITEMS);
        }
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

// ---------------------------------------------------------------------------
// Head scripts — viewer-side defense-in-depth validation
// ---------------------------------------------------------------------------

const ALLOWED_SCRIPT_HOSTS = new Set([
  "www.googletagmanager.com",
  "googletagmanager.com",
  "www.google-analytics.com",
  "www.google.com",
  "pagead2.googlesyndication.com",
  "connect.facebook.net",
  "www.facebook.com",
  "bat.bing.com",
  "clarity.ms",
  "www.clarity.ms",
  "snap.licdn.com",
  "platform.linkedin.com",
  "static.ads-twitter.com",
  "platform.twitter.com",
  "analytics.tiktok.com",
  "s.pinimg.com",
  "sc-static.net",
  "js.hs-scripts.com",
  "js.hs-analytics.net",
  "js.hsforms.net",
  "static.hotjar.com",
  "plausible.io",
  "cdn.matomo.cloud",
  "client.crisp.chat",
  "widget.intercom.io",
  "cdn.cookielaw.org",
  "cookiecdn.com",
]);

const DANGEROUS_PATTERNS = [
  /document\.cookie/i,
  /document\.write/i,
  /\.innerHTML\s*=/i,
  /\.outerHTML\s*=/i,
  /eval\s*\(/i,
  /(?<![a-zA-Z])Function\s*\(/,  // capital-F Function constructor only
  /setTimeout\s*\(\s*['"]/i,
  /setInterval\s*\(\s*['"]/i,
  /fetch\s*\(/i,
  /XMLHttpRequest/i,
  /window\.location\s*=/i,
  /window\.open\s*\(/i,
  /<\s*iframe/i,
  /import\s*\(/i,
  /require\s*\(/i,
  /localStorage|sessionStorage/i,
  /indexedDB/i,
  /WebSocket\s*\(/i,
];

function isAllowedScriptSrc(src: string): boolean {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && ALLOWED_SCRIPT_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

function isSafeInlineScript(content: string): boolean {
  return !DANGEROUS_PATTERNS.some((p) => p.test(content));
}

function isValidMetaTag(meta: HeadMeta): boolean {
  if (!meta.name || !meta.content) return false;
  if (!/^[a-zA-Z0-9_\-:.]+$/.test(meta.name)) return false;
  if (meta.name.length > 200 || meta.content.length > 500) return false;
  if (/[<>]/.test(meta.content)) return false;
  return true;
}

/**
 * Sanitize head_scripts on the viewer side (defense-in-depth).
 * Returns only scripts/meta_tags that pass validation.
 */
export function sanitizeHeadScripts(
  headScripts: HeadScripts | null | undefined,
): HeadScripts | null {
  if (!headScripts) return null;

  const safeScripts: HeadScript[] = (headScripts.scripts ?? [])
    .slice(0, 10)
    .filter((s) => {
      if (s.src) return isAllowedScriptSrc(s.src);
      if (s.content) return s.content.length <= 5000 && isSafeInlineScript(s.content);
      return false;
    });

  const safeMeta: HeadMeta[] = (headScripts.meta_tags ?? [])
    .slice(0, 10)
    .filter(isValidMetaTag);

  if (safeScripts.length === 0 && safeMeta.length === 0) return null;

  return { scripts: safeScripts, meta_tags: safeMeta };
}
