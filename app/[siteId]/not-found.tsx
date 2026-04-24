import Link from "next/link";

/**
 * Branded not-found page for routes within a valid site.
 * The site's Nav and Footer are rendered by the parent layout,
 * so this only shows the inner content.
 *
 * Uses CSS custom properties set by the layout for branding:
 *  --brand-primary, --brand-text, --brand-bg
 * Also reads data-lang from the layout wrapper for i18n.
 */
export default function SiteNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center px-6 max-w-md">
        <h1
          className="text-7xl font-extrabold mb-4"
          style={{ color: "var(--brand-primary, #2563eb)" }}
        >
          404
        </h1>
        <h2
          className="text-2xl font-semibold mb-4"
          style={{ color: "var(--brand-text, #111827)" }}
        >
          <span className="hidden [html[lang=en]_&]:inline">Page not found</span>
          <span className="[html[lang=en]_&]:hidden">Sidan hittades inte</span>
        </h2>
        <p
          className="mb-8 text-lg"
          style={{ color: "var(--brand-text, #6b7280)", opacity: 0.6 }}
        >
          <span className="hidden [html[lang=en]_&]:inline">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </span>
          <span className="[html[lang=en]_&]:hidden">
            Sidan du letar efter finns inte eller har flyttats.
          </span>
        </p>
        <Link
          href="/"
          className="inline-block rounded-full px-8 py-3.5 text-white font-semibold text-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
          style={{ backgroundColor: "var(--brand-primary, #2563eb)" }}
        >
          <span className="hidden [html[lang=en]_&]:inline">Go to homepage</span>
          <span className="[html[lang=en]_&]:hidden">Till startsidan</span>
        </Link>
      </div>
    </div>
  );
}
