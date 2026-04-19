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
