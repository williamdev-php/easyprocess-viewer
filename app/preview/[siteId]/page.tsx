import { notFound } from "next/navigation";
import { fetchSiteData } from "@/lib/api";
import { PreviewShell } from "@/components/preview-shell";

interface Props {
  params: Promise<{ siteId: string }>;
}

export const dynamic = "force-dynamic";

export default async function PreviewPage({ params }: Props) {
  const { siteId } = await params;
  const data = await fetchSiteData(siteId);
  if (!data) notFound();

  return <PreviewShell initialData={data} siteId={siteId} />;
}
