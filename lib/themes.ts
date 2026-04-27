export type ThemeId = "modern" | "bold" | "elegant" | "minimal" | "brutalist" | "soft" | "corporate" | "playful";

export interface Theme {
  id: ThemeId | "custom";
  /** Border radius for cards, buttons, images */
  radius: { sm: string; md: string; lg: string; full: string };
  /** Shadow styles */
  shadow: { card: string; button: string; nav: string };
  /** Section vertical padding */
  sectionPadding: string;
  /** Heading styles */
  heading: { weight: string; tracking: string; transform: string };
  /** Button style */
  button: { radius: string; padding: string; weight: string };
  /** Card style extras */
  card: { border: boolean; radius: string; padding: string };
  /** Hero min-height */
  heroHeight: string;
  /** Nav height */
  navPadding: string;
  /** Decorative elements */
  decorations: boolean;
  /** Divider between sections */
  sectionDivider: boolean;
}

/** Partial theme config for custom theme building — all fields optional. */
export type CustomThemeConfig = Partial<Omit<Theme, "id">>;

const modern: Theme = {
  id: "modern",
  radius: { sm: "rounded-lg", md: "rounded-xl", lg: "rounded-2xl", full: "rounded-full" },
  shadow: {
    card: "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_24px_rgba(0,0,0,0.06)]",
    button: "shadow-lg shadow-black/10",
    nav: "shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
  },
  sectionPadding: "py-24 sm:py-32",
  heading: { weight: "font-bold", tracking: "tracking-tight", transform: "" },
  button: { radius: "rounded-xl", padding: "px-8 py-4", weight: "font-semibold" },
  card: { border: false, radius: "rounded-2xl", padding: "p-8" },
  heroHeight: "min-h-[85vh]",
  navPadding: "py-4",
  decorations: true,
  sectionDivider: false,
};

const bold: Theme = {
  id: "bold",
  radius: { sm: "rounded-md", md: "rounded-lg", lg: "rounded-xl", full: "rounded-full" },
  shadow: {
    card: "shadow-xl shadow-black/8",
    button: "shadow-xl shadow-black/15",
    nav: "shadow-lg shadow-black/5",
  },
  sectionPadding: "py-20 sm:py-28",
  heading: { weight: "font-black", tracking: "tracking-tighter", transform: "" },
  button: { radius: "rounded-lg", padding: "px-10 py-5", weight: "font-bold" },
  card: { border: false, radius: "rounded-xl", padding: "p-8" },
  heroHeight: "min-h-screen",
  navPadding: "py-5",
  decorations: true,
  sectionDivider: false,
};

const elegant: Theme = {
  id: "elegant",
  radius: { sm: "rounded", md: "rounded-md", lg: "rounded-lg", full: "rounded-full" },
  shadow: {
    card: "shadow-sm",
    button: "shadow-sm",
    nav: "shadow-none",
  },
  sectionPadding: "py-24 sm:py-32",
  heading: { weight: "font-semibold", tracking: "tracking-normal", transform: "" },
  button: { radius: "rounded-md", padding: "px-8 py-3.5", weight: "font-medium" },
  card: { border: true, radius: "rounded-lg", padding: "p-7" },
  heroHeight: "min-h-[75vh]",
  navPadding: "py-5",
  decorations: false,
  sectionDivider: true,
};

const minimal: Theme = {
  id: "minimal",
  radius: { sm: "rounded-sm", md: "rounded", lg: "rounded-md", full: "rounded-full" },
  shadow: {
    card: "shadow-none",
    button: "shadow-none",
    nav: "shadow-none",
  },
  sectionPadding: "py-20 sm:py-24",
  heading: { weight: "font-semibold", tracking: "tracking-tight", transform: "" },
  button: { radius: "rounded", padding: "px-7 py-3", weight: "font-medium" },
  card: { border: true, radius: "rounded", padding: "p-6" },
  heroHeight: "min-h-[70vh]",
  navPadding: "py-4",
  decorations: false,
  sectionDivider: false,
};

const brutalist: Theme = {
  id: "brutalist",
  radius: { sm: "rounded-none", md: "rounded-none", lg: "rounded-none", full: "rounded-none" },
  shadow: {
    card: "shadow-[4px_4px_0_rgba(0,0,0,0.9)]",
    button: "shadow-[3px_3px_0_rgba(0,0,0,0.9)]",
    nav: "shadow-[0_2px_0_rgba(0,0,0,0.9)]",
  },
  sectionPadding: "py-20 sm:py-28",
  heading: { weight: "font-black", tracking: "tracking-tight", transform: "uppercase" },
  button: { radius: "rounded-none", padding: "px-8 py-4", weight: "font-bold" },
  card: { border: true, radius: "rounded-none", padding: "p-6" },
  heroHeight: "min-h-[90vh]",
  navPadding: "py-4",
  decorations: false,
  sectionDivider: true,
};

const soft: Theme = {
  id: "soft",
  radius: { sm: "rounded-2xl", md: "rounded-3xl", lg: "rounded-[2rem]", full: "rounded-full" },
  shadow: {
    card: "shadow-[0_2px_15px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)]",
    button: "shadow-md shadow-black/5",
    nav: "shadow-sm shadow-black/3",
  },
  sectionPadding: "py-24 sm:py-32",
  heading: { weight: "font-semibold", tracking: "tracking-tight", transform: "" },
  button: { radius: "rounded-full", padding: "px-8 py-3.5", weight: "font-medium" },
  card: { border: false, radius: "rounded-3xl", padding: "p-8" },
  heroHeight: "min-h-[80vh]",
  navPadding: "py-5",
  decorations: true,
  sectionDivider: false,
};

const corporate: Theme = {
  id: "corporate",
  radius: { sm: "rounded", md: "rounded-md", lg: "rounded-lg", full: "rounded-full" },
  shadow: {
    card: "shadow-sm shadow-black/[0.06]",
    button: "shadow-sm",
    nav: "shadow-[0_1px_2px_rgba(0,0,0,0.06)]",
  },
  sectionPadding: "py-20 sm:py-28",
  heading: { weight: "font-bold", tracking: "tracking-tight", transform: "" },
  button: { radius: "rounded-md", padding: "px-6 py-3", weight: "font-semibold" },
  card: { border: true, radius: "rounded-md", padding: "p-6" },
  heroHeight: "min-h-[70vh]",
  navPadding: "py-3",
  decorations: false,
  sectionDivider: true,
};

const playful: Theme = {
  id: "playful",
  radius: { sm: "rounded-xl", md: "rounded-2xl", lg: "rounded-3xl", full: "rounded-full" },
  shadow: {
    card: "shadow-lg shadow-black/[0.08]",
    button: "shadow-lg shadow-black/10",
    nav: "shadow-md shadow-black/5",
  },
  sectionPadding: "py-24 sm:py-36",
  heading: { weight: "font-extrabold", tracking: "tracking-tight", transform: "" },
  button: { radius: "rounded-full", padding: "px-10 py-4", weight: "font-bold" },
  card: { border: false, radius: "rounded-2xl", padding: "p-8 sm:p-10" },
  heroHeight: "min-h-screen",
  navPadding: "py-5",
  decorations: true,
  sectionDivider: false,
};

export const themes: Record<ThemeId, Theme> = { modern, bold, elegant, minimal, brutalist, soft, corporate, playful };

/**
 * Build a custom theme by merging partial overrides onto a base theme.
 * Use this to let site owners tweak individual theme properties.
 */
export function buildCustomTheme(base: ThemeId | Theme, overrides: CustomThemeConfig): Theme {
  const baseTheme = typeof base === "string" ? themes[base] ?? modern : base;
  return {
    ...baseTheme,
    ...overrides,
    id: "custom",
    radius: { ...baseTheme.radius, ...overrides.radius },
    shadow: { ...baseTheme.shadow, ...overrides.shadow },
    heading: { ...baseTheme.heading, ...overrides.heading },
    button: { ...baseTheme.button, ...overrides.button },
    card: { ...baseTheme.card, ...overrides.card },
  };
}

export function getTheme(id?: string, customOverrides?: CustomThemeConfig): Theme {
  if (!id || id === "default") return customOverrides ? buildCustomTheme("modern", customOverrides) : modern;
  if (id === "custom" && customOverrides) return buildCustomTheme("modern", customOverrides);
  const base = id in themes ? themes[id as ThemeId] : modern;
  return customOverrides ? buildCustomTheme(base, customOverrides) : base;
}
