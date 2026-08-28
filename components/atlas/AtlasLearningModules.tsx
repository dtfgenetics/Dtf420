"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import modules from "@/content/atlas-learning-modules.json";
import { useAtlasProgress } from "@/components/atlas/AtlasLearningProgress";
import { useAtlasMastery } from "@/components/atlas/AtlasMastery";
import styles from "./AtlasLearningModules.module.css";

function slugFor(id: string) {
  return id.replaceAll("_", "-");
}

function lessonSlug(title: string) {
  return title
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AtlasLearningModules() {
  const [selectedId, setSelectedId] = useState(modules[0].id);
  const { progress } = useAtlasProgress();
  const { mastery } = useAtlasMastery();
  const selected = useMemo(
    () => modules.find((module) => module.id === selectedId) ?? modules[0],
    [selectedId],
  );

  return (
    <section className={styles.moduleExplorer} aria-labelledby="atlas-system-modules">
      <div className={styles.heading}>
        <div>
          <p>Whole-plant curriculum</p>
          <h2 id="atlas-system-modules">Explore every plant system</h2>
        </div>
        <span>{modules.reduce((total, module) => total + module.lessons.length, 0)} structured lessons</span>
      </div>

      <div className={styles.layout}>
        <nav className={styles.systemNav} aria-label="Atlas system modules">
          {modules.map((module, index) => {
            const routes = module.lessons.map((lesson) => `/learn/atlas/${slugFor(module.id)}/${lessonSlug(lesson.title)}`);
            const completed = routes.filter((route) => progress.completed.includes(route)).length;
            const mastered = routes.filter((route) => mastery.lessons[route]?.mastered).length;
            return (
              <button
                key={module.id}
                type="button"
                className={module.id === selected.id ? styles.active : ""}
                onClick={() => setSelectedId(module.id)}
              >
                <b>{String(index + 1).padStart(2, "0")}</b>
                <span>{module.label}</span>
                <small>{completed}/{module.lessons.length} complete · {mastered} mastered</small>
              </button>
            );
          })}
        </nav>

        <div className={styles.content}>
          <header className={styles.moduleHeader}>
            <div>
              <p>Selected learning system</p>
              <h3>{selected.label}</h3>
              <Link className={styles.moduleLink} href={`/learn/atlas/${slugFor(selected.id)}`}>
                Open full visual module
              </Link>
            </div>
            <div className={styles.goals}>
              {selected.learningGoals.map((goal) => <span key={goal}>{goal}</span>)}
            </div>
          </header>

          <div className={styles.lessonGrid}>
            {selected.lessons.map((lesson, index) => {
              const route = `/learn/atlas/${slugFor(selected.id)}/${lessonSlug(lesson.title)}`;
              const complete = progress.completed.includes(route);
              const mastered = mastery.lessons[route]?.mastered === true;
              return (
                <Link
                  key={lesson.title}
                  href={route}
                  aria-label={`Open ${lesson.title}`}
                  style={{ color: "inherit", textDecoration: "none", display: "block" }}
                >
                  <article style={{ height: "100%" }}>
                    <div className={styles.lessonTopline}>
                      <span>Lesson {index + 1}</span>
                      <small>{mastered ? "Mastered ✓" : complete ? "Complete ✓" : "Open lesson"}</small>
                    </div>
                    <h4>{lesson.title}</h4>
                    <p>{lesson.summary}</p>
                    <footer>{lesson.visual}</footer>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
