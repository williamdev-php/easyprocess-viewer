/**
 * Renders a dynamic page's sections using the shared section renderer.
 * Used by the catch-all route [siteId]/[...slug] for multi-page sites.
 */

import type { Colors, SiteData, PageSchema } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import type { VariantStyle } from "@/lib/style-variants";
import { renderSectionByType } from "@/lib/section-renderer";
import { ErrorBoundary } from "@/components/error-boundary";

interface Props {
  page: PageSchema;
  siteData: SiteData;
  colors: Colors;
  theme: Theme;
  variantStyle: VariantStyle;
}

export function DynamicPageRenderer({ page, siteData, colors, theme, variantStyle }: Props) {
  const lang = siteData.meta?.language || "sv";
  const siteId = ""; // Not needed for server rendering

  const ctx = { colors, theme, variantStyle, lang, siteId, data: siteData };

  return (
    <>
      {page.sections.map((section, i) => {
        const node = renderSectionByType(section.type, section.data, ctx);
        if (!node) return null;
        return (
          <ErrorBoundary sectionName={`${section.type}-${i}`} key={`${section.type}-${i}`}>
            {node}
          </ErrorBoundary>
        );
      })}
    </>
  );
}
