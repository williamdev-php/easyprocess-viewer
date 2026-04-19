import Link from "next/link";

/**
 * Not-found page for routes within a valid site.
 * The site's Nav and Footer are rendered by the parent layout,
 * so this only shows the inner content.
 *
 * For non-existent subdomains/domains, the root not-found.tsx is used instead.
 */
export default function SiteNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center px-6 max-w-md">
        <h1 className="text-6xl font-bold text-gray-800 mb-3">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Page not found
        </h2>
        <p className="text-gray-500 mb-8 text-lg">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-blue-600 px-8 py-3.5 text-white font-semibold text-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200"
        >
          Go to homepage
        </Link>
      </div>
    </div>
  );
}
