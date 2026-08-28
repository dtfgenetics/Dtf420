import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import courses from "@/content/academy-courses.json";
import coursework from "@/content/academy-coursework.json";
import { LearningResourceJsonLd } from "@/components/education/LearningResourceJsonLd";
import { buildEducationMetadata, buildLearningResourceJsonLd } from "@/lib/education-seo";
import styles from "./page.module.css";

function getCourse(slug: string) {
  const course = courses.find((item) => item.slug === slug);
  const work = coursework.find((item) => item.courseSlug === slug);
  return course && work ? { course, work } : null;
}

export function generateStaticParams() {
  return courses.map((course) => ({ course: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }): Promise<Metadata> {
  const { course: slug } = await params;
  const record = getCourse(slug);
  if (!record) return { title: "THC Academy Course" };

  return buildEducationMetadata({
    title: `${record.course.title} — THC Academy`,
    description: record.course.summary,
    path: `/learn/academy/${slug}`,
  });
}

export default async function AcademyCoursePage({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params;
  const record = getCourse(slug);
  if (!record) notFound();

  const { course, work } = record;
  const path = `/learn/academy/${slug}`;
  const jsonLd = buildLearningResourceJsonLd({
    name: `${course.title} — THC Academy`,
    description: course.summary,
    path,
    learningResourceType: "Course",
    about: course.title,
  });

  return (
    <section className="shell page-section">
      <LearningResourceJsonLd data={jsonLd} />

      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/learn">Learn</Link>
        <span>/</span>
        <Link href="/learn/academy">THC Academy</Link>
        <span>/</span>
        <strong>{course.title}</strong>
      </nav>

      <header className={styles.hero}>
        <p className="eyebrow">THC Academy course</p>
        <h1>{course.title}</h1>
        <p>{course.summary}</p>
      </header>

      <div className={styles.grid}>
        <div className={styles.stack}>
          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <p className="eyebrow">Course outcomes</p>
              <h2>What you should be able to do</h2>
            </header>
            <ul className={styles.outcomes}>
              {work.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
            </ul>
          </section>

          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <p className="eyebrow">Guided sequence</p>
              <h2>{course.units.length} connected units</h2>
            </header>
            <div className={styles.units}>
              {course.units.map((unit, index) => (
                <Link className={styles.unit} href={unit.href} key={unit.href}>
                  <span className={styles.unitNumber}>{index + 1}</span>
                  <span className={styles.unitText}>
                    <strong>{unit.title}</strong>
                    <span>{unit.description}</span>
                  </span>
                  <span className={styles.open}>Open →</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.stack}>
          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <p className="eyebrow">Practice</p>
              <h2>Applied exercises</h2>
            </header>
            <div className={styles.exerciseList}>
              {work.exercises.map((exercise) => (
                <article className={styles.exercise} key={exercise.title}>
                  <h3>{exercise.title}</h3>
                  <p>{exercise.task}</p>
                  <p><strong>Deliverable:</strong> {exercise.deliverable}</p>
                  <Link href={exercise.relatedHref}>Open related learning tool →</Link>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <p className="eyebrow">Capstone</p>
              <h2>{work.capstone.title}</h2>
            </header>
            <div className={styles.capstone}>
              <p>{work.capstone.brief}</p>
              <strong>Evidence to include</strong>
              <ul>
                {work.capstone.evidence.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <div className={styles.capstoneLinks}>
                {work.capstone.relatedHrefs.map((href) => <Link href={href} key={href}>Related resource →</Link>)}
              </div>
            </div>
          </section>
        </aside>
      </div>

      <div className={styles.footerActions}>
        <Link className="button button--primary" href={course.units[0].href}>Begin first unit</Link>
        <Link className="button" href="/learn/academy">Back to Academy</Link>
        <Link className="button" href="/learn/search">Search all education</Link>
      </div>
    </section>
  );
}
