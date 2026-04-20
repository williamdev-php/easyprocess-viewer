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
  seo?: {
    structured_data?: Record<string, unknown>;
    robots?: string;
  };
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
}
