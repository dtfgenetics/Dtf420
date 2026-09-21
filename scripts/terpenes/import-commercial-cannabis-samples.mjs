import fs from "node:fs";
import path from "node:path";
import { once } from "node:events";
import { parseCsvRows, headerIndex, valueFor } from "./lib/csv-stream.mjs";
import { COMMERCIAL_CANNABIS_TERPENE_ANALYTES } from "./lib/commercial-cannabis-analytes.mjs";

function parseNumber(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCultivarSlug(value) {
  const slug = String(value ?? "").trim().toLowerCase();
  return slug || null;
}

export function normalizeCommercialCannabisRow(row, indexes) {
  const sampleId = valueFor(row, indexes, ["u_id"]);
  const cultivarSlug = normalizeCultivarSlug(valueFor(row, indexes, ["strain_slug"]));
  const hasTerpsRaw = valueFor(row, indexes, ["has_terps"]);
  const hasTerps = ["true", "1", "yes"].includes(String(hasTerpsRaw ?? "").toLowerCase());

  if (!sampleId || !cultivarSlug || !hasTerps) return null;

  const measurements = [];
  for (const [sourceAnalyte, mapping] of Object.entries(COMMERCIAL_CANNABIS_TERPENE_ANALYTES)) {
    const value = parseNumber(valueFor(row, indexes, [sourceAnalyte]));
    if (value === null || value < 0) continue;

    measurements.push({
      sourceAnalyte,
      normalizedKey: mapping.normalizedKey,
      canonicalSlug: mapping.canonicalSlug,
      measurementKind: mapping.measurementKind,
      value,
      unit: "percent-w-w",
    });
  }

  if (!measurements.length) return null;

  return {
    sampleId: `smith-2022:${sampleId}`,
    sourceId: "SMITH-2022-COMMERCIAL-US",
    sourceRecordId: String(sampleId),
    labId: valueFor(row, indexes, ["lab_id"]),
    cultivarOriginal: null,
    cultivarSlug,
    cultivarLabelSource: "dataset-normalized-strain-slug",
    producerId: valueFor(row, indexes, ["anon_producer"]),
    region: valueFor(row, indexes, ["region"]),
    productCategory: valueFor(row, indexes, ["product_category"]),
    chemotype: valueFor(row, indexes, ["chemotype"]),
    totalTerpenes: parseNumber(valueFor(row, indexes, ["total_terps"])),
    topTerpeneSourceField: valueFor(row, indexes, ["top_terp_f"]),
    measurements,
  };
}

async function writeLine(stream, object) {
  if (!stream.write(JSON.stringify(object) + "\n")) await once(stream, "drain");
}

export async function importCommercialCannabisSamples({ inputPath, outputPath }) {
  const rows = parseCsvRows(inputPath);
  const first = await rows.next();
  if (first.done) throw new Error("Commercial cannabis CSV is empty");

  const indexes = headerIndex(first.value);
  for (const required of ["u_id", "lab_id", "strain_slug", "has_terps"]) {
    if (!indexes.has(required)) throw new Error(`Missing required commercial cannabis column: ${required}`);
  }

  const output = fs.createWriteStream(outputPath, { encoding: "utf8" });
  let scanned = 0;
  let imported = 0;
  let measurements = 0;

  for await (const row of rows) {
    scanned += 1;
    const sample = normalizeCommercialCannabisRow(row, indexes);
    if (!sample) continue;
    imported += 1;
    measurements += sample.measurements.length;
    await writeLine(output, sample);
  }

  output.end();
  await once(output, "finish");
  return { scanned, imported, measurements, outputPath };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , inputArg, outputArg] = process.argv;
  if (!inputArg || !outputArg) {
    console.error("Usage: node scripts/terpenes/import-commercial-cannabis-samples.mjs <input.csv> <output.jsonl>");
    process.exit(1);
  }
  const inputPath = path.resolve(inputArg);
  const outputPath = path.resolve(outputArg);
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  const result = await importCommercialCannabisSamples({ inputPath, outputPath });
  console.log(JSON.stringify(result, null, 2));
}
