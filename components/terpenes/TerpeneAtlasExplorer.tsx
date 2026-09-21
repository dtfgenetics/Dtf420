"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { terpeneFamilies, terpeneSeedCompounds } from "@/lib/terpenes/data";
import type { TerpeneClassId, TerpeneCompound, TerpeneView } from "@/lib/terpenes/types";
import styles from "./TerpeneAtlasExplorer.module.css";

const views: { id: TerpeneView; label: string; helper: string }[] = [
  { id: "aroma", label: "Aroma", helper: "Sensory language without reducing aroma to one molecule." },
  { id: "chemistry", label: "Chemistry", helper: "Carbon class, structure family, functional chemistry, and identifiers." },
  { id: "biosynthesis", label: "Biosynthesis", helper: "Precursors and pathway relationships." },
  { id: "genetics", label: "Genetics", helper: "Terpene synthases, expression, and inherited variation." },
  { id: "cultivars", label: "Cultivars", helper: "Measured profiles and chemovar-level interpretation." },
];

function matchesSearch(compound: TerpeneCompound, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    compound.name,
    ...compound.aliases,
    compound.formula,
    compound.structureFamily,
    compound.functionalClass,
    compound.biosyntheticPrecursor,
    ...compound.aromaDescriptors,
    ...compound.naturalSources,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function occurrenceLabel(compound: TerpeneCompound) {
  if (compound.cannabisOccurrence === "documented") return "Documented in cannabis";
  if (compound.cannabisOccurrence === "reported") return "Reported in cannabis";
  return "Global reference · cannabis not mapped";
}

export function TerpeneAtlasExplorer() {
  const [view, setView] = useState<TerpeneView>("aroma");
  const [scope, setScope] = useState<"cannabis" | "all">("cannabis");
  const [family, setFamily] = useState<TerpeneClassId | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState("limonene");

  const filtered = useMemo(
    () =>
      terpeneSeedCompounds.filter((compound) => {
        if (scope === "cannabis" && compound.cannabisOccurrence === "not-mapped") return false;
        if (family !== "all" && compound.terpeneClass !== family) return false;
        return matchesSearch(compound, query);
      }),
    [family, query, scope],
  );

  const selected =
    terpeneSeedCompounds.find((compound) => compound.slug === selectedSlug) ??
    filtered[0] ??
    terpeneSeedCompounds[0];

  const selectedFamily = terpeneFamilies.find((item) => item.id === selected.terpeneClass);

  function chooseFamily(nextFamily: TerpeneClassId) {
    setFamily((current) => (current === nextFamily ? "all" : nextFamily));
    const firstMatch = terpeneSeedCompounds.find(
      (compound) =>
        compound.terpeneClass === nextFamily &&
        (scope === "all" || compound.cannabisOccurrence !== "not-mapped"),
    );
    if (firstMatch) setSelectedSlug(firstMatch.slug);
  }

  return (
    <div className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className="eyebrow">Teaching Healthy Cultivation · Plant chemistry</p>
          <h1>THC Terpene Atlas</h1>
          <p>
            Explore terpene families, cannabis-relevant chemistry, aroma, biosynthesis, genetics,
            cultivar context, and evidence without turning complex chemistry into marketing shortcuts.
          </p>
        </div>
        <div className={styles.heroStats} aria-label="Terpene Atlas build status">
          <span><strong>{terpeneFamilies.length}</strong> terpene classes</span>
          <span><strong>{terpeneSeedCompounds.length}</strong> curated seed records</span>
          <span><strong>Versioned</strong> source architecture</span>
        </div>
      </header>

      <section className={styles.toolbar} aria-label="Terpene Atlas controls">
        <label className={styles.search}>
          <span>Search the atlas</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, alias, aroma, formula, source..."
            type="search"
          />
        </label>

        <div className={styles.segmented} aria-label="Data scope">
          <button
            type="button"
            data-active={scope === "cannabis" ? "" : undefined}
            onClick={() => setScope("cannabis")}
          >
            Cannabis mapped
          </button>
          <button
            type="button"
            data-active={scope === "all" ? "" : undefined}
            onClick={() => setScope("all")}
          >
            Global seed set
          </button>
        </div>
      </section>

      <nav className={styles.viewTabs} aria-label="Terpene knowledge views">
        {views.map((item) => (
          <button
            key={item.id}
            type="button"
            data-active={view === item.id ? "" : undefined}
            onClick={() => setView(item.id)}
            title={item.helper}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <section className={styles.workspace}>
        <aside className={styles.familyPanel}>
          <div className={styles.panelHeading}>
            <span>Classification</span>
            <button type="button" onClick={() => setFamily("all")} disabled={family === "all"}>
              Clear
            </button>
          </div>

          <div className={styles.familyList}>
            {terpeneFamilies.map((item) => {
              const count = terpeneSeedCompounds.filter((compound) => compound.terpeneClass === item.id).length;
              return (
                <button
                  type="button"
                  key={item.id}
                  data-active={family === item.id ? "" : undefined}
                  onClick={() => chooseFamily(item.id)}
                >
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.carbonCount} · {item.isopreneUnits} isoprene unit{item.isopreneUnits === "1" ? "" : "s"}</small>
                  </span>
                  <b>{count}</b>
                </button>
              );
            })}
          </div>

          <div className={styles.scopeNote}>
            <strong>Built for full-scale ingestion</strong>
            <p>
              This first coded release uses a reviewed seed set. The same schema is designed to accept
              the much larger global registry and cannabis-specific evidence tables without changing the UI contract.
            </p>
          </div>
        </aside>

        <div className={styles.wheelPanel}>
          <div className={styles.wheelHeader}>
            <div>
              <span>Interactive classification wheel</span>
              <strong>{family === "all" ? "All terpene families" : selectedFamily?.label}</strong>
            </div>
            <small>{views.find((item) => item.id === view)?.helper}</small>
          </div>

          <div className={styles.wheelWrap}>
            <div className={styles.wheel} role="group" aria-label="Terpene family wheel">
              <div className={styles.wheelCore}>
                <span>Terpenes</span>
                <b>&amp;</b>
                <span>Terpenoids</span>
              </div>
              {terpeneFamilies.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.familyNode}
                  data-active={family === item.id ? "" : undefined}
                  onClick={() => chooseFamily(item.id)}
                  style={{ "--i": index } as CSSProperties}
                >
                  <strong>{item.label}</strong>
                  <small>{item.carbonCount}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.compoundStrip} aria-label="Matching terpene compounds">
            {filtered.length ? (
              filtered.map((compound) => (
                <button
                  key={compound.slug}
                  type="button"
                  data-active={selected.slug === compound.slug ? "" : undefined}
                  onClick={() => setSelectedSlug(compound.slug)}
                >
                  <strong>{compound.name}</strong>
                  <small>{compound.formula} · {compound.structureFamily}</small>
                </button>
              ))
            ) : (
              <p>No seed records match these filters yet. Clear a filter or switch the data scope.</p>
            )}
          </div>
        </div>

        <aside className={styles.detailPanel} aria-live="polite">
          <div className={styles.detailTopline}>
            <span>{selectedFamily?.label} · {selectedFamily?.carbonCount}</span>
            <span className={styles.occurrence} data-status={selected.cannabisOccurrence}>
              {occurrenceLabel(selected)}
            </span>
          </div>

          <h2>{selected.name}</h2>
          <p className={styles.identity}>
            {selected.structureFamily} · {selected.functionalClass}
          </p>

          <dl className={styles.facts}>
            <div><dt>Formula</dt><dd>{selected.formula}</dd></div>
            <div><dt>Molecular weight</dt><dd>{selected.molecularWeight ? `${selected.molecularWeight} g/mol` : "Pending source import"}</dd></div>
            <div><dt>CAS</dt><dd>{selected.casNumber ?? "Pending source import"}</dd></div>
            <div><dt>PubChem CID</dt><dd>{selected.pubchemCid ?? "Pending source import"}</dd></div>
            <div><dt>Precursor</dt><dd>{selected.biosyntheticPrecursor}</dd></div>
          </dl>

          <section className={styles.focusCard}>
            <span>{views.find((item) => item.id === view)?.label} view</span>
            <p>{selected.viewNotes[view]}</p>
          </section>

          {selected.aromaDescriptors.length ? (
            <section>
              <h3>Aroma language</h3>
              <div className={styles.chips}>
                {selected.aromaDescriptors.map((descriptor) => <span key={descriptor}>{descriptor}</span>)}
              </div>
            </section>
          ) : null}

          <section>
            <h3>Cannabis context</h3>
            <p>{selected.cannabisContext}</p>
          </section>

          <section className={styles.guardrail}>
            <h3>Evidence guardrail</h3>
            <p>{selected.researchGuardrail}</p>
          </section>

          <Link className={styles.fullRecord} href={`/learn/terpenes/${selected.slug}`}>
            Open full compound record →
          </Link>
        </aside>
      </section>

      <section className={styles.nextLayer}>
        <article>
          <span>01</span>
          <h2>Profile comparison</h2>
          <p>Compare terpene fingerprints compound-by-compound instead of relying on cultivar names alone.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Breeding explorer</h2>
          <p>Connect parent chemistry, measured offspring, TPS evidence, and selection targets without pretending inheritance is deterministic.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Research ledger</h2>
          <p>Every effect claim will carry study type, evidence strength, citation, and review status.</p>
        </article>
      </section>
    </div>
  );
}
