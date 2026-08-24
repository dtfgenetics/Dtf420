"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import modules from "@/content/atlas-learning-modules.json";
import styles from "./AtlasLearningModules.module.css";

function slugFor(id: string) {
  return id.replaceAll("_", "-");
}

export function AtlasLearningModules() {
  const [selectedId, setSelectedId] = useState(modules[0].id);
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
          {modules.map((module, index) => (
            <button
              key={module.id}
              type="button"
              className={module.id === selected.id ? styles.active : ""}
              onClick={() => setSelectedId(module.id)}
            >
              <b>{String(index + 1).padStart(2, "0")}</b>
              <span>{module.label}</span>
              <small>{module.lessons.length} lessons</small>
            </button>
          ))}
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
            {selected.lessons.map((lesson, index) => (
              <article key={lesson.title}>
                <div className={styles.lessonTopline}>
                  <span>Lesson {index + 1}</span>
                  <small>Visual reference</small>
                </div>
                <h4>{lesson.title}</h4>
                <p>{lesson.summary}</p>
                <footer>{lesson.visual}</footer>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
