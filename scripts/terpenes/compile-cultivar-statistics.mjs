import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { buildCultivarProfileSummaries } from "./lib/cultivar-statistics.mjs";

const [, , inputArg, outputArg, minimumArg = "3"] = process.argv;
if (!inputArg || !outputArg) {
  console.error("Usage: node scripts/terpenes/compile-cultivar-statistics.mjs <samples.jsonl> <output.json> [minimumSamples]");
  process.exit(1);
}

const samples = [];
const input = readline.createInterface({
  input: fs.createReadStream(path.resolve(inputArg), { encoding: "utf8" }),
  crlfDelay: Infinity,
});
for await (const line of input) {
  if (line.trim()) samples.push(JSON.parse(line));
}

const minimumSamples = Math.max(1, Number.parseInt(minimumArg, 10) || 3);
const cultivars = buildCultivarProfileSummaries(samples, { minimumSamples });
const output = {
  schemaVersion: 1,
  sourceId: "SMITH-2022-COMMERCIAL-US",
  generatedAt: new Date().toISOString(),
  sampleCount: samples.length,
  cultivarCount: cultivars.length,
  publishableCultivarCount: cultivars.filter((cultivar) => cultivar.publishable).length,
  minimumSamples,
  cultivars,
};

await fs.promises.mkdir(path.dirname(path.resolve(outputArg)), { recursive: true });
await fs.promises.writeFile(path.resolve(outputArg), JSON.stringify(output, null, 2) + "\n", "utf8");
console.log(JSON.stringify({
  sampleCount: output.sampleCount,
  cultivarCount: output.cultivarCount,
  publishableCultivarCount: output.publishableCultivarCount,
  minimumSamples,
}, null, 2));
