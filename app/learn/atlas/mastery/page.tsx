import type { Metadata } from "next";
import Link from "next/link";
import { AtlasMasteryPassport } from "@/components/atlas/AtlasMasteryPassport";

export const metadata: Metadata = {
  title: "Atlas Mastery Passport — THC Living Plant Atlas",
  description: "Track educational mastery badges earned through THC Living Plant Atlas lesson checks and guided-path quizzes.",
};

export default function AtlasMasteryPassportPage() {
  return (
    <section className="shell page-section">
      <nav className="hero__actions" aria-label="Atlas mastery navigation">
        <Link className="button" href="/learn/atlas">Living Plant Atlas</Link>
        <Link className="button" href="/learn/atlas/paths">Guided learning paths</Link>
      </nav>
      <AtlasMasteryPassport />
    </section>
  );
}
