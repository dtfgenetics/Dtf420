import type { Metadata } from "next";
import Link from "next/link";
import { TerpeneProfileComparison } from "@/components/terpenes/TerpeneProfileComparison";
import { buildEducationMetadata } from "@/lib/education-seo";

export const metadata: Metadata = buildEducationMetadata({
  title: "Terpene Profile Comparison",
  description:
    "Compare two measured terpene fingerprints compound-by-compound with totals, shared compounds, vector similarity, and evidence-aware interpretation.",
  path: "/learn/terpenes/profiles",
});

export default function TerpeneProfilesPage() {
  return (
    <>
      <div style={{ width: "min(calc(100% - 40px), 1320px)", margin: "22px auto 0" }}>
        <Link href="/learn/terpenes" style={{ color: "var(--accent-strong)", fontWeight: 850, fontSize: 12 }}>
          ← Back to THC Terpene Atlas
        </Link>
      </div>
      <TerpeneProfileComparison />
    </>
  );
}
