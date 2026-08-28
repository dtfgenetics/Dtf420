import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import tools from "@/content/learning-tools.json";
import { EvidenceSources } from "@/components/education/EvidenceSources";
import { LearningResourceJsonLd } from "@/components/education/LearningResourceJsonLd";
import { buildEducationMetadata, buildLearningResourceJsonLd } from "@/lib/education-seo";
import { PrintButton } from "../PrintButton";
import styles from "../page.module.css";

function getTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: "Printable Learning Tool" };

  return buildEducationMetadata({
    title: `${tool.title} — Printable Learning Tool`,
    description: tool.purpose,
    path: `/learn/tools/${slug}`,
  });
}

function labelFromHref(href: string) {
  return href
    .split("/")
    .filter(Boolean)
    .slice(-1)[0]
    ?.replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? "Related lesson";
}

export default async function LearningToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  const path = `/learn/tools/${slug}`;
  const structuredData = buildLearningResourceJsonLd({
    name: tool.title,
    description: tool.purpose,
    path,
    learningResourceType: "Printable worksheet",
    about: tool.category,
  });

  return (
    <section className="shell page-section">
      <LearningResourceJsonLd data={structuredData} />
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/learn">Learn</Link>
        <span>/</span>
        <Link href="/learn/tools">Printable Tools</Link>
        <span>/</span>
        <strong>{tool.title}</strong>
      </nav>

      <header className={styles.toolHeader}>
        <div>
          <p className={styles.category}>{tool.category}</p>
          <h1>{tool.title}</h1>
          <p className={styles.toolPurpose}>{tool.purpose}</p>
        </div>
        <PrintButton />
      </header>

      <div className={styles.sheet}>
        {tool.sections.map((section) => (
          <section className={styles.sheetSection} key={section.title}>
            <h2>{section.title}</h2>
            <div className={styles.fields}>
              {section.fields.map((field) => (
                <div className={styles.field} key={field}>
                  <strong>{field}</strong>
                  <span className={styles.writeLine} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <EvidenceSources path={path} />

      <section className={styles.related}>
        <h2>Related lessons and tools</h2>
        <div className={styles.relatedLinks}>
          {tool.related.map((href) => (
            <Link href={href} key={href}>{labelFromHref(href)}</Link>
          ))}
        </div>
      </section>
    </section>
  );
}
