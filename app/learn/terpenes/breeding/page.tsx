import type { Metadata } from "next";
import Link from "next/link";
import { TerpeneBreedingExplorer } from "@/components/terpenes/TerpeneBreedingExplorer";
import { buildEducationMetadata } from "@/lib/education-seo";

export const metadata: Metadata = buildEducationMetadata({
  title: "Terpene Breeding Explorer",
  description:
    "Compare measured parent terpene profiles, identify shared and parent-specific chemistry, and create evidence-aware selection targets for offspring screening.",
  path: "/learn/terpenes/breeding",
});

export default function TerpeneBreedingPage() {
  return (
    <>
      <div style={{ width: "min(calc(100% - 40px), 1320px)", margin: "24px auto 0" }}>
        <Link href="/learn/terpenes" style={{ color: "var(--accent-strong)", fontWeight: 850, fontSize: 12 }}>
          ← Back to THC Terpene Atlas
        </Link>
      </div>
      <TerpeneBreedingExplorer />
    </>
  );
}
