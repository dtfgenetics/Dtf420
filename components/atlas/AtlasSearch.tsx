"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import modules from "@/content/atlas-learning-modules.json";
import guidedPaths from "@/content/atlas-guided-paths.json";
import diagnosticCases from "@/content/atlas-diagnostic-cases.json";
import styles from "./AtlasSearch.module.css";

type SearchKind = "Lesson" | "Guided path" | "Diagnostic case" | "Tool";

type SearchItem = {
  kind: SearchKind;
  title: string;
  context: string;
  summary: string;
  href: string;
  terms: string;
};

type RankedItem = SearchItem & { score: number };

function slugify(value: string) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const lessonItems: SearchItem[] = modules.flatMap((atlasModule) =>
  atlasModule.lessons.map((lesson) => ({
    kind: "Lesson" as const,
    title: lesson.title,
    context: atlasModule.label,
    summary: lesson.summary,
    href: `/learn/atlas/${slugify(atlasModule.id)}/${slugify(lesson.title)}`,
    terms: [lesson.visual, ...atlasModule.learningGoals].join(" "),
  })),
);

const pathItems: SearchItem[] = guidedPaths.map((path) => ({
  kind: "Guided path" as const,
  title: path.title,
  context: `${path.lessons.length} lesson guided path`,
  summary: path.summary,
  href: "/learn/atlas/paths",
  terms: `${path.outcome} ${path.lessons.join(" ")}`,
}));

const caseItems: SearchItem[] = diagnosticCases.map((diagnosticCase) => ({
  kind: "Diagnostic case" as const,
  title: diagnosticCase.title,
  context: diagnosticCase.focus,
  summary: diagnosticCase.scenario,
  href: "/learn/atlas/cases",
  terms: [
    diagnosticCase.takeaway,
    diagnosticCase.question,
    ...diagnosticCase.observations.flatMap((observation) => [observation.label, observation.value]),
    ...diagnosticCase.differential,
  ].join(" "),
}));

const toolItems: SearchItem[] = [
  {
    kind: "Tool",
    title: "Study Dashboard",
    context: "Continue learning",
    summary: "Resume lessons, review priorities, guided paths, and mastery from one learner home.",
    href: "/learn/atlas/dashboard",
    terms: "continue progress resume recent misses badges learning state",
  },
  {
    kind: "Tool",
    title: "Explore Plant Systems",
    context: "Whole-plant explorer",
    summary: "Explore anatomy, lifecycle, environment overlays, diagnostic relationships, and all plant systems.",
    href: "/learn/atlas",
    terms: "plant anatomy physiology roots stems nodes leaves flowers trichomes environment lifecycle",
  },
  {
    kind: "Tool",
    title: "Practice Hub",
    context: "Practice",
    summary: "Choose focused recall, diagnostic reasoning, or side-by-side plant-system comparisons.",
    href: "/learn/atlas/practice",
    terms: "practice quiz recall reasoning compare review",
  },
  {
    kind: "Tool",
    title: "Mastery Review Lab",
    context: "Focused review",
    summary: "Practice recent misses and unmastered knowledge checks from the shared Atlas mastery record.",
    href: "/learn/atlas/review",
    terms: "wrong answer weak concepts quiz review mastery practice",
  },
  {
    kind: "Tool",
    title: "Diagnostic Case Lab",
    context: "Observation-first reasoning",
    summary: "Practice choosing discriminating measurements and inspections instead of guessing a diagnosis from appearance.",
    href: "/learn/atlas/cases",
    terms: "symptoms diagnose diagnosis yellow leaves droop wilt tip burn chlorosis case plant problem",
  },
  {
    kind: "Tool",
    title: "Compare Plant Systems",
    context: "Relationships",
    summary: "Compare related structures and processes side by side, including xylem vs phloem and healthy roots vs root stress.",
    href: "/learn/atlas/compare",
    terms: "compare contrast xylem phloem male female roots trichomes airflow",
  },
  {
    kind: "Tool",
    title: "Observation Notebook",
    context: "Field observations",
    summary: "Record symptom location, pattern, progression, measurements, working differential, and the next check.",
    href: "/learn/atlas/notebook",
    terms: "notes notebook record journal pH EC RH measurements observation field plant log",
  },
  {
    kind: "Tool",
    title: "Compare Field Observations",
    context: "Baseline vs follow-up",
    summary: "Compare two saved field notes to see what evidence, context, and measurements changed over time.",
    href: "/learn/atlas/notebook/compare",
    terms: "compare notes baseline follow-up pH EC RH changes trend observation",
  },
  {
    kind: "Tool",
    title: "Mastery Passport",
    context: "Learning achievements",
    summary: "Track guided-path badges and whole-Atlas lesson mastery.",
    href: "/learn/atlas/mastery",
    terms: "badge mastery progress achievements score path quiz",
  },
];

const searchItems = [...lessonItems, ...pathItems, ...caseItems, ...toolItems];
const examples = ["VPD", "yellow lower leaves", "trichomes", "pH", "roots"];

function rankItem(item: SearchItem, rawQuery: string): RankedItem | null {
  const query = normalize(rawQuery);
  if (query.length < 2) return null;

  const title = normalize(item.title);
  const context = normalize(item.context);
  const summary = normalize(item.summary);
  const haystack = normalize(`${item.title} ${item.context} ${item.summary} ${item.terms}`);
  const tokens = query.split(" ").filter(Boolean);

  let score = 0;
  if (title === query) score += 120;
  else if (title.startsWith(query)) score += 80;
  else if (title.includes(query)) score += 55;

  if (context.includes(query)) score += 35;
  if (summary.includes(query)) score += 25;

  const matchedTokens = tokens.filter((token) => haystack.includes(token));
  if (matchedTokens.length === tokens.length) score += 30 + matchedTokens.length * 8;
  else score += matchedTokens.length * 5;

  return score > 0 ? { ...item, score } : null;
}

export function AtlasSearch() {
  const [query, setQuery] = useState("");
  const results = useMemo(
    () => searchItems
      .map((item) => rankItem(item, query))
      .filter((item): item is RankedItem => item !== null)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .slice(0, 12),
    [query],
  );
  const searching = normalize(query).length >= 2;

  return (
    <div className={styles.shell}>
      <section className={styles.hero} aria-labelledby="atlas-search-title">
        <div>
          <small>Atlas Search</small>
          <h1 id="atlas-search-title">Find the concept, case, or tool you need.</h1>
          <p>Search the 50 lessons, guided paths, diagnostic cases, and learner tools without needing to know where they live in the Atlas.</p>
        </div>
        <Link href="/learn/atlas/dashboard">Back to Dashboard</Link>
      </section>

      <section className={styles.searchPanel} aria-label="Search the Living Plant Atlas">
        <label htmlFor="atlas-search-input">Search the Atlas</label>
        <div className={styles.inputWrap}>
          <span aria-hidden="true">⌕</span>
          <input
            id="atlas-search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try VPD, roots, yellow lower leaves, trichomes, pH…"
            autoComplete="off"
          />
          {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear Atlas search">Clear</button> : null}
        </div>
        <div className={styles.examples} aria-label="Atlas search examples">
          <span>Try</span>
          {examples.map((example) => <button key={example} type="button" onClick={() => setQuery(example)}>{example}</button>)}
        </div>
      </section>

      <section className={styles.results} aria-label="Atlas search results" aria-live="polite">
        {!searching ? (
          <div className={styles.empty}>
            <strong>Search across the whole learning system.</strong>
            <p>Lesson titles rank first, followed by matching systems, cases, paths, summaries, and learner tools.</p>
          </div>
        ) : results.length === 0 ? (
          <div className={styles.empty}>
            <strong>No Atlas matches yet.</strong>
            <p>Try a broader biological term, a visible pattern, a measurement, or one of the examples above.</p>
          </div>
        ) : (
          <>
            <header className={styles.resultHeader}>
              <strong>{results.length} result{results.length === 1 ? "" : "s"}</strong>
              <span>Best matches first</span>
            </header>
            <div className={styles.resultList}>
              {results.map((result) => (
                <Link key={`${result.kind}-${result.title}-${result.href}`} href={result.href} className={styles.resultCard}>
                  <div className={styles.resultMeta}>
                    <small>{result.kind}</small>
                    <span>{result.context}</span>
                  </div>
                  <h2>{result.title}</h2>
                  <p>{result.summary}</p>
                  <b>Open →</b>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      <aside className={styles.scope} aria-label="Atlas search scope">
        <strong>Search is for discovery, not diagnosis.</strong>
        <p>Symptom words can surface relevant diagnostic lessons and practice cases, but a search match does not establish a biological cause.</p>
      </aside>
    </div>
  );
}
