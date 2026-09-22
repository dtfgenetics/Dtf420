"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./TerpeneCorpusExplorer.module.css";

type CategoryStat = { value: string; n: number; share: number };

type CorpusCultivar = {
  cultivarSlug: string;
  sampleCount: number;
  labCount: number;
  producerCount: number;
  sampleDepthTier: string;
  totalTerpenesMedian: number | null;
  topTerpenes: CategoryStat[];
  dominantRegion?: CategoryStat | null;
  dominantChemotype?: CategoryStat | null;
  dominantProductCategory?: CategoryStat | null;
  regions?: CategoryStat[];
  chemotypes?: CategoryStat[];
  productCategories?: CategoryStat[];
  quality?: {
    labEffectiveCount: number | null;
    producerEffectiveCount: number | null;
    totalTerpeneCoverage: number;
    regionCoverage: number;
    chemotypeCoverage: number;
    largestRegionShare: number | null;
    largestChemotypeShare: number | null;
  };
  vector: Record<string, number>;
};

type CorpusAnalyte = {
  normalizedKey: string;
  canonicalSlug: string | null;
  measurementKind: string;
  cultivarCount: number;
  cultivarShare: number;
  measuredSamples: number;
  multiLabCultivars: number;
  positiveMedianCultivars: number;
  positiveMedianShare: number;
  cultivarMedianDistribution: {
    n: number;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    mean: number;
  } | null;
};

type CorpusIndex = {
  schemaVersion: number;
  status: string;
  sourceId: string;
  sourceSampleCount: number;
  cultivarCount: number;
  analyteCount: number;
  generatedAt: string | null;
  interpretation: string;
  analytes: CorpusAnalyte[];
  cultivars: CorpusCultivar[];
};

type SortMode =
  | "samples"
  | "labs"
  | "producers"
  | "total-terpenes"
  | "analyte"
  | "name";

function labelFromSlug(value: string) {
  return value
    .replaceAll("-", " ")
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function percent(value: number | null | undefined) {
  return value == null ? "—" : `${Math.round(value * 100)}%`;
}

function safeNumber(value: number | null | undefined, fallback = 0) {
  return Number.isFinite(value) ? Number(value) : fallback;
}

export function TerpeneCorpusExplorer() {
  const [index, setIndex] = useState<CorpusIndex | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const [query, setQuery] = useState("");
  const [minimumSamples, setMinimumSamples] = useState(10);
  const [minimumLabs, setMinimumLabs] = useState(1);
  const [minimumProducers, setMinimumProducers] = useState(1);
  const [region, setRegion] = useState("all");
  const [chemotype, setChemotype] = useState("all");
  const [topTerpene, setTopTerpene] = useState("all");
  const [analyte, setAnalyte] = useState("all");
  const [minimumAnalyteMedian, setMinimumAnalyteMedian] = useState(0);
  const [minimumTotalTerpenes, setMinimumTotalTerpenes] = useState(0);
  const [sortMode, setSortMode] = useState<SortMode>("samples");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/terpenes/cultivars/index.json", { cache: "force-cache" })
      .then(async (response) => {
        if (!response.ok) throw new Error("corpus index unavailable");
        return response.json() as Promise<CorpusIndex>;
      })
      .then((next) => {
        if (cancelled) return;
        if (next.status !== "compiled" || !Array.isArray(next.cultivars) || next.cultivarCount < 100) {
          throw new Error("corpus index not compiled");
        }
        setIndex(next);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("unavailable");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const regionOptions = useMemo(() => {
    const values = new Set<string>();
    index?.cultivars.forEach((cultivar) => (cultivar.regions ?? []).forEach((item) => values.add(item.value)));
    return [...values].sort();
  }, [index]);

  const chemotypeOptions = useMemo(() => {
    const values = new Set<string>();
    index?.cultivars.forEach((cultivar) => (cultivar.chemotypes ?? []).forEach((item) => values.add(item.value)));
    return [...values].sort();
  }, [index]);

  const topTerpeneOptions = useMemo(() => {
    const values = new Set<string>();
    index?.cultivars.forEach((cultivar) => (cultivar.topTerpenes ?? []).forEach((item) => values.add(item.value)));
    return [...values].sort();
  }, [index]);

  const filtered = useMemo(() => {
    if (!index) return [];
    const needle = query.trim().toLowerCase();

    return index.cultivars
      .filter((cultivar) => !needle || cultivar.cultivarSlug.includes(needle))
      .filter((cultivar) => cultivar.sampleCount >= minimumSamples)
      .filter((cultivar) => cultivar.labCount >= minimumLabs)
      .filter((cultivar) => cultivar.producerCount >= minimumProducers)
      .filter((cultivar) =>
        region === "all" || (cultivar.regions ?? []).some((item) => item.value === region),
      )
      .filter((cultivar) =>
        chemotype === "all" || (cultivar.chemotypes ?? []).some((item) => item.value === chemotype),
      )
      .filter((cultivar) =>
        topTerpene === "all" || cultivar.topTerpenes?.[0]?.value === topTerpene,
      )
      .filter((cultivar) =>
        analyte === "all" || safeNumber(cultivar.vector[analyte]) >= minimumAnalyteMedian,
      )
      .filter((cultivar) =>
        minimumTotalTerpenes <= 0 ||
        safeNumber(cultivar.totalTerpenesMedian) >= minimumTotalTerpenes,
      )
      .sort((a, b) => {
        if (sortMode === "name") return a.cultivarSlug.localeCompare(b.cultivarSlug);
        if (sortMode === "labs") return b.labCount - a.labCount || b.sampleCount - a.sampleCount;
        if (sortMode === "producers") return b.producerCount - a.producerCount || b.sampleCount - a.sampleCount;
        if (sortMode === "total-terpenes") {
          return safeNumber(b.totalTerpenesMedian, -1) - safeNumber(a.totalTerpenesMedian, -1);
        }
        if (sortMode === "analyte" && analyte !== "all") {
          return safeNumber(b.vector[analyte], -1) - safeNumber(a.vector[analyte], -1);
        }
        return b.sampleCount - a.sampleCount || b.labCount - a.labCount;
      });
  }, [
    analyte,
    chemotype,
    index,
    minimumAnalyteMedian,
    minimumLabs,
    minimumProducers,
    minimumSamples,
    minimumTotalTerpenes,
    query,
    region,
    sortMode,
    topTerpene,
  ]);

  const selected =
    filtered.find((cultivar) => cultivar.cultivarSlug === selectedSlug) ??
    index?.cultivars.find((cultivar) => cultivar.cultivarSlug === selectedSlug) ??
    null;

  const selectedVector = useMemo(
    () =>
      selected
        ? Object.entries(selected.vector)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
        : [],
    [selected],
  );

  function resetFilters() {
    setQuery("");
    setMinimumSamples(10);
    setMinimumLabs(1);
    setMinimumProducers(1);
    setRegion("all");
    setChemotype("all");
    setTopTerpene("all");
    setAnalyte("all");
    setMinimumAnalyteMedian(0);
    setMinimumTotalTerpenes(0);
    setSortMode("samples");
  }

  return (
    <div className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className="eyebrow">THC Terpene Atlas · whole-corpus chemistry</p>
          <h1>Cultivar Chemistry Corpus</h1>
          <p>
            Filter the complete public cultivar reference set by measured chemistry and source breadth.
            This explorer searches compiled cultivar-group summaries—not raw laboratory rows and not marketing strain claims.
          </p>
        </div>
        <aside>
          <strong>14 measured analyte channels ≠ every known terpene</strong>
          <p>
            The corpus reflects the analytes present in this published laboratory dataset. The broader Terpene Atlas
            remains responsible for global terpene/terpenoid coverage.
          </p>
        </aside>
      </header>

      <section className={styles.stats}>
        <article><span>Source samples</span><strong>{index?.sourceSampleCount.toLocaleString() ?? "—"}</strong></article>
        <article><span>Public cultivar groups</span><strong>{index?.cultivarCount.toLocaleString() ?? "—"}</strong></article>
        <article><span>Measured analyte channels</span><strong>{index?.analyteCount ?? "—"}</strong></article>
        <article><span>Filtered results</span><strong>{status === "ready" ? filtered.length.toLocaleString() : "—"}</strong></article>
      </section>

      {status === "unavailable" ? (
        <section className={styles.notice}>
          <strong>Global cultivar index is unavailable in this deployment.</strong>
          <p>The data-refresh pipeline must compile the corpus index before whole-corpus filtering can run.</p>
        </section>
      ) : null}

      <section className={styles.filters}>
        <label className={styles.wide}>
          <span>Cultivar label</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="blue-dream, haze, kush..."
          />
        </label>

        <label>
          <span>Minimum samples</span>
          <select value={minimumSamples} onChange={(event) => setMinimumSamples(Number(event.target.value))}>
            <option value={5}>5+</option><option value={10}>10+</option><option value={20}>20+</option>
            <option value={30}>30+</option><option value={50}>50+</option><option value={100}>100+</option>
          </select>
        </label>

        <label>
          <span>Minimum labs</span>
          <select value={minimumLabs} onChange={(event) => setMinimumLabs(Number(event.target.value))}>
            <option value={1}>1+</option><option value={2}>2+</option><option value={3}>3+</option><option value={5}>5+</option>
          </select>
        </label>

        <label>
          <span>Minimum producers</span>
          <select value={minimumProducers} onChange={(event) => setMinimumProducers(Number(event.target.value))}>
            <option value={1}>1+</option><option value={2}>2+</option><option value={3}>3+</option><option value={5}>5+</option>
          </select>
        </label>

        <label>
          <span>Region represented</span>
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            <option value="all">All regions</option>
            {regionOptions.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>

        <label>
          <span>Chemotype represented</span>
          <select value={chemotype} onChange={(event) => setChemotype(event.target.value)}>
            <option value="all">All chemotypes</option>
            {chemotypeOptions.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>

        <label>
          <span>Most frequent top terpene</span>
          <select value={topTerpene} onChange={(event) => setTopTerpene(event.target.value)}>
            <option value="all">Any top terpene</option>
            {topTerpeneOptions.map((item) => <option value={item} key={item}>{labelFromSlug(item)}</option>)}
          </select>
        </label>

        <label>
          <span>Analyte median filter</span>
          <select value={analyte} onChange={(event) => setAnalyte(event.target.value)}>
            <option value="all">No analyte filter</option>
            {index?.analytes.map((item) => (
              <option key={item.normalizedKey} value={item.normalizedKey}>{labelFromSlug(item.normalizedKey)}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Minimum analyte median %</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={minimumAnalyteMedian}
            disabled={analyte === "all"}
            onChange={(event) => setMinimumAnalyteMedian(Number(event.target.value))}
          />
        </label>

        <label>
          <span>Minimum total terpene median %</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={minimumTotalTerpenes}
            onChange={(event) => setMinimumTotalTerpenes(Number(event.target.value))}
          />
        </label>

        <label>
          <span>Sort results</span>
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
            <option value="samples">Sample depth</option>
            <option value="labs">Laboratory breadth</option>
            <option value="producers">Producer breadth</option>
            <option value="total-terpenes">Total terpene median</option>
            <option value="analyte" disabled={analyte === "all"}>Selected analyte median</option>
            <option value="name">Cultivar label</option>
          </select>
        </label>

        <button type="button" className={styles.reset} onClick={resetFilters}>Reset filters</button>
      </section>

      <section className={styles.workspace}>
        <div className={styles.results}>
          <div className={styles.resultsHeading}>
            <div>
              <span>Corpus results</span>
              <strong>{filtered.length.toLocaleString()}</strong>
            </div>
            <p>
              Filters describe the source corpus. They do not identify a “best” cultivar or predict human effects.
            </p>
          </div>

          <div className={styles.resultList}>
            {filtered.slice(0, 250).map((cultivar) => {
              const analyteValue = analyte === "all" ? null : cultivar.vector[analyte];
              return (
                <button
                  type="button"
                  key={cultivar.cultivarSlug}
                  data-active={selected?.cultivarSlug === cultivar.cultivarSlug ? "" : undefined}
                  onClick={() => setSelectedSlug(cultivar.cultivarSlug)}
                >
                  <div>
                    <strong>{labelFromSlug(cultivar.cultivarSlug)}</strong>
                    <span>{cultivar.sampleCount} samples · {cultivar.labCount} labs · {cultivar.producerCount} producers</span>
                  </div>
                  <div className={styles.resultMeta}>
                    <span>{cultivar.topTerpenes?.[0] ? labelFromSlug(cultivar.topTerpenes[0].value) : "top terpene unavailable"}</span>
                    <b>{analyteValue == null ? (cultivar.totalTerpenesMedian == null ? "—" : `${cultivar.totalTerpenesMedian.toFixed(2)}% total`) : `${analyteValue.toFixed(3)}%`}</b>
                  </div>
                </button>
              );
            })}
          </div>

          {filtered.length > 250 ? (
            <p className={styles.limitNote}>
              Showing the first 250 filtered groups. Tighten the filters to inspect a narrower corpus slice.
            </p>
          ) : null}
        </div>

        <aside className={styles.detail}>
          {selected ? (
            <>
              <div className={styles.detailHeading}>
                <p className="eyebrow">Corpus detail</p>
                <h2>{labelFromSlug(selected.cultivarSlug)}</h2>
                <span>{selected.sampleDepthTier.replaceAll("-", " ")}</span>
              </div>

              <div className={styles.depthGrid}>
                <article><span>Samples</span><strong>{selected.sampleCount}</strong></article>
                <article><span>Labs</span><strong>{selected.labCount}</strong></article>
                <article><span>Producers</span><strong>{selected.producerCount}</strong></article>
                <article><span>Total terpene median</span><strong>{selected.totalTerpenesMedian == null ? "—" : `${selected.totalTerpenesMedian.toFixed(2)}%`}</strong></article>
              </div>

              <section className={styles.context}>
                <h3>Source context</h3>
                <dl>
                  <div><dt>Dominant region</dt><dd>{selected.dominantRegion ? `${selected.dominantRegion.value} · ${percent(selected.dominantRegion.share)}` : "—"}</dd></div>
                  <div><dt>Dominant chemotype</dt><dd>{selected.dominantChemotype ? `${selected.dominantChemotype.value} · ${percent(selected.dominantChemotype.share)}` : "—"}</dd></div>
                  <div><dt>Dominant product category</dt><dd>{selected.dominantProductCategory?.value ?? "—"}</dd></div>
                  <div><dt>Effective lab count</dt><dd>{selected.quality?.labEffectiveCount?.toFixed(1) ?? "—"}</dd></div>
                  <div><dt>Effective producer count</dt><dd>{selected.quality?.producerEffectiveCount?.toFixed(1) ?? "—"}</dd></div>
                  <div><dt>Total-terpene coverage</dt><dd>{percent(selected.quality?.totalTerpeneCoverage)}</dd></div>
                </dl>
              </section>

              <section className={styles.vector}>
                <div>
                  <h3>Median chemistry vector</h3>
                  <p>Top channels in this compiled cultivar-group median profile.</p>
                </div>
                {selectedVector.map(([key, value]) => (
                  <div className={styles.vectorRow} key={key}>
                    <span>{labelFromSlug(key)}</span>
                    <div><i style={{ width: `${Math.min(100, value * 80)}%` }} /></div>
                    <strong>{value.toFixed(3)}%</strong>
                  </div>
                ))}
              </section>

              <p className={styles.guardrail}>
                This is a corpus summary, not a fixed cultivar specification. Open the cultivar distribution
                browser for quartiles, ranges, regional strata, laboratory breadth, and analyte-level diagnostics.
              </p>

              <Link href="/learn/terpenes/cultivars">Open full cultivar distribution browser →</Link>
            </>
          ) : (
            <div className={styles.prompt}>
              <p className="eyebrow">Whole-corpus inspection</p>
              <h2>Select a cultivar group.</h2>
              <p>Its chemistry vector, source breadth, dominant context, and data-coverage fields will appear here.</p>
            </div>
          )}
        </aside>
      </section>

      <section className={styles.method}>
        <div>
          <p className="eyebrow">Interpretation</p>
          <h2>Filtering chemistry is not ranking cultivars.</h2>
        </div>
        <p>
          Corpus filters answer descriptive questions such as “which compiled groups meet these measured chemistry
          and source-breadth conditions?” They do not establish genetic identity, superiority, therapeutic effect,
          or how a future individual sample will test.
        </p>
      </section>
    </div>
  );
}
