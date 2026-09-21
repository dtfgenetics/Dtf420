import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { importCommercialCannabisSamples } from "./import-commercial-cannabis-samples.mjs";
import { buildCultivarProfileSummaries, sampleDepthTier, summarizeMeasurements } from "./lib/cultivar-statistics.mjs";

const root = process.cwd();
const fixture = path.join(root, "scripts/terpenes/fixtures/commercial-cannabis-samples.csv");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "dtf-cultivar-"));
const normalized = path.join(temp, "samples.jsonl");

const importResult = await importCommercialCannabisSamples({ inputPath: fixture, outputPath: normalized });
if (importResult.scanned !== 5) throw new Error(`Expected 5 rows scanned, got ${importResult.scanned}`);
if (importResult.imported !== 4) throw new Error(`Expected 4 terpene samples imported, got ${importResult.imported}`);

const samples = fs.readFileSync(normalized, "utf8").trim().split("\n").map(JSON.parse);
const blueDream = samples.filter((sample) => sample.cultivarSlug === "blue-dream");
if (blueDream.length !== 3) throw new Error("Expected three Blue Dream fixture samples");

const ocimene = blueDream[0].measurements.find((item) => item.sourceAnalyte === "tot_ocimene");
if (!ocimene || ocimene.canonicalSlug !== null || ocimene.measurementKind !== "aggregate-isomers") {
  throw new Error("Aggregate ocimene must not be mapped to a single canonical isomer");
}

const myrcene = blueDream[0].measurements.find((item) => item.sourceAnalyte === "myrcene");
if (!myrcene || myrcene.canonicalSlug !== "beta-myrcene") {
  throw new Error("Known dataset myrcene analyte was not normalized to beta-myrcene");
}

const stats = summarizeMeasurements([0.7, 0.75, 0.65]);
if (stats.median !== 0.7 || stats.min !== 0.65 || stats.max !== 0.75) {
  throw new Error("Robust measurement summary is incorrect");
}

if (sampleDepthTier(4, 2) !== "insufficient") throw new Error("Four samples should remain insufficient for default public depth");
if (sampleDepthTier(12, 2) !== "moderate-multi-lab") throw new Error("Sample-depth tiering is incorrect");

const summaries = buildCultivarProfileSummaries(samples, { minimumSamples: 3 });
const blueSummary = summaries.find((item) => item.cultivarSlug === "blue-dream");
if (!blueSummary?.publishable) throw new Error("Three-sample cultivar should be publishable at minimumSamples=3");
if (blueSummary.labCount !== 2) throw new Error(`Expected Blue Dream labCount 2, got ${blueSummary.labCount}`);

const other = summaries.find((item) => item.cultivarSlug === "other-cultivar");
if (other?.publishable) throw new Error("Single-sample cultivar must not be publishable at minimumSamples=3");

const myrceneStats = blueSummary.analytes.find((item) => item.normalizedKey === "beta-myrcene");
if (!myrceneStats || myrceneStats.median !== 0.7 || myrceneStats.n !== 3) {
  throw new Error("Blue Dream myrcene summary did not preserve sample distribution");
}

console.log("Cultivar sample import and statistics verification passed.");
