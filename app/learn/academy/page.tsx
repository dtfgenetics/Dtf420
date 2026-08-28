import type { Metadata } from "next";
import Link from "next/link";
import courses from "@/content/academy-courses.json";
import { buildEducationMetadata } from "@/lib/education-seo";
import styles from "./page.module.css";

export const metadata: Metadata = buildEducationMetadata({
  title: "THC Academy — Teaching Healthy Cultivation",
  description: "A 12-course, 60-unit guided curriculum connecting plant science, diagnostics, environment, plant health, breeding, outdoor cultivation, protected cultivation, and post-harvest learning.",
  path: "/learn/academy",
});

const unitCount = courses.reduce((sum, course) => sum + course.units.length, 0);
const referenceKinds = new Set(
  courses.flatMap((course) => course.units.map((unit) => unit.href.split("/").filter(Boolean)[1] ?? "learn")),
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
      </header>

      <div className={styles.stats} aria-label="THC Academy summary">
        <div className={styles.stat}><strong>{courses.length}</strong><span>guided courses</span></div>
        <div className={styles.stat}><strong>{unitCount}</strong><span>connected units</span></div>
        <div className={styles.stat}><strong>{referenceKinds}</strong><span>learning surfaces connected</span></div>
      </div>

      <div className={styles.courseList}>
        {courses.map((course, courseIndex) => (
          <section className={styles.course} id={course.slug} key={course.slug}>
            <header className={styles.courseHeader}>
              <div>
                <span className={styles.courseNumber}>Course {String(courseIndex + 1).padStart(2, "0")}</span>
                <h2>{course.title}</h2>
                <p>{course.summary}</p>
              </div>
              <Link className={styles.startLink} href={course.units[0].href}>Start course →</Link>
            </header>

            <div className={styles.units}>
              {course.units.map((unit, unitIndex) => (
                <Link className={styles.unit} href={unit.href} key={`${course.slug}-${unit.title}`}>
                  <span className={styles.unitIndex}>{unitIndex + 1}</span>
                  <span className={styles.unitText}>
                    <strong>{unit.title}</strong>
                    <span>{unit.description}</span>
                  </span>
                  <span className={styles.open}>Open →</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
