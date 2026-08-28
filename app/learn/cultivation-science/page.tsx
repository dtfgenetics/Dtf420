import type { Metadata } from "next";
import Link from "next/link";
import coreLibrary from "@/content/cultivation-science-library.json";
import protectedLibrary from "@/content/protected-cultivation-library.json";
import protectedLighting from "@/content/protected-cultivation-lighting.json";
import outdoorExpanded from "@/content/outdoor-cultivation-expanded.json";
import postharvestExpanded from "@/content/postharvest-science-expanded.json";
import advancedExpanded from "@/content/advanced-cultivation-science-expanded.json";
import styles from "../plant-health/page.module.css";

const library = [
  ...coreLibrary,
  ...protectedLibrary,
  ...protectedLighting,
  ...outdoorExpanded,
  ...postharvestExpanded,
  ...advancedExpanded,
];

export const metadata: Metadata = {
  title: "Cultivation Science Reference Library",
  description:
    "Advanced cultivation references covering outdoor and protected cultivation, post-harvest science, plant architecture, flowering, and measurement science.",
};

const categories = [
  "Outdoor & Protected Cultivation",
  "Protected Cultivation",
  "Harvest & Post-Harvest",
  "Training & Plant Architecture",
  "Flowering & Reproductive Development",
  "Measurement & Experimental Science",
] as const;

export default function CultivationSciencePage() {
  return (
    <section className="shell page-section">
      <header className={styles.hero}>
        <p className="eyebrow">Teaching Healthy Cultivation</p>
        <h1>Cultivation Science Reference Library</h1>
        <p className="lede">
          Deep subject branches for outdoor and protected cultivation, greenhouse environment and lighting, harvest and post-harvest biology, training and plant architecture, flowering development, and measurement and experimental science.
        </p>
        <div className={styles.heroActions}>
          <Link className="button button--primary" href="/learn/atlas">Open the Living Plant Atlas</Link>
          <Link className="button" href="/learn/plant-health">Open Plant Health</Link>
          <Link className="button" href="/learn/tools">Printable Tools</Link>
          <Link className="button" href="/learn/search">Search all education</Link>
        </div>
      </header>

      <div className={styles.stats} aria-label="Cultivation science library summary">
        <div className={styles.stat}><strong>{library.length}</strong><span>reference lessons</span></div>
        <div className={styles.stat}><strong>{categories.length}</strong><span>subject branches covered</span></div>
        <div className={styles.stat}><strong>{library.reduce((sum, item) => sum + item.visualNeeds.length, 0)}</strong><span>lesson visuals specified</span></div>
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
              <p>{entries.length} focused lessons designed to replace overview-only coverage with practical plant-science reference material.</p>
            </div>

            <div className={styles.grid}>
              {entries.map((item) => (
                <Link className={styles.card} href={`/learn/cultivation-science/${item.slug}`} key={item.slug}>
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
