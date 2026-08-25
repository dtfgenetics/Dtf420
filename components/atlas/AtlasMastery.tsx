"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import knowledgeChecks from "@/content/atlas-knowledge-checks.json";
import guidedPaths from "@/content/atlas-guided-paths.json";
import styles from "./AtlasMastery.module.css";

const STORAGE_KEY = "dtf420.atlas.mastery.v1";
const CHANGE_EVENT = "dtf420-atlas-mastery-change";
const EMPTY_SNAPSHOT = "";

export type LessonMasteryRecord = {
  attempts: number;
  mastered: boolean;
  lastCorrect: boolean;
};

export type PathMasteryRecord = {
  attempts: number;
  bestScore: number;
  lastScore: number;
};

export type AtlasMasteryState = {
  lessons: Record<string, LessonMasteryRecord>;
  paths: Record<string, PathMasteryRecord>;
};

export type AtlasKnowledgeCheck = {
  id: string;
  route: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const validRoutes = new Set(knowledgeChecks.map((check) => check.route));
const validPathIds = new Set(guidedPaths.map((path) => path.id));

function normalizeState(value: unknown): AtlasMasteryState {
  const empty: AtlasMasteryState = { lessons: {}, paths: {} };
  if (!value || typeof value !== "object") return empty;

  const candidate = value as Partial<AtlasMasteryState>;
  const lessons: AtlasMasteryState["lessons"] = {};
  const paths: AtlasMasteryState["paths"] = {};

  if (candidate.lessons && typeof candidate.lessons === "object") {
    for (const [route, raw] of Object.entries(candidate.lessons)) {
      if (!validRoutes.has(route) || !raw || typeof raw !== "object") continue;
      const record = raw as Partial<LessonMasteryRecord>;
      lessons[route] = {
        attempts: Number.isInteger(record.attempts) && Number(record.attempts) >= 0 ? Number(record.attempts) : 0,
        mastered: record.mastered === true,
        lastCorrect: record.lastCorrect === true,
      };
    }
  }

  if (candidate.paths && typeof candidate.paths === "object") {
    for (const [pathId, raw] of Object.entries(candidate.paths)) {
      if (!validPathIds.has(pathId) || !raw || typeof raw !== "object") continue;
      const record = raw as Partial<PathMasteryRecord>;
      const bestScore = typeof record.bestScore === "number" ? Math.max(0, Math.min(100, Math.round(record.bestScore))) : 0;
      const lastScore = typeof record.lastScore === "number" ? Math.max(0, Math.min(100, Math.round(record.lastScore))) : 0;
      paths[pathId] = {
        attempts: Number.isInteger(record.attempts) && Number(record.attempts) >= 0 ? Number(record.attempts) : 0,
        bestScore,
        lastScore,
      };
    }
  }

  return { lessons, paths };
}

function parseSnapshot(snapshot: string): AtlasMasteryState {
  if (!snapshot) return { lessons: {}, paths: {} };
  try {
    return normalizeState(JSON.parse(snapshot));
  } catch {
    return { lessons: {}, paths: {} };
  }
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY_SNAPSHOT;
}

function getServerSnapshot() {
  return EMPTY_SNAPSHOT;
}

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}

function saveMastery(next: AtlasMasteryState) {
  const normalized = normalizeState(next);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useAtlasMastery() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const mastery = useMemo(() => parseSnapshot(snapshot), [snapshot]);
  return {
    mastery,
    update: saveMastery,
  };
}

export function AtlasMasteryOverview() {
  const { mastery } = useAtlasMastery();
  const mastered = Object.values(mastery.lessons).filter((record) => record.mastered).length;
  const percent = Math.round((mastered / knowledgeChecks.length) * 100);

  return (
    <section className={styles.overview} aria-label="Atlas mastery overview">
      <div>
        <small>Knowledge mastery</small>
        <h2>{mastered} of {knowledgeChecks.length} checks mastered</h2>
        <p>Correct responses are saved on this device and count across lessons and guided paths.</p>
      </div>
      <div className={styles.overviewScore}>
        <strong>{percent}%</strong>
        <span>mastered</span>
      </div>
      <div className={styles.track} role="progressbar" aria-label="Atlas checks mastered" aria-valuemin={0} aria-valuemax={knowledgeChecks.length} aria-valuenow={mastered}>
        <span style={{ width: `${percent}%` }} />
      </div>
    </section>
  );
}

export function AtlasLessonKnowledgeCheck({ check }: { check: AtlasKnowledgeCheck }) {
  const { mastery, update } = useAtlasMastery();
  const stored = mastery.lessons[check.route];
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  const submit = () => {
    if (selected === null) return;
    const correct = selected === check.correctIndex;
    const current = mastery.lessons[check.route] ?? { attempts: 0, mastered: false, lastCorrect: false };
    update({
      ...mastery,
      lessons: {
        ...mastery.lessons,
        [check.route]: {
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

  return (
    <section className={styles.lessonCheck} aria-label="Lesson knowledge check">
      <header>
        <div>
          <small>Knowledge check</small>
          <h2>Can you explain what the visual is showing?</h2>
        </div>
        <span className={stored?.mastered ? styles.masteredBadge : styles.practiceBadge}>
          {stored?.mastered ? "Mastered ✓" : "Practice"}
        </span>
      </header>

      <p className={styles.prompt}>{check.prompt}</p>
      <div className={styles.options} role="radiogroup" aria-label="Answer choices">
        {check.options.map((option, index) => {
          const chosen = selected === index;
          const revealCorrect = result !== null && index === check.correctIndex;
          const revealIncorrect = result === "incorrect" && chosen && index !== check.correctIndex;
          const className = revealCorrect ? styles.correctOption : revealIncorrect ? styles.incorrectOption : chosen ? styles.selectedOption : undefined;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={chosen}
              className={className}
              onClick={() => result === null && setSelected(index)}
              disabled={result !== null}
            >
              <b>{String.fromCharCode(65 + index)}</b>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {result === null ? (
        <button className={styles.submit} type="button" onClick={submit} disabled={selected === null}>Check answer</button>
      ) : (
        <div className={result === "correct" ? styles.feedbackCorrect : styles.feedbackIncorrect} role="status">
          <strong>{result === "correct" ? "Correct." : "Not yet."}</strong>
          <p>{check.explanation}</p>
          {result === "incorrect" ? <button type="button" onClick={retry}>Try again</button> : null}
        </div>
      )}
    </section>
  );
}

export function PathMasterySummary({ pathId, lessons }: { pathId: string; lessons: string[] }) {
  const { mastery } = useAtlasMastery();
  const masteredCount = lessons.filter((route) => mastery.lessons[route]?.mastered).length;
  const pathRecord = mastery.paths[pathId];
  const percent = Math.round((masteredCount / lessons.length) * 100);

  return (
    <div className={styles.pathSummary} aria-label="Path mastery summary">
      <div>
        <small>Lesson checks</small>
        <strong>{masteredCount}/{lessons.length} mastered</strong>
        <span>{percent}% of this path&apos;s lesson checks</span>
      </div>
      <div>
        <small>Best path quiz</small>
        <strong>{pathRecord ? `${pathRecord.bestScore}%` : "Not attempted"}</strong>
        <span>{pathRecord ? `${pathRecord.attempts} attempt${pathRecord.attempts === 1 ? "" : "s"}` : "Take the quiz when ready"}</span>
      </div>
      <Link href={`/learn/atlas/paths/${pathId}`}>{pathRecord ? "Retake mastery quiz" : "Take mastery quiz"}</Link>
    </div>
  );
}
