import type { Metadata } from "next";
import Link from "next/link";
import library from "@/content/symptom-differential-library.json";
import styles from "../plant-health/page.module.css";

export const metadata: Metadata = {
  title: "Visual Symptom Differential Library",
  description:
    "Evidence-first cannabis symptom references for yellowing, chlorosis, necrosis, curling, wilting, bleaching, pigmentation, slow growth, root decline, stem lesions, and flower rot.",
};

export default function SymptomDifferentialPage() {
  return (
    <section className="shell page-section">
      <header className={styles.hero}>
        <p className="eyebrow">Teaching Healthy Cultivation</p>
        <h1>Visual Symptom Differential Library</h1>
        <p className="lede">
          Start with location, pattern, progression, and measurements. Each symptom page shows several plausible categories and the checks that help separate them instead of turning one appearance into one diagnosis.
        </p>
        <div className={styles.heroActions}>
          <Link className="button button--primary" href="/learn/plant-health/diagnostic-foundations">Diagnostic foundations</Link>
          <Link className="button" href="/learn/atlas/cases">Practice diagnostic cases</Link>
        </div>
      </header>

      <div className={styles.stats} aria-label="Symptom differential summary">
        <div className={styles.stat}><strong>{library.length}</strong><span>symptom differentials</span></div>
        <div className={styles.stat}><strong>{library.reduce((sum, item) => sum + item.possibleCategories.length, 0)}</strong><span>plausible cause categories mapped</span></div>
        <div className={styles.stat}><strong>{library.reduce((sum, item) => sum + item.visualNeeds.length, 0)}</strong><span>diagnostic visuals specified</span></div>
      </div>

      <div className={styles.grid}>
        {library.map((item) => (
          <Link className={styles.card} href={`/learn/symptoms/${item.slug}`} key={item.slug}>
            <p className={styles.cardCategory}>Symptom differential</p>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <span>Open differential →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
