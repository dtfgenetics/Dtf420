import type { Metadata } from "next";
import Link from "next/link";
import library from "@/content/plant-health-library.json";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Plant Health, IPM & Disease Library",
  description:
    "Observation-first cannabis plant health references covering pests, diseases, systemic pathogens, scouting, sanitation, and diagnostic reasoning.",
};

const categories = ["Foundations", "Arthropod pests", "Diseases", "Systemic pathogens"] as const;

export default function PlantHealthPage() {
  return (
    <section className="shell page-section">
      <header className={styles.hero}>
        <p className="eyebrow">Teaching Healthy Cultivation</p>
        <h1>Plant Health, IPM & Disease Library</h1>
        <p className="lede">
          Diagnose from evidence, not a symptom chart. These references start with what can be observed, show important look-alikes, and identify what should be measured or confirmed before choosing a response.
        </p>
        <div className={styles.heroActions}>
          <Link className="button button--primary" href="/learn/plant-health/diagnostic-foundations">
            Start with diagnostic foundations
          </Link>
          <Link className="button" href="/learn/symptoms">
            Open symptom differentials
          </Link>
          <Link className="button" href="/learn/atlas/cases">
            Open diagnostic cases
          </Link>
        </div>
      </header>

      <div className={styles.stats} aria-label="Plant health library summary">
        <div className={styles.stat}><strong>{library.length}</strong><span>reference lessons</span></div>
        <div className={styles.stat}><strong>{categories.length}</strong><span>topic groups</span></div>
        <div className={styles.stat}><strong>{library.reduce((sum, item) => sum + item.visualNeeds.length, 0)}</strong><span>purpose-built visuals specified</span></div>
      </div>

      {categories.map((category) => {
        const entries = library.filter((item) => item.category === category);
        if (!entries.length) return null;

        return (
          <section className={styles.section} key={category}>
            <div className={styles.sectionHeader}>
              <div>
                <p className="eyebrow">Reference group</p>
                <h2>{category}</h2>
              </div>
              <p>
                {category === "Foundations"
                  ? "Build the observation, sampling, and sanitation habits that make every later diagnosis more reliable."
                  : category === "Arthropod pests"
                    ? "Identify the organism and life stage instead of treating leaf damage as a diagnosis by itself."
                    : category === "Diseases"
                      ? "Separate pathogen evidence from environmental and root-zone conditions that can create similar symptoms."
                      : "Use testing and propagation records when visual symptoms cannot establish infection."}
              </p>
            </div>

            <div className={styles.grid}>
              {entries.map((item) => (
                <Link className={styles.card} href={`/learn/plant-health/${item.slug}`} key={item.slug}>
                  <p className={styles.cardCategory}>{item.category}</p>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <span>Open reference →</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
}
