/**
 * Version registry — maps viewer_version strings to section renderer functions.
 *
 * Each version defines how to render a section key (e.g. "hero", "about") into
 * a React node. This allows multiple design versions to coexist in the same
 * deployment without affecting each other.
 *
 * To add a new version:
 *   1. Create components/v2/ with your new section components
 *   2. Write a renderSection function for v2
 *   3. Add it to VERSION_RENDERERS below
 *   4. Update LATEST_VERSION
 *   5. See VERSIONS.md for the full checklist
 */

import type { ReactNode } from "react";
import type { SiteData, Colors, NavItem } from "./types";
import type { Theme } from "./themes";
import type { VariantStyle } from "./style-variants";

export interface RenderContext {
  data: SiteData;
  colors: Colors;
  theme: Theme;
  variantStyle: VariantStyle;
  lang: string;
  siteId: string;
}

export type SectionRenderer = (key: string, ctx: RenderContext) => ReactNode;

/**
 * Resolve the viewer version from site data.
 * Falls back to "v1" for sites created before the versioning system.
 */
export function resolveVersion(data: SiteData): string {
  return data.viewer_version || "v1";
}

/** The latest version assigned to newly created sites. */
export const LATEST_VERSION = "v1";

/**
 * Registry of version → renderer.
 *
 * v1 rendering is handled inline by live-preview-wrapper.tsx and preview-shell.tsx
 * (the existing code). Future versions will import their own renderSection here.
 *
 * Example for v2:
 *   import { renderSectionV2 } from "@/components/v2";
 *   VERSION_RENDERERS["v2"] = renderSectionV2;
 */
export const VERSION_RENDERERS: Record<string, SectionRenderer> = {
  // v1 is the default — handled by the existing components.
  // It's registered here for completeness but the actual rendering
  // is done by the switch statement in live-preview-wrapper/preview-shell
  // to avoid breaking the existing dynamic import pattern.
};

/**
 * Check if a version has a dedicated renderer in the registry.
 * If false, the caller should use the built-in v1 renderer.
 */
export function hasVersionRenderer(version: string): boolean {
  return version in VERSION_RENDERERS;
}

/**
 * Get the renderer for a given version.
 * Returns undefined for v1 (which uses the built-in renderer).
 */
export function getVersionRenderer(version: string): SectionRenderer | undefined {
  return VERSION_RENDERERS[version];
}

// ---------------------------------------------------------------------------
// Nav / Footer version renderers
// ---------------------------------------------------------------------------

export interface NavRenderProps extends RenderContext {
  items: NavItem[];
  logoUrl?: string | null;
  businessName?: string;
  ctaHref?: string;
}

export interface FooterRenderProps extends RenderContext {
  businessName?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  socialLinks?: Record<string, string>;
  navItems: NavItem[];
}

export type NavRenderer = (props: NavRenderProps) => ReactNode;
export type FooterRenderer = (props: FooterRenderProps) => ReactNode;

/**
 * Nav/Footer version registries.
 * v1 uses the default Nav/Footer components (not registered here).
 * Future versions register custom Nav/Footer renderers.
 *
 * Example for v2:
 *   import { NavV2 } from "@/components/v2/nav";
 *   NAV_RENDERERS["v2"] = (props) => <NavV2 {...props} />;
 */
export const NAV_RENDERERS: Record<string, NavRenderer> = {};
export const FOOTER_RENDERERS: Record<string, FooterRenderer> = {};

export function getNavRenderer(version: string): NavRenderer | undefined {
  return NAV_RENDERERS[version];
}

export function getFooterRenderer(version: string): FooterRenderer | undefined {
  return FOOTER_RENDERERS[version];
}
