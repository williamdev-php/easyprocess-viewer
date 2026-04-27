import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchBlogPost, fetchSiteMeta } from "@/lib/api";
import Image from "next/image";
import { sanitizeImageUrl, sanitizeHtml } from "@/lib/sanitize";
import { t } from "@/lib/i18n";

interface Props {
  params: Promise<{ siteId: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteId, slug } = await params;
  const [post, meta] = await Promise.all([
    fetchBlogPost(siteId, slug),
    fetchSiteMeta(siteId),
  ]);

  if (!post) return { title: "Inlägget hittades inte" };

  const siteName = meta?.business_name || meta?.title || "";
  return {
    title: `${post.title} — ${siteName}`,
    description: post.excerpt || "",
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      images: post.featured_image ? [post.featured_image] : [],
      type: "article",
      ...(post.published_at && { publishedTime: post.published_at }),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { siteId, slug } = await params;
  const [post, meta] = await Promise.all([
    fetchBlogPost(siteId, slug),
    fetchSiteMeta(siteId),
  ]);

  if (!post) notFound();

  const lang = meta?.language || "sv";
  const isProduction = process.env.NODE_ENV === "production";
  const base = isProduction ? "" : `/${siteId}`;

  // Build Article JSON-LD structured data
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(post.featured_image ? { image: post.featured_image } : {}),
    ...(post.published_at ? { datePublished: post.published_at } : {}),
    ...(post.author_name
      ? { author: { "@type": "Person", name: post.author_name } }
      : {}),
    ...(meta?.business_name
      ? { publisher: { "@type": "Organization", name: meta.business_name } }
      : {}),
  };
  const articleJsonLdHtml = JSON.stringify(articleJsonLd).replace(/</g, "\\u003c");

  return (
    <main className="mx-auto max-w-3xl px-4 pb-12 pt-28 sm:px-6 sm:pt-32 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: articleJsonLdHtml }}
      />
      {/* Back link */}
      <Link
        href={`${base}/blog`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        {lang === "sv" ? "Tillbaka till bloggen" : "Back to blog"}
      </Link>

      <article>
        {/* Category badge */}
        {post.category_name && (
          <Link
            href={`${base}/blog?category=${post.category_slug}`}
            className="mb-4 inline-block text-xs font-medium uppercase tracking-wide text-gray-500 hover:text-gray-700"
          >
            {post.category_name}
          </Link>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{post.title}</h1>

        {/* Meta info */}
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          {post.author_name && (
            <span className="font-medium text-gray-700">{post.author_name}</span>
          )}
          {post.published_at && (
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString(
                lang === "sv" ? "sv-SE" : "en-US",
                { year: "numeric", month: "long", day: "numeric" }
              )}
            </time>
          )}
        </div>

        {/* Featured image */}
        {sanitizeImageUrl(post.featured_image) && (
          <div className="mt-8 overflow-hidden rounded-2xl">
            <Image
              src={sanitizeImageUrl(post.featured_image)!}
              alt={post.title}
              width={960}
              height={540}
              className="w-full object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg mt-8 max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-a:underline prose-img:rounded-2xl prose-img:mx-auto prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-ul:list-disc prose-ol:list-decimal prose-li:my-1 prose-hr:my-8"
          dangerouslySetInnerHTML={{ __html: sanitizeContent(post.content || "") }}
        />
      </article>
    </main>
  );
}

/**
 * Sanitize blog HTML content for safe rendering.
 * Uses server-safe sanitizer (no jsdom dependency).
 * Backend sanitizes on save; this is defense-in-depth for the viewer.
 */
function sanitizeContent(content: string): string {
  return sanitizeHtml(content);
}
