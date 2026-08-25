"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import styles from "./AtlasObservationCompare.module.css";

const STORAGE_KEY = "dtf420.atlas.observation-notebook.v1";
const CHANGE_EVENT = "dtf420-atlas-observation-notebook-change";
const EMPTY_SNAPSHOT = "";

type ObservationEntry = {
  id: string;
  createdAt: string;
  updatedAt: string;
  observedAt: string;
  title: string;
  stage: string;
  plantArea: string;
  pattern: string;
  progression: string;
  observations: string;
  rootZoneMoisture: string;
  temperatureContext: string;
  relativeHumidity: string;
  ph: string;
  ec: string;
  irrigationContext: string;
  lightAirflowContext: string;
  workingDifferential: string;
  nextCheck: string;
  status: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeEntry(value: unknown): ObservationEntry | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<ObservationEntry>;
  if (!text(raw.id) || !text(raw.title) || !text(raw.observations)) return null;
  return {
    id: text(raw.id),
    createdAt: text(raw.createdAt),
    updatedAt: text(raw.updatedAt),
    observedAt: text(raw.observedAt),
    title: text(raw.title),
    stage: text(raw.stage),
    plantArea: text(raw.plantArea),
    pattern: text(raw.pattern),
    progression: text(raw.progression),
    observations: text(raw.observations),
    rootZoneMoisture: text(raw.rootZoneMoisture),
    temperatureContext: text(raw.temperatureContext),
    relativeHumidity: text(raw.relativeHumidity),
    ph: text(raw.ph),
    ec: text(raw.ec),
    irrigationContext: text(raw.irrigationContext),
    lightAirflowContext: text(raw.lightAirflowContext),
    workingDifferential: text(raw.workingDifferential),
    nextCheck: text(raw.nextCheck),
    status: text(raw.status),
  };
}

function parseSnapshot(snapshot: string) {
  if (!snapshot) return [] as ObservationEntry[];
  try {
    const parsed = JSON.parse(snapshot) as { entries?: unknown[] };
    if (!Array.isArray(parsed.entries)) return [];
    return parsed.entries.map(normalizeEntry).filter((entry): entry is ObservationEntry => Boolean(entry)).slice(0, 250);
  } catch {
    return [] as ObservationEntry[];
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

function displayDate(entry: ObservationEntry) {
  const value = entry.observedAt || entry.createdAt;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Date not recorded";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}

function numericDelta(before: string, after: string, suffix = "") {
  if (!before.trim() || !after.trim()) return null;
  const first = Number.parseFloat(before);
  const second = Number.parseFloat(after);
  if (!Number.isFinite(first) || !Number.isFinite(second)) return null;
  const delta = second - first;
  if (Math.abs(delta) < 0.0001) return `Δ 0${suffix}`;
  return `Δ ${delta > 0 ? "+" : ""}${Number(delta.toFixed(2))}${suffix}`;
}

function ComparisonRow({ label, before, after }: { label: string; before: string; after: string }) {
  const changed = before !== after;
  return (
    <div className={styles.row}>
      <strong>{label}</strong>
      <span>{before || "Not recorded"}</span>
      <span>{after || "Not recorded"}</span>
      <b className={changed ? styles.changed : styles.same}>{changed ? "Changed" : "Same"}</b>
    </div>
  );
}

function NarrativePair({ label, before, after }: { label: string; before: string; after: string }) {
  return (
    <section className={styles.narrative} aria-label={`${label} comparison`}>
      <header>
        <small>{label}</small>
        <span>{before === after ? "Same recorded text" : "Recorded text changed"}</span>
      </header>
      <div>
        <article><small>Baseline</small><p>{before || "Not recorded"}</p></article>
        <article><small>Follow-up</small><p>{after || "Not recorded"}</p></article>
      </div>
    </section>
  );
}

export function AtlasObservationCompare() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const entries = useMemo(
    () => parseSnapshot(snapshot).sort((a, b) => (b.observedAt || b.updatedAt).localeCompare(a.observedAt || a.updatedAt)),
    [snapshot],
  );
  const [baselineId, setBaselineId] = useState("");
  const [followupId, setFollowupId] = useState("");

  const followup = entries.find((entry) => entry.id === followupId) ?? entries[0];
  const baseline = entries.find((entry) => entry.id === baselineId && entry.id !== followup?.id) ?? entries.find((entry) => entry.id !== followup?.id) ?? entries[0];

  if (entries.length < 2) {
    return (
      <div className={styles.shell}>
        <section className={styles.hero} aria-label="Observation comparison introduction">
          <div>
            <small>Compare Saved Observations</small>
            <h1>Track change from recorded evidence, not memory.</h1>
            <p>Compare two structured Notebook entries to see what stayed stable and what changed between observations.</p>
          </div>
        </section>
        <section className={styles.needMore} aria-label="Observation comparison needs more notes">
          <strong>{entries.length === 0 ? "Save two observations to begin comparing." : "Save one more observation to begin comparing."}</strong>
          <p>The comparison view needs a baseline and a follow-up. It does not infer a diagnosis from the differences.</p>
          <Link href="/learn/atlas/notebook">Open Observation Notebook</Link>
        </section>
      </div>
    );
  }

  if (!baseline || !followup) return null;

  const deltas = [
    { label: "pH", before: baseline.ph, after: followup.ph, delta: numericDelta(baseline.ph, followup.ph) },
    { label: "EC", before: baseline.ec, after: followup.ec, delta: numericDelta(baseline.ec, followup.ec, " mS/cm") },
    { label: "RH", before: baseline.relativeHumidity, after: followup.relativeHumidity, delta: numericDelta(baseline.relativeHumidity, followup.relativeHumidity, "%") },
  ];

  return (
    <div className={styles.shell}>
      <section className={styles.hero} aria-label="Observation comparison introduction">
        <div>
          <small>Compare Saved Observations</small>
          <h1>Track change from recorded evidence, not memory.</h1>
          <p>Use two Notebook entries to compare location, pattern, progression, measurements, context, and reasoning. A change in these fields can guide the next observation, but it does not prove causation by itself.</p>
        </div>
        <div className={styles.scope}><strong>Comparison rule</strong><span>Correlation between a changed measurement and a changed symptom is not, by itself, proof that one caused the other.</span></div>
      </section>

      <section className={styles.selectors} aria-label="Choose observations to compare">
        <label>
          <span>Baseline observation</span>
          <select value={baseline.id} onChange={(event) => setBaselineId(event.target.value)}>
            {entries.map((entry) => <option key={entry.id} value={entry.id} disabled={entry.id === followup.id}>{entry.title} · {displayDate(entry)}</option>)}
          </select>
        </label>
        <div className={styles.arrow} aria-hidden="true">→</div>
        <label>
          <span>Follow-up observation</span>
          <select value={followup.id} onChange={(event) => setFollowupId(event.target.value)}>
            {entries.map((entry) => <option key={entry.id} value={entry.id} disabled={entry.id === baseline.id}>{entry.title} · {displayDate(entry)}</option>)}
          </select>
        </label>
      </section>

      <section className={styles.summary} aria-label="Selected observation summaries">
        <article><small>Baseline</small><h2>{baseline.title}</h2><p>{displayDate(baseline)} · {baseline.status}</p></article>
        <article><small>Follow-up</small><h2>{followup.title}</h2><p>{displayDate(followup)} · {followup.status}</p></article>
      </section>

      <section className={styles.matrix} aria-label="Observation field comparison">
        <header><strong>Evidence field</strong><span>Baseline</span><span>Follow-up</span><b>Change</b></header>
        <ComparisonRow label="Growth stage" before={baseline.stage} after={followup.stage} />
        <ComparisonRow label="Plant area" before={baseline.plantArea} after={followup.plantArea} />
        <ComparisonRow label="Visible pattern" before={baseline.pattern} after={followup.pattern} />
        <ComparisonRow label="Progression" before={baseline.progression} after={followup.progression} />
        <ComparisonRow label="Root-zone moisture" before={baseline.rootZoneMoisture} after={followup.rootZoneMoisture} />
        <ComparisonRow label="Status" before={baseline.status} after={followup.status} />
      </section>

      <section className={styles.measurements} aria-label="Measurement comparison">
        <header><small>Recorded measurements</small><h2>Check magnitude and direction, then interpret in context.</h2></header>
        <div className={styles.measurementGrid}>
          {deltas.map((item) => (
            <article key={item.label}>
              <small>{item.label}</small>
              <div><span>{item.before || "—"}</span><b>→</b><span>{item.after || "—"}</span></div>
              <strong>{item.delta ?? "No numeric delta"}</strong>
            </article>
          ))}
          <article>
            <small>Temperature context</small>
            <div className={styles.temperature}><span>{baseline.temperatureContext || "—"}</span><b>→</b><span>{followup.temperatureContext || "—"}</span></div>
            <strong>{baseline.temperatureContext === followup.temperatureContext ? "Same recorded context" : "Context changed"}</strong>
          </article>
        </div>
      </section>

      <NarrativePair label="Observed evidence" before={baseline.observations} after={followup.observations} />
      <NarrativePair label="Irrigation context" before={baseline.irrigationContext} after={followup.irrigationContext} />
      <NarrativePair label="Light / airflow context" before={baseline.lightAirflowContext} after={followup.lightAirflowContext} />
      <NarrativePair label="Working differential" before={baseline.workingDifferential} after={followup.workingDifferential} />
      <NarrativePair label="Next discriminating check" before={baseline.nextCheck} after={followup.nextCheck} />

      <footer className={styles.footer}>
        <Link href="/learn/atlas/notebook">Back to Observation Notebook</Link>
        <Link href="/learn/atlas/cases">Practice Diagnostic Case Lab</Link>
        <Link href="/learn/atlas/dashboard">Back to Study Dashboard</Link>
      </footer>
    </div>
  );
}
