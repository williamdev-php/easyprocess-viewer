import { notFound } from "next/navigation";
import { fetchSiteData } from "@/lib/api";
import JsonLd from "@/components/json-ld";
import { LivePreviewWrapper } from "@/components/live-preview-wrapper";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Props {
  params: Promise<{ siteId: string }>;
}

export async function generateStaticParams(): Promise<{ siteId: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/sites/published`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const sites: { id: string }[] = await res.json();
    return sites.map((site) => ({ siteId: site.id }));
  } catch {
    return [];
  }
}

export default async function HomePage({ params }: Props) {
  const { siteId } = await params;
  const data = await fetchSiteData(siteId);
  if (!data) notFound();

  return (
    <>
      <JsonLd siteData={data} />
      <LivePreviewWrapper initialData={data} siteId={siteId} />
    </>
  );
}
