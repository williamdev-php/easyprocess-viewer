/**
 * Renders a dynamic page's sections using the shared section renderer.
 * Used by the catch-all route [siteId]/[...slug] for multi-page sites.
 *
 * Supports page-level layout configuration via PageLayoutConfig:
 * - default: standard full-width section rendering
 * - full-width: no max-width constraint
 * - narrow: narrower content column (max-w-3xl)
 * - sidebar-left / sidebar-right: two-column layout with sidebar
 * - landing: no header, full-width, optimized for landing pages
 */

import type { Colors, SiteData, PageSchema, PageLayoutConfig } from "@/lib/types";
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

const MAX_WIDTH_MAP: Record<string, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none",
};

const PADDING_MAP: Record<string, string> = {
  none: "",
  sm: "py-8",
  md: "py-16",
  lg: "py-24",
};

function renderSections(
  sections: { type: string; data: Record<string, unknown> }[],
  ctx: Parameters<typeof renderSectionByType>[2],
) {
  return sections.map((section, i) => {
    const node = renderSectionByType(section.type, section.data, ctx);
    if (!node) return null;
    return (
      <ErrorBoundary sectionName={`${section.type}-${i}`} key={`${section.type}-${i}`}>
        {node}
      </ErrorBoundary>
    );
  });
}

function PageHeader({ title, colors }: { title: string; colors: Colors }) {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <h1
        className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
        style={{ color: colors.text }}
      >
        {title}
      </h1>
    </div>
  );
}

export function DynamicPageRenderer({ page, siteData, colors, theme, variantStyle }: Props) {
  const lang = siteData.meta?.language || "sv";
  const siteId = ""; // Not needed for server rendering

  const ctx = { colors, theme, variantStyle, lang, siteId, data: siteData };
  const config: PageLayoutConfig = page.layout_config || {};
  const layout = config.layout || "default";
  const showHeader = config.show_header !== false && layout !== "landing";
  const maxWidthClass = config.max_width ? MAX_WIDTH_MAP[config.max_width] || "" : "";
  const paddingClass = config.padding ? PADDING_MAP[config.padding] || "" : "";

  const containerStyle: React.CSSProperties = {};
  if (config.background_color) {
    containerStyle.backgroundColor = config.background_color;
  }

  const mainSections = renderSections(page.sections, ctx);

  // Sidebar layouts
  if (layout === "sidebar-left" || layout === "sidebar-right") {
    const sidebarSections = config.sidebar_sections
      ? renderSections(config.sidebar_sections, ctx)
      : null;

    const sidebar = (
      <aside className="w-full md:w-72 lg:w-80 shrink-0">
        {sidebarSections}
      </aside>
    );

    const mainContent = (
      <div className="flex-1 min-w-0">
        {mainSections}
      </div>
    );

    return (
      <div style={containerStyle}>
        {showHeader && <PageHeader title={page.title} colors={colors} />}
        <div className={`mx-auto flex flex-col md:flex-row gap-8 px-5 sm:px-8 ${paddingClass} ${maxWidthClass || "max-w-7xl"}`}>
          {layout === "sidebar-left" ? (
            <>{sidebar}{mainContent}</>
          ) : (
            <>{mainContent}{sidebar}</>
          )}
        </div>
      </div>
    );
  }

  // Full-width layout
  if (layout === "full-width") {
    return (
      <div style={containerStyle}>
        {showHeader && <PageHeader title={page.title} colors={colors} />}
        <div className={paddingClass}>
          {mainSections}
        </div>
      </div>
    );
  }

  // Narrow layout
  if (layout === "narrow") {
    return (
      <div style={containerStyle}>
        {showHeader && <PageHeader title={page.title} colors={colors} />}
        <div className={`mx-auto ${maxWidthClass || "max-w-3xl"} px-5 sm:px-8 ${paddingClass}`}>
          {mainSections}
        </div>
      </div>
    );
  }

  // Landing layout - no header, full-width
  if (layout === "landing") {
    return (
      <div style={containerStyle}>
        {mainSections}
      </div>
    );
  }

  // Default layout
  return (
    <div style={containerStyle} className={paddingClass}>
      {showHeader && page.title && (
        <PageHeader title={page.title} colors={colors} />
      )}
      <div className={maxWidthClass ? `mx-auto ${maxWidthClass}` : ""}>
        {mainSections}
      </div>
    </div>
  );
}
