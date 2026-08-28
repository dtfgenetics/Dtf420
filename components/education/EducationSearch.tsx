"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import atlasModules from "@/content/atlas-learning-modules.json";
import plantHealthCore from "@/content/plant-health-library.json";
import plantHealthExpanded from "@/content/plant-health-expanded.json";
import cultivationCore from "@/content/cultivation-science-library.json";
import protectedCultivation from "@/content/protected-cultivation-library.json";
import symptomLibrary from "@/content/symptom-differential-library.json";
import learningTools from "@/content/learning-tools.json";
import styles from "./EducationSearch.module.css";

type SearchKind = "Atlas lesson" | "Plant health" | "Cultivation science" | "Symptom differential" | "Printable tool";

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

const atlasItems: SearchItem[] = atlasModules.flatMap((atlasModule) =>
  atlasModule.lessons.map((lesson) => ({
    kind: "Atlas lesson" as const,
    title: lesson.title,
    context: atlasModule.label,
    summary: lesson.summary,
    href: `/learn/atlas/${slugify(atlasModule.id)}/${slugify(lesson.title)}`,
    terms: `${lesson.visual} ${atlasModule.learningGoals.join(" ")}`,
  })),
);

const plantHealthItems: SearchItem[] = [...plantHealthCore, ...plantHealthExpanded].map((item) => ({
  kind: "Plant health" as const,
  title: item.title,
  context: item.category,
  summary: item.summary,
  href: `/learn/plant-health/${item.slug}`,
  terms: [
    ...item.whatToLookFor,
    ...item.lookAlikes,
    ...item.confirmWith,
    ...item.managementPrinciples,
    ...item.prevention,
  ].join(" "),
}));

const cultivationItems: SearchItem[] = [...cultivationCore, ...protectedCultivation].map((item) => ({
  kind: "Cultivation science" as const,
  title: item.title,
  context: item.category,
  summary: item.summary,
  href: `/learn/cultivation-science/${item.slug}`,
  terms: [...item.keyConcepts, ...item.measureObserve, ...item.commonMistakes].join(" "),
}));

const symptomItems: SearchItem[] = symptomLibrary.map((item) => ({
  kind: "Symptom differential" as const,
  title: item.title,
  context: "Observation-first differential",
  summary: item.summary,
  href: `/learn/symptoms/${item.slug}`,
  terms: [...item.patternQuestions, ...item.possibleCategories, ...item.discriminatingChecks, ...item.redFlags].join(" "),
}));

const toolItems: SearchItem[] = learningTools.map((item) => ({
  kind: "Printable tool" as const,
  title: item.title,
  context: item.category,
  summary: item.purpose,
  href: `/learn/tools/${item.slug}`,
  terms: item.sections.flatMap((section) => [section.title, ...section.fields]).join(" "),
}));

const searchItems = [...atlasItems, ...plantHealthItems, ...cultivationItems, ...symptomItems, ...toolItems];
const kinds: Array<"All" | SearchKind> = ["All", "Atlas lesson", "Plant health", "Cultivation science", "Symptom differential", "Printable tool"];
const examples = ["yellow lower leaves", "whiteflies", "dew point", "PPFD", "root rot", "drying airflow"];

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
  if (context.includes(query)) score += 30;
  if (summary.includes(query)) score += 24;

  const matchedTokens = tokens.filter((token) => haystack.includes(token));
  if (matchedTokens.length === tokens.length) score += 35 + matchedTokens.length * 8;
  else score += matchedTokens.length * 5;

  return score > 0 ? { ...item, score } : null;
}

export function EducationSearch() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"All" | SearchKind>("All");

  const results = useMemo(() => {
    const ranked = searchItems
      .filter((item) => kind === "All" || item.kind === kind)
      .map((item) => rankItem(item, query))
      .filter((item): item is RankedItem => item !== null)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    return ranked.slice(0, 24);
  }, [query, kind]);

  const searching = normalize(query).length >= 2;

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div>
          <p className="eyebrow">Teaching Healthy Cultivation</p>
          <h1>Search Education</h1>
          <p>Search Atlas lessons, plant-health references, symptom differentials, outdoor and greenhouse science, post-harvest material, and printable field tools from one place.</p>
        </div>
        <Link href="/learn">Back to Learn</Link>
      </section>

      <section className={styles.searchPanel} aria-label="Search Teaching Healthy Cultivation">
        <label htmlFor="education-search-input">Search the education system</label>
        <div className={styles.inputRow}>
          <input
            id="education-search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try yellow lower leaves, whiteflies, dew point, PPFD…"
            autoComplete="off"
          />
          <select aria-label="Filter education search" value={kind} onChange={(event) => setKind(event.target.value as "All" | SearchKind)}>
            {kinds.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <div className={styles.examples}>
          {examples.map((example) => <button type="button" key={example} onClick={() => setQuery(example)}>{example}</button>)}
        </div>
      </section>

      <section aria-live="polite">
        {!searching ? (
          <div className={styles.empty}>Enter at least two characters to search across {searchItems.length} indexed learning resources.</div>
        ) : results.length === 0 ? (
          <div className={styles.empty}>No matches yet. Try a broader plant structure, symptom, pest, measurement, environment, or workflow term.</div>
        ) : (
          <>
            <header className={styles.resultHeader}>
              <strong>{results.length} result{results.length === 1 ? "" : "s"}</strong>
              <span>Best matches first</span>
            </header>
            <div className={styles.resultList}>
              {results.map((result) => (
                <Link className={styles.resultCard} href={result.href} key={`${result.kind}-${result.href}`}>
                  <div className={styles.resultMeta}>
                    <strong>{result.kind}</strong>
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

      <aside className={styles.scope}>
        <strong>Search is for discovery, not diagnosis.</strong> Symptom terms can surface relevant references, but a search match does not establish a biological cause.
      </aside>
    </div>
  );
}
