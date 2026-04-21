import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchBlogPost, fetchSiteMeta } from "@/lib/api";
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
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
        {post.featured_image && (
          <div className="mt-8 overflow-hidden rounded-2xl">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full object-cover"
              loading="eager"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg mt-8 max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: renderContent(post.content || "") }}
        />
      </article>
    </main>
  );
}

/**
 * Simple content renderer — supports basic HTML content.
 * For Markdown support, integrate a markdown renderer on the server.
 * For now, if content looks like plain text (no HTML tags), wrap in paragraphs.
 */
function renderContent(content: string): string {
  // If content already contains HTML tags, return as-is
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content;
  }
  // Otherwise, convert line breaks to paragraphs
  return content
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}
