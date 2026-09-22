"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import styles from "./TerpeneRegistryExplorer.module.css";

type FamilyId =
  | "hemiterpene"
  | "monoterpene"
  | "sesquiterpene"
  | "diterpene"
  | "sesterterpene"
  | "triterpene"
  | "tetraterpene"
  | "polyterpene"
  | "unresolved";

type ManifestShard = {
  family: FamilyId;
  filename: string;
  count: number;
  part: number;
};

type RegistryManifest = {
  schemaVersion: number;
  status: string;
  sourceId: string;
  sourceRelease: string;
  generatedAt: string | null;
  inputCandidateRecords: number;
  resolvedIdentityRecords: number;
  unresolvedIdentityCount: number;
  unresolvedIdentitySampleCount: number;
  familyCounts: Record<FamilyId, number>;
  reviewStatus: string;
  identityPolicy: string[];
  familyPolicy: string[];
  sourceUrl?: string;
  sourceSha256?: string;
  license?: string;
  shards: ManifestShard[];
};

type RegistryRecord = {
  id: string;
  identity: { type: string; value: string; key: string };
  canonicalName: string | null;
  names: string[];
  synonyms: string[];
  formula: string | null;
  molecularWeight: number | null;
  family: FamilyId | null;
  familyAssignment: {
    family: FamilyId | null;
    status: string;
    confidence: string;
    carbonCount: number | null;
  };
  classification: Record<string, string | null>;
  candidateReasons: string[];
  candidateConfidences: string[];
  sourceRefs: Array<{ sourceId: string | null; sourceRelease: string | null; sourceRecordId: string | null }>;
  sourceOrganisms: string[];
  reviewStatus: string;
};

const familyOrder: FamilyId[] = [
  "hemiterpene",
  "monoterpene",
  "sesquiterpene",
  "diterpene",
  "sesterterpene",
  "triterpene",
  "tetraterpene",
  "polyterpene",
  "unresolved",
];

function familyLabel(family: FamilyId) {
  if (family === "unresolved") return "Unresolved family";
  return family.charAt(0).toUpperCase() + family.slice(1) + "s";
}

function humanize(value: string | null | undefined) {
  return String(value ?? "—").replaceAll("-", " ");
}

function matchesRecord(record: RegistryRecord, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const text = [
    record.canonicalName,
    ...record.names,
    ...record.synonyms,
    record.formula,
    record.identity.value,
    ...Object.values(record.classification ?? {}),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return text.includes(needle);
}

export function TerpeneRegistryExplorer() {
  const [manifest, setManifest] = useState<RegistryManifest | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const [family, setFamily] = useState<FamilyId>("monoterpene");
  const [familyCache, setFamilyCache] = useState<Partial<Record<FamilyId, RegistryRecord[]>>>({});
  const [failedFamilies, setFailedFamilies] = useState<FamilyId[]>([]);
  const inflightFamilies = useRef(new Set<FamilyId>());
  const [query, setQuery] = useState("");
  const [identityType, setIdentityType] = useState("all");
  const [assignmentConfidence, setAssignmentConfidence] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/terpenes/registry/manifest.json", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("registry manifest unavailable");
        return response.json() as Promise<RegistryManifest>;
      })
      .then((next) => {
        if (cancelled) return;
        setManifest(next);
        setStatus(next.status === "compiled" ? "ready" : "unavailable");
      })
      .catch(() => {
        if (!cancelled) setStatus("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status !== "ready" || !manifest) return;
    if (familyCache[family] || failedFamilies.includes(family) || inflightFamilies.current.has(family)) return;

    const shards = manifest.shards.filter((shard) => shard.family === family);
    if (!shards.length) return;

    let cancelled = false;
    inflightFamilies.current.add(family);

    Promise.all(
      shards.map(async (shard) => {
        const response = await fetch(`/data/terpenes/registry/${shard.filename}`, { cache: "force-cache" });
        if (!response.ok) throw new Error(`registry shard unavailable: ${shard.filename}`);
        return response.json() as Promise<RegistryRecord[]>;
      }),
    )
      .then((parts) => {
        inflightFamilies.current.delete(family);
        if (cancelled) return;
        setFamilyCache((current) => ({ ...current, [family]: parts.flat() }));
        setFailedFamilies((current) => current.filter((item) => item !== family));
      })
      .catch(() => {
        inflightFamilies.current.delete(family);
        if (cancelled) return;
        setFailedFamilies((current) =>
          current.includes(family) ? current : [...current, family],
        );
      });

    return () => {
      cancelled = true;
    };
  }, [failedFamilies, family, familyCache, manifest, status]);

  const familyShards = manifest?.shards.filter((shard) => shard.family === family) ?? [];
  const records = familyCache[family] ?? [];
  const familyState: "idle" | "loading" | "ready" | "unavailable" =
    status !== "ready"
      ? "idle"
      : failedFamilies.includes(family)
        ? "unavailable"
        : familyCache[family]
          ? "ready"
          : familyShards.length === 0
            ? "ready"
            : "loading";

  const filtered = useMemo(
    () =>
      records
        .filter((record) => matchesRecord(record, query))
        .filter((record) => identityType === "all" || record.identity.type === identityType)
        .filter(
          (record) =>
            assignmentConfidence === "all" ||
            record.familyAssignment.confidence === assignmentConfidence,
        )
        .sort((a, b) =>
          (a.canonicalName ?? a.id).localeCompare(b.canonicalName ?? b.id),
        ),
    [assignmentConfidence, identityType, query, records],
  );

  const selected =
    filtered.find((record) => record.id === selectedId) ??
    records.find((record) => record.id === selectedId) ??
    null;

  return (
    <div className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className="eyebrow">THC Terpene Atlas · universal registry</p>
          <h1>All-Known Terpene Registry</h1>
          <p>
            A versioned natural-products registry for terpene and terpenoid candidates, separated from the
            smaller reviewed THC teaching set. Exact structure identity and provenance come before editorial promotion.
          </p>
        </div>
        <aside>
          <strong>Candidate registry ≠ reviewed cannabis claim</strong>
          <p>
            COCONUT records expand chemical scope. Cannabis occurrence, aroma relevance, genetics, biological
            effects, and breeding interpretation require their own evidence and review layers.
          </p>
        </aside>
      </header>

      <section className={styles.stats}>
        <article><span>Source candidates</span><strong>{manifest?.inputCandidateRecords.toLocaleString() ?? "—"}</strong></article>
        <article><span>Resolved identities</span><strong>{manifest?.resolvedIdentityRecords.toLocaleString() ?? "—"}</strong></article>
        <article><span>Unresolved identity</span><strong>{manifest?.unresolvedIdentityCount.toLocaleString() ?? "—"}</strong></article>
        <article><span>Source release</span><strong>{manifest?.sourceRelease ?? "—"}</strong></article>
      </section>

      {status !== "ready" ? (
        <section className={styles.notice}>
          <strong>
            {status === "loading"
              ? "Loading registry status…"
              : "Universal registry runtime has not been compiled into this deployment yet."}
          </strong>
          <p>
            The monthly bulk workflow downloads the registered COCONUT release, validates the source,
            normalizes terpene/terpenoid candidates, resolves exact identities, and publishes bounded family shards.
          </p>
        </section>
      ) : null}

      <section className={styles.familyGrid} aria-label="Terpene registry family counts">
        {familyOrder.map((item) => (
          <button
            type="button"
            key={item}
            data-active={family === item ? "" : undefined}
            onClick={() => setFamily(item)}
          >
            <span>{familyLabel(item)}</span>
            <strong>{manifest?.familyCounts[item]?.toLocaleString() ?? "0"}</strong>
          </button>
        ))}
      </section>

      <section className={styles.controls}>
        <label className={styles.search}>
          <span>Search loaded family</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="name, synonym, formula, InChIKey, classification..."
          />
        </label>
        <label>
          <span>Identity signal</span>
          <select value={identityType} onChange={(event) => setIdentityType(event.target.value)}>
            <option value="all">All exact identity signals</option>
            <option value="full-inchikey">Full InChIKey</option>
            <option value="canonical-smiles">Canonical SMILES fallback</option>
          </select>
        </label>
        <label>
          <span>Family confidence</span>
          <select
            value={assignmentConfidence}
            onChange={(event) => setAssignmentConfidence(event.target.value)}
          >
            <option value="all">All confidence states</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="none">Unresolved</option>
          </select>
        </label>
      </section>

      <section className={styles.workspace}>
        <div className={styles.results}>
          <div className={styles.resultsHeading}>
            <div>
              <span>{familyLabel(family)}</span>
              <strong>{familyState === "ready" ? filtered.length.toLocaleString() : "—"}</strong>
            </div>
            <p>
              {familyState === "loading"
                ? "Loading bounded family shards…"
                : "Registry records remain source candidates until reviewed into the teaching/evidence layers."}
            </p>
          </div>

          <div className={styles.list}>
            {familyState === "ready" ? (
              filtered.slice(0, 400).map((record) => (
                <button
                  type="button"
                  key={record.id}
                  data-active={selected?.id === record.id ? "" : undefined}
                  onClick={() => setSelectedId(record.id)}
                >
                  <div>
                    <strong>{record.canonicalName ?? "Unnamed source candidate"}</strong>
                    <span>{record.formula ?? "formula unavailable"} · {humanize(record.familyAssignment.status)}</span>
                  </div>
                  <div className={styles.identityBadge}>
                    <span>{humanize(record.identity.type)}</span>
                    <b>{record.familyAssignment.confidence}</b>
                  </div>
                </button>
              ))
            ) : (
              <p className={styles.empty}>
                {familyState === "unavailable"
                  ? "This family shard could not be loaded."
                  : "Compile the registry or choose a family to inspect records."}
              </p>
            )}
          </div>

          {filtered.length > 400 ? (
            <p className={styles.limit}>Showing the first 400 matches in this family. Narrow the search to inspect a specific identity.</p>
          ) : null}
        </div>

        <aside className={styles.detail}>
          {selected ? (
            <>
              <div className={styles.detailHeading}>
                <p className="eyebrow">Source candidate</p>
                <h2>{selected.canonicalName ?? "Unnamed candidate"}</h2>
                <span>{selected.id}</span>
              </div>

              <dl className={styles.facts}>
                <div><dt>Family</dt><dd>{selected.family ? familyLabel(selected.family) : "Unresolved"}</dd></div>
                <div><dt>Family assignment</dt><dd>{humanize(selected.familyAssignment.status)}</dd></div>
                <div><dt>Assignment confidence</dt><dd>{selected.familyAssignment.confidence}</dd></div>
                <div><dt>Formula carbon count</dt><dd>{selected.familyAssignment.carbonCount ?? "—"}</dd></div>
                <div><dt>Formula</dt><dd>{selected.formula ?? "—"}</dd></div>
                <div><dt>Molecular weight</dt><dd>{selected.molecularWeight ?? "—"}</dd></div>
                <div><dt>Identity type</dt><dd>{humanize(selected.identity.type)}</dd></div>
                <div><dt>Review state</dt><dd>{humanize(selected.reviewStatus)}</dd></div>
              </dl>

              <section>
                <h3>Exact identity</h3>
                <code>{selected.identity.value}</code>
              </section>

              <section>
                <h3>Classification provenance</h3>
                <div className={styles.classification}>
                  {Object.entries(selected.classification ?? {})
                    .filter(([, value]) => Boolean(value))
                    .map(([key, value]) => (
                      <div key={key}><span>{humanize(key)}</span><strong>{value}</strong></div>
                    ))}
                </div>
              </section>

              <section>
                <h3>Names &amp; synonyms</h3>
                <div className={styles.chips}>
                  {[...selected.names, ...selected.synonyms].slice(0, 18).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </section>

              <section>
                <h3>Source provenance</h3>
                <p>{selected.sourceRefs.length} source record reference{selected.sourceRefs.length === 1 ? "" : "s"} retained.</p>
                <div className={styles.sourceRefs}>
                  {selected.sourceRefs.slice(0, 8).map((ref, index) => (
                    <code key={`${ref.sourceRecordId}-${index}`}>
                      {ref.sourceId}:{ref.sourceRecordId} · {ref.sourceRelease}
                    </code>
                  ))}
                </div>
              </section>

              {selected.sourceOrganisms.length ? (
                <section>
                  <h3>Occurrence text from source</h3>
                  <p className={styles.organisms}>{selected.sourceOrganisms.slice(0, 5).join(" · ")}</p>
                </section>
              ) : null}

              <p className={styles.guardrail}>
                This record is not automatically a cannabis terpene, aroma driver, breeding marker, or biological-effect claim.
                Those links require separate reviewed evidence.
              </p>
            </>
          ) : (
            <div className={styles.prompt}>
              <p className="eyebrow">Identity-first registry</p>
              <h2>Select a source candidate.</h2>
              <p>Inspect exact identity, family assignment, source classifications, synonyms, and provenance.</p>
            </div>
          )}
        </aside>
      </section>

      <section className={styles.method}>
        <div>
          <p className="eyebrow">Registry architecture</p>
          <h2>Broad coverage without pretending every candidate is reviewed.</h2>
        </div>
        <div>
          <p><strong>Identity:</strong> full InChIKey first, canonical structure fallback, never common-name merging.</p>
          <p><strong>Family:</strong> explicit source classification first; exact carbon count only as a fallback; unresolved stays unresolved.</p>
          <p><strong>Promotion:</strong> candidate → identity-reviewed → evidence-linked → THC editorial-reviewed.</p>
        </div>
      </section>

      <nav className={styles.links}>
        <Link href="/learn/terpenes">← Reviewed Terpene Wheel</Link>
        <Link href="/learn/terpenes/research">Research ledger →</Link>
        <Link href="/learn/terpenes/corpus">Cultivar chemistry corpus →</Link>
      </nav>
    </div>
  );
}
