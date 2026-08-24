import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import modules from "@/content/atlas-learning-modules.json";
import atlasSections from "@/content/atlas-sections.json";
import { AtlasSystemGraphic } from "@/components/atlas/AtlasSystemGraphic";
import { AtlasInteractiveLab } from "@/components/atlas/AtlasInteractiveLab";
import { AtlasCoreInteractiveLab } from "@/components/atlas/AtlasCoreInteractiveLab";
import styles from "./page.module.css";

function slugFor(id: string) {
  return id.replaceAll("_", "-");
}

function findAtlasModule(slug: string) {
  return modules.find((item) => slugFor(item.id) === slug);
}

export function generateStaticParams() {
  return modules.map((item) => ({ system: slugFor(item.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ system: string }> }): Promise<Metadata> {
  const { system } = await params;
  const atlasModule = findAtlasModule(system);
  if (!atlasModule) return { title: "Atlas System" };
  const section = atlasSections.find((item) => item.id === atlasModule.id);
  return {
    title: `${atlasModule.label} — THC Living Plant Atlas`,
    description: section?.summary ?? `Visual cannabis plant science lessons for ${atlasModule.label}.`,
  };
}

export default async function AtlasSystemPage({ params }: { params: Promise<{ system: string }> }) {
  const { system } = await params;
  const atlasModule = findAtlasModule(system);
  if (!atlasModule) notFound();

  const section = atlasSections.find((item) => item.id === atlasModule.id);
  const related = modules.filter((item) => item.id !== atlasModule.id).slice(0, 4);

  return (
    <section className="shell page-section">
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
            <div className={styles.summary}>{section?.summary}</div>
            <div className={styles.stats}>
              <span><b>{atlasModule.lessons.length}</b> structured lessons</span>
              <span><b>{atlasModule.learningGoals.length}</b> learning goals</span>
              <span><b>{section?.topics.length ?? 0}</b> indexed topics</span>
            </div>
          </div>
          <AtlasSystemGraphic systemId={atlasModule.id} />
        </section>

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
              <article key={lesson.title} id={`lesson-${index + 1}`}>
                <div className={styles.lessonIndex}>Lesson {String(index + 1).padStart(2, "0")}</div>
                <h3>{lesson.title}</h3>
                <p>{lesson.summary}</p>
                <div className={styles.visualReference}>
                  <span>Planned / linked visual</span>
                  <strong>{lesson.visual}</strong>
                </div>
              </article>
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
            <p>Keep exploring the plant</p>
            <h2>Related Atlas systems</h2>
          </div>
          <div className={styles.relatedGrid}>
            {related.map((item) => (
              <Link key={item.id} href={`/learn/atlas/${slugFor(item.id)}`}>
                <span>{item.label}</span>
                <small>{item.lessons.length} lessons</small>
              </Link>
            ))}
          </div>
          <Link className={styles.backButton} href="/learn/atlas">Return to whole-plant Atlas</Link>
        </section>
      </div>
    </section>
  );
}
