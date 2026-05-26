// Server component — emits a JSON-LD <script> tag with safe < escaping.
type JsonLdProps = {
  id?: string;
  data: Record<string, unknown> | Record<string, unknown>[];
};

export default function JsonLd({ id, data }: JsonLdProps) {
  const json = JSON.stringify(Array.isArray(data) ? data : [data]).replace(
    /</g,
    '\\u003c'
  );
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
