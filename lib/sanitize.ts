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
    ["quiz", "steps"],
    ["quiz", "results"],
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
 *
 * Also normalizes internal paths: bare slugs like "om-oss" become "/om-oss"
 * to prevent the browser from treating them as relative URLs (which would
 * navigate to e.g. "https://om-oss/" instead of the correct page).
 */
export function sanitizeUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  // Strip control characters (tabs, newlines, null bytes) that could bypass protocol checks
  const cleaned = url.replace(/[\x00-\x1f\x7f]/g, "").trim();
  if (!cleaned) return undefined;
  const lower = cleaned.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return undefined;
  }
  // Already absolute, anchor, or protocol-relative — return as-is
  if (
    cleaned.startsWith("/") ||
    cleaned.startsWith("#") ||
    cleaned.startsWith("http://") ||
    cleaned.startsWith("https://") ||
    cleaned.startsWith("mailto:") ||
    cleaned.startsWith("tel:")
  ) {
    return cleaned;
  }
  // Bare slug like "om-oss" or "tjanster" — prepend "/" to make it an absolute path.
  // Without this, the browser resolves it as a relative URL which breaks navigation.
  return `/${cleaned}`;
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
// Stricter email regex: local part allows alphanumeric, dots, hyphens, underscores, plus signs;
// domain requires at least one dot with alphanumeric labels (no consecutive dots, no leading/trailing dots).
const EMAIL_FORMAT_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
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
  // Strip control characters before validation
  const cleaned = url.replace(/[\x00-\x1f\x7f]/g, "").trim();
  if (!cleaned) return undefined;
  const lower = cleaned.toLowerCase();
  if (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("/") ||
    lower.startsWith(".")
  ) {
    return cleaned;
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

/** Validate SRI integrity attribute format (sha256-, sha384-, or sha512- prefix + base64). */
const SRI_RE = /^sha(256|384|512)-[A-Za-z0-9+/=]{43,128}$/;

function isValidSri(integrity: string | null | undefined): boolean {
  if (!integrity) return false;
  // SRI can contain multiple space-separated hashes
  return integrity.split(/\s+/).every((hash) => SRI_RE.test(hash));
}

function isAllowedScriptSrc(src: string, integrity?: string | null): boolean {
  try {
    const url = new URL(src);
    if (url.protocol !== "https:" || !ALLOWED_SCRIPT_HOSTS.has(url.hostname)) {
      return false;
    }
    // Require SRI for external scripts to ensure they haven't been tampered with.
    // If no integrity hash is provided, reject the script as a defense-in-depth measure.
    if (!isValidSri(integrity)) {
      if (typeof console !== "undefined") {
        console.warn(`[sanitize] Blocked external script without valid SRI: ${src}`);
      }
      return false;
    }
    return true;
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
      if (s.src) return isAllowedScriptSrc(s.src, s.integrity);
      if (s.content) return s.content.length <= 5000 && isSafeInlineScript(s.content);
      return false;
    });

  const safeMeta: HeadMeta[] = (headScripts.meta_tags ?? [])
    .slice(0, 10)
    .filter(isValidMetaTag);

  if (safeScripts.length === 0 && safeMeta.length === 0) return null;

  return { scripts: safeScripts, meta_tags: safeMeta };
}

// ---------------------------------------------------------------------------
// Server-safe HTML sanitizer (no jsdom/DOMPurify dependency)
// ---------------------------------------------------------------------------

const ALLOWED_TAGS_SET = new Set([
  "p", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "del",
  "ul", "ol", "li",
  "a", "img",
  "blockquote", "pre", "code",
  "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td",
  "div", "span",
]);

const ALLOWED_ATTRS_SET = new Set([
  "href", "target", "rel", "title",
  "src", "alt", "width", "height",
  "class", "style",
  "colspan", "rowspan",
]);

/**
 * Lightweight server-safe HTML sanitizer. Strips tags and attributes that are
 * not in the allow-lists. Does NOT depend on jsdom or any browser API.
 *
 * Backend already sanitizes content on save — this is defense-in-depth.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  // If content has no HTML tags (legacy plain text), convert to paragraphs
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return html
      .split(/\n\n+/)
      .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
      .join("");
  }

  // Strip disallowed tags (keep content for non-void tags, remove entirely for script/style/etc)
  const STRIP_ENTIRELY = /&lt;(script|style|iframe|object|embed|form|input|textarea|select|button)[^>]*>[\s\S]*?<\/\1>/gi;
  let result = html.replace(STRIP_ENTIRELY, "");

  // Remove dangerous tags completely (including content)
  result = result.replace(/<(script|style|iframe|object|embed|form|input|textarea|select|button)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  result = result.replace(/<(script|style|iframe|object|embed|form|input|textarea|select|button)\b[^>]*\/?>/gi, "");

  // Strip event handlers (on*)
  result = result.replace(/\s+on[a-z]+\s*=\s*["'][^"']*["']/gi, "");
  result = result.replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, "");

  // Strip javascript: hrefs
  result = result.replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"');

  // Remove disallowed tags but keep their inner content
  result = result.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag: string) => {
    const lower = tag.toLowerCase();
    if (!ALLOWED_TAGS_SET.has(lower)) return "";

    // For opening tags, filter attributes
    if (match.startsWith("</")) return `</${lower}>`;

    const selfClosing = match.endsWith("/>");
    // Extract allowed attributes
    const attrs: string[] = [];
    const attrRegex = /([a-z][a-z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(match)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";
      if (ALLOWED_ATTRS_SET.has(attrName)) {
        attrs.push(`${attrName}="${attrValue.replace(/"/g, "&quot;")}"`);
      }
    }

    const attrStr = attrs.length > 0 ? " " + attrs.join(" ") : "";
    return selfClosing ? `<${lower}${attrStr} />` : `<${lower}${attrStr}>`;
  });

  return result;
}
