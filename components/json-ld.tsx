export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  if (!data || Object.keys(data).length === 0) return null;

  // Escape < to \u003c to prevent breaking out of the <script> tag (XSS).
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
