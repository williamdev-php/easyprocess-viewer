import { notFound } from "next/navigation";
import { fetchSiteData } from "@/lib/api";
import JsonLd from "@/components/json-ld";
import { LivePreviewWrapper } from "@/components/live-preview-wrapper";

interface Props {
  params: Promise<{ siteId: string }>;
}

export default async function HomePage({ params }: Props) {
  const { siteId } = await params;
  const data = await fetchSiteData(siteId);
  if (!data) notFound();

  return (
    <>
      <JsonLd data={data.seo?.structured_data || {}} />
      <LivePreviewWrapper initialData={data} siteId={siteId} />
    </>
  );
}
