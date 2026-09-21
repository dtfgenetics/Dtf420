import type { Metadata } from "next";
import sourceRegistry from "@/data/terpenes/source-registry.json";
import { TerpeneCultivarBrowser } from "@/components/terpenes/TerpeneCultivarBrowser";
import { buildEducationMetadata } from "@/lib/education-seo";

export const metadata: Metadata = buildEducationMetadata({
  title: "Cultivar Terpene Distributions",
  description:
    "Explore repeated-sample cultivar terpene distributions with medians, quartiles, observed ranges, sample depth, and laboratory depth.",
  path: "/learn/terpenes/cultivars",
});

export default function TerpeneCultivarsPage() {
  const source = sourceRegistry.sources.find((item) => item.id === "SMITH-2022-COMMERCIAL-US");

  return (
    <TerpeneCultivarBrowser
      sourceName={source?.name ?? "Published commercial U.S. cannabis chemistry dataset"}
      sourceUrl={source && "repository" in source
        ? `https://github.com/${String(source.repository)}`
        : null}
    />
  );
}
