"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { getCannabisTerpenes } from "@/lib/terpenes/queries";
import { compareTerpeneProfiles, profileFromValues } from "@/lib/terpenes/profiles";
import styles from "./TerpeneProfileComparison.module.css";

const compounds = getCannabisTerpenes();

function updateValue(
  setter: (next: Record<string, number>) => void,
  current: Record<string, number>,
  slug: string,
  raw: string,
) {
  const parsed = Number.parseFloat(raw);
  setter({
    ...current,
    [slug]: Number.isFinite(parsed) && parsed > 0 ? parsed : 0,
  });
}

export function TerpeneProfileComparison() {
  const [labelA, setLabelA] = useState("Profile A");
  const [labelB, setLabelB] = useState("Profile B");
  const [valuesA, setValuesA] = useState<Record<string, number>>({});
  const [valuesB, setValuesB] = useState<Record<string, number>>({});

  const comparison = useMemo(
    () =>
      compareTerpeneProfiles(
        profileFromValues("profile-a", labelA || "Profile A", valuesA),
        profileFromValues("profile-b", labelB || "Profile B", valuesB),
      ),
    [labelA, labelB, valuesA, valuesB],
  );

  const maxObserved = Math.max(
    0.01,
    ...compounds.flatMap((compound) => [
      valuesA[compound.slug] ?? 0,
      valuesB[compound.slug] ?? 0,
    ]),
  );

  const comparisonBySlug = new Map(
    comparison.comparisons.map((item) => [item.compoundSlug, item]),
  );

  function clearProfiles() {
    setValuesA({});
    setValuesB({});
  }

  return (
    <div className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className="eyebrow">THC Terpene Atlas · measured chemistry</p>
          <h1>Terpene Profile Comparison</h1>
          <p>
            Compare two measured terpene fingerprints compound-by-compound. This tool compares entered
            chemistry; it does not treat a cultivar name as a fixed chemical identity.
          </p>
        </div>
        <aside>
          <strong>Aroma fingerprint ≠ effect score</strong>
          <p>
            Similarity describes the shape of the entered terpene vectors. It does not predict how a person
            will feel, nor does it prove two samples are genetically identical.
          </p>
        </aside>
      </header>

      <section className={styles.profileHeader}>
        <label>
          <span>Profile A label</span>
          <input value={labelA} onChange={(event) => setLabelA(event.target.value)} />
        </label>
        <div className={styles.compareMark}>vs</div>
        <label>
          <span>Profile B label</span>
          <input value={labelB} onChange={(event) => setLabelB(event.target.value)} />
        </label>
        <button type="button" onClick={clearProfiles}>Clear values</button>
      </section>

      <section className={styles.summary} aria-label="Profile comparison summary">
        <article>
          <span>{labelA || "Profile A"} entered total</span>
          <strong>{comparison.parentATotal.toFixed(2)}%</strong>
        </article>
        <article>
          <span>{labelB || "Profile B"} entered total</span>
          <strong>{comparison.parentBTotal.toFixed(2)}%</strong>
        </article>
        <article>
          <span>Shared compounds</span>
          <strong>{comparison.sharedCompounds.length}</strong>
        </article>
        <article>
          <span>Vector similarity</span>
          <strong>
            {comparison.similarity === null
              ? "Need both"
              : `${(comparison.similarity * 100).toFixed(0)}%`}
          </strong>
        </article>
      </section>

      <section className={styles.fingerprintPanel}>
        <div className={styles.sectionHeading}>
          <div>
            <p className="eyebrow">Visual fingerprint</p>
            <h2>Compare relative shape and absolute entered values.</h2>
          </div>
          <p>
            Bar length is scaled to the largest value currently entered in either profile. Numerical percentages
            remain visible so visual scale never replaces the measurement.
          </p>
        </div>

        <div className={styles.legend}>
          <span data-profile="a">{labelA || "Profile A"}</span>
          <span data-profile="b">{labelB || "Profile B"}</span>
        </div>

        <div className={styles.fingerprint}>
          {compounds.map((compound) => {
            const a = valuesA[compound.slug] ?? 0;
            const b = valuesB[compound.slug] ?? 0;
            const relation = comparisonBySlug.get(compound.slug)?.presence ?? "none";
            const style = {
              "--a-width": `${(a / maxObserved) * 100}%`,
              "--b-width": `${(b / maxObserved) * 100}%`,
            } as CSSProperties;

            return (
              <article className={styles.fingerprintRow} key={compound.slug} style={style}>
                <div className={styles.compoundMeta}>
                  <strong>{compound.name}</strong>
                  <span>{compound.formula} · {compound.structureFamily}</span>
                </div>

                <div className={styles.bars}>
                  <div className={styles.barTrack}>
                    <div className={styles.barA} />
                    <span>{a > 0 ? `${a.toFixed(3)}%` : "—"}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barB} />
                    <span>{b > 0 ? `${b.toFixed(3)}%` : "—"}</span>
                  </div>
                </div>

                <span className={styles.relation} data-relation={relation}>
                  {relation === "shared"
                    ? "shared"
                    : relation === "parent-a-only"
                      ? "A only"
                      : relation === "parent-b-only"
                        ? "B only"
                        : "not entered"}
                </span>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.entryPanel}>
        <div className={styles.sectionHeading}>
          <div>
            <p className="eyebrow">Enter laboratory values</p>
            <h2>Build the two profiles.</h2>
          </div>
          <p>
            Use comparable units from comparable laboratory reports. Blank values mean “not entered,” not
            “proven absent.” Enter percentages as reported by the source laboratory.
          </p>
        </div>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Compound</th>
                <th>Chemical class</th>
                <th>{labelA || "Profile A"} %</th>
                <th>{labelB || "Profile B"} %</th>
                <th>Relationship</th>
              </tr>
            </thead>
            <tbody>
              {compounds.map((compound) => {
                const relation = comparisonBySlug.get(compound.slug)?.presence ?? "none";
                return (
                  <tr key={compound.slug}>
                    <td>
                      <strong>{compound.name}</strong>
                      <small>{compound.formula}</small>
                    </td>
                    <td>{compound.terpeneClass.replaceAll("-", " ")}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        inputMode="decimal"
                        value={valuesA[compound.slug] || ""}
                        onChange={(event) =>
                          updateValue(setValuesA, valuesA, compound.slug, event.target.value)
                        }
                        aria-label={`${labelA || "Profile A"} ${compound.name} percentage`}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        inputMode="decimal"
                        value={valuesB[compound.slug] || ""}
                        onChange={(event) =>
                          updateValue(setValuesB, valuesB, compound.slug, event.target.value)
                        }
                        aria-label={`${labelB || "Profile B"} ${compound.name} percentage`}
                      />
                    </td>
                    <td>
                      <span className={styles.relation} data-relation={relation}>
                        {relation === "shared"
                          ? "Observed in both"
                          : relation === "parent-a-only"
                            ? "Profile A only"
                            : relation === "parent-b-only"
                              ? "Profile B only"
                              : "No entered value"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.interpretation}>
        <div>
          <p className="eyebrow">Interpretation</p>
          <h2>Similarity is descriptive, not an identity test.</h2>
        </div>
        <div>
          <p>
            The comparison uses the entered terpene vectors to describe shared chemistry and relative profile
            shape. Different laboratories, methods, harvest stages, storage histories, and sample positions can
            change measured values.
          </p>
          <p>
            For cultivar-level conclusions, compare distributions from repeated samples rather than one certificate
            of analysis. The cultivar statistics pipeline preserves medians, quartiles, ranges, sample counts, and
            laboratory counts for that reason.
          </p>
        </div>
      </section>

      <nav className={styles.links} aria-label="Related terpene tools">
        <Link href="/learn/terpenes">← Back to Terpene Wheel</Link>
        <Link href="/learn/terpenes/breeding">Breeding explorer →</Link>
        <Link href="/learn/terpenes/research">Research ledger →</Link>
      </nav>
    </div>
  );
}
