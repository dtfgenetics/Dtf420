"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import glossary from "@/content/education-glossary.json";
import styles from "./page.module.css";

const categories = ["All", ...Array.from(new Set(glossary.map((entry) => entry.category))).sort()];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function GlossaryExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    const normalizedQuery = normalize(query);
    return glossary.filter((entry) => {
      if (category !== "All" && entry.category !== category) return false;
      if (!normalizedQuery) return true;
      const haystack = normalize(`${entry.term} ${entry.definition} ${entry.category} ${entry.aliases.join(" ")}`);
      return normalizedQuery.split(" ").every((token) => haystack.includes(token));
    });
  }, [category, query]);

  return (
    <>
      <section className={styles.controls} aria-label="Glossary search and filters">
        <label className={styles.searchField}>
          <span>Search terms and definitions</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try VPD, chlorosis, rhizosphere, EC…"
            autoComplete="off"
          />
        </label>

        <label className={styles.categoryField}>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>

        <div className={styles.resultCount} aria-live="polite">
          <strong>{filtered.length}</strong>
          <span>of {glossary.length} terms</span>
        </div>
      </section>

      {filtered.length ? (
        <div className={styles.grid}>
          {filtered.map((entry) => (
            <article className={styles.card} id={entry.slug} key={entry.slug}>
              <div className={styles.cardMeta}>
                <span>{entry.category}</span>
                {entry.aliases.length ? <small>Also: {entry.aliases.join(", ")}</small> : null}
              </div>
              <h2>{entry.term}</h2>
              <p>{entry.definition}</p>
              {entry.relatedRoutes.length ? (
                <div className={styles.links} aria-label={`${entry.term} related learning`}>
                  {entry.relatedRoutes.map((route) => (
                    <Link href={route} key={route}>Study related topic →</Link>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <section className={styles.empty} aria-live="polite">
          <h2>No glossary match</h2>
          <p>Try a shorter term, an abbreviation, or switch the category filter back to All.</p>
          <button type="button" onClick={() => { setQuery(""); setCategory("All"); }}>Clear filters</button>
        </section>
      )}
    </>
  );
}
