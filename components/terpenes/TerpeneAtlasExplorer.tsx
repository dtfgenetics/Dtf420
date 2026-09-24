"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { terpeneFamilies, terpeneSeedCompounds } from "@/lib/terpenes/data";
import type { TerpeneClassId, TerpeneCompound, TerpeneView } from "@/lib/terpenes/types";
import styles from "./TerpeneAtlasExplorer.module.css";

const views: { id: TerpeneView; label: string; helper: string }[] = [
  { id: "aroma", label: "Aroma", helper: "Sensory language without reducing aroma to one molecule." },
  { id: "chemistry", label: "Chemistry", helper: "Chemical class, structure family, functional chemistry, and identifiers." },
  { id: "biosynthesis", label: "Biosynthesis", helper: "Precursors, terpene synthases, and pathway relationships." },
  { id: "genetics", label: "Genetics", helper: "Functionally characterized synthases, expression, and inherited variation." },
  { id: "cultivars", label: "Cultivars", helper: "Measured sample distributions instead of fixed strain percentages." },
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

function ringStyle(index: number, count: number) {
  const angle = (360 / Math.max(count, 1)) * index;
  return { "--angle": `${angle}deg`, "--counter-angle": `${angle * -1}deg` } as CSSProperties;
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

  const wheelCompounds = filtered.length
    ? filtered.slice(0, 12)
    : terpeneSeedCompounds
        .filter((compound) => scope === "all" || compound.cannabisOccurrence !== "not-mapped")
        .slice(0, 12);

  const selected =
    terpeneSeedCompounds.find((compound) => compound.slug === selectedSlug) ??
    wheelCompounds[0] ??
    terpeneSeedCompounds[0];

  const selectedFamily = terpeneFamilies.find((item) => item.id === selected.terpeneClass);
  const aromaRing = selected.aromaDescriptors.length
    ? selected.aromaDescriptors.slice(0, 8)
    : ["reference compound"];

  function chooseFamily(nextFamily: TerpeneClassId) {
    const willClear = family === nextFamily;
    setFamily(willClear ? "all" : nextFamily);

    if (!willClear) {
      const firstMatch = terpeneSeedCompounds.find(
        (compound) =>
          compound.terpeneClass === nextFamily &&
          (scope === "all" || compound.cannabisOccurrence !== "not-mapped"),
      );
      if (firstMatch) setSelectedSlug(firstMatch.slug);
    }
  }

  function chooseScope(nextScope: "cannabis" | "all") {
    setScope(nextScope);
    if (nextScope === "cannabis" && selected.cannabisOccurrence === "not-mapped") {
      const firstCannabis = terpeneSeedCompounds.find(
        (compound) => compound.cannabisOccurrence !== "not-mapped",
      );
      if (firstCannabis) setSelectedSlug(firstCannabis.slug);
    }
  }

  return (
    <div className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className="eyebrow">THC · Teaching Healthy Cultivation · Plant chemistry</p>
          <h1>Terpenes &amp; Terpenoids Wheel</h1>
          <p className={styles.heroSubtitle}>Cannabis &amp; Hemp Aroma Chemistry</p>
          <p className={styles.heroCopy}>
            Explore chemical class, individual molecules, aroma associations, biosynthesis, genetics,
            cultivar chemistry, and reviewed evidence without turning aroma into an effect prediction.
          </p>
        </div>
        <div className={styles.heroStats} aria-label="Terpene Atlas build status">
          <span><strong>{terpeneFamilies.length}</strong> chemical classes</span>
          <span><strong>{terpeneSeedCompounds.length}</strong> reviewed seed records</span>
          <span><strong>Aroma ≠ effect</strong> core teaching rule</span>
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
            onClick={() => chooseScope("cannabis")}
          >
            Cannabis mapped
          </button>
          <button
            type="button"
            data-active={scope === "all" ? "" : undefined}
            onClick={() => chooseScope("all")}
          >
            All known scope
          </button>
        </div>
      </section>

      <nav className={styles.viewTabs} aria-label="Terpene knowledge views">
        <span>Explore by</span>
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
        <Link href="/learn/terpenes/research">Evidence</Link>
      </nav>

      <section className={styles.workspace}>
        <aside className={styles.familyPanel}>
          <div className={styles.panelHeading}>
            <span>Inner ring · chemical class</span>
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

          <div className={styles.ringLegend}>
            <div><i data-ring="class" /><span><strong>Inner</strong> chemical class</span></div>
            <div><i data-ring="compound" /><span><strong>Middle</strong> individual compounds</span></div>
            <div><i data-ring="aroma" /><span><strong>Outer</strong> aroma associations</span></div>
          </div>

          <div className={styles.scopeNote}>
            <strong>Aroma chemistry is broader than terpenes.</strong>
            <p>
              Skunk, gas, savory, and other notes can involve sulfur compounds, esters, aldehydes,
              ketones, and additional VOCs. They are not forced into terpene families here.
            </p>
          </div>
        </aside>

        <div className={styles.wheelPanel}>
          <div className={styles.wheelHeader}>
            <div>
              <span>Interactive chemistry + aroma wheel</span>
              <strong>{family === "all" ? "All chemical classes" : selectedFamily?.label}</strong>
            </div>
            <small>{views.find((item) => item.id === view)?.helper}</small>
          </div>

          <div className={styles.wheelViewport} aria-label="Swipe horizontally on small screens to inspect the full wheel">
            <div className={styles.wheel} role="group" aria-label="Terpenes and terpenoids concentric wheel">
              <div className={styles.wheelCore}>
                <small>THC</small>
                <strong>Terpenes</strong>
                <b>&amp;</b>
                <strong>Terpenoids</strong>
                <span>Aroma guide</span>
                <em>Aroma ≠ effect prediction</em>
              </div>

              <div className={styles.classRing} aria-label="Chemical class ring">
                {terpeneFamilies.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.classNode}
                    data-active={family === item.id ? "" : undefined}
                    onClick={() => chooseFamily(item.id)}
                    style={ringStyle(index, terpeneFamilies.length)}
                    aria-label={`${item.label}, ${item.carbonCount}`}
                  >
                    <strong>{item.label.replace("terpenes", "")}</strong>
                    <small>{item.carbonCount}</small>
                  </button>
                ))}
              </div>

              <div className={styles.compoundRing} aria-label="Compound ring">
                {wheelCompounds.map((compound, index) => (
                  <button
                    key={compound.slug}
                    type="button"
                    className={styles.compoundNode}
                    data-active={selected.slug === compound.slug ? "" : undefined}
                    onClick={() => setSelectedSlug(compound.slug)}
                    style={ringStyle(index, wheelCompounds.length)}
                    aria-label={`Select ${compound.name}`}
                  >
                    <strong>{compound.name}</strong>
                    <small>{compound.formula}</small>
                  </button>
                ))}
              </div>

              <div className={styles.aromaRing} aria-label={`Aroma associations for ${selected.name}`}>
                {aromaRing.map((descriptor, index) => (
                  <span
                    key={`${selected.slug}-${descriptor}`}
                    className={styles.aromaNode}
                    style={ringStyle(index, aromaRing.length)}
                  >
                    {descriptor}
                  </span>
                ))}
              </div>
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
              <p>No records match these filters yet. Clear a filter or switch the data scope.</p>
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

          <div className={styles.selectedAroma}>
            <span>Outer-ring aroma</span>
            <div className={styles.chips}>
              {selected.aromaDescriptors.length
                ? selected.aromaDescriptors.map((descriptor) => <span key={descriptor}>{descriptor}</span>)
                : <span>Not assigned as an aroma driver in this seed record</span>}
            </div>
          </div>

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

          <section>
            <h3>Cannabis context</h3>
            <p>{selected.cannabisContext}</p>
          </section>

          <section className={styles.guardrail}>
            <h3>Evidence guardrail</h3>
            <p>{selected.researchGuardrail}</p>
          </section>

          <div className={styles.detailActions}>
            <Link className={styles.fullRecord} href={`/learn/terpenes/${selected.slug}`}>
              Open full compound record →
            </Link>
            <Link href="/learn/terpenes/genetics">TPS genetics</Link>
            <Link href="/learn/terpenes/research">Research ledger</Link>
          </div>
        </aside>
      </section>

      <section className={styles.nextLayer}>
        <article>
          <span>01</span>
          <h2>Profile comparison</h2>
          <p>Compare measured terpene fingerprints compound-by-compound instead of relying on cultivar names alone.</p>
          <Link href="/learn/terpenes/profiles">Open profile comparison →</Link>
        </article>
        <article>
          <span>02</span>
          <h2>Breeding explorer</h2>
          <p>Connect parent chemistry, measured offspring, TPS evidence, and selection targets without pretending inheritance is deterministic.</p>
          <Link href="/learn/terpenes/breeding">Open breeding explorer →</Link>
        </article>
        <article>
          <span>03</span>
          <h2>Genetics map</h2>
          <p>Trace functionally characterized Cannabis terpene synthases to substrates, major products, minor products, strain origin, and evidence.</p>
          <Link href="/learn/terpenes/genetics">Open TPS genetics →</Link>
        </article>
        <article>
          <span>04</span>
          <h2>Research ledger</h2>
          <p>Inspect claim type, study type, methods, source location, review status, and what each evidence record can actually establish.</p>
          <Link href="/learn/terpenes/research">Open research ledger →</Link>
        </article>
        <article>
          <span>05</span>
          <h2>Cultivar distributions</h2>
          <p>Browse repeated-sample medians, quartiles, observed ranges, sample depth, and laboratory depth without assigning one permanent chemistry value to a cultivar name.</p>
          <Link href="/learn/terpenes/cultivars">Open cultivar distributions →</Link>
        </article>
        <article>
          <span>06</span>
          <h2>Chemistry corpus</h2>
          <p>Filter the complete public cultivar reference set by terpene medians, sample depth, laboratory breadth, producer breadth, region, chemotype, and total-terpene median.</p>
          <Link href="/learn/terpenes/corpus">Open chemistry corpus →</Link>
        </article>
        <article>
          <span>07</span>
          <h2>Universal registry</h2>
          <p>Inspect the versioned all-known terpene and terpenoid candidate registry by exact identity, family assignment, source classification, confidence, review state, and provenance.</p>
          <Link href="/learn/terpenes/registry">Open universal registry →</Link>
        </article>
        <article>
          <span>08</span>
          <h2>Chapter readiness</h2>
          <p>Track the 14-section educational chapter model, linked evidence, assessments, and remaining editorial expansion work across reviewed compounds.</p>
          <Link href="/learn/terpenes/chapters">Open chapter readiness →</Link>
        </article>
        <article>
          <span>09</span>
          <h2>Review promotion</h2>
          <p>See which registry candidates are ready for reviewed chapters, which evidence signals they already have, and the exact blockers preventing premature promotion.</p>
          <Link href="/learn/terpenes/promotion">Open review promotion →</Link>
        </article>
      </section>
    </div>
  );
}
