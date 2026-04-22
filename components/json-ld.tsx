import type { SiteData } from "@/lib/types";

/**
 * Build a LocalBusiness JSON-LD object dynamically from site business data.
 * Only included when there is enough business info to be meaningful.
 */
function buildLocalBusinessLd(data: SiteData): Record<string, unknown> | null {
  const biz = data.business;
  if (!biz?.name) return null;

  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: biz.name,
  };

  if (biz.email) ld.email = biz.email;
  if (biz.phone) ld.telephone = biz.phone;

  if (biz.address) {
    ld.address = {
      "@type": "PostalAddress",
      streetAddress: biz.address,
    };
  }

  // Opening hours → schema.org openingHoursSpecification
  if (biz.opening_hours_enabled && biz.opening_hours?.length) {
    const specs = biz.opening_hours
      .filter((d) => !d.closed && d.open && d.close)
      .map((d) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${d.day}`,
        opens: d.open,
        closes: d.close,
      }));
    if (specs.length > 0) {
      ld.openingHoursSpecification = specs;
    }
  }

  if (data.meta?.description) ld.description = data.meta.description;

  const logoUrl = data.branding?.logo_url;
  if (logoUrl) ld.logo = logoUrl;

  return ld;
}

/**
 * Merge user-provided structured data with auto-generated LocalBusiness data.
 * User-provided fields take precedence (they override auto-generated ones).
 */
function mergeStructuredData(
  autoLd: Record<string, unknown> | null,
  userLd: Record<string, unknown> | undefined,
): Record<string, unknown> | null {
  // If user provided their own structured data, merge auto-generated as base
  if (userLd && Object.keys(userLd).length > 0) {
    if (autoLd) {
      // User overrides auto-generated fields
      return { ...autoLd, ...userLd };
    }
    return userLd;
  }
  return autoLd;
}

interface JsonLdProps {
  /** Full site data — used to auto-generate LocalBusiness structured data. */
  siteData?: SiteData;
  /** Legacy: raw structured data object (used when siteData is not provided). */
  data?: Record<string, unknown>;
}

export default function JsonLd({ siteData, data }: JsonLdProps) {
  let finalData: Record<string, unknown> | null = null;

  if (siteData) {
    const autoLd = buildLocalBusinessLd(siteData);
    finalData = mergeStructuredData(autoLd, siteData.seo?.structured_data);
  } else if (data && Object.keys(data).length > 0) {
    finalData = data;
  }

  if (!finalData || Object.keys(finalData).length === 0) return null;

  // Escape < to \u003c to prevent breaking out of the <script> tag (XSS).
  const json = JSON.stringify(finalData).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
