import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchBlogPosts, fetchBlogCategories, fetchSiteMeta } from "@/lib/api";
import { t } from "@/lib/i18n";

interface Props {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ page?: string; category?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteId } = await params;
  const meta = await fetchSiteMeta(siteId);
  const title = meta ? `Blogg — ${meta.business_name || meta.title}` : "Blogg";
  return {
    title,
    description: meta?.description || "",
  };
}

export default async function BlogListingPage({ params, searchParams }: Props) {
  const { siteId } = await params;
  const sp = await searchParams;
  const page = parseInt(sp.page || "1", 10);
  const category = sp.category || undefined;

  const [postsData, categories, meta] = await Promise.all([
    fetchBlogPosts(siteId, page, 12, category),
    fetchBlogCategories(siteId),
    fetchSiteMeta(siteId),
  ]);

  if (!postsData) notFound();

  const lang = meta?.language || "sv";
  const isProduction = process.env.NODE_ENV === "production";
  const base = isProduction ? "" : `/${siteId}`;
  const posts = postsData.items;
  const totalPages = Math.ceil(postsData.total / postsData.page_size);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">{t("nav.blog", lang)}</h1>

      {/* Category filter */}
      {categories && categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href={`${base}/blog`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              !category ? "bg-current/10 text-current" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {lang === "sv" ? "Alla" : "All"}
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`${base}/blog?category=${cat.slug}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                category === cat.slug
                  ? "bg-current/10 text-current"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {cat.name} ({cat.post_count})
            </Link>
          ))}
        </div>
      )}

      {/* Posts grid */}
      {posts.length === 0 ? (
        <p className="text-gray-500">
          {lang === "sv" ? "Inga blogginlägg ännu." : "No blog posts yet."}
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`${base}/blog/${post.slug}`}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
            >
              {post.featured_image && (
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-5">
                {post.category_name && (
                  <span className="mb-2 inline-block text-xs font-medium uppercase tracking-wide text-gray-500">
                    {post.category_name}
                  </span>
                )}
                <h2 className="text-lg font-semibold leading-snug group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                  {post.author_name && <span>{post.author_name}</span>}
                  {post.published_at && (
                    <time>{new Date(post.published_at).toLocaleDateString(lang === "sv" ? "sv-SE" : "en-US")}</time>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
          {page > 1 && (
            <Link
              href={`${base}/blog?page=${page - 1}${category ? `&category=${category}` : ""}`}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              &larr; {lang === "sv" ? "Föregående" : "Previous"}
            </Link>
          )}
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`${base}/blog?page=${page + 1}${category ? `&category=${category}` : ""}`}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              {lang === "sv" ? "Nästa" : "Next"} &rarr;
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
