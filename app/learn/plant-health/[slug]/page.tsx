import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import coreLibrary from "@/content/plant-health-library.json";
import expandedLibrary from "@/content/plant-health-expanded.json";
import styles from "../page.module.css";

const library = [...coreLibrary, ...expandedLibrary];

function getEntry(slug: string) {
  return library.find((item) => item.slug === slug);
}

export function generateStaticParams() {
  return library.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return { title: "Plant Health Reference" };

  return {
    title: `${entry.title} — Plant Health Library`,
    description: entry.summary,
  };
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

export default async function PlantHealthReferencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();

  return (
    <section className="shell page-section">
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/learn">Learn</Link>
        <span>/</span>
        <Link href="/learn/plant-health">Plant Health</Link>
        <span>/</span>
        <strong>{entry.title}</strong>
      </nav>

      <header className={styles.topicHero}>
        <p className="eyebrow">{entry.category}</p>
        <h1>{entry.title}</h1>
        <p className={styles.topicSummary}>{entry.summary}</p>
      </header>

      <div className={styles.topicGrid}>
        <TopicPanel title="What to look for" items={entry.whatToLookFor} />
        <TopicPanel title="Important look-alikes" items={entry.lookAlikes} />
        <TopicPanel title="How to confirm" items={entry.confirmWith} />
        <TopicPanel title="Management principles" items={entry.managementPrinciples} />
        <TopicPanel title="Prevention" items={entry.prevention} />
        <TopicPanel title="Visuals this lesson still needs" items={entry.visualNeeds} className={styles.visualPanel} />
      </div>

      <div className={styles.footerActions}>
        <Link className="button button--primary" href="/learn/plant-health">Back to Plant Health Library</Link>
        <Link className="button" href="/learn/tools">Printable scouting tools</Link>
        <Link className="button" href="/learn/symptoms">Symptom differentials</Link>
        <Link className="button" href="/learn/atlas/cases">Practice diagnostic cases</Link>
        <Link className="button" href="/learn/atlas">Open Living Plant Atlas</Link>
      </div>
    </section>
  );
}
