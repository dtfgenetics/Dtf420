import type { Metadata } from "next";
import coreSources from "@/content/education-sources.json";
import abioticSources from "@/content/education-sources-abiotic.json";
import plantHealthIpmSources from "@/content/education-sources-plant-health-ipm.json";
import sourceMap from "@/content/education-source-map.json";
import { buildEducationMetadata } from "@/lib/education-seo";
import styles from "../plant-health/page.module.css";

const sources = [...coreSources, ...abioticSources, ...plantHealthIpmSources];

export const metadata: Metadata = buildEducationMetadata({
  title: "Evidence & Sources — Teaching Healthy Cultivation",
  description: "Peer-reviewed research, university extension resources, and government references connected to THC cultivation lessons.",
  path: "/learn/sources",
});

const usageCount = new Map<string, number>();
for (const ids of Object.values(sourceMap)) {
  for (const id of ids) usageCount.set(id, (usageCount.get(id) ?? 0) + 1);
}

export default function EducationSourcesPage() {
  return (
    <section className="shell page-section">
      <header className={styles.hero}>
        <p className="eyebrow">Teaching Healthy Cultivation</p>
        <h1>Evidence & Sources</h1>
        <p className="lede">
          The research and technical references currently connected to THC lessons. Sources are mapped only where they support relevant biological, diagnostic, environmental, or process concepts.
        </p>
      </header>

      <div className={styles.stats} aria-label="Evidence library summary">
        <div className={styles.stat}><strong>{sources.length}</strong><span>evidence sources</span></div>
        <div className={styles.stat}><strong>{Object.keys(sourceMap).length}</strong><span>lesson pages mapped</span></div>
        <div className={styles.stat}><strong>{new Set(sources.map((source) => source.sourceType)).size}</strong><span>source types</span></div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className="eyebrow">Reference library</p>
            <h2>Current sources</h2>
          </div>
          <p>Peer-reviewed research is prioritized for cannabis-specific claims, with university extension and government guidance used for broader greenhouse, IPM, biosecurity, environmental-stress, and diagnostic principles.</p>
        </div>

        <div className={styles.grid}>
          {sources.map((source) => (
            <a className={styles.card} href={source.url} target="_blank" rel="noreferrer" key={source.id}>
              <p className={styles.cardCategory}>{source.sourceType}</p>
              <h3>{source.title}</h3>
              <p>{source.scope}</p>
              <span>{source.publisher}{"year" in source && source.year ? ` · ${source.year}` : ""} · used on {usageCount.get(source.id) ?? 0} lesson page{usageCount.get(source.id) === 1 ? "" : "s"} ↗</span>
            </a>
          ))}
        </div>
      </section>
    </section>
  );
}
