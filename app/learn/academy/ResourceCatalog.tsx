"use client";

import { useMemo, useState } from "react";
import catalog from "@/content/academy-resource-catalog.json";
import styles from "./page.module.css";

type StatusFilter = "all" | "available" | "review";

const statusCopy = {
  reuse: { label: "Available reference", detail: "The existing reference can be used directly." },
  upgrade: { label: "Mapped for upgrade", detail: "An existing reference is confirmed as the starting point." },
  review: { label: "Cataloged for review", detail: "The topic is preserved, but its public reference mapping is not yet confirmed." },
} as const;

export default function ResourceCatalog() {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [visibleCount, setVisibleCount] = useState(24);

  const domains = useMemo(
    () => Array.from(new Map(catalog.records.map((record) => [record.domainId, record.domain])).entries()),
    [],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return catalog.records.filter((record) => {
      const matchesQuery = !needle || `${record.id} ${record.title} ${record.domain} ${record.match?.id ?? ""} ${record.match?.title ?? ""}`.toLowerCase().includes(needle);
      const matchesDomain = domain === "all" || record.domainId === domain;
      const matchesStatus = status === "all" || (status === "available" ? record.status !== "review" : record.status === "review");
      return matchesQuery && matchesDomain && matchesStatus;
    });
  }, [domain, query, status]);

  function resetPage() {
    setVisibleCount(24);
  }

  return (
    <section className={styles.catalog} id="resource-library" aria-labelledby="resource-library-heading">
      <header className={styles.catalogHeader}>
        <div>
          <p className="eyebrow">Comprehensive educational resource library</p>
          <h2 id="resource-library-heading">Explore all 420 preserved topics</h2>
          <p>
            This catalog is the Academy reference layer—not 420 credential courses. Confirmed mappings connect to existing reference work; review items remain visible so no topic is silently lost while reconciliation continues.
          </p>
        </div>
        <div className={styles.catalogSummary} aria-label="Resource reconciliation summary">
          <span><strong>{catalog.summary.total}</strong> cataloged</span>
          <span><strong>{catalog.summary.confirmedReuse + catalog.summary.confirmedUpgrade}</strong> confirmed mappings</span>
          <span><strong>{catalog.summary.candidateReview}</strong> in review</span>
        </div>
      </header>

      <div className={styles.catalogNotice} role="note">
        Course participation and professional credential decisions are separate systems. Viewing a resource does not award or imply a credential.
      </div>

      <div className={styles.filters} aria-label="Filter resource catalog">
        <label>
          <span>Search</span>
          <input
            type="search"
            value={query}
            placeholder="Topic, ID, domain, or mapped reference"
            onChange={(event) => { setQuery(event.target.value); resetPage(); }}
          />
        </label>
        <label>
          <span>Domain</span>
          <select value={domain} onChange={(event) => { setDomain(event.target.value); resetPage(); }}>
            <option value="all">All {domains.length} domains</option>
            {domains.map(([id, name]) => <option value={id} key={id}>{id} · {name}</option>)}
          </select>
        </label>
        <label>
          <span>Reconciliation status</span>
          <select value={status} onChange={(event) => { setStatus(event.target.value as StatusFilter); resetPage(); }}>
            <option value="all">All statuses</option>
            <option value="available">Confirmed mappings</option>
            <option value="review">Cataloged for review</option>
          </select>
        </label>
      </div>

      <p className={styles.results} aria-live="polite">
        Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} matching resources
      </p>

      {filtered.length ? (
        <div className={styles.resourceGrid}>
          {filtered.slice(0, visibleCount).map((record) => {
            const copy = statusCopy[record.status as keyof typeof statusCopy];
            return (
              <article className={styles.resourceCard} key={record.id}>
                <div className={styles.resourceMeta}>
                  <span>{record.id}</span>
                  <span>Level {record.level}</span>
                </div>
                <h3>{record.title}</h3>
                <p className={styles.domain}>{record.domainId} · {record.domain}</p>
                <p className={`${styles.status} ${record.status === "review" ? styles.statusReview : styles.statusConfirmed}`}>{copy.label}</p>
                <p className={styles.statusDetail}>{copy.detail}</p>
                {record.match ? (
                  <div className={styles.mapping}>
                    <span>Mapped reference</span>
                    <strong>{record.match.id}</strong>
                    <p>{record.match.title}</p>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : <p className={styles.empty}>No resources match those filters. Try a broader search or reset a filter.</p>}

      {visibleCount < filtered.length ? (
        <button className={styles.loadMore} type="button" onClick={() => setVisibleCount((count) => count + 24)}>
          Show 24 more
        </button>
      ) : null}
    </section>
  );
}
