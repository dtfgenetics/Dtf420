import type { Metadata } from "next";
import Link from "next/link";
import { TerpeneCorpusExplorer } from "@/components/terpenes/TerpeneCorpusExplorer";
import { buildEducationMetadata } from "@/lib/education-seo";

export const metadata: Metadata = buildEducationMetadata({
  title: "Cultivar Chemistry Corpus",
  description:
    "Filter the public cannabis cultivar chemistry corpus by terpene medians, sample depth, laboratory breadth, producer breadth, region, chemotype, and total-terpene median.",
  path: "/learn/terpenes/corpus",
});

export default function TerpeneCorpusPage() {
  return (
    <>
      <div style={{ width: "min(calc(100% - 40px), 1460px)", margin: "22px auto 0" }}>
        <Link href="/learn/terpenes" style={{ color: "var(--accent-strong)", fontWeight: 850, fontSize: 12 }}>
          ← Back to THC Terpene Atlas
        </Link>
      </div>
      <TerpeneCorpusExplorer />
    </>
  );
}
