import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

function shardKey(record) {
  const basis = String(record.name || record.inchiKey || record.sourceRecordId || "").trim().toLowerCase();
  const first = basis.normalize("NFKD").replace(/[^a-z0-9]/g, "")[0];
  return first && /[a-z0-9]/.test(first) ? first : "other";
}

function publicRecord(record) {
  return {
    id: record.sourceRecordId,
    name: record.name,
    formula: record.formula,
    molecularWeight: record.molecularWeight,
    inchiKey: record.inchiKey,
    canonicalSmiles: record.canonicalSmiles,
    classification: record.classification,
    candidateConfidence: record.candidateConfidence,
    reviewStatus: record.reviewStatus,
  };
}

const [, , inputArg, outputArg, releaseArg = "unknown"] = process.argv;
if (!inputArg || !outputArg) {
  console.error("Usage: node scripts/terpenes/build-runtime-shards.mjs <normalized.jsonl> <output-dir> [release]");
  process.exit(1);
}

const inputPath = path.resolve(inputArg);
const outputDir = path.resolve(outputArg);
await fs.promises.mkdir(outputDir, { recursive: true });

const shards = new Map();
const input = readline.createInterface({
  input: fs.createReadStream(inputPath, { encoding: "utf8" }),
  crlfDelay: Infinity,
});

let total = 0;
for await (const line of input) {
  if (!line.trim()) continue;
  const record = JSON.parse(line);
  const key = shardKey(record);
  if (!shards.has(key)) shards.set(key, []);
  shards.get(key).push(publicRecord(record));
  total += 1;
}

const manifestShards = [];
for (const [key, records] of [...shards.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  records.sort((a, b) => String(a.name ?? a.id ?? "").localeCompare(String(b.name ?? b.id ?? "")));
  const filename = `terpenes-${key}.json`;
  await fs.promises.writeFile(
    path.join(outputDir, filename),
    JSON.stringify(records) + "\n",
    "utf8",
  );
  manifestShards.push({ key, filename, count: records.length });
}

const manifest = {
  schemaVersion: 1,
  source: "COCONUT",
  sourceRelease: releaseArg,
  generatedAt: new Date().toISOString(),
  recordCount: total,
  shardStrategy: "normalized-first-alphanumeric-character-of-name-or-identity",
  shards: manifestShards,
};

await fs.promises.writeFile(
  path.join(outputDir, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8",
);

console.log(JSON.stringify(manifest, null, 2));
