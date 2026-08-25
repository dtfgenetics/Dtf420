"use client";

import Link from "next/link";
import { useMemo } from "react";
import guidedPaths from "@/content/atlas-guided-paths.json";
import modules from "@/content/atlas-learning-modules.json";
import { atlasKnowledgeChecks } from "@/lib/atlas-knowledge-checks";
import { useAtlasProgress } from "@/components/atlas/AtlasLearningProgress";
import { useAtlasMastery } from "@/components/atlas/AtlasMastery";
import styles from "./AtlasStudyDashboard.module.css";

type LessonMeta = {
  title: string;
  systemLabel: string;
  route: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const lessons: LessonMeta[] = modules.flatMap((atlasModule) =>
  atlasModule.lessons.map((lesson) => ({
    title: lesson.title,
    systemLabel: atlasModule.label,
    route: `/learn/atlas/${slugify(atlasModule.id)}/${slugify(lesson.title)}`,
  })),
);

const lessonByRoute = new Map(lessons.map((lesson) => [lesson.route, lesson] as const));

function percentage(value: number, total: number) {
  return total === 0 ? 0 : Math.round((value / total) * 100);
}

export function AtlasStudyDashboard() {
  const { progress } = useAtlasProgress();
  const { mastery } = useAtlasMastery();
  const completed = useMemo(() => new Set(progress.completed), [progress.completed]);

  const completedCount = completed.size;
  const masteredCount = atlasKnowledgeChecks.filter((check) => mastery.lessons[check.route]?.mastered).length;
  const recentMisses = atlasKnowledgeChecks.filter((check) => {
    const record = mastery.lessons[check.route];
    return Boolean(record && record.attempts > 0 && !record.lastCorrect);
  });
  const unlockedPathBadges = guidedPaths.filter((path) => (mastery.paths[path.id]?.bestScore ?? 0) >= 80).length;

  const continueLesson =
    (progress.continueRoute && !completed.has(progress.continueRoute) ? lessonByRoute.get(progress.continueRoute) : undefined) ??
    lessons.find((lesson) => !completed.has(lesson.route)) ??
    lessons[0];

  const pathStats = guidedPaths.map((path) => {
    const completedLessons = path.lessons.filter((route) => completed.has(route)).length;
    const masteredLessons = path.lessons.filter((route) => mastery.lessons[route]?.mastered).length;
    const bestScore = mastery.paths[path.id]?.bestScore ?? 0;
    const nextRoute = path.lessons.find((route) => !completed.has(route)) ?? path.lessons[0];
    return {
      ...path,
      completedLessons,
      masteredLessons,
      bestScore,
      nextRoute,
      progressPercent: percentage(completedLessons, path.lessons.length),
    };
  });

  const closestPath = [...pathStats].sort((a, b) => {
    if (b.progressPercent !== a.progressPercent) return b.progressPercent - a.progressPercent;
    if (b.masteredLessons !== a.masteredLessons) return b.masteredLessons - a.masteredLessons;
    return guidedPaths.findIndex((path) => path.id === a.id) - guidedPaths.findIndex((path) => path.id === b.id);
  })[0];

  const recommendation = recentMisses.length > 0
    ? {
        eyebrow: "Review priority",
        title: `${recentMisses.length} recent miss${recentMisses.length === 1 ? " needs" : "es need"} attention`,
        copy: "Correct weak spots while the context is still fresh.",
        href: "/learn/atlas/review",
        action: "Review recent misses",
      }
    : completedCount < lessons.length
      ? {
          eyebrow: "Continue learning",
          title: continueLesson ? `Continue with ${continueLesson.title}` : "Continue the Atlas",
          copy: continueLesson ? `Resume in ${continueLesson.systemLabel}.` : "Continue the next unfinished Atlas lesson.",
          href: continueLesson?.route ?? "/learn/atlas",
          action: "Continue lesson",
        }
      : masteredCount < atlasKnowledgeChecks.length
        ? {
            eyebrow: "Mastery priority",
            title: `${atlasKnowledgeChecks.length - masteredCount} checks remain unmastered`,
            copy: "Use focused review to convert completed lessons into retained knowledge.",
            href: "/learn/atlas/review",
            action: "Practice unmastered checks",
          }
        : unlockedPathBadges < guidedPaths.length
          ? {
              eyebrow: "Badge priority",
              title: `${guidedPaths.length - unlockedPathBadges} path badge${guidedPaths.length - unlockedPathBadges === 1 ? " remains" : "s remain"}`,
              copy: "Take the remaining guided-path quizzes to finish your Mastery Passport.",
              href: "/learn/atlas/paths",
              action: "Finish path mastery",
            }
          : {
              eyebrow: "Atlas mastery",
              title: "Your current Atlas mastery goals are complete",
              copy: "Use Practice or Explore whenever you want to reinforce the material.",
              href: "/learn/atlas/mastery",
              action: "View Mastery Passport",
            };

  return (
    <div className={styles.shell}>
      <section className={styles.hero} aria-label="Atlas study dashboard summary">
        <div>
          <small>Study Dashboard</small>
          <h1>Continue with what matters most.</h1>
          <p>Your completion, mastery, review, and path records stay together on this device.</p>
        </div>
        <Link href="/learn/atlas">Explore the plant</Link>
      </section>

      <section className={styles.metrics} aria-label="Atlas study metrics">
        <article><small>Lessons</small><strong>{completedCount}/{lessons.length}</strong><span>{percentage(completedCount, lessons.length)}% complete</span></article>
        <article><small>Knowledge</small><strong>{masteredCount}/{atlasKnowledgeChecks.length}</strong><span>{percentage(masteredCount, atlasKnowledgeChecks.length)}% mastered</span></article>
        <article><small>Review</small><strong>{recentMisses.length}</strong><span>{recentMisses.length === 0 ? "Queue clear" : "Recent misses"}</span></article>
        <article><small>Badges</small><strong>{unlockedPathBadges}/{guidedPaths.length}</strong><span>Path mastery</span></article>
      </section>

      <section className={styles.recommendation} aria-label="Recommended Atlas study action">
        <div><small>{recommendation.eyebrow}</small><h2>{recommendation.title}</h2><p>{recommendation.copy}</p></div>
        <Link href={recommendation.href}>{recommendation.action}</Link>
      </section>

      <div className={styles.grid}>
        <section className={styles.panel} aria-label="Continue Atlas learning">
          <small>Continue Learning</small><h2>{continueLesson?.title ?? "Living Plant Atlas"}</h2>
          <p>{continueLesson ? `${continueLesson.systemLabel} · Next unfinished lesson.` : "Choose any Atlas lesson to continue."}</p>
          <Link href={continueLesson?.route ?? "/learn/atlas"}>Open next lesson</Link>
        </section>
        <section className={styles.panel} aria-label="Closest guided learning path">
          <small>Closest guided path</small><h2>{closestPath.title}</h2>
          <p>{closestPath.completedLessons}/{closestPath.lessons.length} lessons complete · {closestPath.masteredLessons}/{closestPath.lessons.length} checks mastered</p>
          <div className={styles.track} role="progressbar" aria-label={`${closestPath.title} dashboard progress`} aria-valuemin={0} aria-valuemax={closestPath.lessons.length} aria-valuenow={closestPath.completedLessons}><span style={{ width: `${closestPath.progressPercent}%` }} /></div>
          <div className={styles.panelActions}><Link href={closestPath.nextRoute}>Continue path</Link><Link href="/learn/atlas/paths">View all paths</Link></div>
        </section>
      </div>

      <section className={styles.toolGroups} aria-label="Atlas learner destinations">
        <article className={styles.toolGroup}>
          <header><small>Learn</small><h2>Build the model</h2></header>
          <Link href="/learn/atlas"><strong>Explore Plant Systems</strong><span>Use the whole-plant explorer, lifecycle, overlays, and system lessons.</span></Link>
          <Link href="/learn/atlas/paths"><strong>Guided Paths</strong><span>Follow curated cross-system learning sequences.</span></Link>
        </article>

        <article className={styles.toolGroup}>
          <header><small>Practice</small><h2>Use what you know</h2></header>
          <Link href="/learn/atlas/practice"><strong>Open Practice Hub</strong><span>Review weak concepts, work diagnostic cases, or compare plant systems.</span></Link>
        </article>

        <article className={styles.toolGroup}>
          <header><small>Observe</small><h2>Record real evidence</h2></header>
          <Link href="/learn/atlas/notebook"><strong>Observation Notebook</strong><span>Record location, pattern, measurements, differential, and next check.</span></Link>
          <Link href="/learn/atlas/notebook/compare"><strong>Compare Field Observations</strong><span>Compare baseline and follow-up notes to see what actually changed.</span></Link>
        </article>

        <article className={styles.toolGroup}>
          <header><small>Track</small><h2>See what is retained</h2></header>
          <Link href="/learn/atlas/mastery"><strong>Mastery Passport</strong><span>Track path badges and whole-Atlas mastery.</span></Link>
        </article>
      </section>
    </div>
  );
}
