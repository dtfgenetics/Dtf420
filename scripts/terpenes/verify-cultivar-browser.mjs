import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ui = fs.readFileSync(path.join(root, "components/terpenes/TerpeneCultivarBrowser.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "components/terpenes/TerpeneCultivarBrowser.module.css"), "utf8");
const page = fs.readFileSync(path.join(root, "app/learn/terpenes/cultivars/page.tsx"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "public/data/terpenes/cultivars/manifest.json"), "utf8"));
const workflow = fs.readFileSync(path.join(root, ".github/workflows/refresh-terpene-cultivars.yml"), "utf8");
const registry = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/source-registry.json"), "utf8"));

for (const token of [
  "Cultivar Terpene Distributions",
  "Distribution, not destiny",
  "Search normalized cultivar label",
  "Measured cultivar distribution",
  "Sample depth",
  "Usable labeled samples",
  "Compiled cultivar labels",
  "Public summaries",
  "Source SHA-256",
  "Generated",
  "This source analyte does not resolve one exact isomer",
]) {
  if (!ui.includes(token)) throw new Error(`Cultivar browser UI missing contract: ${token}`);
}

for (const token of [".fullRange", ".iqr", ".median", ".depthBadge", ".identityNote"]) {
  if (!css.includes(token)) throw new Error(`Cultivar browser styling missing: ${token}`);
}

if (!page.includes('path: "/learn/terpenes/cultivars"')) {
  throw new Error("Cultivar browser route metadata is missing");
}

if (manifest.sourceId !== "SMITH-2022-COMMERCIAL-US") {
  throw new Error("Cultivar runtime manifest uses the wrong sourceId");
}

if (manifest.status === "compiled") {
  if (!manifest.sourceSampleCount || manifest.sourceSampleCount < 10000) {
    throw new Error("Compiled cultivar manifest has implausibly low source sample count");
  }
  if (!manifest.publishableCultivarCount || manifest.publishableCultivarCount < 100) {
    throw new Error("Compiled cultivar manifest has implausibly low public cultivar count");
  }
  if (!Array.isArray(manifest.shards) || manifest.shards.length < 10) {
    throw new Error("Compiled cultivar manifest has too few runtime shards");
  }
  if (!Number.isFinite(manifest.sourceBytes) || manifest.sourceBytes < 10000000) {
    throw new Error("Compiled cultivar manifest is missing plausible source byte provenance");
  }
  if (!/^[a-f0-9]{64}$/i.test(String(manifest.sourceSha256 ?? ""))) {
    throw new Error("Compiled cultivar manifest is missing a valid SHA-256 source fingerprint");
  }
  if (!manifest.generatedAt || Number.isNaN(Date.parse(manifest.generatedAt))) {
    throw new Error("Compiled cultivar manifest is missing a valid generatedAt timestamp");
  }
} else {
  if (manifest.status !== "not-generated") {
    throw new Error("Bootstrap cultivar manifest must explicitly say not-generated");
  }
  if ((manifest.shards ?? []).length !== 0) {
    throw new Error("Bootstrap cultivar manifest must not contain fake runtime shards");
  }
}

for (const token of [
  "workflow_dispatch:",
  'cron: "17 5 1 * *"',
  "permissions:",
  "contents: write",
  "preproc_lab_data_pub_20220218.csv",
  "import-commercial-cannabis-samples.mjs",
  "compile-cultivar-statistics.mjs",
  "build-cultivar-runtime-shards.mjs",
  'rm -rf "$OUTPUT_DIR"',
  "git pull --rebase origin main",
]) {
  if (!workflow.includes(token)) throw new Error(`Cultivar refresh workflow missing contract: ${token}`);
}

const registered = registry.sources.find((source) => source.id === "SMITH-2022-COMMERCIAL-US");
if (!registered) throw new Error("Cultivar browser source is not registered");

for (const phrase of ["best strain", "top strain", "guaranteed effect", "cultivar name guarantees", "fixed terpene percentage"]) {
  if ((ui + "\n" + page).toLowerCase().includes(phrase)) {
    throw new Error(`Cultivar browser contains prohibited shortcut: ${phrase}`);
  }
}

console.log(
  `Cultivar browser verified: manifest status=${manifest.status}, source=${manifest.sourceId}, runtime shards=${manifest.shards?.length ?? 0}.`,
);
