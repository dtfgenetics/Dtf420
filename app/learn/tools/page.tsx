import type { Metadata } from "next";
import Link from "next/link";
import tools from "@/content/learning-tools.json";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Printable Cultivation Learning Tools",
  description:
    "Printable observation sheets, scouting maps, environmental logs, calibration records, propagation records, outdoor surveys, and post-harvest worksheets for Teaching Healthy Cultivation.",
};

export default function LearningToolsPage() {
  return (
    <section className="shell page-section">
      <header className={styles.hero}>
        <p className="eyebrow">Teaching Healthy Cultivation</p>
        <h1>Printable Learning Tools</h1>
        <p className="lede">
          Turn the education system into repeatable field practice. These worksheets are designed to capture observations, measurements, lot identity, and follow-up instead of relying on memory.
        </p>
        <div className={styles.heroActions}>
          <Link className="button button--primary" href="/learn/plant-health">Plant Health Library</Link>
          <Link className="button" href="/learn/cultivation-science">Cultivation Science</Link>
        </div>
      </header>

      <div className={styles.grid}>
        {tools.map((tool) => (
          <Link className={styles.card} href={`/learn/tools/${tool.slug}`} key={tool.slug}>
            <p className={styles.category}>{tool.category}</p>
            <h2>{tool.title}</h2>
            <p>{tool.purpose}</p>
            <span>Open printable worksheet →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
