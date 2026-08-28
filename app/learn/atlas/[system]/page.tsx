import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import modules from "@/content/atlas-learning-modules.json";
import atlasSections from "@/content/atlas-sections.json";
import { AtlasSystemGraphic } from "@/components/atlas/AtlasSystemGraphic";
import { AtlasInteractiveLab } from "@/components/atlas/AtlasInteractiveLab";
import { AtlasCoreInteractiveLab } from "@/components/atlas/AtlasCoreInteractiveLab";
import { AtlasSystemProgress } from "@/components/atlas/AtlasSystemProgress";
import { AtlasSystemConnections } from "@/components/atlas/AtlasSystemConnections";
import { LearningResourceJsonLd } from "@/components/education/LearningResourceJsonLd";
import { buildEducationMetadata, buildLearningResourceJsonLd } from "@/lib/education-seo";
import styles from "./page.module.css";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findAtlasModule(slug: string) {
  return modules.find((item) => slugify(item.id) === slug);
}

export function generateStaticParams() {
  return modules.map((item) => ({ system: slugify(item.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ system: string }> }): Promise<Metadata> {
  const { system } = await params;
  const atlasModule = findAtlasModule(system);
  if (!atlasModule) return { title: "Atlas System" };
  const section = atlasSections.find((item) => item.id === atlasModule.id);
  return buildEducationMetadata({
    title: `${atlasModule.label} — THC Living Plant Atlas`,
    description: section?.summary ?? `Visual cannabis plant science lessons for ${atlasModule.label}.`,
    path: `/learn/atlas/${system}`,
  });
}

export default async function AtlasSystemPage({ params }: { params: Promise<{ system: string }> }) {
  const { system } = await params;
  const atlasModule = findAtlasModule(system);
  if (!atlasModule) notFound();

  const section = atlasSections.find((item) => item.id === atlasModule.id);
  const description = section?.summary ?? `Visual cannabis plant science lessons for ${atlasModule.label}.`;
  const structuredData = buildLearningResourceJsonLd({
    name: `${atlasModule.label} — THC Living Plant Atlas`,
    description,
    path: `/learn/atlas/${system}`,
    learningResourceType: "Interactive plant-system learning module",
    about: atlasModule.label,
  });

  return (
    <section className="shell page-section">
      <LearningResourceJsonLd data={structuredData} />
      <div className={styles.pageShell}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/learn">Learn</Link>
          <span>/</span>
          <Link href="/learn/atlas">Living Plant Atlas</Link>
          <span>/</span>
          <strong>{atlasModule.label}</strong>
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p>THC Living Plant Atlas system</p>
            <h1>{atlasModule.label}</h1>
            <div className={styles.summary}>{description}</div>
            <div className={styles.stats}>
              <span><b>{atlasModule.lessons.length}</b> structured lessons</span>
              <span><b>{atlasModule.learningGoals.length}</b> learning goals</span>
              <span><b>{section?.topics.length ?? 0}</b> indexed topics</span>
            </div>
          </div>
          <AtlasSystemGraphic systemId={atlasModule.id} />
        </section>

        <AtlasSystemProgress systemId={atlasModule.id} />
        <AtlasSystemConnections systemId={atlasModule.id} />
        <AtlasInteractiveLab systemId={atlasModule.id} />
        <AtlasCoreInteractiveLab systemId={atlasModule.id} />

        <section className={styles.goalsSection}>
          <header>
            <p>Learning objectives</p>
            <h2>What this system should teach</h2>
          </header>
          <div className={styles.goals}>
            {atlasModule.learningGoals.map((goal, index) => (
              <article key={goal}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <span>{goal}</span>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.lessonsSection}>
          <header>
            <p>Visual curriculum</p>
            <h2>{atlasModule.label} lesson sequence</h2>
            <span>Each lesson is structured around a visual reference so the Atlas can replace dry text-first learning with observation and diagrams.</span>
          </header>

          <div className={styles.lessons}>
            {atlasModule.lessons.map((lesson, index) => (
              <Link
                key={lesson.title}
                href={`/learn/atlas/${system}/${slugify(lesson.title)}`}
                style={{ color: "inherit", textDecoration: "none", display: "block" }}
              >
                <article id={`lesson-${index + 1}`} style={{ height: "100%" }}>
                  <div className={styles.lessonIndex}>Lesson {String(index + 1).padStart(2, "0")}</div>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.summary}</p>
                  <div className={styles.visualReference}>
                    <span>Open visual lesson</span>
                    <strong>{lesson.visual}</strong>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {section ? (
          <section className={styles.topicIndex}>
            <div>
              <p>Reference index</p>
              <h2>Topics connected to this system</h2>
            </div>
            <div>
              {section.topics.map((topic) => <span key={topic}>{topic}</span>)}
            </div>
          </section>
        ) : null}

        <section className={styles.related}>
          <div>
            <p>Whole-plant context</p>
            <h2>Return to the connected Atlas</h2>
          </div>
          <div className={styles.relatedGrid}>
            <Link href="/learn/atlas">
              <span>Whole-plant explorer</span>
              <small>See this system in the plant map and lifecycle.</small>
            </Link>
            <Link href="/learn/atlas/dashboard">
              <span>Study dashboard</span>
              <small>Resume lessons, mastery, paths, and review.</small>
            </Link>
            <Link href="/learn/atlas/practice">
              <span>Practice hub</span>
              <small>Apply system knowledge to comparisons and diagnostic reasoning.</small>
            </Link>
            <Link href="/learn/atlas/notebook">
              <span>Observation notebook</span>
              <small>Record real plant observations and measurements.</small>
            </Link>
          </div>
          <Link className={styles.backButton} href="/learn/atlas">Return to whole-plant Atlas</Link>
        </section>
      </div>
    </section>
  );
}
