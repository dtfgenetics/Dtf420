"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type {
  CultivarCategoryStatistics,
  CultivarProfileSummary,
} from "@/lib/terpenes/cultivar-types";
import styles from "./TerpeneCultivarBrowser.module.css";

type Manifest = {
  schemaVersion: number;
  sourceId?: string;
  sourceSampleCount?: number;
  cultivarCount?: number;
  publishableCultivarCount?: number;
  minimumSamples?: number;
  generatedAt?: string;
  shardStrategy?: string;
  sourceBytes?: number;
  sourceSha256?: string;
  shards?: Array<{ key: string; filename: string; count: number }>;
  status?: string;
};

type IntelligenceCultivar = {
  cultivarSlug: string;
  sampleCount: number;
  labCount: number;
  producerCount: number;
  sampleDepthTier: CultivarProfileSummary["sampleDepthTier"];
  totalTerpenesMedian: number | null;
  topTerpenes: CultivarCategoryStatistics[];
  vector: Record<string, number>;
};

type IntelligenceAnalyte = {
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

type CultivarIntelligenceIndex = {
  schemaVersion: number;
  status: string;
  sourceId: string;
  sourceSampleCount: number;
  cultivarCount: number;
  analyteCount: number;
  generatedAt: string | null;
  interpretation: string;
  analytes: IntelligenceAnalyte[];
  cultivars: IntelligenceCultivar[];
};

type Props = {
  sourceName: string;
  sourceUrl: string | null;
};

type AnalyteFilter = "all" | "exact" | "unresolved";
type AnalyteSort = "median" | "sample-depth" | "iqr";

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function analyteLabel(key: string) {
  return key
    .replace("-total", " total")
    .replaceAll("-", " ")
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function depthLabel(tier: CultivarProfileSummary["sampleDepthTier"]) {
  return tier.replaceAll("-", " ");
}

function shardKey(query: string) {
  const first = query.trim().toLowerCase().replace(/[^a-z0-9]/g, "")[0];
  return first || null;
}

function matchesCultivar(records: CultivarProfileSummary[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return records
    .filter((cultivar) => cultivar.cultivarSlug.includes(needle))
    .sort((a, b) => b.sampleCount - a.sampleCount || a.cultivarSlug.localeCompare(b.cultivarSlug))
    .slice(0, 80);
}

function formatShare(value: number) {
  return `${Math.round(value * 100)}%`;
}

function topCategory(items: CultivarCategoryStatistics[]) {
  return items[0] ?? null;
}

function normalizeCultivarSummary(record: CultivarProfileSummary): CultivarProfileSummary {
  const producerCount = Number.isFinite(record.producerCount) ? record.producerCount : 0;
  const fallbackConcentration = (distinctCount: number) => ({
    knownCount: 0,
    distinctCount,
    largestShare: null,
    concentrationIndex: null,
    effectiveCount: null,
  });

  return {
    ...record,
    producerCount,
    totalTerpenes: record.totalTerpenes ?? null,
    regions: Array.isArray(record.regions) ? record.regions : [],
    productCategories: Array.isArray(record.productCategories) ? record.productCategories : [],
    chemotypes: Array.isArray(record.chemotypes) ? record.chemotypes : [],
    topTerpenes: Array.isArray(record.topTerpenes) ? record.topTerpenes : [],
    regionStrata: Array.isArray(record.regionStrata) ? record.regionStrata : [],
    dataQuality: record.dataQuality ?? {
      labs: fallbackConcentration(record.labCount),
      producers: fallbackConcentration(producerCount),
      totalTerpeneCoverage: record.totalTerpenes ? 1 : 0,
      regionCoverage: 0,
      productCategoryCoverage: 0,
      chemotypeCoverage: 0,
      largestRegionShare: null,
      largestProductCategoryShare: null,
      largestChemotypeShare: null,
    },
    analytes: record.analytes.map((analyte) => ({
      ...analyte,
      sampleCoverage:
        Number.isFinite(analyte.sampleCoverage)
          ? analyte.sampleCoverage
          : record.sampleCount > 0
            ? analyte.n / record.sampleCount
            : 0,
      relativeIqr:
        analyte.relativeIqr ??
        (analyte.median > 0 ? (analyte.q3 - analyte.q1) / analyte.median : null),
      labMedianDistribution: analyte.labMedianDistribution ?? null,
    })),
  };
}

function vectorSimilarity(
  left: Record<string, number>,
  right: Record<string, number>,
) {
  const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])];
  const dot = keys.reduce((sum, key) => sum + (left[key] ?? 0) * (right[key] ?? 0), 0);
  const normLeft = Math.sqrt(keys.reduce((sum, key) => sum + (left[key] ?? 0) ** 2, 0));
  const normRight = Math.sqrt(keys.reduce((sum, key) => sum + (right[key] ?? 0) ** 2, 0));
  return normLeft > 0 && normRight > 0 ? dot / (normLeft * normRight) : null;
}

function sharedVectorKeys(left: Record<string, number>, right: Record<string, number>) {
  return Object.keys(left).filter((key) => key in right).length;
}

function medianVectorSimilarity(a: CultivarProfileSummary, b: CultivarProfileSummary) {
  const aMap = new Map(a.analytes.map((item) => [item.normalizedKey, item.median]));
  const bMap = new Map(b.analytes.map((item) => [item.normalizedKey, item.median]));
  const keys = [...new Set([...aMap.keys(), ...bMap.keys()])];

  const dot = keys.reduce((sum, key) => sum + (aMap.get(key) ?? 0) * (bMap.get(key) ?? 0), 0);
  const normA = Math.sqrt(keys.reduce((sum, key) => sum + (aMap.get(key) ?? 0) ** 2, 0));
  const normB = Math.sqrt(keys.reduce((sum, key) => sum + (bMap.get(key) ?? 0) ** 2, 0));

  return normA > 0 && normB > 0 ? dot / (normA * normB) : null;
}

function CategoryBars({
  title,
  items,
}: {
  title: string;
  items: CultivarCategoryStatistics[];
}) {
  return (
    <article className={styles.contextCard}>
      <div className={styles.contextHeading}>
        <span>{title}</span>
        <strong>{items.length}</strong>
      </div>
      {items.length ? (
        <div className={styles.categoryList}>
          {items.slice(0, 8).map((item) => (
            <div key={item.value} className={styles.categoryRow}>
              <div>
                <strong>{item.value}</strong>
                <span>{item.n} samples · {formatShare(item.share)}</span>
              </div>
              <div className={styles.categoryTrack}>
                <i style={{ width: `${Math.min(100, item.share * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noContext}>No source values were available for this category.</p>
      )}
    </article>
  );
}

export function TerpeneCultivarBrowser({ sourceName, sourceUrl }: Props) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [manifestState, setManifestState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [query, setQuery] = useState("");
  const [compareQuery, setCompareQuery] = useState("");
  const [shardCache, setShardCache] = useState<Record<string, CultivarProfileSummary[]>>({});
  const [failedKeys, setFailedKeys] = useState<string[]>([]);
  const inflightKeys = useRef(new Set<string>());
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [compareSlug, setCompareSlug] = useState<string | null>(null);
  const [analyteQuery, setAnalyteQuery] = useState("");
  const [analyteFilter, setAnalyteFilter] = useState<AnalyteFilter>("all");
  const [analyteSort, setAnalyteSort] = useState<AnalyteSort>("median");
  const [globalIndex, setGlobalIndex] = useState<CultivarIntelligenceIndex | null>(null);
  const [globalIndexState, setGlobalIndexState] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");
  const [neighborMinimumSamples, setNeighborMinimumSamples] = useState(10);
  const [neighborMultiLabOnly, setNeighborMultiLabOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/terpenes/cultivars/manifest.json", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("manifest unavailable");
        return response.json() as Promise<Manifest>;
      })
      .then((next) => {
        if (cancelled) return;
        setManifest(next);
        setManifestState(next.shards?.length ? "ready" : "unavailable");
      })
      .catch(() => {
        if (!cancelled) setManifestState("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const primaryKey = shardKey(query);
  const compareKey = shardKey(compareQuery);

  useEffect(() => {
    if (manifestState !== "ready") return;

    const requested = [...new Set([primaryKey, compareKey].filter(Boolean))] as string[];
    for (const key of requested) {
      if (shardCache[key] || failedKeys.includes(key) || inflightKeys.current.has(key)) continue;
      const shard = manifest?.shards?.find((item) => item.key === key);
      if (!shard) continue;

      inflightKeys.current.add(key);
      fetch(`/data/terpenes/cultivars/${shard.filename}`, { cache: "force-cache" })
        .then(async (response) => {
          if (!response.ok) throw new Error("shard unavailable");
          return response.json() as Promise<CultivarProfileSummary[]>;
        })
        .then((records) => {
          inflightKeys.current.delete(key);
          setShardCache((current) => ({
            ...current,
            [key]: records.map(normalizeCultivarSummary),
          }));
          setFailedKeys((current) => current.filter((item) => item !== key));
        })
        .catch(() => {
          inflightKeys.current.delete(key);
          setFailedKeys((current) => (current.includes(key) ? current : [...current, key]));
        });
    }
  }, [compareKey, failedKeys, manifest, manifestState, primaryKey, shardCache]);

  const primaryRecords = primaryKey ? shardCache[primaryKey] ?? [] : [];
  const compareRecords = compareKey ? shardCache[compareKey] ?? [] : [];
  const matches = useMemo(() => matchesCultivar(primaryRecords, query), [primaryRecords, query]);
  const compareMatches = useMemo(
    () => matchesCultivar(compareRecords, compareQuery),
    [compareQuery, compareRecords],
  );

  const allCached = useMemo(() => Object.values(shardCache).flat(), [shardCache]);
  const selected = allCached.find((item) => item.cultivarSlug === selectedSlug) ?? null;
  const comparison = allCached.find((item) => item.cultivarSlug === compareSlug) ?? null;

  const activePrimaryShard = manifest?.shards?.find((item) => item.key === primaryKey);
  const activeCompareShard = manifest?.shards?.find((item) => item.key === compareKey);
  const primaryLoading = Boolean(
    query.trim() &&
    manifestState === "ready" &&
    primaryKey &&
    activePrimaryShard &&
    !shardCache[primaryKey] &&
    !failedKeys.includes(primaryKey),
  );
  const compareLoading = Boolean(
    compareQuery.trim() &&
    manifestState === "ready" &&
    compareKey &&
    activeCompareShard &&
    !shardCache[compareKey] &&
    !failedKeys.includes(compareKey),
  );

  const filteredAnalytes = useMemo(() => {
    if (!selected) return [];
    const needle = analyteQuery.trim().toLowerCase();

    return selected.analytes
      .filter((analyte) => {
        if (
          needle &&
          !analyte.normalizedKey.toLowerCase().includes(needle) &&
          !String(analyte.canonicalSlug ?? "").toLowerCase().includes(needle)
        ) {
          return false;
        }
        if (analyteFilter === "exact" && analyte.measurementKind !== "compound") return false;
        if (analyteFilter === "unresolved" && analyte.measurementKind === "compound") return false;
        return true;
      })
      .sort((a, b) => {
        if (analyteSort === "sample-depth") return b.n - a.n || b.median - a.median;
        if (analyteSort === "iqr") return (b.q3 - b.q1) - (a.q3 - a.q1);
        return b.median - a.median;
      });
  }, [analyteFilter, analyteQuery, analyteSort, selected]);

  const maxAnalyte = filteredAnalytes.length
    ? Math.max(0.001, ...filteredAnalytes.map((item) => item.max))
    : 1;

  const comparisonRows = useMemo(() => {
    if (!selected || !comparison) return [];
    const a = new Map(selected.analytes.map((item) => [item.normalizedKey, item]));
    const b = new Map(comparison.analytes.map((item) => [item.normalizedKey, item]));
    return [...new Set([...a.keys(), ...b.keys()])]
      .map((key) => ({ key, a: a.get(key) ?? null, b: b.get(key) ?? null }))
      .sort(
        (left, right) =>
          Math.max(right.a?.median ?? 0, right.b?.median ?? 0) -
          Math.max(left.a?.median ?? 0, left.b?.median ?? 0),
      );
  }, [comparison, selected]);

  const compareScale = comparisonRows.length
    ? Math.max(
        0.001,
        ...comparisonRows.flatMap((row) => [row.a?.median ?? 0, row.b?.median ?? 0]),
      )
    : 1;

  const similarity = selected && comparison ? medianVectorSimilarity(selected, comparison) : null;
  const sharedAnalytes = comparisonRows.filter((row) => row.a && row.b).length;
  const topSignal = selected ? topCategory(selected.topTerpenes) : null;
  const topChemotype = selected ? topCategory(selected.chemotypes) : null;

  const regionalAnalytes = useMemo(() => {
    if (!selected?.regionStrata?.length) return [];
    return selected.analytes
      .slice()
      .sort((a, b) => b.median - a.median)
      .slice(0, 10)
      .map((analyte) => analyte.normalizedKey);
  }, [selected]);

  const regionalMaxMedian = useMemo(() => {
    if (!selected?.regionStrata?.length) return 1;
    return Math.max(
      0.001,
      ...selected.regionStrata.flatMap((region) =>
        region.analytes.map((analyte) => analyte.median),
      ),
    );
  }, [selected]);

  const qualityFlags = useMemo(() => {
    if (!selected) return [];
    const flags: string[] = [];
    if (selected.sampleCount < 10) flags.push("limited sample depth");
    if (selected.labCount === 1) flags.push("single-lab group");
    else if ((selected.dataQuality.labs.largestShare ?? 0) >= 0.8) flags.push("lab-concentrated");
    if (selected.producerCount === 1) flags.push("single-producer group");
    else if ((selected.dataQuality.producers.largestShare ?? 0) >= 0.8) flags.push("producer-concentrated");
    if ((selected.dataQuality.largestRegionShare ?? 0) >= 0.8) flags.push("region-concentrated");
    if (selected.dataQuality.totalTerpeneCoverage < 0.8) flags.push("partial total-terpene coverage");
    return flags;
  }, [selected]);

  const selectedMedianVector = useMemo(
    () =>
      selected
        ? Object.fromEntries(selected.analytes.map((analyte) => [analyte.normalizedKey, analyte.median]))
        : {},
    [selected],
  );

  const nearestProfiles = useMemo(() => {
    if (!selected || !globalIndex) return [];
    return globalIndex.cultivars
      .filter((cultivar) => cultivar.cultivarSlug !== selected.cultivarSlug)
      .filter((cultivar) => cultivar.sampleCount >= neighborMinimumSamples)
      .filter((cultivar) => !neighborMultiLabOnly || cultivar.labCount >= 2)
      .map((cultivar) => ({
        cultivar,
        similarity: vectorSimilarity(selectedMedianVector, cultivar.vector),
        sharedAnalytes: sharedVectorKeys(selectedMedianVector, cultivar.vector),
      }))
      .filter((item) => item.similarity !== null && item.sharedAnalytes >= 5)
      .sort(
        (a, b) =>
          (b.similarity ?? 0) - (a.similarity ?? 0) ||
          b.sharedAnalytes - a.sharedAnalytes ||
          b.cultivar.sampleCount - a.cultivar.sampleCount,
      )
      .slice(0, 12);
  }, [globalIndex, neighborMinimumSamples, neighborMultiLabOnly, selected, selectedMedianVector]);

  function loadGlobalIndex() {
    if (globalIndexState === "loading" || globalIndexState === "ready") return;
    setGlobalIndexState("loading");
    fetch("/data/terpenes/cultivars/index.json", { cache: "force-cache" })
      .then(async (response) => {
        if (!response.ok) throw new Error("global cultivar intelligence index unavailable");
        return response.json() as Promise<CultivarIntelligenceIndex>;
      })
      .then((index) => {
        if (
          index.status !== "compiled" ||
          !Array.isArray(index.cultivars) ||
          !Array.isArray(index.analytes) ||
          index.cultivarCount < 100
        ) {
          throw new Error("global cultivar intelligence index is not compiled");
        }
        setGlobalIndex(index);
        setGlobalIndexState("ready");
      })
      .catch(() => {
        setGlobalIndex(null);
        setGlobalIndexState("unavailable");
      });
  }

  return (
    <div className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className="eyebrow">THC Terpene Atlas · repeated sample chemistry</p>
          <h1>Cultivar Chemistry Explorer</h1>
          <p>
            Search published cultivar labels, inspect repeated-sample terpene distributions, study source
            context, and compare two cultivar groups without pretending one strain name equals one fixed chemistry.
          </p>
        </div>
        <aside>
          <strong>Distribution, not destiny</strong>
          <p>
            Sample count, laboratory count, producer count, quartiles, ranges, region, product category,
            chemotype, maturity, environment, and storage all affect how cultivar chemistry should be read.
          </p>
        </aside>
      </header>

      <section className={styles.datasetBar} aria-label="Cultivar dataset status">
        <article><span>Source samples</span><strong>{manifest?.sourceSampleCount?.toLocaleString() ?? "—"}</strong></article>
        <article><span>Compiled cultivars</span><strong>{manifest?.cultivarCount?.toLocaleString() ?? "—"}</strong></article>
        <article><span>Public cultivar groups</span><strong>{manifest?.publishableCultivarCount?.toLocaleString() ?? "—"}</strong></article>
        <article><span>Public threshold</span><strong>{manifest?.minimumSamples ? `${manifest.minimumSamples}+ samples` : "5+ samples"}</strong></article>
        <article><span>Runtime status</span><strong>{manifestState === "ready" ? "Compiled" : manifestState === "loading" ? "Loading" : "Refresh required"}</strong></article>
      </section>

      <section className={styles.searchPanel}>
        <label>
          <span>Search normalized cultivar label</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try blue-dream, og, haze, kush..."
            autoComplete="off"
          />
        </label>
        <p>
          Search lazy-loads only the matching alphabetical runtime shard. Results are ordered by sample
          depth—not popularity, quality, potency, or effect.
        </p>
      </section>

      {manifestState === "unavailable" ? (
        <section className={styles.notice}>
          <strong>Cultivar runtime data has not been compiled into this deployment yet.</strong>
          <p>
            The page is wired to the production statistics pipeline. The refresh workflow downloads the
            registered CC0 source, preserves individual samples, compiles medians/quartiles/ranges and source
            context, then publishes only compact static shards.
          </p>
        </section>
      ) : null}

      <section className={styles.workspace}>
        <aside className={styles.resultsPanel}>
          <div className={styles.panelHeading}>
            <span>Search results</span>
            <strong>{query.trim() ? matches.length : 0}</strong>
          </div>

          {!query.trim() ? (
            <p className={styles.empty}>Enter a cultivar label to load its alphabetical runtime shard.</p>
          ) : primaryLoading ? (
            <p className={styles.empty}>Loading cultivar distribution shard…</p>
          ) : matches.length ? (
            <div className={styles.results}>
              {matches.map((cultivar) => (
                <button
                  type="button"
                  key={cultivar.cultivarSlug}
                  data-active={selected?.cultivarSlug === cultivar.cultivarSlug ? "" : undefined}
                  onClick={() => setSelectedSlug(cultivar.cultivarSlug)}
                >
                  <span>
                    <strong>{titleFromSlug(cultivar.cultivarSlug)}</strong>
                    <small>{cultivar.cultivarSlug}</small>
                  </span>
                  <b>{cultivar.sampleCount}</b>
                </button>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>No compiled cultivar labels match this search.</p>
          )}
        </aside>

        <main className={styles.detailPanel}>
          {selected ? (
            <>
              <div className={styles.detailHeader}>
                <div>
                  <p className="eyebrow">Measured cultivar distribution</p>
                  <h2>{titleFromSlug(selected.cultivarSlug)}</h2>
                  <span>{selected.cultivarSlug}</span>
                </div>
                <div className={styles.depthBadge} data-depth={selected.sampleDepthTier}>
                  <span>Sample depth</span>
                  <strong>{depthLabel(selected.sampleDepthTier)}</strong>
                </div>
              </div>

              <div className={styles.depthStats}>
                <article><span>Samples</span><strong>{selected.sampleCount}</strong></article>
                <article><span>Labs</span><strong>{selected.labCount}</strong></article>
                <article><span>Producers</span><strong>{selected.producerCount}</strong></article>
                <article><span>Analytes</span><strong>{selected.analytes.length}</strong></article>
                <article>
                  <span>Total terpenes median</span>
                  <strong>{selected.totalTerpenes ? `${selected.totalTerpenes.median.toFixed(2)}%` : "—"}</strong>
                </article>
                <article>
                  <span>Most frequent top terpene</span>
                  <strong>{topSignal ? analyteLabel(topSignal.value) : "—"}</strong>
                </article>
              </div>

              <section className={styles.qualitySection}>
                <div className={styles.sectionHeading}>
                  <div>
                    <p className="eyebrow">Data-quality factors</p>
                    <h3>Read the source breadth before reading the chemistry.</h3>
                  </div>
                  <p>
                    These are separate context factors, not a combined confidence score. Concentration can reflect
                    how the source dataset was assembled and does not by itself indicate poor analytical quality.
                  </p>
                </div>

                <div className={styles.qualityFlags}>
                  {qualityFlags.length ? (
                    qualityFlags.map((flag) => <span key={flag}>{flag}</span>)
                  ) : (
                    <span data-neutral="">No major concentration flags in the compiled context fields</span>
                  )}
                </div>

                <div className={styles.qualityGrid}>
                  <article>
                    <span>Laboratory breadth</span>
                    <strong>{selected.labCount} represented</strong>
                    <dl>
                      <div><dt>Largest lab share</dt><dd>{selected.dataQuality.labs.largestShare === null ? "—" : formatShare(selected.dataQuality.labs.largestShare)}</dd></div>
                      <div><dt>Effective lab count</dt><dd>{selected.dataQuality.labs.effectiveCount === null ? "—" : selected.dataQuality.labs.effectiveCount.toFixed(1)}</dd></div>
                      <div><dt>Concentration index</dt><dd>{selected.dataQuality.labs.concentrationIndex === null ? "—" : selected.dataQuality.labs.concentrationIndex.toFixed(2)}</dd></div>
                    </dl>
                  </article>
                  <article>
                    <span>Producer breadth</span>
                    <strong>{selected.producerCount} represented</strong>
                    <dl>
                      <div><dt>Largest producer share</dt><dd>{selected.dataQuality.producers.largestShare === null ? "—" : formatShare(selected.dataQuality.producers.largestShare)}</dd></div>
                      <div><dt>Effective producer count</dt><dd>{selected.dataQuality.producers.effectiveCount === null ? "—" : selected.dataQuality.producers.effectiveCount.toFixed(1)}</dd></div>
                      <div><dt>Concentration index</dt><dd>{selected.dataQuality.producers.concentrationIndex === null ? "—" : selected.dataQuality.producers.concentrationIndex.toFixed(2)}</dd></div>
                    </dl>
                  </article>
                  <article>
                    <span>Context-field coverage</span>
                    <strong>Source completeness</strong>
                    <dl>
                      <div><dt>Region</dt><dd>{formatShare(selected.dataQuality.regionCoverage)}</dd></div>
                      <div><dt>Product category</dt><dd>{formatShare(selected.dataQuality.productCategoryCoverage)}</dd></div>
                      <div><dt>Chemotype</dt><dd>{formatShare(selected.dataQuality.chemotypeCoverage)}</dd></div>
                    </dl>
                  </article>
                  <article>
                    <span>Chemistry coverage</span>
                    <strong>{formatShare(selected.dataQuality.totalTerpeneCoverage)} total-terpene coverage</strong>
                    <dl>
                      <div><dt>Largest region share</dt><dd>{selected.dataQuality.largestRegionShare === null ? "—" : formatShare(selected.dataQuality.largestRegionShare)}</dd></div>
                      <div><dt>Largest product share</dt><dd>{selected.dataQuality.largestProductCategoryShare === null ? "—" : formatShare(selected.dataQuality.largestProductCategoryShare)}</dd></div>
                      <div><dt>Largest chemotype share</dt><dd>{selected.dataQuality.largestChemotypeShare === null ? "—" : formatShare(selected.dataQuality.largestChemotypeShare)}</dd></div>
                    </dl>
                  </article>
                </div>

                <p className={styles.qualityGuardrail}>
                  Effective source count is derived from concentration, not a count of hidden identities. A lower
                  effective count means more observations came from a smaller share of sources. It does not label
                  a laboratory or producer as better or worse.
                </p>
              </section>

              {selected.totalTerpenes ? (
                <section className={styles.totalPanel}>
                  <div>
                    <p className="eyebrow">Total terpene distribution</p>
                    <h3>{selected.totalTerpenes.median.toFixed(2)}% median</h3>
                    <p>
                      Q1 {selected.totalTerpenes.q1.toFixed(2)}% · Q3 {selected.totalTerpenes.q3.toFixed(2)}% ·
                      observed {selected.totalTerpenes.min.toFixed(2)}–{selected.totalTerpenes.max.toFixed(2)}%
                    </p>
                  </div>
                  <div className={styles.totalScale}>
                    <div
                      className={styles.totalIqr}
                      style={{
                        left: `${(selected.totalTerpenes.q1 / Math.max(selected.totalTerpenes.max, 0.001)) * 100}%`,
                        width: `${((selected.totalTerpenes.q3 - selected.totalTerpenes.q1) / Math.max(selected.totalTerpenes.max, 0.001)) * 100}%`,
                      }}
                    />
                    <i
                      style={{
                        left: `${(selected.totalTerpenes.median / Math.max(selected.totalTerpenes.max, 0.001)) * 100}%`,
                      }}
                    />
                  </div>
                </section>
              ) : null}

              <section className={styles.contextSection}>
                <div className={styles.sectionHeading}>
                  <div>
                    <p className="eyebrow">Source context</p>
                    <h3>What kinds of samples make up this cultivar group?</h3>
                  </div>
                  <p>
                    These distributions describe the source dataset. They are not proof that every producer,
                    region, product, or chemotype carrying this label behaves the same way.
                  </p>
                </div>

                <div className={styles.contextGrid}>
                  <CategoryBars title="Region mix" items={selected.regions} />
                  <CategoryBars title="Product categories" items={selected.productCategories} />
                  <CategoryBars title="Chemotype labels" items={selected.chemotypes} />
                  <CategoryBars title="Reported top terpene" items={selected.topTerpenes} />
                </div>

                {topChemotype ? (
                  <p className={styles.contextGuardrail}>
                    Most frequent chemotype label in this source group: <strong>{topChemotype.value}</strong>{" "}
                    ({formatShare(topChemotype.share)} of samples with this grouping). This is descriptive source
                    context, not a cultivar-definition rule.
                  </p>
                ) : null}
              </section>

              <section className={styles.regionSection}>
                <div className={styles.sectionHeading}>
                  <div>
                    <p className="eyebrow">Regional source strata</p>
                    <h3>Same cultivar label, separated by source region.</h3>
                  </div>
                  <p>
                    A regional difference is descriptive, not causal. Region can be confounded with laboratory,
                    producer, product mix, time, genetics, cultivation, maturity, storage, and other source factors.
                  </p>
                </div>

                {selected.regionStrata.length ? (
                  <>
                    <div className={styles.regionCards}>
                      {selected.regionStrata.map((region) => (
                        <article key={region.region}>
                          <div>
                            <span>Region</span>
                            <strong>{region.region}</strong>
                          </div>
                          <dl>
                            <div><dt>Samples</dt><dd>{region.sampleCount}</dd></div>
                            <div><dt>Labs</dt><dd>{region.labCount}</dd></div>
                            <div><dt>Producers</dt><dd>{region.producerCount}</dd></div>
                            <div>
                              <dt>Total terpene median</dt>
                              <dd>{region.totalTerpenes ? `${region.totalTerpenes.median.toFixed(2)}%` : "—"}</dd>
                            </div>
                          </dl>
                        </article>
                      ))}
                    </div>

                    {selected.regionStrata.length >= 2 ? (
                      <div
                        className={styles.regionMatrix}
                        style={{ "--region-count": selected.regionStrata.length } as CSSProperties}
                      >
                        <div className={styles.regionMatrixHead}>
                          <strong>Analyte</strong>
                          {selected.regionStrata.map((region) => (
                            <strong key={region.region}>{region.region}</strong>
                          ))}
                        </div>
                        {regionalAnalytes.map((key) => (
                          <div className={styles.regionMatrixRow} key={key}>
                            <div>
                              <strong>{analyteLabel(key)}</strong>
                              <span>regional median</span>
                            </div>
                            {selected.regionStrata.map((region) => {
                              const analyte = region.analytes.find((item) => item.normalizedKey === key);
                              const width = analyte ? (analyte.median / regionalMaxMedian) * 100 : 0;
                              return (
                                <div key={region.region}>
                                  <div className={styles.regionMedianTrack}>
                                    <i style={{ width: `${width}%` }} />
                                  </div>
                                  <span>{analyte ? `${analyte.median.toFixed(3)}%` : "—"}</span>
                                  <small>{analyte ? `n=${analyte.n}` : "not enough data"}</small>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.regionNotice}>
                        Only one source region meets the minimum subgroup depth for this cultivar label, so a
                        between-region comparison is intentionally not shown.
                      </p>
                    )}

                    <p className={styles.regionGuardrail}>
                      Regional strata require the same minimum subgroup depth used for publication. They are
                      designed to reveal heterogeneity inside a cultivar label, not to attribute chemistry to geography.
                    </p>
                  </>
                ) : (
                  <p className={styles.regionNotice}>
                    No regional subgroup meets the minimum depth required for a separate distribution.
                  </p>
                )}
              </section>

              <section className={styles.distributionSection}>
                <div className={styles.sectionHeading}>
                  <div>
                    <p className="eyebrow">Analyte distributions</p>
                    <h3>Filter the terpene measurements.</h3>
                  </div>
                  <p>
                    Exact compound measurements and unresolved aggregate/isomer fields stay visibly distinct.
                    Range width can reflect biology, sampling, laboratory methods, or all three. Across-lab
                    median spread is descriptive source variation, not a laboratory-performance ranking.
                  </p>
                </div>

                <div className={styles.analyteControls}>
                  <label>
                    <span>Find analyte</span>
                    <input
                      type="search"
                      value={analyteQuery}
                      onChange={(event) => setAnalyteQuery(event.target.value)}
                      placeholder="myrcene, limonene, pinene..."
                    />
                  </label>
                  <label>
                    <span>Identity resolution</span>
                    <select value={analyteFilter} onChange={(event) => setAnalyteFilter(event.target.value as AnalyteFilter)}>
                      <option value="all">All measurements</option>
                      <option value="exact">Exact compound mapping</option>
                      <option value="unresolved">Aggregate / unresolved</option>
                    </select>
                  </label>
                  <label>
                    <span>Sort by</span>
                    <select value={analyteSort} onChange={(event) => setAnalyteSort(event.target.value as AnalyteSort)}>
                      <option value="median">Highest median</option>
                      <option value="sample-depth">Sample depth</option>
                      <option value="iqr">Widest IQR</option>
                    </select>
                  </label>
                  <div className={styles.filterCount}>
                    <span>Showing</span>
                    <strong>{filteredAnalytes.length}</strong>
                  </div>
                </div>

                <div className={styles.distributions}>
                  {filteredAnalytes.map((analyte) => {
                    const style = {
                      "--min": `${(analyte.min / maxAnalyte) * 100}%`,
                      "--q1": `${(analyte.q1 / maxAnalyte) * 100}%`,
                      "--median": `${(analyte.median / maxAnalyte) * 100}%`,
                      "--q3": `${(analyte.q3 / maxAnalyte) * 100}%`,
                      "--max": `${(analyte.max / maxAnalyte) * 100}%`,
                    } as CSSProperties;

                    return (
                      <article className={styles.analyte} key={analyte.normalizedKey}>
                        <div className={styles.analyteHeading}>
                          <div>
                            <strong>{analyteLabel(analyte.normalizedKey)}</strong>
                            <span>{analyte.measurementKind.replaceAll("-", " ")}</span>
                          </div>
                          <b>{analyte.median.toFixed(3)}% median</b>
                        </div>

                        <div className={styles.range} style={style} aria-label={`${analyteLabel(analyte.normalizedKey)} observed distribution`}>
                          <div className={styles.fullRange} />
                          <div className={styles.iqr} />
                          <i className={styles.median} />
                        </div>

                        <dl>
                          <div><dt>Min</dt><dd>{analyte.min.toFixed(3)}%</dd></div>
                          <div><dt>Q1</dt><dd>{analyte.q1.toFixed(3)}%</dd></div>
                          <div><dt>Median</dt><dd>{analyte.median.toFixed(3)}%</dd></div>
                          <div><dt>Q3</dt><dd>{analyte.q3.toFixed(3)}%</dd></div>
                          <div><dt>Max</dt><dd>{analyte.max.toFixed(3)}%</dd></div>
                          <div><dt>n / labs</dt><dd>{analyte.n} / {analyte.labCount}</dd></div>
                        </dl>

                        <div className={styles.analyteDiagnostics}>
                          <span>Sample coverage <strong>{formatShare(analyte.sampleCoverage)}</strong></span>
                          <span>
                            IQR / median{" "}
                            <strong>{analyte.relativeIqr === null ? "—" : `${analyte.relativeIqr.toFixed(2)}×`}</strong>
                          </span>
                          <span>
                            Lab-median span{" "}
                            <strong>
                              {analyte.labMedianDistribution && analyte.labMedianDistribution.n >= 2
                                ? `${analyte.labMedianDistribution.min.toFixed(3)}–${analyte.labMedianDistribution.max.toFixed(3)}%`
                                : "single/insufficient lab depth"}
                            </strong>
                          </span>
                        </div>

                        {analyte.measurementKind.includes("aggregate") ||
                        analyte.measurementKind.includes("unspecified") ? (
                          <p className={styles.identityNote}>
                            This source analyte does not resolve one exact isomer/stereochemical identity.
                            The Atlas preserves that uncertainty instead of silently assigning a specific compound.
                          </p>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className={styles.compareSection}>
                <div className={styles.sectionHeading}>
                  <div>
                    <p className="eyebrow">Cultivar comparison</p>
                    <h3>Compare median terpene vectors.</h3>
                  </div>
                  <p>
                    Similarity describes the shape of the compiled median terpene vectors. It is not an
                    effect score, genetic-identity test, quality ranking, or prediction of an individual sample.
                  </p>
                </div>

                <div className={styles.compareSearch}>
                  <label>
                    <span>Find second cultivar</span>
                    <input
                      type="search"
                      value={compareQuery}
                      onChange={(event) => setCompareQuery(event.target.value)}
                      placeholder="Search a second cultivar..."
                    />
                  </label>
                  {comparison ? (
                    <button type="button" onClick={() => { setCompareSlug(null); setCompareQuery(""); }}>
                      Clear comparison
                    </button>
                  ) : null}
                </div>

                {compareQuery.trim() && !comparison ? (
                  <div className={styles.compareMatches}>
                    {compareLoading ? (
                      <p>Loading comparison shard…</p>
                    ) : compareMatches.length ? (
                      compareMatches.slice(0, 12).map((cultivar) => (
                        <button
                          type="button"
                          key={cultivar.cultivarSlug}
                          disabled={cultivar.cultivarSlug === selected.cultivarSlug}
                          onClick={() => setCompareSlug(cultivar.cultivarSlug)}
                        >
                          <strong>{titleFromSlug(cultivar.cultivarSlug)}</strong>
                          <span>{cultivar.sampleCount} samples · {cultivar.labCount} labs</span>
                        </button>
                      ))
                    ) : (
                      <p>No compiled comparison cultivar matches this search.</p>
                    )}
                  </div>
                ) : null}

                {comparison ? (
                  <>
                    <div className={styles.compareSummary}>
                      <article>
                        <span>Primary</span>
                        <strong>{titleFromSlug(selected.cultivarSlug)}</strong>
                        <small>{selected.sampleCount} samples · {selected.labCount} labs</small>
                      </article>
                      <article>
                        <span>Comparison</span>
                        <strong>{titleFromSlug(comparison.cultivarSlug)}</strong>
                        <small>{comparison.sampleCount} samples · {comparison.labCount} labs</small>
                      </article>
                      <article>
                        <span>Shared analytes</span>
                        <strong>{sharedAnalytes}</strong>
                      </article>
                      <article>
                        <span>Median-vector similarity</span>
                        <strong>{similarity === null ? "—" : `${(similarity * 100).toFixed(0)}%`}</strong>
                      </article>
                    </div>

                    <div className={styles.compareTable}>
                      <div className={styles.compareLegend}>
                        <span data-profile="a">{titleFromSlug(selected.cultivarSlug)}</span>
                        <span data-profile="b">{titleFromSlug(comparison.cultivarSlug)}</span>
                      </div>
                      {comparisonRows.map((row) => (
                        <article key={row.key}>
                          <div className={styles.compareName}>
                            <strong>{analyteLabel(row.key)}</strong>
                            <span>{row.a && row.b ? "shared measurement" : row.a ? "primary only" : "comparison only"}</span>
                          </div>
                          <div className={styles.compareBars}>
                            <div>
                              <i style={{ width: `${((row.a?.median ?? 0) / compareScale) * 100}%` }} />
                              <span>{row.a ? `${row.a.median.toFixed(3)}%` : "—"}</span>
                            </div>
                            <div>
                              <i style={{ width: `${((row.b?.median ?? 0) / compareScale) * 100}%` }} />
                              <span>{row.b ? `${row.b.median.toFixed(3)}%` : "—"}</span>
                            </div>
                          </div>
                          <strong className={styles.delta}>
                            {row.a && row.b
                              ? `${(row.a.median - row.b.median) >= 0 ? "+" : ""}${(row.a.median - row.b.median).toFixed(3)}`
                              : "—"}
                          </strong>
                        </article>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className={styles.comparePrompt}>
                    Select a second compiled cultivar to compare median terpene distributions.
                  </div>
                )}
              </section>

              <section className={styles.globalSection}>
                <div className={styles.sectionHeading}>
                  <div>
                    <p className="eyebrow">Global cultivar chemistry</p>
                    <h3>Find chemistry neighbors and analyte prevalence.</h3>
                  </div>
                  <p>
                    This layer uses a compact index of all public cultivar groups. Similarity compares median
                    terpene-vector shape; prevalence distinguishes positive-median cultivar groups from simple
                    measurement coverage.
                  </p>
                </div>

                {globalIndexState !== "ready" ? (
                  <div className={styles.globalLoad}>
                    <div>
                      <strong>
                        {globalIndexState === "loading"
                          ? "Loading the global chemistry index…"
                          : globalIndexState === "unavailable"
                            ? "Global chemistry index is not compiled in this deployment."
                            : "Load the global chemistry reference on demand."}
                      </strong>
                      <p>
                        The index is separate from the alphabetical shards so ordinary cultivar searches stay light.
                        It contains compact median vectors and aggregate prevalence only—not raw laboratory rows.
                      </p>
                    </div>
                    {globalIndexState === "idle" ? (
                      <button type="button" onClick={loadGlobalIndex}>
                        Load global chemistry index
                      </button>
                    ) : null}
                  </div>
                ) : globalIndex ? (
                  <>
                    <div className={styles.globalSummary}>
                      <article><span>Public cultivar groups</span><strong>{globalIndex.cultivarCount.toLocaleString()}</strong></article>
                      <article><span>Indexed analytes</span><strong>{globalIndex.analyteCount}</strong></article>
                      <article><span>Source samples</span><strong>{globalIndex.sourceSampleCount.toLocaleString()}</strong></article>
                      <article><span>Nearest profiles shown</span><strong>{nearestProfiles.length}</strong></article>
                    </div>

                    <div className={styles.globalGrid}>
                      <section className={styles.neighborPanel}>
                        <div className={styles.subHeading}>
                          <div>
                            <span>Nearest median chemistry profiles</span>
                            <strong>{titleFromSlug(selected.cultivarSlug)}</strong>
                          </div>
                          <p>Cosine similarity on compiled median terpene vectors. Descriptive chemistry only.</p>
                        </div>

                        <div className={styles.neighborControls}>
                          <label>
                            <span>Minimum samples</span>
                            <select
                              value={neighborMinimumSamples}
                              onChange={(event) => setNeighborMinimumSamples(Number(event.target.value))}
                            >
                              <option value={5}>5+</option>
                              <option value={10}>10+</option>
                              <option value={20}>20+</option>
                              <option value={30}>30+</option>
                            </select>
                          </label>
                          <label className={styles.checkLabel}>
                            <input
                              type="checkbox"
                              checked={neighborMultiLabOnly}
                              onChange={(event) => setNeighborMultiLabOnly(event.target.checked)}
                            />
                            <span>Multi-lab groups only</span>
                          </label>
                        </div>

                        <div className={styles.neighbors}>
                          {nearestProfiles.map(({ cultivar, similarity, sharedAnalytes }) => (
                            <button
                              type="button"
                              key={cultivar.cultivarSlug}
                              onClick={() => {
                                setQuery(cultivar.cultivarSlug);
                                setSelectedSlug(cultivar.cultivarSlug);
                              }}
                            >
                              <div>
                                <strong>{titleFromSlug(cultivar.cultivarSlug)}</strong>
                                <span>{cultivar.sampleCount} samples · {cultivar.labCount} labs · {sharedAnalytes} shared analytes</span>
                              </div>
                              <b>{similarity === null ? "—" : `${(similarity * 100).toFixed(1)}%`}</b>
                            </button>
                          ))}
                        </div>
                      </section>

                      <section className={styles.prevalencePanel}>
                        <div className={styles.subHeading}>
                          <div>
                            <span>Global analyte prevalence</span>
                            <strong>Positive-median cultivar groups</strong>
                          </div>
                          <p>Coverage and positive-median prevalence are shown separately.</p>
                        </div>

                        <div className={styles.prevalenceList}>
                          {globalIndex.analytes.map((analyte) => (
                            <article key={analyte.normalizedKey}>
                              <div className={styles.prevalenceTop}>
                                <div>
                                  <strong>{analyteLabel(analyte.normalizedKey)}</strong>
                                  <span>{analyte.measurementKind.replaceAll("-", " ")}</span>
                                </div>
                                <b>{formatShare(analyte.positiveMedianShare)}</b>
                              </div>
                              <div className={styles.prevalenceTrack}>
                                <i style={{ width: `${Math.min(100, analyte.positiveMedianShare * 100)}%` }} />
                              </div>
                              <dl>
                                <div><dt>Positive median</dt><dd>{analyte.positiveMedianCultivars} groups</dd></div>
                                <div><dt>Measurement coverage</dt><dd>{analyte.cultivarCount} groups</dd></div>
                                <div><dt>Measured samples</dt><dd>{analyte.measuredSamples.toLocaleString()}</dd></div>
                                <div><dt>Median of cultivar medians</dt><dd>{analyte.cultivarMedianDistribution ? `${analyte.cultivarMedianDistribution.median.toFixed(3)}%` : "—"}</dd></div>
                              </dl>
                            </article>
                          ))}
                        </div>
                      </section>
                    </div>

                    <p className={styles.globalGuardrail}>{globalIndex.interpretation}</p>
                  </>
                ) : null}
              </section>
            </>
          ) : (
            <div className={styles.selectPrompt}>
              <p className="eyebrow">Cultivar chemistry workspace</p>
              <h2>Search and select a compiled cultivar.</h2>
              <p>
                The workspace will show repeated-sample chemistry, sample context, analyte distributions,
                identity-resolution warnings, and a second-cultivar comparison. No single measurement is
                presented as the permanent profile of a cultivar name.
              </p>
            </div>
          )}
        </main>
      </section>

      <section className={styles.source}>
        <div>
          <p className="eyebrow">Dataset provenance</p>
          <h2>{sourceName}</h2>
          <p>
            Runtime summaries are derived from the registered published dataset. The browser preserves sample,
            laboratory, producer, regional, product, chemotype, and analyte context while keeping raw laboratory
            identifiers out of the public runtime.
          </p>
          {manifest?.sourceSha256 ? (
            <small>
              Runtime source checksum: {manifest.sourceSha256.slice(0, 16)}… · generated {manifest.generatedAt ?? "unknown"}
            </small>
          ) : null}
        </div>
        {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noreferrer">Open source dataset ↗</a> : null}
      </section>
    </div>
  );
}
