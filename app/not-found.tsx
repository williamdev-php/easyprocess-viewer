import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center px-6 max-w-md">
        <div className="text-8xl mb-6">😞</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          This page is unavailable
        </h1>
        <p className="text-gray-500 mb-8 text-lg">
          The site you&apos;re looking for doesn&apos;t exist, has been removed,
          or is no longer published.
        </p>
        <Link
          href="https://qvicko.com"
          className="inline-block rounded-full bg-blue-600 px-8 py-3.5 text-white font-semibold text-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200"
        >
          Create or transform your website
        </Link>
      </div>
    </div>
  );
}
