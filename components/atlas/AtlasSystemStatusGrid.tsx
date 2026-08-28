"use client";

import Link from "next/link";
import modules from "@/content/atlas-learning-modules.json";
import { useAtlasProgress } from "@/components/atlas/AtlasLearningProgress";
import { useAtlasMastery } from "@/components/atlas/AtlasMastery";
import styles from "./AtlasSystemStatusGrid.module.css";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AtlasSystemStatusGrid() {
  const { progress } = useAtlasProgress();
  const { mastery } = useAtlasMastery();

  return (
    <section className={styles.wrap} aria-labelledby="atlas-system-status">
      <header className={styles.heading}>
        <div>
          <small>Whole-plant learning map</small>
          <h2 id="atlas-system-status">See what you know across the plant.</h2>
        </div>
        <div className={styles.headingActions}>
          <Link href="/learn/atlas/dashboard">Study dashboard</Link>
          <Link href="/learn/atlas/review">Review weak areas</Link>
        </div>
      </header>

      <div className={styles.grid}>
        {modules.map((atlasModule) => {
          const systemSlug = slugify(atlasModule.id);
          const routes = atlasModule.lessons.map(
            (lesson) => `/learn/atlas/${systemSlug}/${slugify(lesson.title)}`,
          );
          const complete = routes.filter((route) => progress.completed.includes(route)).length;
          const mastered = routes.filter((route) => mastery.lessons[route]?.mastered).length;
          const total = routes.length;
          const percent = total === 0 ? 0 : Math.round((complete / total) * 100);
          const nextRoute = routes.find((route) => !progress.completed.includes(route)) ?? routes[0];
          const state = mastered === total && total > 0
            ? "Mastered"
            : complete === total && total > 0
              ? "Complete"
              : complete > 0 || mastered > 0
                ? "In progress"
                : "Not started";

          return (
            <article key={atlasModule.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span>{state}</span>
                <strong>{percent}%</strong>
              </div>
              <h3>{atlasModule.label}</h3>
              <p>{complete}/{total} lessons complete · {mastered}/{total} checks mastered</p>
              <div className={styles.track} role="progressbar" aria-label={`${atlasModule.label} completion`} aria-valuemin={0} aria-valuemax={total} aria-valuenow={complete}>
                <i style={{ width: `${percent}%` }} />
              </div>
              <div className={styles.actions}>
                <Link href={`/learn/atlas/${systemSlug}`}>Open system</Link>
                {nextRoute ? <Link href={nextRoute}>{complete === total ? "Review" : "Continue"}</Link> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
