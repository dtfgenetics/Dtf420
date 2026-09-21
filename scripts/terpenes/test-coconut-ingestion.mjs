import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { normalizeCoconutCsv } from "./normalize-coconut.mjs";

const root = process.cwd();
const fixture = path.join(root, "scripts/terpenes/fixtures/coconut-sample.csv");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "dtf-terpenes-"));
const normalized = path.join(temp, "normalized.jsonl");
const runtime = path.join(temp, "runtime");

const summary = await normalizeCoconutCsv({
  inputPath: fixture,
  outputPath: normalized,
  release: "fixture-2026-09",
});

if (summary.scanned !== 4) throw new Error(`Expected 4 rows scanned, got ${summary.scanned}`);
if (summary.candidates !== 3) throw new Error(`Expected 3 terpene/isoprenoid candidates, got ${summary.candidates}`);

const rows = fs.readFileSync(normalized, "utf8").trim().split("\n").map(JSON.parse);
if (!rows.some((row) => row.sourceRecordId === "CNP0000003" && row.sourceOrganisms.includes("\n"))) {
  throw new Error("Streaming CSV parser did not preserve quoted multiline fields");
}
if (rows.some((row) => row.sourceRecordId === "CNP0000002")) {
  throw new Error("Non-terpenoid alkaloid leaked into candidate output");
}
if (!rows.every((row) => row.reviewStatus === "unreviewed-source-candidate")) {
  throw new Error("COCONUT candidates must remain unreviewed at import");
}

execFileSync(process.execPath, [
  path.join(root, "scripts/terpenes/build-runtime-shards.mjs"),
  normalized,
  runtime,
  "fixture-2026-09",
], { stdio: "pipe" });

const manifest = JSON.parse(fs.readFileSync(path.join(runtime, "manifest.json"), "utf8"));
if (manifest.recordCount !== 3) throw new Error(`Expected 3 runtime records, got ${manifest.recordCount}`);
if (!manifest.shards.length) throw new Error("Runtime sharder created no shards");

console.log("COCONUT ingestion fixture passed.");
