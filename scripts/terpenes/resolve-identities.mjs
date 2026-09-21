import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { once } from "node:events";
import { resolveIdentityRecords } from "./lib/identity.mjs";

async function readJsonl(filePath) {
  const records = [];
  const lines = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  for await (const line of lines) {
    if (!line.trim()) continue;
    records.push(JSON.parse(line));
  }
  return records;
}

async function writeJsonl(filePath, records) {
  const output = fs.createWriteStream(filePath, { encoding: "utf8" });
  for (const record of records) {
    if (!output.write(JSON.stringify(record) + "\n")) await once(output, "drain");
  }
  output.end();
  await once(output, "finish");
}

const [, , inputArg, outputDirArg] = process.argv;
if (!inputArg || !outputDirArg) {
  console.error("Usage: node scripts/terpenes/resolve-identities.mjs <input.jsonl> <output-dir>");
  process.exit(1);
}

const inputPath = path.resolve(inputArg);
const outputDir = path.resolve(outputDirArg);
await fs.promises.mkdir(outputDir, { recursive: true });

const records = await readJsonl(inputPath);
const result = resolveIdentityRecords(records);

await writeJsonl(path.join(outputDir, "identity-clusters.jsonl"), result.clusters);
await writeJsonl(path.join(outputDir, "identity-conflicts.jsonl"), result.conflicts);
await writeJsonl(path.join(outputDir, "identity-unresolved.jsonl"), result.unresolved);

const summary = {
  inputRecords: records.length,
  clusters: result.clusters.length,
  conflicts: result.conflicts.length,
  unresolved: result.unresolved.length,
  rules: [
    "full InChIKey",
    "PubChem CID",
    "exact canonical structure",
    "never merge by name alone",
  ],
};

await fs.promises.writeFile(
  path.join(outputDir, "identity-summary.json"),
  JSON.stringify(summary, null, 2) + "\n",
  "utf8",
);

console.log(JSON.stringify(summary, null, 2));
