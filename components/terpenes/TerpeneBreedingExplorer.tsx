"use client";

import { useMemo, useState } from "react";
import { getCannabisTerpenes } from "@/lib/terpenes/queries";
import { buildBreedingSelectionHypothesis } from "@/lib/terpenes/breeding";
import { profileFromValues } from "@/lib/terpenes/profiles";
import styles from "./TerpeneBreedingExplorer.module.css";

const compounds = getCannabisTerpenes();

function labelForSlug(slug: string) {
  return compounds.find((compound) => compound.slug === slug)?.name ?? slug;
}

function updateNumber(
  setter: (next: Record<string, number>) => void,
  current: Record<string, number>,
  slug: string,
  raw: string,
) {
  const value = Number.parseFloat(raw);
  setter({ ...current, [slug]: Number.isFinite(value) && value > 0 ? value : 0 });
}

export function TerpeneBreedingExplorer() {
  const [parentALabel, setParentALabel] = useState("Parent A");
  const [parentBLabel, setParentBLabel] = useState("Parent B");
  const [parentAValues, setParentAValues] = useState<Record<string, number>>({});
  const [parentBValues, setParentBValues] = useState<Record<string, number>>({});
  const [targetSlugs, setTargetSlugs] = useState<string[]>([
    "beta-myrcene",
    "limonene",
    "beta-caryophyllene",
  ]);

  const hypothesis = useMemo(() => {
    const parentA = profileFromValues("parent-a", parentALabel || "Parent A", parentAValues);
    const parentB = profileFromValues("parent-b", parentBLabel || "Parent B", parentBValues);
    return buildBreedingSelectionHypothesis(parentA, parentB, targetSlugs);
  }, [parentALabel, parentBLabel, parentAValues, parentBValues, targetSlugs]);

  const comparisonBySlug = new Map(
    hypothesis.comparison.comparisons.map((item) => [item.compoundSlug, item]),
  );

  function toggleTarget(slug: string) {
    setTargetSlugs((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
  }

  return (
    <div className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className="eyebrow">THC Terpene Atlas · Breeding</p>
          <h1>Terpene Breeding Explorer</h1>
          <p>
            Compare measured parent profiles, identify shared and parent-specific chemistry,
            and build offspring screening targets without pretending inheritance is deterministic.
          </p>
        </div>
        <aside>
          <strong>What this tool does</strong>
          <p>It converts parent chemistry into a selection map. It does not output guaranteed F1 percentages.</p>
        </aside>
      </header>

      <section className={styles.parentNames}>
        <label>
          <span>Parent A</span>
          <input value={parentALabel} onChange={(event) => setParentALabel(event.target.value)} />
        </label>
        <div className={styles.crossMark}>×</div>
        <label>
          <span>Parent B</span>
          <input value={parentBLabel} onChange={(event) => setParentBLabel(event.target.value)} />
        </label>
      </section>

      <section className={styles.entryPanel}>
        <div className={styles.entryHeading}>
          <div>
            <p className="eyebrow">Enter measured chemistry</p>
            <h2>Parent terpene profiles</h2>
          </div>
          <p>
            Enter comparable terpene percentages from COAs or repeated parent measurements.
            Blank fields are treated as not entered, not as proven biological absence.
          </p>
        </div>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Target</th>
                <th>Compound</th>
                <th>{parentALabel || "Parent A"} %</th>
                <th>{parentBLabel || "Parent B"} %</th>
                <th>Observed relationship</th>
                <th>Parent midpoint*</th>
              </tr>
            </thead>
            <tbody>
              {compounds.map((compound) => {
                const comparison = comparisonBySlug.get(compound.slug);
                return (
                  <tr key={compound.slug}>
                    <td>
                      <input
                        className={styles.checkbox}
                        type="checkbox"
                        checked={targetSlugs.includes(compound.slug)}
                        onChange={() => toggleTarget(compound.slug)}
                        aria-label={`Use ${compound.name} as a selection target`}
                      />
                    </td>
                    <td>
                      <strong>{compound.name}</strong>
                      <small>{compound.formula} · {compound.structureFamily}</small>
                    </td>
                    <td>
                      <input
                        className={styles.numberInput}
                        min="0"
                        step="0.01"
                        type="number"
                        inputMode="decimal"
                        value={parentAValues[compound.slug] || ""}
                        onChange={(event) =>
                          updateNumber(setParentAValues, parentAValues, compound.slug, event.target.value)
                        }
                        aria-label={`${parentALabel || "Parent A"} ${compound.name} percentage`}
                      />
                    </td>
                    <td>
                      <input
                        className={styles.numberInput}
                        min="0"
                        step="0.01"
                        type="number"
                        inputMode="decimal"
                        value={parentBValues[compound.slug] || ""}
                        onChange={(event) =>
                          updateNumber(setParentBValues, parentBValues, compound.slug, event.target.value)
                        }
                        aria-label={`${parentBLabel || "Parent B"} ${compound.name} percentage`}
                      />
                    </td>
                    <td>
                      <span className={styles.relationship} data-presence={comparison?.presence ?? "none"}>
                        {comparison?.presence === "shared"
                          ? "Observed in both"
                          : comparison?.presence === "parent-a-only"
                            ? "Parent A only"
                            : comparison?.presence === "parent-b-only"
                              ? "Parent B only"
                              : "No entered value"}
                      </span>
                    </td>
                    <td>
                      {comparison ? comparison.observedMidpoint.toFixed(3) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className={styles.footnote}>
          *The midpoint is descriptive arithmetic between entered parents. It is not an offspring prediction.
        </p>
      </section>

      <section className={styles.summaryGrid}>
        <article>
          <span>Parent A entered total</span>
          <strong>{hypothesis.comparison.parentATotal.toFixed(2)}%</strong>
        </article>
        <article>
          <span>Parent B entered total</span>
          <strong>{hypothesis.comparison.parentBTotal.toFixed(2)}%</strong>
        </article>
        <article>
          <span>Shared entered compounds</span>
          <strong>{hypothesis.comparison.sharedCompounds.length}</strong>
        </article>
        <article>
          <span>Profile-vector similarity</span>
          <strong>
            {hypothesis.comparison.similarity === null
              ? "Need both profiles"
              : `${(hypothesis.comparison.similarity * 100).toFixed(0)}%`}
          </strong>
        </article>
      </section>

      <section className={styles.targets}>
        <div className={styles.sectionHeading}>
          <p className="eyebrow">Selection hypothesis</p>
          <h2>What to screen for in offspring</h2>
          <p>
            Targets are based only on the parent chemistry you entered. Add actual offspring results
            as soon as they exist and replace assumptions with measured segregation data.
          </p>
        </div>

        <div className={styles.targetGrid}>
          {hypothesis.targets.length ? (
            hypothesis.targets.map((target) => (
              <article key={target.compoundSlug}>
                <div>
                  <span data-availability={target.availability}>{target.availability.replaceAll("-", " ")}</span>
                  <h3>{labelForSlug(target.compoundSlug)}</h3>
                </div>
                <dl>
                  <div><dt>{parentALabel || "Parent A"}</dt><dd>{target.parentAObserved.toFixed(3)}%</dd></div>
                  <div><dt>{parentBLabel || "Parent B"}</dt><dd>{target.parentBObserved.toFixed(3)}%</dd></div>
                </dl>
                <p>{target.interpretation}</p>
              </article>
            ))
          ) : (
            <p className={styles.empty}>Select at least one terpene target in the table above.</p>
          )}
        </div>
      </section>

      <section className={styles.guardrails}>
        <div>
          <p className="eyebrow">Breeding guardrails</p>
          <h2>Parent chemistry is evidence, not destiny.</h2>
        </div>
        <ol>
          {hypothesis.guardrails.map((guardrail) => <li key={guardrail}>{guardrail}</li>)}
        </ol>
      </section>
    </div>
  );
}
