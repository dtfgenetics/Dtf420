import fs from "node:fs";
import path from "node:path";

function shardKey(slug) {
  const first = String(slug ?? "").trim().toLowerCase()[0];
  return first && /[a-z0-9]/.test(first) ? first : "other";
}

const [, , inputArg, outputDirArg] = process.argv;
if (!inputArg || !outputDirArg) {
  console.error("Usage: node scripts/terpenes/build-cultivar-runtime-shards.mjs <cultivar-stats.json> <output-dir>");
  process.exit(1);
}

const input = JSON.parse(fs.readFileSync(path.resolve(inputArg), "utf8"));
const outputDir = path.resolve(outputDirArg);
await fs.promises.mkdir(outputDir, { recursive: true });

const publishable = (input.cultivars ?? []).filter((cultivar) => cultivar.publishable);
const shards = new Map();
for (const cultivar of publishable) {
  const key = shardKey(cultivar.cultivarSlug);
  if (!shards.has(key)) shards.set(key, []);
  shards.get(key).push(cultivar);
}

const manifestShards = [];
for (const [key, cultivars] of [...shards.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  cultivars.sort((a, b) => a.cultivarSlug.localeCompare(b.cultivarSlug));
  const filename = `cultivars-${key}.json`;
  await fs.promises.writeFile(
    path.join(outputDir, filename),
    JSON.stringify(cultivars) + "\n",
    "utf8",
  );
  manifestShards.push({ key, filename, count: cultivars.length });
}

const manifest = {
  schemaVersion: 4,
  sourceId: input.sourceId,
  sourceSampleCount: input.sampleCount,
  cultivarCount: input.cultivarCount,
  publishableCultivarCount: publishable.length,
  minimumSamples: input.minimumSamples,
  generatedAt: new Date().toISOString(),
  shardStrategy: "first-alphanumeric-character-of-cultivar-slug",
  shards: manifestShards,
};

await fs.promises.writeFile(
  path.join(outputDir, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8",
);

console.log(JSON.stringify(manifest, null, 2));
