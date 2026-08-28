type LearningResourceJsonLdProps = {
  data: Record<string, unknown>;
};

export function LearningResourceJsonLd({ data }: LearningResourceJsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
