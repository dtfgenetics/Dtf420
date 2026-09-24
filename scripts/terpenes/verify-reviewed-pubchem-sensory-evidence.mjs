import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const cache = JSON.parse(
  fs.readFileSync(path.join(root, "data/terpenes/reviewed-pubchem-sensory-evidence.json"), "utf8"),
);
const builder = fs.readFileSync(
  path.join(root, "scripts/terpenes/build-reviewed-pubchem-sensory-evidence.mjs"),
  "utf8",
);
const pugViewLib = fs.readFileSync(
  path.join(root, "scripts/terpenes/lib/pubchem-pug-view.mjs"),
  "utf8",
);
const helper = fs.readFileSync(path.join(root, "lib/terpenes/sensory-evidence.ts"), "utf8");
const chapterTypes = fs.readFileSync(path.join(root, "lib/terpenes/chapter-types.ts"), "utf8");
const chapters = fs.readFileSync(path.join(root, "lib/terpenes/chapters.ts"), "utf8");
const page = fs.readFileSync(path.join(root, "app/learn/terpenes/[slug]/page.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "app/learn/terpenes/[slug]/page.module.css"), "utf8");
const dashboard = fs.readFileSync(path.join(root, "app/learn/terpenes/chapters/page.tsx"), "utf8");
const workflow = fs.readFileSync(
  path.join(root, ".github/workflows/refresh-reviewed-terpene-sensory.yml"),
  "utf8",
);
const sourceRegistry = JSON.parse(
  fs.readFileSync(path.join(root, "data/terpenes/source-registry.json"), "utf8"),
);

const headings = ["Odor", "Odor Threshold", "Taste"];

if (cache.schemaVersion !== "1.0.0" || cache.sourceId !== "PUBCHEM-PUG-VIEW") {
  throw new Error("Invalid reviewed sensory evidence cache header.");
}

for (const heading of headings) {
  if (!cache.headings?.includes(heading)) {
    throw new Error(`Sensory evidence cache missing heading: ${heading}`);
  }
  if (!builder.includes(`"${heading}"`)) {
    throw new Error(`Sensory evidence builder missing heading: ${heading}`);
  }
}

for (const token of [
  "fetchPugViewHeading",
  "normalizePugViewEvidence",
]) {
  if (!builder.includes(token)) {
    throw new Error(`Sensory builder missing shared parser call: ${token}`);
  }
}

for (const token of [
  "collectPugViewValueStrings",
  "buildPugViewReferenceMap",
  "findPugViewHeadingSections",
  "normalizePugViewEvidence",
  "fetchPugViewHeading",
  "response.status === 404",
]) {
  if (!pugViewLib.includes(token)) {
    throw new Error(`Shared PUG-View parser missing: ${token}`);
  }
}

for (const token of [
  "getReviewedSensoryEvidenceRecord",
  "countSensoryEvidence",
  "getReviewedSensoryEvidenceCacheStatus",
]) {
  if (!helper.includes(token)) {
    throw new Error(`Sensory evidence query layer missing: ${token}`);
  }
}

if (!chapterTypes.includes("sensoryEvidenceCount") || !chapters.includes("sensoryEvidenceCount")) {
  throw new Error("Chapter readiness is not wired to sensory evidence counts.");
}
if (!chapters.includes('"linked-evidence"') || !chapters.includes('"reviewed-foundation"')) {
  throw new Error("Sensory chapter readiness does not distinguish linked evidence from foundation.");
}

for (const token of [
  "source-preserved sensory reports",
  "Odor thresholds depend on medium, method, purity",
  "A lower threshold does not mean",
  "sensoryEvidenceRecord",
  "sensoryEvidenceCount",
]) {
  if (!page.includes(token)) {
    throw new Error(`Compound sensory evidence UI missing: ${token}`);
  }
}

for (const token of [
  ".sensorySection",
  ".sensoryGuardrail",
  ".sensoryEvidenceGrid",
  ".sensoryEvidenceEntries",
]) {
  if (!css.includes(token)) {
    throw new Error(`Sensory evidence styling missing: ${token}`);
  }
}

for (const token of [
  "getReviewedSensoryEvidenceRecord",
  "countSensoryEvidence",
  "sensoryEvidenceCount",
]) {
  if (!dashboard.includes(token)) {
    throw new Error(`Chapter readiness dashboard missing sensory evidence wiring: ${token}`);
  }
}

for (const token of [
  "Refresh Reviewed Terpene Sensory Evidence",
  "build-reviewed-pubchem-sensory-evidence.mjs",
  "reviewed-pubchem-sensory-evidence.json",
  "reviewed-pubchem-manifest.json",
]) {
  if (!workflow.includes(token)) {
    throw new Error(`Sensory evidence refresh workflow missing: ${token}`);
  }
}

const source = sourceRegistry.sources?.find((item) => item.id === "PUBCHEM-PUG-VIEW");
if (!source) {
  throw new Error("PUBCHEM-PUG-VIEW source is not registered.");
}

if (cache.status === "compiled") {
  if (!Array.isArray(cache.compounds) || cache.compounds.length === 0 || cache.compounds.length > manifest.compounds.length) {
    throw new Error("Compiled sensory evidence cache must be a non-empty subset of the reviewed manifest.");
  }

  let evidenceCount = 0;
  for (const record of cache.compounds) {
    if (!record.slug || !record.pubchemCid || !record.sensory) {
      throw new Error(`Incomplete sensory evidence record: ${record.slug ?? "unknown"}`);
    }
    for (const heading of headings) {
      if (!Array.isArray(record.sensory[heading])) {
        throw new Error(`Missing sensory evidence array: ${record.slug} / ${heading}`);
      }
      evidenceCount += record.sensory[heading].length;
    }
  }

  if (evidenceCount < 5) {
    throw new Error(`Compiled sensory evidence count is implausibly low: ${evidenceCount}`);
  }
} else if (cache.status !== "not-generated") {
  throw new Error("Sensory evidence cache status must be compiled or not-generated.");
}

console.log(
  `Reviewed sensory evidence verified: cache status=${cache.status}, headings=${headings.length}.`,
);
