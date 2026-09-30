"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./EducationSearch.module.css";

type SearchKind =
  | "Academy course"
  | "Atlas lesson"
  | "Plant health"
  | "Cultivation science"
  | "Symptom differential"
  | "Printable tool"
  | "Evidence source"
  | "Glossary term"
  | "SOP"
  | "Other";

type PagefindData = {
  url: string;
  excerpt?: string;
  meta?: Record<string, string>;
};

type PagefindResult = {
  id: string;
  score: number;
  data: () => Promise<PagefindData>;
};

type PagefindModule = {
  search: (
    term: string,
    options?: { filters?: Record<string, string | string[]> },
  ) => Promise<{ results: PagefindResult[] }>;
};

type SearchResult = {
  id: string;
  kind: SearchKind;
  title: string;
  context: string;
  summary: string;
  href: string;
  score: number;
};

const kinds: Array<"All" | SearchKind> = [
  "All",
  "Academy course",
  "Atlas lesson",
  "Plant health",
  "Cultivation science",
  "Symptom differential",
  "Printable tool",
  "Evidence source",
  "Glossary term",
  "SOP",
];

const examples = [
  "VPD",
  "root-zone hypoxia",
  "edema",
  "pH meter",
  "PPFD",
  "breeding",
  "yellow lower leaves",
  "water activity",
  "HLVd research",
  "rhizosphere",
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function plainText(value = "") {
  return value
    .replace(/<mark[^>]*>/gi, "")
    .replace(/<\/mark>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function inferKind(url: string): SearchKind {
  if (url.startsWith("/learn/academy/")) return "Academy course";
  if (url.startsWith("/learn/atlas/")) return "Atlas lesson";
  if (url.startsWith("/learn/plant-health/")) return "Plant health";
  if (url.startsWith("/learn/cultivation-science/")) return "Cultivation science";
  if (url.startsWith("/learn/symptoms/")) return "Symptom differential";
  if (url.startsWith("/learn/tools/")) return "Printable tool";
  if (url.startsWith("/learn/sources/")) return "Evidence source";
  if (url.startsWith("/learn/glossary/")) return "Glossary term";
  if (url.startsWith("/learn/sops/")) return "SOP";
  return "Other";
}

function contextFor(kind: SearchKind, url: string) {
  if (kind !== "Other") return kind;
  const segment = url.split("/").filter(Boolean).at(1);
  return segment ? segment.replaceAll("-", " ") : "Teaching Healthy Cultivation";
}

async function loadPagefind(): Promise<PagefindModule> {
  const modulePath = "/pagefind/pagefind.js";
  return (await import(/* webpackIgnore: true */ modulePath)) as PagefindModule;
}

export function EducationSearch() {
  const [engine, setEngine] = useState<"checking" | "pagefind" | "unavailable">("checking");
  const [pagefind, setPagefind] = useState<PagefindModule | null>(null);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"All" | SearchKind>("All");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadPagefind()
      .then((module) => {
        if (cancelled) return;
        setPagefind(module);
        setEngine("pagefind");
      })
      .catch(() => {
        if (!cancelled) setEngine("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const searching = normalize(query).length >= 2;

  useEffect(() => {
    if (engine !== "pagefind" || !pagefind || !searching) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setBusy(true);
      try {
        const response = await pagefind.search(query);
        const loaded = await Promise.all(
          response.results.slice(0, 256).map(async (result) => {
            const data = await result.data();
            const resultKind = inferKind(data.url);
            return {
              id: result.id,
              kind: resultKind,
              title: data.meta?.title || "Teaching Healthy Cultivation",
              context: contextFor(resultKind, data.url),
              summary: plainText(data.excerpt || data.meta?.description || ""),
              href: data.url,
              score: result.score,
            } satisfies SearchResult;
          }),
        );

        if (!cancelled) {
          setResults(
            loaded
              .filter((result) => result.kind !== "Other")
              .filter((result) => kind === "All" || result.kind === kind)
              .slice(0, 24),
          );
        }
      } catch {
        if (!cancelled) setEngine("unavailable");
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [engine, pagefind, query, kind, searching]);

  const resultLabel = useMemo(() => {
    if (busy) return "Searching…";
    return `${results.length} result${results.length === 1 ? "" : "s"}`;
  }, [busy, results.length]);

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div>
          <p className="eyebrow">Teaching Healthy Cultivation</p>
          <h1>Search Education</h1>
          <p>
            Search Academy courses, Atlas lessons, plant-health references, symptom differentials,
            cultivation science, glossary definitions, SOPs, printable tools, and evidence sources
            from one place.
          </p>
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
            placeholder="Try root-zone hypoxia, VPD, pH meter, rhizosphere…"
            autoComplete="off"
          />
          <select
            aria-label="Filter education search"
            value={kind}
            onChange={(event) => setKind(event.target.value as "All" | SearchKind)}
          >
            {kinds.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.examples}>
          {examples.map((example) => (
            <button type="button" key={example} onClick={() => setQuery(example)}>
              {example}
            </button>
          ))}
        </div>
      </section>

      <section aria-live="polite" aria-busy={busy}>
        {engine === "checking" ? (
          <div className={styles.empty}>Preparing the education search index…</div>
        ) : engine === "unavailable" ? (
          <div className={styles.empty}>
            The education search index is unavailable. Return to the Learn hub and browse the
            published learning sections while the index is repaired.
          </div>
        ) : !searching ? (
          <div className={styles.empty}>
            Enter at least two characters to search the indexed Teaching Healthy Cultivation library.
          </div>
        ) : !busy && results.length === 0 ? (
          <div className={styles.empty}>
            No matches yet. Try a broader plant structure, physiology, propagation, nutrition,
            breeding, symptom, pest, measurement, SOP, environment, glossary, or post-harvest term.
          </div>
        ) : (
          <>
            <header className={styles.resultHeader}>
              <strong>{resultLabel}</strong>
              <span>Best indexed matches first</span>
            </header>
            <div className={styles.resultList}>
              {results.map((result) => (
                <Link className={styles.resultCard} href={result.href} key={result.id}>
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
        <strong>Search is for discovery, not diagnosis.</strong> Symptom terms can surface relevant
        references, but a search match does not establish a biological cause.
      </aside>
    </div>
  );
}
