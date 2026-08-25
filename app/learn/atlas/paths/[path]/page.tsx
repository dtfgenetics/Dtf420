import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import guidedPaths from "@/content/atlas-guided-paths.json";
import { AtlasPathMasteryQuiz } from "@/components/atlas/AtlasPathMasteryQuiz";

export function generateStaticParams() {
  return guidedPaths.map((path) => ({ path: path.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ path: string }> }): Promise<Metadata> {
  const { path } = await params;
  const selected = guidedPaths.find((item) => item.id === path);
  if (!selected) return { title: "Atlas Path Mastery" };
  return {
    title: `${selected.title} Mastery Quiz — THC Living Plant Atlas`,
    description: `Knowledge check for the ${selected.title} guided learning path.`,
  };
}

export default async function AtlasPathMasteryPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;
  if (!guidedPaths.some((item) => item.id === path)) notFound();

  return (
    <section className="shell page-section">
      <nav className="hero__actions" aria-label="Atlas mastery navigation">
        <Link className="button" href="/learn/atlas/paths">Back to guided paths</Link>
        <Link className="button" href="/learn/atlas">Living Plant Atlas</Link>
      </nav>
      <AtlasPathMasteryQuiz pathId={path} />
    </section>
  );
}
