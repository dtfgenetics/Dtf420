import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "data/terpenes/reviewed-pubchem-manifest.json"), "utf8"),
);
const cache = JSON.parse(
  fs.readFileSync(path.join(root, "data/terpenes/reviewed-pubchem-natural-occurrence.json"), "utf8"),
);
const builder = fs.readFileSync(
  path.join(root, "scripts/terpenes/build-reviewed-pubchem-natural-occurrence.mjs"),
  "utf8",
);
const helper = fs.readFileSync(path.join(root, "lib/terpenes/natural-occurrence.ts"), "utf8");
const chapterTypes = fs.readFileSync(path.join(root, "lib/terpenes/chapter-types.ts"), "utf8");
const chapters = fs.readFileSync(path.join(root, "lib/terpenes/chapters.ts"), "utf8");
const page = fs.readFileSync(path.join(root, "app/learn/terpenes/[slug]/page.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "app/learn/terpenes/[slug]/page.module.css"), "utf8");
const dashboard = fs.readFileSync(path.join(root, "app/learn/terpenes/chapters/page.tsx"), "utf8");
const workflow = fs.readFileSync(
  path.join(root, ".github/workflows/refresh-reviewed-terpene-occurrence.yml"),
  "utf8",
);

if (cache.schemaVersion !== "1.0.0" || cache.sourceId !== "PUBCHEM-PUG-VIEW") {
  throw new Error("Invalid reviewed natural occurrence cache header.");
}
if (!cache.headings?.includes("Natural Occurrence")) {
  throw new Error("Natural occurrence cache missing Natural Occurrence heading.");
}

for (const token of [
  "fetchPugViewHeading",
  "normalizePugViewEvidence",
  '"Natural Occurrence"',
]) {
  if (!builder.includes(token)) {
    throw new Error(`Natural occurrence builder missing: ${token}`);
  }
}

for (const token of [
  "getReviewedNaturalOccurrenceRecord",
  "countNaturalOccurrenceEvidence",
  "getReviewedNaturalOccurrenceCacheStatus",
]) {
  if (!helper.includes(token)) {
    throw new Error(`Natural occurrence query layer missing: ${token}`);
  }
}

if (!chapterTypes.includes("naturalOccurrenceEvidenceCount")) {
  throw new Error("Chapter context missing naturalOccurrenceEvidenceCount.");
}
for (const token of [
  "naturalOccurrenceEvidenceCount > 0",
  '"linked-evidence"',
  '"reviewed-foundation"',
  '"PUBCHEM-PUG-VIEW"',
  '"LOTUS"',
]) {
  if (!chapters.includes(token)) {
    throw new Error(`Natural occurrence readiness missing: ${token}`);
  }
}

for (const token of [
  "curated teaching summaries",
  "source databases",
  "not automatically a quantified",
  "Structured organism normalization",
  "LOTUS",
  "naturalOccurrenceRecord",
]) {
  if (!page.includes(token)) {
    throw new Error(`Natural occurrence chapter UI missing: ${token}`);
  }
}

for (const token of [
  ".occurrenceSection",
  ".occurrenceGuardrail",
  ".occurrenceEvidenceGrid",
]) {
  if (!css.includes(token)) {
    throw new Error(`Natural occurrence styling missing: ${token}`);
  }
}

for (const token of [
  "getReviewedNaturalOccurrenceRecord",
  "countNaturalOccurrenceEvidence",
  "naturalOccurrenceEvidenceCount",
]) {
  if (!dashboard.includes(token)) {
    throw new Error(`Natural occurrence dashboard wiring missing: ${token}`);
  }
}

for (const token of [
  "Refresh Reviewed Terpene Natural Occurrence",
  "build-reviewed-pubchem-natural-occurrence.mjs",
  "reviewed-pubchem-natural-occurrence.json",
  "reviewed-pubchem-manifest.json",
]) {
  if (!workflow.includes(token)) {
    throw new Error(`Natural occurrence refresh workflow missing: ${token}`);
  }
}

if (cache.status === "compiled") {
  if (!Array.isArray(cache.compounds) || cache.compounds.length === 0 || cache.compounds.length > manifest.compounds.length) {
    throw new Error("Compiled natural occurrence cache must be a non-empty subset of the reviewed manifest.");
  }

  for (const record of cache.compounds) {
    if (!record.slug || !record.pubchemCid || !Array.isArray(record.occurrence?.["Natural Occurrence"])) {
      throw new Error(`Incomplete natural occurrence cache record: ${record.slug ?? "unknown"}`);
    }
  }
} else if (cache.status !== "not-generated") {
  throw new Error("Natural occurrence cache status must be compiled or not-generated.");
}

console.log(
  `Reviewed natural occurrence evidence verified: cache status=${cache.status}.`,
);
