import type { Metadata } from "next";
import Link from "next/link";
import courses from "@/content/academy-courses.json";
import { buildEducationMetadata } from "@/lib/education-seo";
import ResourceCatalog from "./ResourceCatalog";
import AcademyCourseList from "./AcademyCourseList";
import styles from "./page.module.css";

export const metadata: Metadata = buildEducationMetadata({
  title: "THC Academy — Teaching Healthy Cultivation",
  description: "A 12-course, 60-unit guided curriculum plus a searchable 420-topic educational resource catalog connecting plant science and practical cultivation learning.",
  path: "/learn/academy",
});

const unitCount = courses.reduce((sum, course) => sum + course.units.length, 0);
const referenceKinds = new Set(
  courses.flatMap((course) => course.units.map((unit) => unit.href.split("/").filter(Boolean)[2] ?? "learn")),
).size;

export default function AcademyPage() {
  return (
    <section className="shell page-section">
      <header className={styles.hero}>
        <p className="eyebrow">Teaching Healthy Cultivation</p>
        <h1>THC Academy</h1>
        <p className="lede">
          A guided curriculum built on the same evidence-first references, Living Plant Atlas lessons, diagnostic workflows, and field tools used across the education system. Academy organizes the material into a learning sequence without duplicating the underlying science.
        </p>
        <div className={styles.heroActions}>
          <Link className="button" href="#guided-courses">Browse guided courses</Link>
          <Link className="button secondary" href="#resource-library">Search 420 resource topics</Link>
        </div>
      </header>

      <div className={styles.stats} aria-label="THC Academy summary">
        <div className={styles.stat}><strong>{courses.length}</strong><span>guided courses</span></div>
        <div className={styles.stat}><strong>{unitCount}</strong><span>connected units</span></div>
        <div className={styles.stat}><strong>{referenceKinds}</strong><span>learning surfaces connected</span></div>
      </div>

      <AcademyCourseList />

      <ResourceCatalog />
    </section>
  );
}
