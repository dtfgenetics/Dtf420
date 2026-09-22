import type { Metadata } from "next";
import Link from "next/link";
import { TerpeneRegistryExplorer } from "@/components/terpenes/TerpeneRegistryExplorer";
import { buildEducationMetadata } from "@/lib/education-seo";

export const metadata: Metadata = buildEducationMetadata({
  title: "All-Known Terpene Registry",
  description:
    "Explore the versioned global terpene and terpenoid candidate registry by family, exact identity, classification, confidence, review state, and source provenance.",
  path: "/learn/terpenes/registry",
});

export default function TerpeneRegistryPage() {
  return (
    <>
      <div style={{ width: "min(calc(100% - 40px), 1460px)", margin: "22px auto 0" }}>
        <Link href="/learn/terpenes" style={{ color: "var(--accent-strong)", fontWeight: 850, fontSize: 12 }}>
          ← Back to THC Terpene Atlas
        </Link>
      </div>
      <TerpeneRegistryExplorer />
    </>
  );
}
