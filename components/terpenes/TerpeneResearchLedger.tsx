"use client";

import { useMemo, useState } from "react";
import type { ResearchEvidenceRecord, ResearchSource } from "@/lib/terpenes/research";
import { evidenceScope, humanizeEvidenceTerm } from "@/lib/terpenes/research";
import styles from "./TerpeneResearchLedger.module.css";

type Props = {
  records: ResearchEvidenceRecord[];
  sources: ResearchSource[];
};

function sourceMap(sources: ResearchSource[]) {
  return new Map(sources.map((source) => [source.id, source]));
}

const coverageGroups = [
  { id: "human", label: "Human", types: ["human-experimental", "human-clinical", "human-observational"] },
  { id: "animal", label: "Animal", types: ["animal"] },
  { id: "mechanistic", label: "Mechanistic / in vitro", types: ["mechanistic", "in-vitro"] },
  { id: "plant", label: "Plant chemistry / genetics", types: ["chemical-analysis", "enzyme-functional", "genomics"] },
  { id: "safety", label: "Safety / stability", types: ["toxicology", "stability-study"] },
  { id: "review", label: "Reviews", types: ["review"] },
  { id: "sensory", label: "Sensory", types: ["sensory"] },
] as const;

function countGroup(records: ResearchEvidenceRecord[], types: readonly string[]) {
  const allowed = new Set(types);
  return records.filter((record) => allowed.has(record.studyType)).length;
}

export function TerpeneResearchLedger({ records, sources }: Props) {
  const [query, setQuery] = useState("");
  const [claimType, setClaimType] = useState("all");
  const [studyType, setStudyType] = useState("all");
  const [reviewStatus, setReviewStatus] = useState("all");
  const bySource = useMemo(() => sourceMap(sources), [sources]);

  const claimTypes = useMemo(() => [...new Set(records.map((record) => record.claimType))].sort(), [records]);
  const studyTypes = useMemo(() => [...new Set(records.map((record) => record.studyType))].sort(), [records]);
  const reviewStates = useMemo(() => [...new Set(records.map((record) => record.reviewStatus))].sort(), [records]);

  const coverage = useMemo(
    () =>
      coverageGroups.map((group) => ({
        ...group,
        count: countGroup(records, group.types),
      })),
    [records],
  );

  const compoundCoverage = useMemo(() => {
    const slugs = [...new Set(records.map((record) => record.compoundSlug))]
      .filter((slug) => slug !== "_general-terpene")
      .sort();

    return slugs.map((slug) => {
      const compoundRecords = records.filter((record) => record.compoundSlug === slug);
      return {
        slug,
        total: compoundRecords.length,
        groups: Object.fromEntries(
          coverageGroups.map((group) => [group.id, countGroup(compoundRecords, group.types)]),
        ) as Record<string, number>,
      };
    });
  }, [records]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((record) => {
      if (claimType !== "all" && record.claimType !== claimType) return false;
      if (studyType !== "all" && record.studyType !== studyType) return false;
      if (reviewStatus !== "all" && record.reviewStatus !== reviewStatus) return false;
      if (!needle) return true;
      const source = bySource.get(record.sourceId);
      const text = [
        record.id, record.compoundSlug, record.statement, record.sourceId, source?.name,
        record.sourceLocator, record.studyType, record.populationOrMaterial, record.analyticalMethod,
        record.notes, record.geneId, record.substrate, record.cultivarOrStrain,
      ].filter(Boolean).join(" ").toLowerCase();
      return text.includes(needle);
    });
  }, [records, query, claimType, studyType, reviewStatus, bySource]);

  return (
    <div className={styles.ledger}>
      <section className={styles.landscape} aria-label="Research evidence landscape">
        <div className={styles.landscapeHeading}>
          <div>
            <span>Evidence landscape</span>
            <h2>Coverage is not the same thing as evidence strength.</h2>
          </div>
          <p>
            Counts show how many reviewed records exist in each study family. A larger number does not
            automatically mean a stronger or more clinically relevant conclusion.
          </p>
        </div>

        <div className={styles.coverageCards}>
          {coverage.map((group) => (
            <article key={group.id}>
              <span>{group.label}</span>
              <strong>{group.count}</strong>
              <small>{group.types.map((type) => humanizeEvidenceTerm(type)).join(" · ")}</small>
            </article>
          ))}
        </div>

        <div className={styles.matrixWrap}>
          <table className={styles.matrix}>
            <thead>
              <tr>
                <th>Compound</th>
                {coverageGroups.map((group) => <th key={group.id}>{group.label}</th>)}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {compoundCoverage.map((row) => (
                <tr key={row.slug}>
                  <th>{humanizeEvidenceTerm(row.slug)}</th>
                  {coverageGroups.map((group) => (
                    <td key={group.id} data-empty={row.groups[group.id] === 0 ? "" : undefined}>
                      {row.groups[group.id]}
                    </td>
                  ))}
                  <td><strong>{row.total}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={styles.matrixNote}>
          A zero means this ledger does not currently contain a reviewed record in that study family for the compound.
          It does not prove the evidence does not exist elsewhere.
        </p>
      </section>

      <section className={styles.controls} aria-label="Research ledger filters">
        <label className={styles.search}>
          <span>Search evidence</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Compound, gene, source, method, claim..."
          />
        </label>
        <label>
          <span>Claim type</span>
          <select value={claimType} onChange={(event) => setClaimType(event.target.value)}>
            <option value="all">All claim types</option>
            {claimTypes.map((value) => <option key={value} value={value}>{humanizeEvidenceTerm(value)}</option>)}
          </select>
        </label>
        <label>
          <span>Study type</span>
          <select value={studyType} onChange={(event) => setStudyType(event.target.value)}>
            <option value="all">All study types</option>
            {studyTypes.map((value) => <option key={value} value={value}>{humanizeEvidenceTerm(value)}</option>)}
          </select>
        </label>
        <label>
          <span>Review state</span>
          <select value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value)}>
            <option value="all">All review states</option>
            {reviewStates.map((value) => <option key={value} value={value}>{humanizeEvidenceTerm(value)}</option>)}
          </select>
        </label>
      </section>

      <div className={styles.resultBar}>
        <strong>{filtered.length}</strong>
        <span>evidence record{filtered.length === 1 ? "" : "s"} shown</span>
      </div>

      <section className={styles.records} aria-label="Terpene evidence records">
        {filtered.length ? filtered.map((record) => {
          const source = bySource.get(record.sourceId);
          return (
            <article className={styles.record} key={record.id}>
              <div className={styles.recordHeader}>
                <div>
                  <span className={styles.claimType}>{humanizeEvidenceTerm(record.claimType)}</span>
                  <h2>{record.statement}</h2>
                </div>
                <span className={styles.review} data-review={record.reviewStatus}>
                  {humanizeEvidenceTerm(record.reviewStatus)}
                </span>
              </div>

              <div className={styles.tags}>
                <span>{humanizeEvidenceTerm(record.studyType)}</span>
                <span>{record.compoundSlug}</span>
                {record.geneId ? <span>{record.geneId}</span> : null}
                {record.cultivarOrStrain ? <span>{record.cultivarOrStrain}</span> : null}
              </div>

              <dl className={styles.facts}>
                <div><dt>Material / population</dt><dd>{record.populationOrMaterial}</dd></div>
                <div><dt>Method</dt><dd>{record.analyticalMethod ?? "Not specified in this ledger entry"}</dd></div>
                <div><dt>Source locator</dt><dd>{record.sourceLocator}</dd></div>
                {record.substrate ? <div><dt>Substrate</dt><dd>{record.substrate}</dd></div> : null}
                {record.value !== null ? <div><dt>Recorded value</dt><dd>{record.value} {record.unit}</dd></div> : null}
              </dl>

              <section className={styles.scope}>
                <span>What this evidence establishes</span>
                <p>{evidenceScope(record)}</p>
              </section>

              {record.notes ? <p className={styles.notes}>{record.notes}</p> : null}

              <footer className={styles.recordFooter}>
                <div>
                  <strong>{source?.name ?? record.sourceId}</strong>
                  <small>{source?.doi ? "DOI " + source.doi : record.sourceId}</small>
                </div>
                {source?.sourceUrl ? (
                  <a href={source.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a>
                ) : null}
              </footer>
            </article>
          );
        }) : (
          <div className={styles.empty}>No evidence records match the current filters.</div>
        )}
      </section>
    </div>
  );
}
