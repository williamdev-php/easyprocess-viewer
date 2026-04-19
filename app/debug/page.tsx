"use client";

import { useState } from "react";
import { resolveColors } from "@/lib/colors";
import { getTheme } from "@/lib/themes";
import { VARIANTS, getVariantStyle } from "@/lib/style-variants";
import type { SiteData } from "@/lib/types";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { Hero } from "@/components/hero";
import { AboutSection } from "@/components/about-section";
import { FeaturesSection } from "@/components/features-section";
import { StatsSection } from "@/components/stats-section";
import { ServicesSection } from "@/components/services-section";
import { ProcessSection } from "@/components/process-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { TeamSection } from "@/components/team-section";
import { FAQSection } from "@/components/faq-section";
import { CTASection } from "@/components/cta-section";
import { GallerySection } from "@/components/gallery-section";
import { ContactSection } from "@/components/contact-section";

// ---------------------------------------------------------------------------
// Example site data for the debug preview
// ---------------------------------------------------------------------------
const EXAMPLE_DATA: SiteData = {
  meta: {
    title: "Björkström Bygg AB | Kvalitet i varje detalj",
    description: "Stockholms mest erfarna byggfirma med över 25 års erfarenhet.",
    language: "sv",
  },
  theme: "modern",
  branding: {
    colors: {
      primary: "#1e3a5f",
      secondary: "#2c5282",
      accent: "#e8a838",
      background: "#ffffff",
      text: "#1a202c",
    },
  },
  business: {
    name: "Björkström Bygg AB",
    tagline: "Kvalitet i varje detalj sedan 1998",
    email: "info@bjorkstrombygg.se",
    phone: "08-123 45 67",
    address: "Industrivägen 12, 112 34 Stockholm",
  },
  hero: {
    headline: "Vi bygger ditt drömhem med precision och passion",
    subtitle:
      "Med över 25 års erfarenhet levererar vi byggprojekt i toppklass. Från renovering till nybyggnation — vi tar hand om hela processen så att du kan fokusera på det som är viktigt.",
    cta: { label: "Begär offert", href: "#contact" },
    background_image: null,
  },
  about: {
    title: "Erfarenhet du kan lita på",
    text: "Björkström Bygg AB grundades 1998 med en enkel vision: att leverera byggprojekt av högsta kvalitet till rimliga priser. Under mer än 25 år har vi vuxit från ett litet familjeföretag till en av Stockholms mest betrodda byggfirmor. Vi är stolta över att varje projekt vi tar oss an genomförs med samma omsorg och uppmärksamhet till detaljer som vi hade redan från start. Vårt team av erfarna hantverkare och projektledare ser till att varje steg i processen hålls till högsta standard.",
    image: null,
    highlights: [
      { label: "Grundat", value: "1998" },
      { label: "Projekt", value: "500+" },
      { label: "Medarbetare", value: "45" },
      { label: "Kundnöjdhet", value: "98%" },
    ],
  },
  features: {
    title: "Varför välja Björkström Bygg?",
    subtitle: "Vi kombinerar hantverkskunnande med modern teknik",
    items: [
      {
        title: "25+ års erfarenhet",
        description:
          "Vår långa erfarenhet ger oss kunskap att hantera alla typer av byggprojekt, från enkla renoveringar till komplexa nybyggnationer.",
        icon: "🏗️",
      },
      {
        title: "Certifierade hantverkare",
        description:
          "Alla våra hantverkare är utbildade och certifierade. Vi investerar kontinuerligt i kompetensutveckling för att ligga i framkant.",
        icon: "✅",
      },
      {
        title: "Fast pris utan överraskningar",
        description:
          "Vi erbjuder alltid fast pris efter noggrann besiktning. Du vet exakt vad projektet kostar innan vi börjar.",
        icon: "💰",
      },
      {
        title: "10 års garanti",
        description:
          "Vi står bakom vårt arbete med 10 års garanti på alla konstruktionsarbeten. Din trygghet är vår prioritet.",
        icon: "🛡️",
      },
      {
        title: "Hållbart byggande",
        description:
          "Vi använder miljövänliga material och energieffektiva lösningar. Bra för din plånbok och för planeten.",
        icon: "🌿",
      },
      {
        title: "Personlig kontakt",
        description:
          "Du har alltid en dedikerad projektledare som håller dig uppdaterad genom hela processen.",
        icon: "🤝",
      },
    ],
  },
  stats: {
    title: "Siffror som talar för sig själva",
    items: [
      { value: "500+", label: "Genomförda projekt" },
      { value: "25+", label: "Års erfarenhet" },
      { value: "98%", label: "Nöjda kunder" },
      { value: "45", label: "Medarbetare" },
    ],
  },
  services: {
    title: "Våra tjänster",
    subtitle: "Kompletta bygglösningar för hem och företag",
    items: [
      {
        title: "Nybyggnation",
        description:
          "Från grund till tak — vi bygger ditt nya hem eller kommersiella fastighet med högsta kvalitet.",
      },
      {
        title: "Renovering",
        description:
          "Ge ditt hem nytt liv med en professionell renovering. Kök, badrum, eller totalrenovering.",
      },
      {
        title: "Tillbyggnad",
        description:
          "Behöver du mer utrymme? Vi planerar och bygger tillbyggnader som smälter in perfekt.",
      },
      {
        title: "Fasadrenovering",
        description:
          "Skydda och förnya ditt hus med en professionell fasadrenovering. Vi hanterar puts, tegel och trä.",
      },
      {
        title: "Takarbeten",
        description:
          "Takomläggning, takreparationer och takbyten. Vi arbetar med alla typer av takmaterial.",
      },
      {
        title: "Projektledning",
        description:
          "Behöver du hjälp att koordinera ditt byggprojekt? Våra projektledare tar hand om allt.",
      },
    ],
  },
  process: {
    title: "Så fungerar det",
    subtitle: "Från första kontakt till färdigt projekt — en smidig process",
    steps: [
      {
        title: "Kontakt & rådgivning",
        description:
          "Vi börjar med ett kostnadsfritt möte där vi diskuterar dina önskemål, behov och budget.",
        step_number: 1,
      },
      {
        title: "Planering & offert",
        description:
          "Efter besiktning tar vi fram en detaljerad plan och ett fast pris utan dolda kostnader.",
        step_number: 2,
      },
      {
        title: "Byggstart",
        description:
          "Vårt team sätter igång med arbetet. Du har alltid kontakt med din dedikerade projektledare.",
        step_number: 3,
      },
      {
        title: "Slutbesiktning & garanti",
        description:
          "Vi går igenom projektet tillsammans och säkerställer att allt uppfyller dina förväntningar. 10 års garanti.",
        step_number: 4,
      },
    ],
  },
  gallery: {
    title: "Våra projekt",
    subtitle: "Ett urval av genomförda projekt",
    images: [
      { url: "/api/placeholder/800/600", alt: "Nybyggd villa i Djursholm" },
      { url: "/api/placeholder/800/600", alt: "Köksrenovering i Östermalm" },
      { url: "/api/placeholder/800/600", alt: "Tillbyggnad i Bromma" },
      { url: "/api/placeholder/800/600", alt: "Badrumsrenovering" },
      { url: "/api/placeholder/800/600", alt: "Kontorsrenovering" },
      { url: "/api/placeholder/800/600", alt: "Fasadrenovering" },
    ],
  },
  team: {
    title: "Möt vårt team",
    subtitle: "Erfarna proffs som brinner för kvalitet",
    members: [
      {
        name: "Erik Björkström",
        role: "VD & Grundare",
        bio: "Över 30 års erfarenhet inom byggbranschen. Erik grundade företaget 1998.",
        image: null,
      },
      {
        name: "Anna Lindberg",
        role: "Projektledare",
        bio: "Certifierad projektledare med fokus på kundkommunikation och kvalitetssäkring.",
        image: null,
      },
      {
        name: "Marcus Holm",
        role: "Platschef",
        bio: "15 års erfarenhet som snickare och platschef. Specialist på nybyggnation.",
        image: null,
      },
    ],
  },
  testimonials: {
    title: "Vad våra kunder säger",
    subtitle: "",
    items: [
      {
        text: "Björkström Bygg renoverade vårt kök och badrum. Resultatet överträffade alla förväntningar. Professionellt team som höll tidplan och budget perfekt.",
        author: "Maria Svensson",
        role: "Villaägare, Bromma",
      },
      {
        text: "Vi anlitade Björkström för en totalrenovering av vår kontorslokal. Imponerade av deras projektledning och hantverk. Rekommenderas varmt!",
        author: "Johan Eriksson",
        role: "Företagskund, Kista",
      },
      {
        text: "Fantastiskt jobb med vår tillbyggnad. Erik och hans team var alltid tillgängliga och lyhörda för våra önskemål. Otroligt nöjda med resultatet.",
        author: "Sofia Andersson",
        role: "Kund sedan 2021",
      },
      {
        text: "Tredje gången vi anlitar Björkström Bygg. De levererar alltid hög kvalitet och är ett nöje att samarbeta med. Helt enkelt bäst i Stockholm.",
        author: "Lars Pettersson",
        role: "Fastighetsägare",
      },
    ],
    show_ratings: true,
  },
  faq: {
    title: "Vanliga frågor",
    subtitle: "Svar på de vanligaste frågorna om våra tjänster",
    items: [
      {
        question: "Hur lång tid tar en typisk renovering?",
        answer:
          "Det beror på projektets omfattning. Ett badrum tar normalt 3-4 veckor, ett kök 4-6 veckor, och en totalrenovering kan ta 2-4 månader. Vi ger alltid en realistisk tidsplan vid offert.",
      },
      {
        question: "Erbjuder ni fast pris?",
        answer:
          "Ja, vi erbjuder alltid fast pris efter en noggrann besiktning. Du vet exakt vad projektet kostar innan vi börjar. Inga dolda tillägg eller överraskningar.",
      },
      {
        question: "Vilka garantier lämnar ni?",
        answer:
          "Vi ger 10 års garanti på alla konstruktionsarbeten. Dessutom har vi ansvarsförsäkring och följer alla gällande byggnormer och bestämmelser.",
      },
      {
        question: "Kan ni hjälpa till med bygglov?",
        answer:
          "Absolut! Vi hanterar hela bygglovsprocessen åt dig, från ansökan till godkännande. Vi har lång erfarenhet av att arbeta med Stockholms stad.",
      },
      {
        question: "Hur snabbt kan ni komma igång?",
        answer:
          "Normalt kan vi påbörja mindre projekt inom 2-3 veckor. Större projekt planeras in med längre framförhållning. Kontakta oss för en aktuell tidsuppskattning.",
      },
      {
        question: "Arbetar ni med ROT-avdrag?",
        answer:
          "Ja, vi hanterar all administration kring ROT-avdrag. Du betalar bara din del — vi tar hand om resten direkt med Skatteverket.",
      },
    ],
  },
  cta: {
    title: "Redo att starta ditt projekt?",
    text: "Kontakta oss idag för en kostnadsfri rådgivning och offert. Vi hjälper dig att förverkliga dina byggdrömmar.",
    button: { label: "Begär offert nu", href: "#contact" },
  },
  contact: {
    title: "Kontakta oss",
    text: "Hör av dig så berättar vi mer om hur vi kan hjälpa dig med ditt nästa projekt.",
    show_form: true,
    show_info: true,
  },
};

// ---------------------------------------------------------------------------
// Tab button
// ---------------------------------------------------------------------------
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-white text-gray-900 shadow-md"
          : "text-gray-400 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Debug page
// ---------------------------------------------------------------------------
export default function DebugPage() {
  const [activeVariant, setActiveVariant] = useState(0);

  const variantStyle = getVariantStyle(activeVariant);
  const colors = resolveColors(EXAMPLE_DATA);
  const theme = getTheme(EXAMPLE_DATA.theme);
  const lang = EXAMPLE_DATA.meta?.language || "sv";

  const variantIds = Object.keys(VARIANTS)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="min-h-screen" style={{ background: "#0f0f0f" }}>
      {/* Sticky tab bar */}
      <div className="sticky top-0 z-[100] border-b border-white/10 bg-[#0f0f0f]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center gap-6">
            <h1 className="shrink-0 text-sm font-bold text-white/70 uppercase tracking-wider">
              Style Variants
            </h1>
            <div className="flex gap-2 overflow-x-auto">
              {variantIds.map((id) => {
                const v = VARIANTS[id];
                return (
                  <TabButton
                    key={id}
                    active={activeVariant === id}
                    onClick={() => setActiveVariant(id)}
                  >
                    {id}: {v.name}
                  </TabButton>
                );
              })}
            </div>
          </div>
          {/* Description */}
          <p className="mt-2 text-xs text-gray-500">
            {variantStyle.description}
          </p>
        </div>
      </div>

      {/* Variant info bar */}
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex flex-wrap gap-3 text-[11px] font-mono text-gray-500">
          <span>cardRadius: <span className="text-gray-300">{variantStyle.cardRadius}</span></span>
          <span>gridCols: <span className="text-gray-300">{variantStyle.gridCols}</span></span>
          <span>headerAlign: <span className="text-gray-300">{variantStyle.headerAlign}</span></span>
          <span>heroAlign: <span className="text-gray-300">{variantStyle.heroAlign}</span></span>
          <span>processLayout: <span className="text-gray-300">{variantStyle.processLayout}</span></span>
          <span>faqStyle: <span className="text-gray-300">{variantStyle.faqStyle}</span></span>
          <span>testimonialStyle: <span className="text-gray-300">{variantStyle.testimonialStyle}</span></span>
          <span>teamStyle: <span className="text-gray-300">{variantStyle.teamStyle}</span></span>
          <span>ctaLayout: <span className="text-gray-300">{variantStyle.ctaLayout}</span></span>
          <span>contactLayout: <span className="text-gray-300">{variantStyle.contactLayout}</span></span>
          <span>galleryGrid: <span className="text-gray-300">{variantStyle.galleryGrid}</span></span>
          <span>aboutLayout: <span className="text-gray-300">{variantStyle.aboutLayout}</span></span>
          <span>decorations: <span className="text-gray-300">{String(variantStyle.showDecorations)}</span></span>
          <span>cardBorder: <span className="text-gray-300">{String(variantStyle.cardBorder)}</span></span>
        </div>
      </div>

      {/* Rendered sections */}
      <div
        className="relative"
        style={{
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          background: colors.background,
        }}
      >
        {/* Nav */}
        <SectionLabel name="Nav" />
        <Nav
          items={[
            { label: "Hem", href: "#" },
            { label: "Om oss", href: "#" },
            { label: "Tjänster", href: "#" },
            { label: "Galleri", href: "#" },
            { label: "FAQ", href: "#" },
          ]}
          colors={colors}
          theme={theme}
          businessName={EXAMPLE_DATA.business?.name}
          ctaHref="#contact"
          lang={lang}
          variantStyle={variantStyle}
        />

        {/* Hero */}
        <SectionLabel name="Hero" />
        <Hero
          headline={EXAMPLE_DATA.hero!.headline}
          subtitle={EXAMPLE_DATA.hero!.subtitle}
          cta={EXAMPLE_DATA.hero!.cta}
          background_image={null}
          show_cta={true}
          colors={colors}
          theme={theme}
          lang={lang}
          variantStyle={variantStyle}
        />

        {/* About */}
        <SectionLabel name="About" />
        <AboutSection
          {...EXAMPLE_DATA.about!}
          colors={colors}
          theme={theme}
          variant="full"
          lang={lang}
          variantStyle={variantStyle}
        />

        {/* Features */}
        <SectionLabel name="Features" />
        <FeaturesSection
          {...EXAMPLE_DATA.features!}
          colors={colors}
          theme={theme}
          lang={lang}
          variantStyle={variantStyle}
        />

        {/* Stats */}
        <SectionLabel name="Stats" />
        <StatsSection
          {...EXAMPLE_DATA.stats!}
          colors={colors}
          theme={theme}
          variantStyle={variantStyle}
        />

        {/* Services */}
        <SectionLabel name="Services" />
        <ServicesSection
          {...EXAMPLE_DATA.services!}
          colors={colors}
          theme={theme}
          lang={lang}
          variantStyle={variantStyle}
        />

        {/* Process */}
        <SectionLabel name="Process" />
        <ProcessSection
          {...EXAMPLE_DATA.process!}
          colors={colors}
          theme={theme}
          lang={lang}
          variantStyle={variantStyle}
        />

        {/* Gallery */}
        <SectionLabel name="Gallery" />
        <GallerySection
          {...EXAMPLE_DATA.gallery!}
          colors={colors}
          theme={theme}
          lang={lang}
          variantStyle={variantStyle}
        />

        {/* Team */}
        <SectionLabel name="Team" />
        <TeamSection
          {...EXAMPLE_DATA.team!}
          colors={colors}
          theme={theme}
          lang={lang}
          variantStyle={variantStyle}
        />

        {/* Testimonials */}
        <SectionLabel name="Testimonials" />
        <TestimonialsSection
          {...EXAMPLE_DATA.testimonials!}
          colors={colors}
          theme={theme}
          lang={lang}
          variantStyle={variantStyle}
        />

        {/* FAQ */}
        <SectionLabel name="FAQ" />
        <FAQSection
          {...EXAMPLE_DATA.faq!}
          colors={colors}
          theme={theme}
          variantStyle={variantStyle}
        />

        {/* CTA */}
        <SectionLabel name="CTA" />
        <CTASection
          {...EXAMPLE_DATA.cta!}
          colors={colors}
          theme={theme}
          variantStyle={variantStyle}
        />

        {/* Contact */}
        <SectionLabel name="Contact" />
        <ContactSection
          {...EXAMPLE_DATA.contact!}
          email={EXAMPLE_DATA.business?.email}
          phone={EXAMPLE_DATA.business?.phone}
          address={EXAMPLE_DATA.business?.address}
          colors={colors}
          theme={theme}
          lang={lang}
          variantStyle={variantStyle}
        />

        {/* PageHeader (sub-page header example) */}
        <SectionLabel name="PageHeader (sub-page)" />
        <PageHeader
          title="Våra tjänster"
          subtitle="Kompletta bygglösningar för hem och företag"
          colors={colors}
          theme={theme}
          variantStyle={variantStyle}
        />

        {/* Footer */}
        <SectionLabel name="Footer" />
        <Footer
          businessName={EXAMPLE_DATA.business?.name}
          email={EXAMPLE_DATA.business?.email}
          phone={EXAMPLE_DATA.business?.phone}
          address={EXAMPLE_DATA.business?.address}
          socialLinks={{ facebook: "#", instagram: "#", linkedin: "#" }}
          navItems={[
            { label: "Hem", href: "#" },
            { label: "Om oss", href: "#" },
            { label: "Tjänster", href: "#" },
            { label: "Galleri", href: "#" },
            { label: "FAQ", href: "#" },
            { label: "Kontakt", href: "#" },
          ]}
          colors={colors}
          theme={theme}
          lang={lang}
          variantStyle={variantStyle}
        />
      </div>
    </div>
  );
}

function SectionLabel({ name }: { name: string }) {
  return (
    <div className="relative z-20 mx-auto max-w-7xl px-4">
      <div className="inline-flex items-center gap-2 rounded-b-lg bg-black/80 px-3 py-1 text-[11px] font-mono font-medium text-emerald-400 backdrop-blur-sm">
        &lt;{name} /&gt;
      </div>
    </div>
  );
}
