import type { Metadata } from "next";
import Link from "next/link";
import coreLibrary from "@/content/cultivation-science-library.json";
import protectedLibrary from "@/content/protected-cultivation-library.json";
import protectedLighting from "@/content/protected-cultivation-lighting.json";
import outdoorExpanded from "@/content/outdoor-cultivation-expanded.json";
import postharvestExpanded from "@/content/postharvest-science-expanded.json";
import advancedExpanded from "@/content/advanced-cultivation-science-expanded.json";
import plantPhysiologyExpanded from "@/content/plant-physiology-expanded.json";
import propagationNutritionGenetics from "@/content/propagation-nutrition-genetics-expanded.json";
import { buildEducationMetadata } from "@/lib/education-seo";
import styles from "../plant-health/page.module.css";

const library = [
  ...coreLibrary,
  ...protectedLibrary,
  ...protectedLighting,
  ...outdoorExpanded,
  ...postharvestExpanded,
  ...advancedExpanded,
  ...plantPhysiologyExpanded,
  ...propagationNutritionGenetics,
];

export const metadata: Metadata = buildEducationMetadata({
  title: "Cultivation Science Reference Library",
  description: "Advanced cultivation references covering plant physiology, propagation, nutrition and root-zone chemistry, genetics and breeding, outdoor and protected cultivation, post-harvest science, plant architecture, flowering, and measurement science.",
  path: "/learn/cultivation-science",
});

const categories = [
  "Plant Physiology & Development",
  "Propagation & Cloning",
  "Nutrition & Root-Zone Chemistry",
  "Genetics & Breeding",
  "Outdoor & Protected Cultivation",
  "Protected Cultivation",
  "Harvest & Post-Harvest",
  "Training & Plant Architecture",
  "Flowering & Reproductive Development",
  "Measurement & Experimental Science",
] as const;

export default function CultivationSciencePage() {
  return (
    <section className="shell page-section" data-reference-progressive-disclosure="true">
      <header className={styles.hero}>
        <p className="eyebrow">Teaching Healthy Cultivation</p>
        <h1>Cultivation Science Reference Library</h1>
        <p className="lede">
          Deep subject branches for whole-plant physiology, propagation and cloning, nutrition and root-zone chemistry, genetics and breeding, outdoor and protected cultivation, harvest and post-harvest biology, plant architecture, flowering development, and measurement science.
        </p>
        <div className={styles.heroActions}>
          <Link className="button button--primary" href="/learn/atlas">Open the Living Plant Atlas</Link>
          <Link className="button" href="/learn/academy">THC Academy</Link>
          <Link className="button" href="/learn/plant-health">Open Plant Health</Link>
          <Link className="button" href="/learn/tools">Printable Tools</Link>
          <Link className="button" href="/learn/sources">Evidence & Sources</Link>
          <Link className="button" href="/learn/search">Search all education</Link>
        </div>
      </header>

      <div className={styles.stats} aria-label="Cultivation science library summary">
        <div className={styles.stat}><strong>{library.length}</strong><span>reference lessons</span></div>
        <div className={styles.stat}><strong>{categories.length}</strong><span>subject branches covered</span></div>
        <div className={styles.stat}><strong>{library.reduce((sum, item) => sum + item.visualNeeds.length, 0)}</strong><span>lesson visuals specified</span></div>
      </div>

      <div className={styles.referenceGroups}>
        {categories.map((category) => {
          const entries = library.filter((item) => item.category === category);
          if (!entries.length) return null;
          return (
            <details className={styles.referenceGroup} data-reference-group="true" key={category}>
              <summary className={styles.referenceGroupSummary}>
                <span>
                  <span className="eyebrow">Reference group</span>
                  <span className={styles.referenceGroupTitle}>{category}</span>
                  <span className={styles.referenceGroupDescription}>Focused lessons that move from overview concepts into practical plant-science reference material.</span>
                </span>
                <span className={styles.referenceGroupMeta}>
                  <span className={styles.referenceGroupCount}>{entries.length} references</span>
                </span>
              </summary>
              <div className={styles.referenceGroupBody}>
                <div className={styles.grid}>
                  {entries.map((item) => (
                    <Link className={styles.card} data-reference-record="true" href={`/learn/cultivation-science/${item.slug}`} key={item.slug}>
                      <p className={styles.cardCategory}>{item.category}</p>
                      <h3>{item.title}</h3>
                      <p>{item.summary}</p>
                      <span>Open reference →</span>
                    </Link>
                  ))}
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
