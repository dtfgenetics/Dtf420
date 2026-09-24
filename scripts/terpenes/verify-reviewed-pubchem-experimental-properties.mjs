import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const cache = JSON.parse(
  fs.readFileSync(path.join(root, "data/terpenes/reviewed-pubchem-experimental-properties.json"), "utf8"),
);
const sourceRegistry = JSON.parse(
  fs.readFileSync(path.join(root, "data/terpenes/source-registry.json"), "utf8"),
);
const builder = fs.readFileSync(
  path.join(root, "scripts/terpenes/build-reviewed-pubchem-experimental-properties.mjs"),
  "utf8",
);
const pugViewLib = fs.readFileSync(
  path.join(root, "scripts/terpenes/lib/pubchem-pug-view.mjs"),
  "utf8",
);
const helper = fs.readFileSync(
  path.join(root, "lib/terpenes/experimental-properties.ts"),
  "utf8",
);
const chapterTypes = fs.readFileSync(path.join(root, "lib/terpenes/chapter-types.ts"), "utf8");
const chapters = fs.readFileSync(path.join(root, "lib/terpenes/chapters.ts"), "utf8");
const page = fs.readFileSync(path.join(root, "app/learn/terpenes/[slug]/page.tsx"), "utf8");
const pageCss = fs.readFileSync(path.join(root, "app/learn/terpenes/[slug]/page.module.css"), "utf8");
const dashboard = fs.readFileSync(path.join(root, "app/learn/terpenes/chapters/page.tsx"), "utf8");
const workflow = fs.readFileSync(
  path.join(root, ".github/workflows/refresh-reviewed-terpene-properties.yml"),
  "utf8",
);

const expectedHeadings = [
  "Boiling Point",
  "Melting Point",
  "Vapor Pressure",
  "Density",
  "Flash Point",
  "Refractive Index",
];

if (cache.schemaVersion !== "1.0.0" || cache.sourceId !== "PUBCHEM-PUG-VIEW") {
  throw new Error("Invalid reviewed experimental-property cache header.");
}

for (const heading of expectedHeadings) {
  if (!cache.headings?.includes(heading)) {
    throw new Error(`Experimental-property cache missing heading: ${heading}`);
  }
  if (!builder.includes(`"${heading}"`)) {
    throw new Error(`Experimental-property builder missing heading: ${heading}`);
  }
}

for (const token of [
  "collectPugViewValueStrings",
  "buildPugViewReferenceMap",
  "findPugViewHeadingSections",
  "normalizePugViewEvidence",
  "reportedValue",
  "references",
  "response.status === 404",
]) {
  if (!(builder + "\n" + pugViewLib).includes(token)) {
    throw new Error(`Experimental-property parser/builder missing contract: ${token}`);
  }
}

for (const token of [
  "getReviewedExperimentalPropertyRecord",
  "countExperimentalPropertyEvidence",
  "getReviewedExperimentalPropertyCacheStatus",
]) {
  if (!helper.includes(token)) {
    throw new Error(`Experimental-property query layer missing: ${token}`);
  }
}

for (const token of [
  "experimentalPropertyEvidenceCount",
]) {
  if (!chapterTypes.includes(token) || !chapters.includes(token)) {
    throw new Error(`Chapter readiness missing experimental-property coverage: ${token}`);
  }
}

for (const token of [
  "Reported experimental properties",
  "Keep reported values attached to their source and conditions",
  "PubChem aggregates reported experimental values",
  "reported boiling point must not be presented as an “ideal vaping temperature.”",
  "experimentalPropertyRecord",
]) {
  if (!page.includes(token)) {
    throw new Error(`Experimental-property chapter UI missing: ${token}`);
  }
}

for (const token of [
  ".experimentalPropertySection",
  ".experimentalPropertyGrid",
  ".experimentalPropertyEntries",
  ".propertyReferences",
]) {
  if (!pageCss.includes(token)) {
    throw new Error(`Experimental-property chapter styling missing: ${token}`);
  }
}

for (const token of [
  "getReviewedExperimentalPropertyRecord",
  "countExperimentalPropertyEvidence",
  "experimentalPropertyEvidenceCount",
]) {
  if (!dashboard.includes(token)) {
    throw new Error(`Chapter readiness dashboard missing experimental-property wiring: ${token}`);
  }
}

const pugViewSource = sourceRegistry.sources?.find((source) => source.id === "PUBCHEM-PUG-VIEW");
if (!pugViewSource) {
  throw new Error("PUBCHEM-PUG-VIEW source is not registered.");
}
if (!String(pugViewSource.notes ?? "").includes("Do not collapse multiple reports")) {
  throw new Error("PUBCHEM-PUG-VIEW source is missing conflicting-value guardrail.");
}

for (const token of [
  "build-reviewed-pubchem-experimental-properties.mjs",
  "reviewed-pubchem-experimental-properties.json",
  "experimental property",
]) {
  if (!workflow.toLowerCase().includes(token.toLowerCase())) {
    throw new Error(`Reviewed property refresh workflow missing experimental layer: ${token}`);
  }
}

if (cache.status === "compiled") {
  if (!Array.isArray(cache.compounds) || cache.compounds.length === 0 || cache.compounds.length > manifest.compounds.length) {
    throw new Error("Compiled experimental-property cache must be a non-empty subset of the reviewed manifest.");
  }

  let evidenceCount = 0;
  for (const record of cache.compounds) {
    if (!record.slug || !record.pubchemCid || !record.properties) {
      throw new Error(`Incomplete experimental-property record: ${record.slug ?? "unknown"}`);
    }
    for (const heading of expectedHeadings) {
      if (!Array.isArray(record.properties[heading])) {
        throw new Error(`Experimental-property record missing heading array: ${record.slug} / ${heading}`);
      }
      evidenceCount += record.properties[heading].length;
    }
  }

  if (evidenceCount < 10) {
    throw new Error(`Compiled experimental-property evidence count is implausibly low: ${evidenceCount}`);
  }
} else if (cache.status !== "not-generated") {
  throw new Error("Experimental-property cache status must be compiled or not-generated.");
}

console.log(
  `Reviewed experimental-property layer verified: cache status=${cache.status}, headings=${expectedHeadings.length}.`,
);
