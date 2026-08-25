import type { Metadata } from "next";
import Link from "next/link";
import { AtlasGuidedPaths } from "@/components/atlas/AtlasGuidedPaths";

export const metadata: Metadata = {
  title: "Guided Learning Paths — THC Living Plant Atlas",
  description: "Curated cross-system learning paths through cannabis plant anatomy, physiology, diagnostics, canopy architecture, reproduction, and flower observation.",
};

export default function AtlasPathsPage() {
  return (
    <section className="shell page-section">
      <nav className="hero__actions" aria-label="Atlas learning navigation">
        <Link className="button" href="/learn/atlas">Back to Living Plant Atlas</Link>
        <Link className="button" href="/learn/atlas/compare">Compare plant systems</Link>
      </nav>

      <header className="section-heading" style={{ marginTop: 34 }}>
        <h1 style={{ marginBottom: 18 }}>Guided Learning Paths</h1>
        <p className="lede">
          Follow curated lesson sequences that connect multiple plant systems around one biological question. Each lesson keeps the same completion state as the full 50-lesson Atlas.
        </p>
      </header>

      <AtlasGuidedPaths />
    </section>
  );
}
