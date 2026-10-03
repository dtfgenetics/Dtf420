import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import courses from "@/content/academy-courses.json";
import { buildEducationMetadata } from "@/lib/education-seo";
import styles from "./page.module.css";

function getLegacyGuide(slug: string) {
  return courses.find((item) => item.slug === slug) ?? null;
}

export function generateStaticParams() {
  return courses.map((course) => ({ course: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }): Promise<Metadata> {
  const { course: slug } = await params;
  const record = getLegacyGuide(slug);
  if (!record) return { title: "Legacy THC Academy compatibility route" };
  const base = buildEducationMetadata({
    title: `${record.title} — legacy THC Academy route`,
    description: "This historical guided path is preserved for compatibility only. Current professional courses live under Courses and the Learning Hub.",
    path: `/learn/academy/${slug}`,
  });
  return {
    ...base,
    robots: { index: false, follow: true },
    alternates: { canonical: "https://dtfseeds.com/courses/" },
  };
}

export default async function LegacyAcademyCourseCompatibilityPage({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params;
  const record = getLegacyGuide(slug);
  if (!record) notFound();

  return (
    <section className="shell page-section" data-dtf-academy-compatibility="legacy-guide">
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/learn">Learn</Link>
        <span>/</span>
        <Link href="/learn/academy">Legacy Academy</Link>
        <span>/</span>
        <strong>{record.title}</strong>
      </nav>

      <header className={styles.hero}>
        <p className="eyebrow">Legacy THC Academy compatibility</p>
        <h1>{record.title}</h1>
        <p>
          This historical guided path is no longer an active course. Its source record is retained for migration and provenance, while current certification curriculum is published only through the canonical Courses and Learning Hub systems.
        </p>
      </header>

      <div className={styles.footerActions}>
        <Link className="button button--primary" href="/courses/">Open professional courses</Link>
        <Link className="button" href="/learn/learning-hub/">Open Learning Hub</Link>
        <Link className="button" href="/learn/encyclopedia/">Open Encyclopedia</Link>
      </div>
    </section>
  );
}
