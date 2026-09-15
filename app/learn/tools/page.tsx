import type { Metadata } from "next";
import Link from "next/link";
import tools from "@/content/learning-tools.json";
import { buildEducationMetadata } from "@/lib/education-seo";
import styles from "./page.module.css";

const categories = Array.from(new Set(tools.map((tool) => tool.category)));

export const metadata: Metadata = buildEducationMetadata({
  title: "Printable Cultivation Learning Tools",
  description: "Printable observation sheets, scouting maps, environmental logs, calibration records, propagation records, outdoor surveys, and post-harvest worksheets for Teaching Healthy Cultivation.",
  path: "/learn/tools",
});

export default function LearningToolsPage() {
  return (
    <section className="shell page-section" data-reference-progressive-disclosure="true">
      <header className={styles.hero}>
        <p className="eyebrow">Teaching Healthy Cultivation</p>
        <h1>Printable Learning Tools</h1>
        <p className="lede">
          Turn the education system into repeatable field practice. These worksheets are designed to capture observations, measurements, lot identity, and follow-up instead of relying on memory.
        </p>
        <div className={styles.heroActions}>
          <Link className="button button--primary" href="/learn/plant-health">Plant Health Library</Link>
          <Link className="button" href="/learn/cultivation-science">Cultivation Science</Link>
          <Link className="button" href="/learn/sources">Evidence & Sources</Link>
        </div>
      </header>

      <div className={styles.referenceGroups}>
        {categories.map((category) => {
          const entries = tools.filter((tool) => tool.category === category);
          return (
            <details className={styles.referenceGroup} data-reference-group="true" key={category}>
              <summary className={styles.referenceGroupSummary}>
                <span>
                  <span className="eyebrow">Tool group</span>
                  <span className={styles.groupTitle}>{category}</span>
                  <span className={styles.groupDescription}>Expand this group to choose the worksheet or field record that matches the job you are doing.</span>
                </span>
                <span className={styles.groupCount}>{entries.length} tool{entries.length === 1 ? "" : "s"}</span>
              </summary>
              <div className={styles.groupBody}>
                <div className={styles.grid}>
                  {entries.map((tool) => (
                    <Link className={styles.card} data-reference-record="true" href={`/learn/tools/${tool.slug}`} key={tool.slug}>
                      <p className={styles.category}>{tool.category}</p>
                      <h2>{tool.title}</h2>
                      <p>{tool.purpose}</p>
                      <span>Open printable worksheet →</span>
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
