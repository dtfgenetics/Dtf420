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
const registryRuntime = path.join(temp, "registry-runtime");

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

execFileSync(process.execPath, [
  path.join(root, "scripts/terpenes/build-universal-registry.mjs"),
  normalized,
  registryRuntime,
  "fixture-2026-09",
], { stdio: "pipe" });

const registryManifest = JSON.parse(
  fs.readFileSync(path.join(registryRuntime, "manifest.json"), "utf8"),
);
if (registryManifest.resolvedIdentityRecords !== 3) {
  throw new Error(`Expected 3 resolved registry identities, got ${registryManifest.resolvedIdentityRecords}`);
}
if (registryManifest.familyCounts.monoterpene !== 1) {
  throw new Error("Fixture limonene was not assigned to monoterpene family");
}
if (registryManifest.familyCounts.sesquiterpene !== 1) {
  throw new Error("Fixture sesquiterpene was not assigned to sesquiterpene family");
}
if (registryManifest.familyCounts.tetraterpene !== 1) {
  throw new Error("Fixture carotenoid was not assigned to tetraterpene family");
}
if (registryManifest.familyCounts.unresolved !== 0) {
  throw new Error("Fixture unexpectedly produced unresolved terpene-family records");
}

const mono = JSON.parse(
  fs.readFileSync(path.join(registryRuntime, "registry-monoterpene.json"), "utf8"),
);
if (mono[0]?.reviewStatus !== "unreviewed-source-candidate") {
  throw new Error("Universal registry candidates must remain explicitly unreviewed");
}
if (mono[0]?.identity?.type !== "full-inchikey") {
  throw new Error("Universal registry did not prefer the fixture full InChIKey");
}

console.log("COCONUT ingestion and universal registry fixture passed.");
