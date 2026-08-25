"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import modules from "@/content/atlas-learning-modules.json";
import { atlasKnowledgeChecks, type AtlasKnowledgeCheck } from "@/lib/atlas-knowledge-checks";
import { useAtlasMastery } from "@/components/atlas/AtlasMastery";
import styles from "./AtlasReviewLab.module.css";

type ReviewMode = "focus" | "unmastered" | "all";

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

const checkByRoute = new Map(atlasKnowledgeChecks.map((check) => [check.route, check] as const));

function priorityFor(check: AtlasKnowledgeCheck, mastery: ReturnType<typeof useAtlasMastery>["mastery"]) {
  const record = mastery.lessons[check.route];
  if (record && record.attempts > 0 && !record.lastCorrect) return 0;
  if (!record?.mastered && record?.attempts) return 1;
  if (!record?.mastered) return 2;
  return 3;
}

export function AtlasReviewLab() {
  const { mastery, update } = useAtlasMastery();
  const [mode, setMode] = useState<ReviewMode>("focus");
  const [activeRoute, setActiveRoute] = useState(atlasKnowledgeChecks[0].route);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  const masteredCount = atlasKnowledgeChecks.filter((check) => mastery.lessons[check.route]?.mastered).length;
  const recentMissCount = atlasKnowledgeChecks.filter((check) => {
    const record = mastery.lessons[check.route];
    return Boolean(record && record.attempts > 0 && !record.lastCorrect);
  }).length;
  const unmasteredCount = atlasKnowledgeChecks.length - masteredCount;

  const queue = useMemo(() => {
    const filtered = atlasKnowledgeChecks.filter((check) => {
      const record = mastery.lessons[check.route];
      if (mode === "all") return true;
      if (mode === "unmastered") return !record?.mastered;
      return !record?.mastered || Boolean(record && record.attempts > 0 && !record.lastCorrect);
    });

    return [...filtered].sort((a, b) => {
      const priorityDifference = priorityFor(a, mastery) - priorityFor(b, mastery);
      if (priorityDifference !== 0) return priorityDifference;
      return atlasKnowledgeChecks.indexOf(a) - atlasKnowledgeChecks.indexOf(b);
    });
  }, [mastery, mode]);

  const queuedActive = queue.find((check) => check.route === activeRoute);
  const activeCheck = result !== null ? checkByRoute.get(activeRoute) : queuedActive ?? queue[0];
  const activeMeta = activeCheck ? lessonMeta.get(activeCheck.route) : undefined;
  const activeRecord = activeCheck ? mastery.lessons[activeCheck.route] : undefined;

  const switchMode = (nextMode: ReviewMode) => {
    setMode(nextMode);
    setSelected(null);
    setResult(null);
    const nextQueue = atlasKnowledgeChecks
      .filter((check) => {
        const record = mastery.lessons[check.route];
        if (nextMode === "all") return true;
        if (nextMode === "unmastered") return !record?.mastered;
        return !record?.mastered || Boolean(record && record.attempts > 0 && !record.lastCorrect);
      })
      .sort((a, b) => priorityFor(a, mastery) - priorityFor(b, mastery));
    if (nextQueue[0]) setActiveRoute(nextQueue[0].route);
  };

  const submit = () => {
    if (!activeCheck || selected === null) return;
    const correct = selected === activeCheck.correctIndex;
    const current = mastery.lessons[activeCheck.route] ?? { attempts: 0, mastered: false, lastCorrect: false };
    update({
      ...mastery,
      lessons: {
        ...mastery.lessons,
        [activeCheck.route]: {
          attempts: current.attempts + 1,
          mastered: current.mastered || correct,
          lastCorrect: correct,
        },
      },
    });
    setResult(correct ? "correct" : "incorrect");
  };

  const retry = () => {
    setSelected(null);
    setResult(null);
  };

  const nextReview = () => {
    if (!activeCheck) return;
    const remaining = queue.filter((check) => check.route !== activeCheck.route);
    const currentIndex = queue.findIndex((check) => check.route === activeCheck.route);
    const fallback = queue[(currentIndex + 1) % Math.max(queue.length, 1)];
    const next = remaining[0] ?? fallback;
    if (next) setActiveRoute(next.route);
    setSelected(null);
    setResult(null);
  };

  return (
    <div className={styles.shell}>
      <section className={styles.summary} aria-label="Atlas review summary">
        <div>
          <small>Mastery Review Lab</small>
          <h1>Practice what needs attention.</h1>
          <p>Recent misses rise to the top. Correct answers update the same mastery record used by lessons, guided paths, and your Mastery Passport.</p>
        </div>
        <div className={styles.stats}>
          <div><strong>{recentMissCount}</strong><span>recent misses</span></div>
          <div><strong>{unmasteredCount}</strong><span>unmastered</span></div>
          <div><strong>{masteredCount}</strong><span>mastered</span></div>
        </div>
      </section>

      <nav className={styles.modes} aria-label="Atlas review modes">
        <button type="button" aria-pressed={mode === "focus"} onClick={() => switchMode("focus")}>Focus review</button>
        <button type="button" aria-pressed={mode === "unmastered"} onClick={() => switchMode("unmastered")}>Unmastered only</button>
        <button type="button" aria-pressed={mode === "all"} onClick={() => switchMode("all")}>All 50 checks</button>
      </nav>

      <section className={styles.queueSummary} aria-label="Current review queue">
        <div>
          <small>Current queue</small>
          <strong>{queue.length} check{queue.length === 1 ? "" : "s"}</strong>
        </div>
        <span>{mode === "focus" ? "Missed checks first, then other unmastered concepts." : mode === "unmastered" ? "Only concepts not yet mastered." : "The complete Atlas knowledge-check bank."}</span>
      </section>

      {activeCheck ? (
        <section className={styles.practice} aria-label="Atlas review practice">
          <header>
            <div>
              <small>{activeMeta?.systemLabel ?? "Atlas lesson"}</small>
              <h2>{activeMeta?.title ?? "Review check"}</h2>
            </div>
            <div className={styles.attempts} aria-label="Previous attempts">
              <strong>{activeRecord?.attempts ?? 0}</strong>
              <span>previous attempt{(activeRecord?.attempts ?? 0) === 1 ? "" : "s"}</span>
            </div>
          </header>

          <p className={styles.prompt}>{activeCheck.prompt}</p>
          <div className={styles.options} role="radiogroup" aria-label="Review answer choices">
            {activeCheck.options.map((option, index) => {
              const chosen = selected === index;
              const revealCorrect = result !== null && index === activeCheck.correctIndex;
              const revealIncorrect = result === "incorrect" && chosen && index !== activeCheck.correctIndex;
              const className = revealCorrect ? styles.correct : revealIncorrect ? styles.incorrect : chosen ? styles.selected : undefined;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={chosen}
                  className={className}
                  disabled={result !== null}
                  onClick={() => result === null && setSelected(index)}
                >
                  <b>{String.fromCharCode(65 + index)}</b>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          {result === null ? (
            <div className={styles.actions}>
              <button type="button" onClick={submit} disabled={selected === null}>Check answer</button>
              <Link href={activeCheck.route}>Open full lesson</Link>
            </div>
          ) : (
            <div className={result === "correct" ? styles.feedbackCorrect : styles.feedbackIncorrect} role="status">
              <strong>{result === "correct" ? "Correct — mastery updated." : "Not yet — keep this concept in review."}</strong>
              <p>{activeCheck.explanation}</p>
              <div>
                {result === "incorrect" ? <button type="button" onClick={retry}>Try again</button> : <button type="button" onClick={nextReview}>Next review</button>}
                <Link href={activeCheck.route}>Open full lesson</Link>
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className={styles.empty} aria-label="Atlas review queue complete">
          <h2>No checks match this review mode.</h2>
          <p>You have cleared this queue. Switch to All 50 checks if you want additional practice.</p>
        </section>
      )}

      <footer className={styles.footer}>
        <Link href="/learn/atlas/mastery">View Mastery Passport</Link>
        <Link href="/learn/atlas">Back to Living Plant Atlas</Link>
      </footer>
    </div>
  );
}
