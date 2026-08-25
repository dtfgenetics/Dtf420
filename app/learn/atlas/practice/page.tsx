import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Atlas Practice",
  description: "Practice Living Plant Atlas knowledge with focused review, diagnostic cases, and plant-system comparisons.",
};

const tools = [
  {
    href: "/learn/atlas/review",
    eyebrow: "Recall",
    title: "Mastery Review Lab",
    copy: "Practice recent misses and unmastered lesson checks using the same saved mastery record as the rest of the Atlas.",
    action: "Review weak concepts",
  },
  {
    href: "/learn/atlas/cases",
    eyebrow: "Reasoning",
    title: "Diagnostic Case Lab",
    copy: "Work realistic observation-first cases by choosing the next discriminating measurement or inspection instead of guessing a diagnosis.",
    action: "Practice diagnostic reasoning",
  },
  {
    href: "/learn/atlas/compare",
    eyebrow: "Relationships",
    title: "Compare Plant Systems",
    copy: "Study related structures and processes side by side, including xylem vs phloem and healthy roots vs root stress.",
    action: "Compare plant systems",
  },
] as const;

export default function AtlasPracticePage() {
  return (
    <main className={`shell page-section ${styles.page}`}>
      <section className={styles.hero} aria-labelledby="practice-title">
        <div>
          <p className={styles.kicker}>Atlas Practice</p>
          <h1 id="practice-title">Turn plant knowledge into usable reasoning.</h1>
          <p>Choose the kind of practice you need: recall a concept, reason through a plant case, or compare two biological systems.</p>
        </div>
        <Link href="/learn/atlas/dashboard">Back to Study Dashboard</Link>
      </section>

      <section className={styles.grid} aria-label="Atlas practice tools">
        {tools.map((tool) => (
          <article key={tool.href} className={styles.card}>
            <small>{tool.eyebrow}</small>
            <h2>{tool.title}</h2>
            <p>{tool.copy}</p>
            <Link href={tool.href}>{tool.action}</Link>
          </article>
        ))}
      </section>

      <section className={styles.method} aria-label="Atlas practice method">
        <small>Practice method</small>
        <h2>Observe → compare → test → update.</h2>
        <p>The Atlas practice tools are designed to reinforce evidence-based thinking. A visible symptom or one changed measurement is a clue, not a complete causal conclusion.</p>
      </section>
    </main>
  );
}
