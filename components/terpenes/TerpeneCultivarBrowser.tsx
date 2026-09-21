"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { CultivarProfileSummary } from "@/lib/terpenes/cultivar-types";
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
  shards?: Array<{ key: string; filename: string; count: number }>;
  status?: string;
  sourceUrl?: string;
  sourceBytes?: number;
  sourceSha256?: string;
};

type Props = {
  sourceName: string;
  sourceUrl: string | null;
};

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

function formatGeneratedAt(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function shortFingerprint(value?: string) {
  if (!value) return "—";
  return value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-8)}` : value;
}

export function TerpeneCultivarBrowser({ sourceName, sourceUrl }: Props) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [manifestState, setManifestState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [query, setQuery] = useState("");
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [cultivars, setCultivars] = useState<CultivarProfileSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);

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

  const key = shardKey(query);

  useEffect(() => {
    if (!key || manifestState !== "ready" || key === loadedKey || failedKey === key) return;

    const shard = manifest?.shards?.find((item) => item.key === key);
    if (!shard) return;

    let cancelled = false;
    fetch(`/data/terpenes/cultivars/${shard.filename}`, { cache: "force-cache" })
      .then(async (response) => {
        if (!response.ok) throw new Error("shard unavailable");
        return response.json() as Promise<CultivarProfileSummary[]>;
      })
      .then((records) => {
        if (cancelled) return;
        setCultivars(records);
        setLoadedKey(key);
        setFailedKey(null);
        setSelectedSlug((current) =>
          current && records.some((item) => item.cultivarSlug === current)
            ? current
            : null,
        );
      })
      .catch(() => {
        if (cancelled) return;
        setCultivars([]);
        setFailedKey(key);
      });

    return () => {
      cancelled = true;
    };
  }, [failedKey, key, loadedKey, manifest, manifestState]);

  const activeShard = manifest?.shards?.find((item) => item.key === key);
  const shardLoading = Boolean(
    query.trim() &&
    manifestState === "ready" &&
    key &&
    activeShard &&
    key !== loadedKey &&
    failedKey !== key,
  );
  const shardMissing = Boolean(
    query.trim() &&
    manifestState === "ready" &&
    key &&
    (!activeShard || failedKey === key),
  );

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle || key !== loadedKey) return [];
    return cultivars
      .filter((cultivar) => cultivar.cultivarSlug.includes(needle))
      .sort((a, b) => b.sampleCount - a.sampleCount || a.cultivarSlug.localeCompare(b.cultivarSlug))
      .slice(0, 80);
  }, [cultivars, key, loadedKey, query]);

  const selected =
    matches.find((item) => item.cultivarSlug === selectedSlug) ??
    cultivars.find((item) => item.cultivarSlug === selectedSlug) ??
    null;

  const maxAnalyte = selected
    ? Math.max(0.001, ...selected.analytes.map((item) => item.max))
    : 1;

  return (
    <div className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className="eyebrow">THC Terpene Atlas · repeated sample chemistry</p>
          <h1>Cultivar Terpene Distributions</h1>
          <p>
            Search cultivar labels from a published multi-laboratory dataset and inspect distributions
            instead of treating one strain name or one certificate of analysis as a permanent chemistry value.
          </p>
        </div>
        <aside>
          <strong>Distribution, not destiny</strong>
          <p>
            Cultivar labels are grouping labels. Sample count, laboratory count, quartiles, ranges,
            methods, environment, maturity, and storage all matter when interpreting the chemistry.
          </p>
        </aside>
      </header>

      <section className={styles.datasetBar} aria-label="Cultivar dataset status">
        <article>
          <span>Usable labeled samples</span>
          <strong>{manifest?.sourceSampleCount?.toLocaleString() ?? "—"}</strong>
        </article>
        <article>
          <span>Compiled cultivar labels</span>
          <strong>{manifest?.cultivarCount?.toLocaleString() ?? "—"}</strong>
        </article>
        <article>
          <span>Public summaries</span>
          <strong>{manifest?.publishableCultivarCount?.toLocaleString() ?? "—"}</strong>
        </article>
        <article>
          <span>Public threshold</span>
          <strong>{manifest?.minimumSamples ? `${manifest.minimumSamples}+ samples` : "5+ samples"}</strong>
        </article>
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
          Search begins after the first alphanumeric character and lazy-loads only the matching shard.
          Results are ordered by sample depth, not popularity or quality.
        </p>
      </section>

      {manifestState === "unavailable" ? (
        <section className={styles.notice}>
          <strong>Cultivar runtime data has not been compiled into this deployment yet.</strong>
          <p>
            The page is wired to the production statistics pipeline. The refresh workflow downloads the
            registered CC0 source, preserves individual samples, compiles medians/quartiles/ranges, and
            publishes only compact static shards.
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
          ) : shardLoading ? (
            <p className={styles.empty}>Loading cultivar distribution shard…</p>
          ) : shardMissing ? (
            <p className={styles.empty}>No compiled cultivar shard is available for this search.</p>
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
                <article><span>Reported analytes</span><strong>{selected.analytes.length}</strong></article>
                <article><span>Minimum threshold</span><strong>{selected.minimumSamples}</strong></article>
              </div>

              <div className={styles.distributions}>
                {selected.analytes.map((analyte) => {
                  const scale = maxAnalyte;
                  const style = {
                    "--min": `${(analyte.min / scale) * 100}%`,
                    "--q1": `${(analyte.q1 / scale) * 100}%`,
                    "--median": `${(analyte.median / scale) * 100}%`,
                    "--q3": `${(analyte.q3 / scale) * 100}%`,
                    "--max": `${(analyte.max / scale) * 100}%`,
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
                        <div><dt>n</dt><dd>{analyte.n}</dd></div>
                      </dl>

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
            </>
          ) : (
            <div className={styles.selectPrompt}>
              <p className="eyebrow">Cultivar distribution viewer</p>
              <h2>Search and select a compiled cultivar.</h2>
              <p>
                The selected record will show repeated-sample quartiles and ranges. No single number is
                presented as the permanent terpene profile of a cultivar name.
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
            Runtime summaries are derived from the registered published dataset. The 34,224-sample runtime
            count represents records with terpene data and a usable normalized cultivar label; it is a filtered
            browser subset, not the broader source-study sample count. The browser preserves sample depth and
            laboratory depth and does not expose private raw laboratory identifiers.
          </p>
          <div className={styles.sourceMeta}>
            <span><b>Runtime</b>{manifestState === "ready" ? "compiled" : manifestState}</span>
            <span><b>Generated</b>{formatGeneratedAt(manifest?.generatedAt)}</span>
            <span><b>Source bytes</b>{manifest?.sourceBytes?.toLocaleString() ?? "—"}</span>
            <span title={manifest?.sourceSha256 ?? undefined}><b>Source SHA-256</b>{shortFingerprint(manifest?.sourceSha256)}</span>
          </div>
        </div>
        {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noreferrer">Open source dataset ↗</a> : null}
      </section>
    </div>
  );
}
