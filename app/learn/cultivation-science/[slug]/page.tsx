import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import coreLibrary from "@/content/cultivation-science-library.json";
import protectedLibrary from "@/content/protected-cultivation-library.json";
import protectedLighting from "@/content/protected-cultivation-lighting.json";
import outdoorExpanded from "@/content/outdoor-cultivation-expanded.json";
import postharvestExpanded from "@/content/postharvest-science-expanded.json";
import advancedExpanded from "@/content/advanced-cultivation-science-expanded.json";
import plantPhysiologyExpanded from "@/content/plant-physiology-expanded.json";
import { RelatedEducation } from "@/components/education/RelatedEducation";
import { EvidenceSources } from "@/components/education/EvidenceSources";
import { LearningResourceJsonLd } from "@/components/education/LearningResourceJsonLd";
import { buildEducationMetadata, buildLearningResourceJsonLd } from "@/lib/education-seo";
import styles from "../../plant-health/page.module.css";

const library = [
  ...coreLibrary,
  ...protectedLibrary,
  ...protectedLighting,
  ...outdoorExpanded,
  ...postharvestExpanded,
  ...advancedExpanded,
  ...plantPhysiologyExpanded,
];

function getEntry(slug: string) {
  return library.find((item) => item.slug === slug);
}

export function generateStaticParams() {
  return library.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return { title: "Cultivation Science Reference" };

  return buildEducationMetadata({
    title: `${entry.title} — Cultivation Science`,
    description: entry.summary,
    path: `/learn/cultivation-science/${slug}`,
  });
}

function TopicPanel({ title, items, className = "" }: { title: string; items: string[]; className?: string }) {
  return (
    <section className={`${styles.topicPanel} ${className}`}>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

export default async function CultivationScienceReferencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();
  const path = `/learn/cultivation-science/${slug}`;
  const structuredData = buildLearningResourceJsonLd({
    name: entry.title,
    description: entry.summary,
    path,
    learningResourceType: "Cultivation science reference",
    about: entry.category,
  });

  return (
    <section className="shell page-section">
      <LearningResourceJsonLd data={structuredData} />
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/learn">Learn</Link>
        <span>/</span>
        <Link href="/learn/cultivation-science">Cultivation Science</Link>
        <span>/</span>
        <strong>{entry.title}</strong>
      </nav>

      <header className={styles.topicHero}>
        <p className="eyebrow">{entry.category}</p>
        <h1>{entry.title}</h1>
        <p className={styles.topicSummary}>{entry.summary}</p>
      </header>

      <div className={styles.topicGrid}>
        <TopicPanel title="Key concepts" items={entry.keyConcepts} />
        <TopicPanel title="What to measure or observe" items={entry.measureObserve} />
        <TopicPanel title="Common mistakes" items={entry.commonMistakes} />
        <TopicPanel title="Visuals this lesson still needs" items={entry.visualNeeds} className={styles.visualPanel} />
      </div>

      <EvidenceSources path={path} />
      <RelatedEducation path={path} />

      <div className={styles.footerActions}>
        <Link className="button button--primary" href="/learn/cultivation-science">Back to Cultivation Science</Link>
        <Link className="button" href="/learn/search">Search all education</Link>
        <Link className="button" href="/learn/atlas">Open Living Plant Atlas</Link>
      </div>
    </section>
  );
}
