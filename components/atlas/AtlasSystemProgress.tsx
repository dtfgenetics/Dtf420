"use client";

import Link from "next/link";
import modules from "@/content/atlas-learning-modules.json";
import { useAtlasProgress } from "@/components/atlas/AtlasLearningProgress";
import { useAtlasMastery } from "@/components/atlas/AtlasMastery";
import styles from "./AtlasSystemProgress.module.css";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AtlasSystemProgress({ systemId }: { systemId: string }) {
  const atlasModule = modules.find((item) => item.id === systemId);
  const { progress } = useAtlasProgress();
  const { mastery } = useAtlasMastery();

  if (!atlasModule) return null;

  const routes = atlasModule.lessons.map(
    (lesson) => `/learn/atlas/${slugify(atlasModule.id)}/${slugify(lesson.title)}`,
  );
  const completed = routes.filter((route) => progress.completed.includes(route)).length;
  const mastered = routes.filter((route) => mastery.lessons[route]?.mastered).length;
  const total = routes.length;
  const completionPercent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const masteryPercent = total === 0 ? 0 : Math.round((mastered / total) * 100);
  const nextRoute = routes.find((route) => !progress.completed.includes(route)) ?? routes[0];
  const nextLesson = atlasModule.lessons[routes.indexOf(nextRoute)] ?? atlasModule.lessons[0];

  return (
    <section className={styles.wrap} aria-label={`${atlasModule.label} learning progress`}>
      <header className={styles.header}>
        <div>
          <small>System progress</small>
          <h2>Keep this system connected to your Atlas record.</h2>
        </div>
        <Link href="/learn/atlas/dashboard">Open dashboard</Link>
      </header>

      <div className={styles.metrics}>
        <article>
          <div><span>Lessons complete</span><strong>{completed}/{total}</strong></div>
          <div className={styles.track} role="progressbar" aria-label={`${atlasModule.label} lessons complete`} aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed}>
            <i style={{ width: `${completionPercent}%` }} />
          </div>
          <small>{completionPercent}% complete</small>
        </article>
        <article>
          <div><span>Knowledge mastered</span><strong>{mastered}/{total}</strong></div>
          <div className={styles.track} role="progressbar" aria-label={`${atlasModule.label} knowledge checks mastered`} aria-valuemin={0} aria-valuemax={total} aria-valuenow={mastered}>
            <i style={{ width: `${masteryPercent}%` }} />
          </div>
          <small>{masteryPercent}% mastered</small>
        </article>
      </div>

      {nextRoute && nextLesson ? (
        <div className={styles.next}>
          <div>
            <small>{completed >= total ? "Review this system" : "Next unfinished lesson"}</small>
            <strong>{nextLesson.title}</strong>
          </div>
          <Link href={nextRoute}>{completed >= total ? "Review lesson" : "Continue learning"}</Link>
        </div>
      ) : null}
    </section>
  );
}
