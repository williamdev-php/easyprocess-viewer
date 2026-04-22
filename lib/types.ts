export interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface CTAButton {
  label: string;
  href: string;
}

export interface Highlight {
  label: string;
  value: string;
}

export interface ServiceItem {
  title: string;
  description: string;
}

export interface GalleryImage {
  url: string;
  alt?: string;
  caption?: string;
}

export interface TestimonialItem {
  text: string;
  author: string;
  role?: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface TeamMember {
  name: string;
  role?: string;
  image?: string | null;
  bio?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ProcessStep {
  title: string;
  description: string;
  step_number?: number;
}

export interface PricingTier {
  name: string;
  price: string;
  description?: string;
  features?: string[];
  highlighted?: boolean;
  cta?: CTAButton | null;
}

export interface LogoItem {
  name: string;
  image_url?: string;
}

export interface ContentBlock {
  type: string; // "text" | "image" | "button" | "heading"
  content?: string;
  url?: string;
  alt?: string;
  label?: string;
  href?: string;
}

export interface OpeningHoursDay {
  day: string; // "Monday" | "Tuesday" | ... | "Sunday"
  open?: string; // "09:00"
  close?: string; // "17:00"
  closed?: boolean;
}

export interface SectionSettings {
  animation?: string; // "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale" | "none"
  background_color?: string;
}

export interface HeadScript {
  src?: string | null;
  content?: string | null;
  async_attr?: boolean;
  defer?: boolean;
}

export interface HeadMeta {
  name: string;
  content: string;
}

export interface HeadScripts {
  scripts?: HeadScript[];
  meta_tags?: HeadMeta[];
}

export interface SiteData {
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
    og_image?: string | null;
    language?: string;
  };
  section_order?: string[];
  theme?: string;
  style_variant?: number;
  /** Layout override — pick nav style independently of style_variant. "" = use variant default. */
  nav_style?: string;
  /** Layout override — pick footer style independently of style_variant. "" = use variant default. */
  footer_style?: string;
  /** Custom header navigation — when set, used instead of auto-generated nav. */
  header_nav?: NavItem[] | null;
  /** Custom footer navigation — when set, used instead of auto-generated nav. */
  footer_nav?: NavItem[] | null;
  /** Viewer version — locks this site to a specific component set. Defaults to "v1". */
  viewer_version?: string;
  branding?: {
    logo_url?: string | null;
    colors?: Partial<Colors>;
    fonts?: { heading?: string; body?: string };
  };
  business?: {
    name?: string;
    tagline?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    org_number?: string | null;
    social_links?: Record<string, string>;
    opening_hours_enabled?: boolean;
    opening_hours?: OpeningHoursDay[];
  };
  hero?: {
    headline: string;
    subtitle?: string;
    cta?: CTAButton | null;
    background_image?: string | null;
    show_cta?: boolean;
  } | null;
  about?: {
    title?: string;
    text?: string;
    image?: string | null;
    highlights?: Highlight[] | null;
    show_highlights?: boolean;
  } | null;
  features?: {
    title?: string;
    subtitle?: string;
    items?: FeatureItem[];
  } | null;
  stats?: {
    title?: string;
    items?: StatItem[];
  } | null;
  services?: {
    title?: string;
    subtitle?: string;
    items?: ServiceItem[];
  } | null;
  process?: {
    title?: string;
    subtitle?: string;
    steps?: ProcessStep[];
  } | null;
  gallery?: {
    title?: string;
    subtitle?: string;
    images?: GalleryImage[];
  } | null;
  team?: {
    title?: string;
    subtitle?: string;
    members?: TeamMember[];
  } | null;
  testimonials?: {
    title?: string;
    subtitle?: string;
    items?: TestimonialItem[];
    show_ratings?: boolean;
  } | null;
  faq?: {
    title?: string;
    subtitle?: string;
    items?: FAQItem[];
  } | null;
  cta?: {
    title?: string;
    text?: string;
    button?: CTAButton | null;
    show_button?: boolean;
  } | null;
  contact?: {
    title?: string;
    text?: string;
    show_form?: boolean;
    show_info?: boolean;
  } | null;
  pricing?: {
    title?: string;
    subtitle?: string;
    tiers?: PricingTier[];
  } | null;
  video?: {
    title?: string;
    subtitle?: string;
    video_url?: string;
    caption?: string;
  } | null;
  logo_cloud?: {
    title?: string;
    subtitle?: string;
    logos?: LogoItem[];
  } | null;
  custom_content?: {
    title?: string;
    subtitle?: string;
    layout?: string;
    blocks?: ContentBlock[];
  } | null;
  banner?: {
    text?: string;
    button?: CTAButton | null;
    background_color?: string;
  } | null;
  section_settings?: Record<string, SectionSettings>;
  seo?: {
    structured_data?: Record<string, unknown>;
    robots?: string;
  };
  head_scripts?: HeadScripts | null;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteResponse {
  site_data: SiteData;
  template?: string;
  status?: string;
  created_at?: string;
  claim_token?: string | null;
  installed_apps?: string[];
}

// ---------------------------------------------------------------------------
// Blog types
// ---------------------------------------------------------------------------

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content?: string;
  featured_image: string | null;
  author_name: string | null;
  category_name: string | null;
  category_slug: string | null;
  published_at: string | null;
  created_at?: string | null;
}

export interface BlogPostList {
  items: BlogPost[];
  total: number;
  page: number;
  page_size: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  post_count: number;
}

export interface SiteMeta {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  og_image?: string | null;
  language: string;
  logo_url?: string | null;
  business_name: string;
  structured_data: Record<string, unknown>;
  robots: string;
  head_scripts?: HeadScripts | null;
}
