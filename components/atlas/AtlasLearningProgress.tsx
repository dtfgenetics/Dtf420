"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import modules from "@/content/atlas-learning-modules.json";
import styles from "./AtlasLearningProgress.module.css";

const STORAGE_KEY = "dtf420.atlas.progress.v1";
const CHANGE_EVENT = "dtf420-atlas-progress-change";
const EMPTY_SNAPSHOT = "";

export type AtlasProgressState = {
  completed: string[];
  continueRoute?: string;
};

type LessonRecord = {
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

const lessons: LessonRecord[] = modules.flatMap((atlasModule) =>
  atlasModule.lessons.map((lesson) => ({
    title: lesson.title,
    systemLabel: atlasModule.label,
    route: `/learn/atlas/${slugify(atlasModule.id)}/${slugify(lesson.title)}`,
  })),
);

function normalizeProgress(value: unknown): AtlasProgressState {
  if (!value || typeof value !== "object") return { completed: [] };
  const candidate = value as Partial<AtlasProgressState>;
  const completed = Array.isArray(candidate.completed)
    ? candidate.completed.filter((route): route is string => typeof route === "string" && lessons.some((lesson) => lesson.route === route))
    : [];
  const continueRoute = typeof candidate.continueRoute === "string" && lessons.some((lesson) => lesson.route === candidate.continueRoute)
    ? candidate.continueRoute
    : undefined;
  return { completed: [...new Set(completed)], continueRoute };
}

function parseProgressSnapshot(snapshot: string): AtlasProgressState {
  if (!snapshot) return { completed: [] };
  try {
    return normalizeProgress(JSON.parse(snapshot));
  } catch {
    return { completed: [] };
  }
}

function getProgressSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY_SNAPSHOT;
}

function getServerSnapshot() {
  return EMPTY_SNAPSHOT;
}

function subscribeToProgress(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}

function readProgress() {
  return parseProgressSnapshot(getProgressSnapshot());
}

function saveProgress(next: AtlasProgressState) {
  const normalized = normalizeProgress(next);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useAtlasProgress() {
  const snapshot = useSyncExternalStore(subscribeToProgress, getProgressSnapshot, getServerSnapshot);
  const progress = useMemo(() => parseProgressSnapshot(snapshot), [snapshot]);
  const update = useCallback((next: AtlasProgressState) => saveProgress(next), []);
  return { progress, update };
}

function resolveContinueLesson(progress: AtlasProgressState) {
  const completed = new Set(progress.completed);
  if (progress.continueRoute && !completed.has(progress.continueRoute)) {
    return lessons.find((lesson) => lesson.route === progress.continueRoute);
  }
  return lessons.find((lesson) => !completed.has(lesson.route)) ?? lessons[0];
}

export function AtlasProgressOverview() {
  const { progress } = useAtlasProgress();
  const completedCount = progress.completed.length;
  const percent = Math.round((completedCount / lessons.length) * 100);
  const continueLesson = resolveContinueLesson(progress);

  return (
    <section className={styles.overview} aria-label="Atlas learning progress">
      <div className={styles.overviewCopy}>
        <div>
          <h2>Your Atlas progress</h2>
          <p>{completedCount} of {lessons.length} lessons complete</p>
        </div>
        <strong>{percent}%</strong>
      </div>

      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-label="Atlas lessons completed"
        aria-valuemin={0}
        aria-valuemax={lessons.length}
        aria-valuenow={completedCount}
      >
        <span style={{ width: `${percent}%` }} />
      </div>

      <div className={styles.continueRow}>
        <div>
          <small>Saved on this device</small>
          <span>{completedCount === lessons.length ? "All lessons are complete. Revisit any system whenever you want." : `Continue with ${continueLesson?.systemLabel}: ${continueLesson?.title}`}</span>
        </div>
        {continueLesson ? <Link href={continueLesson.route}>{completedCount === lessons.length ? "Review Atlas" : "Continue learning"}</Link> : null}
      </div>
    </section>
  );
}

export function AtlasLessonProgress({ route, nextRoute }: { route: string; nextRoute?: string }) {
  const { progress, update } = useAtlasProgress();
  const completed = useMemo(() => progress.completed.includes(route), [progress.completed, route]);

  useEffect(() => {
    const latest = readProgress();
    if (latest.completed.includes(route) || latest.continueRoute === route) return;
    saveProgress({ ...latest, continueRoute: route });
  }, [route]);

  const toggleComplete = () => {
    const completedRoutes = new Set(progress.completed);
    if (completed) completedRoutes.delete(route);
    else completedRoutes.add(route);

    update({
      completed: [...completedRoutes],
      continueRoute: !completed && nextRoute ? nextRoute : route,
    });
  };

  return (
    <section className={styles.lessonProgress} aria-label="Lesson completion">
      <div>
        <h2>{completed ? "Lesson complete" : "Track this lesson"}</h2>
        <p>{completed ? "This lesson is saved as complete on this device." : "Mark the lesson complete when you are comfortable with the visual, observations, and system context."}</p>
      </div>
      <div className={styles.lessonActions}>
        <button type="button" onClick={toggleComplete} aria-pressed={completed}>
          {completed ? "Completed ✓" : "Mark lesson complete"}
        </button>
        {completed && nextRoute ? <Link href={nextRoute}>Continue to next lesson</Link> : null}
      </div>
    </section>
  );
}
