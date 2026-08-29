"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import modules from "@/content/atlas-learning-modules.json";
import sections from "@/content/atlas-sections.json";
import systemConnections from "@/content/atlas-system-connections.json";
import growthStages from "@/content/atlas-growth-stages.json";
import overlays from "@/content/atlas-overlays.json";
import guidedPaths from "@/content/atlas-guided-paths.json";
import diagnosticCases from "@/content/atlas-diagnostic-cases.json";
import diagnosticCasesExpanded from "@/content/atlas-diagnostic-cases-expanded.json";
import styles from "./AtlasSearch.module.css";

type SearchKind = "Lesson" | "Plant system" | "Lifecycle stage" | "Environment factor" | "Diagnostic zone" | "Guided path" | "Diagnostic case" | "Tool";

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

function environmentRoute(id: string) {
  if (id === "light") return "/learn/atlas/environment-overlay/light-distribution";
  if (["leaf_temperature", "temperature", "rh"].includes(id)) return "/learn/atlas/environment-overlay/temperature-and-humidity";
  if (id === "vpd") return "/learn/atlas/environment-overlay/vpd-and-transpiration";
  if (id === "airflow") return "/learn/atlas/environment-overlay/airflow-and-boundary-layer";
  if (["water", "root_oxygen", "ph", "ec"].includes(id)) return "/learn/atlas/environment-overlay/root-zone-interaction";
  return "/learn/atlas/environment-overlay";
}

const connectionById = new Map(systemConnections.map((item) => [item.id, item] as const));

const lessonItems: SearchItem[] = modules.flatMap((atlasModule) =>
  atlasModule.lessons.map((lesson) => {
    const connection = connectionById.get(atlasModule.id);
    return {
      kind: "Lesson" as const,
      title: lesson.title,
      context: atlasModule.label,
      summary: lesson.summary,
      href: `/learn/atlas/${slugify(atlasModule.id)}/${slugify(lesson.title)}`,
      terms: [
        lesson.visual,
        ...atlasModule.learningGoals,
        ...(connection?.stages ?? []),
        ...(connection?.measurements ?? []),
      ].join(" "),
    };
  }),
);

const systemItems: SearchItem[] = sections.map((section) => {
  const connection = connectionById.get(section.id);
  return {
    kind: "Plant system",
    title: section.label,
    context: `${section.topics.length} indexed topics`,
    summary: section.summary,
    href: `/learn/atlas/${slugify(section.id)}`,
    terms: [
      section.firstAsset,
      ...section.topics,
      connection?.reason ?? "",
      ...(connection?.stages ?? []),
      ...(connection?.measurements ?? []),
      ...(connection?.related ?? []),
    ].join(" "),
  };
});

const stageItems: SearchItem[] = growthStages.map((stage) => ({
  kind: "Lifecycle stage" as const,
  title: stage.label,
  context: `Stage ${stage.stageNumber} of ${growthStages.length}`,
  summary: stage.summary,
  href: "/learn/atlas#atlas-growth-stages",
  terms: [
    ...stage.visibleStructures,
    ...stage.activeSystems,
    ...stage.observe,
    ...stage.biology,
  ].join(" "),
}));

const environmentItems: SearchItem[] = overlays.environment.factors.map((factor) => ({
  kind: "Environment factor" as const,
  title: factor.label,
  context: `${factor.zone} zone`,
  summary: factor.summary,
  href: environmentRoute(factor.id),
  terms: `${factor.id} ${factor.connectsTo.join(" ")}`,
}));

const diagnosticZoneItems: SearchItem[] = overlays.diagnostics.zones.map((zone) => ({
  kind: "Diagnostic zone" as const,
  title: zone.label,
  context: `Symptom location · ${zone.position}`,
  summary: zone.questions[0],
  href: "/learn/atlas/diagnostic-overlay/symptom-location",
  terms: `${zone.id} ${zone.questions.join(" ")}`,
}));

const pathItems: SearchItem[] = guidedPaths.map((path) => ({
  kind: "Guided path" as const,
  title: path.title,
  context: `${path.lessons.length} lesson guided path`,
  summary: path.summary,
  href: `/learn/atlas/paths/${path.id}`,
  terms: `${path.outcome} ${path.lessons.join(" ")}`,
}));

const caseItems: SearchItem[] = [...diagnosticCases, ...diagnosticCasesExpanded].map((diagnosticCase) => ({
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
    title: "Visual Identification Lab",
    context: "Practice from diagrams",
    summary: "Identify plant structures, reproductive features, vascular tissues, root structures, and environmental relationships from Atlas visuals.",
    href: "/learn/atlas/practice#visual-identification-title",
    terms: "visual identify diagram structure recognition practice roots xylem node petiole stigma trichome reproductive",
  },
  {
    kind: "Tool",
    title: "Practice Hub",
    context: "Practice",
    summary: "Choose visual identification, focused recall, diagnostic reasoning, or side-by-side plant-system comparisons.",
    href: "/learn/atlas/practice",
    terms: "practice visual quiz recall reasoning compare review",
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
    terms: "symptoms diagnose diagnosis yellow leaves droop wilt tip burn chlorosis edema herbicide stippling flower rot case plant problem",
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

const searchItems = [
  ...lessonItems,
  ...systemItems,
  ...stageItems,
  ...environmentItems,
  ...diagnosticZoneItems,
  ...pathItems,
  ...caseItems,
  ...toolItems,
];
const examples = ["VPD", "root oxygen", "edema", "herbicide drift", "stippling", "flower rot"];

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
      .slice(0, 14),
    [query],
  );
  const searching = normalize(query).length >= 2;

  return (
    <div className={styles.shell}>
      <section className={styles.hero} aria-labelledby="atlas-search-title">
        <div>
          <small>Atlas Search</small>
          <h1 id="atlas-search-title">Find the structure, stage, measurement, case, or tool you need.</h1>
          <p>Search lessons plus plant systems, lifecycle stages, environment factors, symptom locations, guided paths, diagnostic cases, and learner tools.</p>
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
            placeholder="Try VPD, root oxygen, edema, herbicide drift, stippling…"
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
            <strong>Search across the connected plant model.</strong>
            <p>Results can come from lesson titles, system topics, developmental stages, measurements, environment factors, diagnostic zones, cases, paths, and tools.</p>
          </div>
        ) : results.length === 0 ? (
          <div className={styles.empty}>
            <strong>No Atlas matches yet.</strong>
            <p>Try a broader biological term, a visible pattern, a developmental stage, a measurement, or one of the examples above.</p>
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
