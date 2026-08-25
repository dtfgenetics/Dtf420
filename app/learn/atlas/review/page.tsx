import type { Metadata } from "next";
import Link from "next/link";
import { AtlasReviewLab } from "@/components/atlas/AtlasReviewLab";

export const metadata: Metadata = {
  title: "Mastery Review Lab — THC Living Plant Atlas",
  description: "Focused review practice for missed and unmastered THC Living Plant Atlas knowledge checks.",
};

export default function AtlasReviewPage() {
  return (
    <section className="shell page-section">
      <nav className="hero__actions" aria-label="Atlas review navigation">
        <Link className="button" href="/learn/atlas">Living Plant Atlas</Link>
        <Link className="button" href="/learn/atlas/mastery">Mastery Passport</Link>
        <Link className="button" href="/learn/atlas/paths">Guided learning paths</Link>
      </nav>
      <div style={{ marginTop: 34 }}>
        <AtlasReviewLab />
      </div>
    </section>
  );
}
