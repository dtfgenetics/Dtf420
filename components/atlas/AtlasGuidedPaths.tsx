"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import modules from "@/content/atlas-learning-modules.json";
import guidedPaths from "@/content/atlas-guided-paths.json";
import { useAtlasProgress } from "@/components/atlas/AtlasLearningProgress";
import { PathMasterySummary } from "@/components/atlas/AtlasMastery";
import styles from "./AtlasGuidedPaths.module.css";

type LessonMeta = {
  title: string;
  systemLabel: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const lessonMeta = new Map<string, LessonMeta>(
  modules.flatMap((atlasModule) =>
    atlasModule.lessons.map((lesson) => [
      `/learn/atlas/${slugify(atlasModule.id)}/${slugify(lesson.title)}`,
      { title: lesson.title, systemLabel: atlasModule.label },
    ] as const),
  ),
);

export function AtlasGuidedPaths() {
  const { progress } = useAtlasProgress();
  const [selectedId, setSelectedId] = useState(guidedPaths[0].id);
  const selectedPath = guidedPaths.find((path) => path.id === selectedId) ?? guidedPaths[0];
  const completed = useMemo(() => new Set(progress.completed), [progress.completed]);
  const completedCount = selectedPath.lessons.filter((route) => completed.has(route)).length;
  const percent = Math.round((completedCount / selectedPath.lessons.length) * 100);
  const nextRoute = selectedPath.lessons.find((route) => !completed.has(route)) ?? selectedPath.lessons[0];
  const pathComplete = completedCount === selectedPath.lessons.length;

  return (
    <div className={styles.shell}>
      <nav className={styles.pathRail} aria-label="Atlas guided learning paths">
        {guidedPaths.map((path) => {
          const done = path.lessons.filter((route) => completed.has(route)).length;
          return (
            <button
              key={path.id}
              type="button"
              className={path.id === selectedPath.id ? styles.activePath : undefined}
              aria-pressed={path.id === selectedPath.id}
              onClick={() => setSelectedId(path.id)}
            >
              <span>{path.title}</span>
              <small>{done}/{path.lessons.length}</small>
            </button>
          );
        })}
      </nav>

      <section className={styles.pathDetail} aria-label={`${selectedPath.title} learning path`}>
        <header className={styles.header}>
          <div>
            <p>Guided path · {selectedPath.lessons.length} lessons</p>
            <h2>{selectedPath.title}</h2>
            <span>{selectedPath.summary}</span>
          </div>
          <div className={styles.pathProgress}>
            <strong>{percent}%</strong>
            <span>{completedCount} of {selectedPath.lessons.length} complete</span>
          </div>
        </header>

        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label={`${selectedPath.title} progress`}
          aria-valuemin={0}
          aria-valuemax={selectedPath.lessons.length}
          aria-valuenow={completedCount}
        >
          <span style={{ width: `${percent}%` }} />
        </div>

        <div className={styles.outcome}>
          <small>Learning outcome</small>
          <p>{selectedPath.outcome}</p>
        </div>

        <PathMasterySummary pathId={selectedPath.id} lessons={selectedPath.lessons} />

        <ol className={styles.sequence} aria-label={`${selectedPath.title} lesson sequence`}>
          {selectedPath.lessons.map((route, index) => {
            const meta = lessonMeta.get(route);
            const done = completed.has(route);
            return (
              <li key={route} className={done ? styles.completedStep : undefined}>
                <div className={styles.stepNumber} aria-hidden="true">{done ? "✓" : index + 1}</div>
                <div className={styles.stepCopy}>
                  <small>{meta?.systemLabel ?? "Atlas lesson"}</small>
                  <strong>{meta?.title ?? route}</strong>
                </div>
                <Link href={route}>{done ? "Review" : "Open lesson"}</Link>
              </li>
            );
          })}
        </ol>

        <footer className={styles.footer}>
          <div>
            <small>Progress is shared with the full Atlas</small>
            <span>Complete a lesson here and it counts everywhere that lesson appears.</span>
          </div>
          <Link className={styles.primaryAction} href={nextRoute}>
            {pathComplete ? "Review this path" : completedCount > 0 ? "Continue this path" : "Start this path"}
          </Link>
        </footer>
      </section>
    </div>
  );
}
