"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import styles from "./AtlasObservationNotebook.module.css";

const STORAGE_KEY = "dtf420.atlas.observation-notebook.v1";
const CHANGE_EVENT = "dtf420-atlas-observation-notebook-change";
const EMPTY_SNAPSHOT = "";
const MAX_ENTRIES = 250;

const stages = [
  "Unknown / not recorded",
  "Germination",
  "Seedling",
  "Vegetative",
  "Transition / preflower",
  "Flower development",
  "Maturation",
] as const;

const plantAreas = [
  "Whole plant",
  "New growth",
  "Upper canopy",
  "Middle canopy",
  "Lower canopy",
  "Single branch",
  "Leaves",
  "Stem",
  "Root zone",
  "Flowers",
] as const;

const patterns = [
  "Uniform / general",
  "Interveinal",
  "Marginal / edge",
  "Tips / edges",
  "Spotting / lesions",
  "Posture / wilt",
  "Localized",
  "Patchy / irregular",
  "Other / unsure",
] as const;

const progressions = [
  "Just noticed",
  "Stable",
  "Slowly expanding",
  "Rapidly expanding",
  "Intermittent",
  "Improving",
] as const;

const moistureStates = [
  "Unknown / not measured",
  "Dry",
  "Moderately moist",
  "Saturated / recently irrigated",
  "Variable across the root zone",
] as const;

const statuses = ["Open observation", "Monitoring", "Resolved"] as const;

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

type NotebookState = {
  version: 1;
  entries: ObservationEntry[];
};

type FormState = Omit<ObservationEntry, "id" | "createdAt" | "updatedAt">;

const emptyForm: FormState = {
  observedAt: "",
  title: "",
  stage: stages[0],
  plantArea: plantAreas[0],
  pattern: patterns[0],
  progression: progressions[0],
  observations: "",
  rootZoneMoisture: moistureStates[0],
  temperatureContext: "",
  relativeHumidity: "",
  ph: "",
  ec: "",
  irrigationContext: "",
  lightAirflowContext: "",
  workingDifferential: "",
  nextCheck: "",
  status: statuses[0],
};

function cleanText(value: unknown, maxLength = 5000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeChoice(value: unknown, allowed: readonly string[], fallback: string) {
  return typeof value === "string" && allowed.includes(value) ? value : fallback;
}

function normalizeEntry(value: unknown): ObservationEntry | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<ObservationEntry>;
  const id = cleanText(candidate.id, 120);
  const title = cleanText(candidate.title, 180);
  const observations = cleanText(candidate.observations, 6000);
  if (!id || !title || !observations) return null;

  return {
    id,
    createdAt: cleanText(candidate.createdAt, 80),
    updatedAt: cleanText(candidate.updatedAt, 80),
    observedAt: cleanText(candidate.observedAt, 80),
    title,
    stage: normalizeChoice(candidate.stage, stages, stages[0]),
    plantArea: normalizeChoice(candidate.plantArea, plantAreas, plantAreas[0]),
    pattern: normalizeChoice(candidate.pattern, patterns, patterns[0]),
    progression: normalizeChoice(candidate.progression, progressions, progressions[0]),
    observations,
    rootZoneMoisture: normalizeChoice(candidate.rootZoneMoisture, moistureStates, moistureStates[0]),
    temperatureContext: cleanText(candidate.temperatureContext, 180),
    relativeHumidity: cleanText(candidate.relativeHumidity, 40),
    ph: cleanText(candidate.ph, 40),
    ec: cleanText(candidate.ec, 40),
    irrigationContext: cleanText(candidate.irrigationContext, 1000),
    lightAirflowContext: cleanText(candidate.lightAirflowContext, 1000),
    workingDifferential: cleanText(candidate.workingDifferential, 3000),
    nextCheck: cleanText(candidate.nextCheck, 2000),
    status: normalizeChoice(candidate.status, statuses, statuses[0]),
  };
}

function normalizeState(value: unknown): NotebookState {
  const empty: NotebookState = { version: 1, entries: [] };
  if (!value || typeof value !== "object") return empty;
  const candidate = value as Partial<NotebookState>;
  if (!Array.isArray(candidate.entries)) return empty;

  const seen = new Set<string>();
  const entries: ObservationEntry[] = [];
  for (const raw of candidate.entries) {
    const entry = normalizeEntry(raw);
    if (!entry || seen.has(entry.id)) continue;
    seen.add(entry.id);
    entries.push(entry);
    if (entries.length >= MAX_ENTRIES) break;
  }
  return { version: 1, entries };
}

function parseSnapshot(snapshot: string): NotebookState {
  if (!snapshot) return { version: 1, entries: [] };
  try {
    return normalizeState(JSON.parse(snapshot));
  } catch {
    return { version: 1, entries: [] };
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

function saveNotebook(next: NotebookState) {
  const normalized = normalizeState(next);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function useObservationNotebook() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const notebook = useMemo(() => parseSnapshot(snapshot), [snapshot]);
  return { notebook, update: saveNotebook };
}

function createEntryId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `observation-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function displayDate(value: string, fallback: string) {
  const source = value || fallback;
  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return "Date not recorded";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}

function fieldValue(entry: ObservationEntry, key: keyof FormState) {
  return entry[key] ?? "";
}

export function AtlasObservationNotebook() {
  const { notebook, update } = useObservationNotebook();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");

  const sortedEntries = useMemo(
    () => [...notebook.entries].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [notebook.entries],
  );
  const visibleEntries = filter === "All" ? sortedEntries : sortedEntries.filter((entry) => entry.status === filter);
  const openCount = notebook.entries.filter((entry) => entry.status !== "Resolved").length;

  const setField = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (message) setMessage("");
  };

  const resetEditor = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  };

  const saveEntry = () => {
    const title = form.title.trim();
    const observations = form.observations.trim();
    if (!title || !observations) {
      setMessage("Add a short title and the observation you actually saw before saving.");
      return;
    }

    const now = new Date().toISOString();
    const existing = editingId ? notebook.entries.find((entry) => entry.id === editingId) : undefined;
    const nextEntry: ObservationEntry = {
      id: existing?.id ?? createEntryId(),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      ...form,
      title,
      observations,
    };

    const remaining = notebook.entries.filter((entry) => entry.id !== nextEntry.id);
    update({ version: 1, entries: [nextEntry, ...remaining].slice(0, MAX_ENTRIES) });
    setForm(emptyForm);
    setEditingId(null);
    setMessage(existing ? "Observation updated." : "Observation saved on this device.");
  };

  const editEntry = (entry: ObservationEntry) => {
    const nextForm = { ...emptyForm };
    for (const key of Object.keys(nextForm) as (keyof FormState)[]) nextForm[key] = fieldValue(entry, key);
    setForm(nextForm);
    setEditingId(entry.id);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteEntry = (entry: ObservationEntry) => {
    if (!window.confirm(`Delete observation “${entry.title}”?`)) return;
    update({ version: 1, entries: notebook.entries.filter((item) => item.id !== entry.id) });
    if (editingId === entry.id) resetEditor();
    setMessage("Observation deleted.");
  };

  const exportNotebook = () => {
    const payload = {
      format: "DTF420 Atlas Observation Notebook",
      version: 1,
      exportedAt: new Date().toISOString(),
      entries: sortedEntries,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `dtf420-atlas-observations-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className={styles.shell}>
      <section className={styles.hero} aria-label="Atlas observation notebook introduction">
        <div>
          <small>Atlas Observation Notebook</small>
          <h1>Record evidence before you decide what it means.</h1>
          <p>Capture location, pattern, progression, root-zone and environment context, plausible explanations, and the next observation that could separate them.</p>
        </div>
        <div className={styles.heroStats}>
          <div><strong>{notebook.entries.length}</strong><span>saved notes</span></div>
          <div><strong>{openCount}</strong><span>open / monitoring</span></div>
        </div>
      </section>

      <div className={styles.workspace}>
        <section className={styles.editor} aria-label="Observation note editor">
          <header>
            <div>
              <small>{editingId ? "Edit saved observation" : "New observation"}</small>
              <h2>{editingId ? "Update the evidence record" : "Describe what you can actually observe"}</h2>
            </div>
            {editingId ? <button type="button" onClick={resetEditor}>Cancel edit</button> : null}
          </header>

          <div className={styles.formGrid}>
            <label className={styles.spanTwo}>
              <span>Observation title *</span>
              <input value={form.title} onChange={(event) => setField("title", event.target.value)} placeholder="e.g. Upper-canopy pale new growth" maxLength={180} />
            </label>
            <label>
              <span>Observed date / time</span>
              <input type="datetime-local" value={form.observedAt} onChange={(event) => setField("observedAt", event.target.value)} />
            </label>
            <label>
              <span>Status</span>
              <select value={form.status} onChange={(event) => setField("status", event.target.value)}>{statuses.map((value) => <option key={value}>{value}</option>)}</select>
            </label>
            <label>
              <span>Growth stage</span>
              <select value={form.stage} onChange={(event) => setField("stage", event.target.value)}>{stages.map((value) => <option key={value}>{value}</option>)}</select>
            </label>
            <label>
              <span>Plant area / location</span>
              <select value={form.plantArea} onChange={(event) => setField("plantArea", event.target.value)}>{plantAreas.map((value) => <option key={value}>{value}</option>)}</select>
            </label>
            <label>
              <span>Visible pattern</span>
              <select value={form.pattern} onChange={(event) => setField("pattern", event.target.value)}>{patterns.map((value) => <option key={value}>{value}</option>)}</select>
            </label>
            <label>
              <span>Progression</span>
              <select value={form.progression} onChange={(event) => setField("progression", event.target.value)}>{progressions.map((value) => <option key={value}>{value}</option>)}</select>
            </label>
            <label className={styles.spanTwo}>
              <span>What do you actually see? *</span>
              <textarea value={form.observations} onChange={(event) => setField("observations", event.target.value)} placeholder="Describe color, shape, posture, affected tissue, distribution, and anything that changed over time. Avoid naming a cause here." rows={5} />
            </label>
          </div>

          <fieldset>
            <legend>Root-zone and environment context</legend>
            <div className={styles.formGrid}>
              <label>
                <span>Root-zone moisture</span>
                <select value={form.rootZoneMoisture} onChange={(event) => setField("rootZoneMoisture", event.target.value)}>{moistureStates.map((value) => <option key={value}>{value}</option>)}</select>
              </label>
              <label>
                <span>Temperature context</span>
                <input value={form.temperatureContext} onChange={(event) => setField("temperatureContext", event.target.value)} placeholder="e.g. 78 °F air, 81 °F leaf" maxLength={180} />
              </label>
              <label>
                <span>Relative humidity (%)</span>
                <input inputMode="decimal" value={form.relativeHumidity} onChange={(event) => setField("relativeHumidity", event.target.value)} placeholder="e.g. 58" maxLength={40} />
              </label>
              <label>
                <span>Root-zone pH</span>
                <input inputMode="decimal" value={form.ph} onChange={(event) => setField("ph", event.target.value)} placeholder="e.g. 6.2" maxLength={40} />
              </label>
              <label>
                <span>EC (mS/cm)</span>
                <input inputMode="decimal" value={form.ec} onChange={(event) => setField("ec", event.target.value)} placeholder="e.g. 1.8" maxLength={40} />
              </label>
              <label className={styles.spanTwo}>
                <span>Irrigation context</span>
                <textarea value={form.irrigationContext} onChange={(event) => setField("irrigationContext", event.target.value)} placeholder="When was it watered? How much? Did the symptom appear before or after irrigation?" rows={3} />
              </label>
              <label className={styles.spanTwo}>
                <span>Light / airflow context</span>
                <textarea value={form.lightAirflowContext} onChange={(event) => setField("lightAirflowContext", event.target.value)} placeholder="Note recent light changes, upper-canopy exposure, fan direction, sheltered areas, or midday-only effects." rows={3} />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Reasoning record</legend>
            <div className={styles.formGrid}>
              <label className={styles.spanTwo}>
                <span>Working differential</span>
                <textarea value={form.workingDifferential} onChange={(event) => setField("workingDifferential", event.target.value)} placeholder="List more than one plausible explanation when the evidence is still ambiguous." rows={4} />
              </label>
              <label className={styles.spanTwo}>
                <span>Best next observation / measurement</span>
                <textarea value={form.nextCheck} onChange={(event) => setField("nextCheck", event.target.value)} placeholder="What measurement or comparison would best separate the competing explanations?" rows={4} />
              </label>
            </div>
          </fieldset>

          <div className={styles.editorFooter}>
            <div role="status">{message}</div>
            <button className={styles.primaryAction} type="button" onClick={saveEntry}>{editingId ? "Save changes" : "Save observation"}</button>
          </div>
        </section>

        <aside className={styles.guide} aria-label="Observation notebook method">
          <small>Observation-first method</small>
          <h2>Keep description separate from interpretation.</h2>
          <ol>
            <li><strong>Locate it.</strong><span>New growth, old growth, one branch, upper canopy, roots, flowers?</span></li>
            <li><strong>Describe the pattern.</strong><span>Uniform, interveinal, marginal, spotted, wilted, patchy?</span></li>
            <li><strong>Track progression.</strong><span>Stable, spreading, intermittent, improving?</span></li>
            <li><strong>Add context.</strong><span>Water, pH, EC, temperature, humidity, light and airflow.</span></li>
            <li><strong>Rank possibilities.</strong><span>Keep more than one explanation when evidence overlaps.</span></li>
            <li><strong>Choose the next test.</strong><span>Measure what most clearly separates those possibilities.</span></li>
          </ol>
          <Link href="/learn/atlas/cases">Practice with Diagnostic Case Lab</Link>
          <Link href="/learn/atlas/diagnostic-overlay/differential-workflow">Study differential workflow</Link>
        </aside>
      </div>

      <section className={styles.saved} aria-label="Saved observation notes">
        <header>
          <div>
            <small>Saved on this device</small>
            <h2>Observation history</h2>
            <p>Use repeated notes to compare progression instead of relying on memory.</p>
          </div>
          <div className={styles.savedActions}>
            <label>
              <span>Filter</span>
              <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option>All</option>
                {statuses.map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <button type="button" onClick={exportNotebook} disabled={notebook.entries.length === 0}>Export JSON</button>
          </div>
        </header>

        {visibleEntries.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>{notebook.entries.length === 0 ? "No observations saved yet." : "No observations match this filter."}</strong>
            <span>{notebook.entries.length === 0 ? "Use the structured editor above the next time you inspect a plant." : "Choose another status to see the rest of your notes."}</span>
          </div>
        ) : (
          <div className={styles.entries}>
            {visibleEntries.map((entry) => (
              <article key={entry.id} className={styles.entry}>
                <header>
                  <div>
                    <small>{entry.status}</small>
                    <h3>{entry.title}</h3>
                    <span>{displayDate(entry.observedAt, entry.createdAt)} · {entry.stage} · {entry.plantArea}</span>
                  </div>
                  <div className={styles.entryActions}>
                    <button type="button" onClick={() => editEntry(entry)}>Edit</button>
                    <button type="button" onClick={() => deleteEntry(entry)}>Delete</button>
                  </div>
                </header>
                <div className={styles.evidenceGrid}>
                  <div><small>Pattern</small><span>{entry.pattern}</span></div>
                  <div><small>Progression</small><span>{entry.progression}</span></div>
                  <div><small>Root zone</small><span>{entry.rootZoneMoisture}</span></div>
                </div>
                <div className={styles.noteBlock}><small>Observation</small><p>{entry.observations}</p></div>
                {(entry.temperatureContext || entry.relativeHumidity || entry.ph || entry.ec) ? (
                  <div className={styles.measurements}>
                    {entry.temperatureContext ? <span><b>Temperature</b>{entry.temperatureContext}</span> : null}
                    {entry.relativeHumidity ? <span><b>RH</b>{entry.relativeHumidity}%</span> : null}
                    {entry.ph ? <span><b>pH</b>{entry.ph}</span> : null}
                    {entry.ec ? <span><b>EC</b>{entry.ec} mS/cm</span> : null}
                  </div>
                ) : null}
                {entry.irrigationContext ? <div className={styles.noteBlock}><small>Irrigation context</small><p>{entry.irrigationContext}</p></div> : null}
                {entry.lightAirflowContext ? <div className={styles.noteBlock}><small>Light / airflow context</small><p>{entry.lightAirflowContext}</p></div> : null}
                {entry.workingDifferential ? <div className={styles.noteBlock}><small>Working differential</small><p>{entry.workingDifferential}</p></div> : null}
                {entry.nextCheck ? <div className={styles.nextCheck}><small>Next discriminating check</small><p>{entry.nextCheck}</p></div> : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        <Link href="/learn/atlas/dashboard">Back to Study Dashboard</Link>
        <Link href="/learn/atlas/cases">Open Diagnostic Case Lab</Link>
      </footer>
    </div>
  );
}
