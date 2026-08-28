import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import library from "@/content/symptom-differential-library.json";
import { RelatedEducation } from "@/components/education/RelatedEducation";
import { EvidenceSources } from "@/components/education/EvidenceSources";
import { LearningResourceJsonLd } from "@/components/education/LearningResourceJsonLd";
import { buildEducationMetadata, buildLearningResourceJsonLd } from "@/lib/education-seo";
import styles from "../../plant-health/page.module.css";

function getEntry(slug: string) {
  return library.find((item) => item.slug === slug);
}

export function generateStaticParams() {
  return library.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return { title: "Symptom Differential" };

  return buildEducationMetadata({
    title: `${entry.title} — Symptom Differential`,
    description: entry.summary,
    path: `/learn/symptoms/${slug}`,
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

export default async function SymptomDifferentialDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();
  const path = `/learn/symptoms/${slug}`;
  const structuredData = buildLearningResourceJsonLd({
    name: entry.title,
    description: entry.summary,
    path,
    learningResourceType: "Symptom differential",
    about: "Observation-first plant diagnosis",
  });

  return (
    <section className="shell page-section">
      <LearningResourceJsonLd data={structuredData} />
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/learn">Learn</Link>
        <span>/</span>
        <Link href="/learn/symptoms">Symptoms</Link>
        <span>/</span>
        <strong>{entry.title}</strong>
      </nav>

      <header className={styles.topicHero}>
        <p className="eyebrow">Symptom differential</p>
        <h1>{entry.title}</h1>
        <p className={styles.topicSummary}>{entry.summary}</p>
      </header>

      <div className={styles.topicGrid}>
        <TopicPanel title="Pattern questions" items={entry.patternQuestions} />
        <TopicPanel title="Plausible cause categories" items={entry.possibleCategories} />
        <TopicPanel title="Discriminating checks" items={entry.discriminatingChecks} />
        <TopicPanel title="Red flags" items={entry.redFlags} />
        <TopicPanel title="Visuals this differential still needs" items={entry.visualNeeds} className={styles.visualPanel} />
      </div>

      <EvidenceSources path={path} />
      <RelatedEducation path={path} />

      <div className={styles.footerActions}>
        <Link className="button button--primary" href="/learn/symptoms">Back to symptom library</Link>
        <Link className="button" href="/learn/search">Search all education</Link>
        <Link className="button" href="/learn/atlas/cases">Practice diagnostic cases</Link>
      </div>
    </section>
  );
}
