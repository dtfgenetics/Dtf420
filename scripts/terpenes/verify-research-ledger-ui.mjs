import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ledger = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/evidence-ledger.json"), "utf8"));
const registry = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/source-registry.json"), "utf8"));
const researchLib = fs.readFileSync(path.join(root, "lib/terpenes/research.ts"), "utf8");
const researchPage = fs.readFileSync(path.join(root, "app/learn/terpenes/research/page.tsx"), "utf8");
const researchUi = fs.readFileSync(path.join(root, "components/terpenes/TerpeneResearchLedger.tsx"), "utf8");

const sources = new Map(registry.sources.map((source) => [source.id, source]));
const publicReviewStates = new Set(["source-verified", "editorial-reviewed"]);
let publicRecords = 0;

for (const record of ledger.records) {
  if (!publicReviewStates.has(record.reviewStatus)) continue;
  publicRecords += 1;
  const source = sources.get(record.sourceId);
  if (!source) throw new Error("Reviewed evidence has unregistered source: " + record.id);
  const navigable = Boolean(source.sourceUrl || source.doi || source.repository || source.datasetPath);
  if (!navigable) throw new Error("Reviewed evidence source lacks public locator: " + record.sourceId);
}

for (const token of [
  "cannabis-occurrence",
  "terpene-synthase-function",
  "cultivar-sample",
  "sensory-descriptor",
  "biological-effect",
  "biosynthetic-pathway",
]) {
  if (!researchLib.includes(token)) throw new Error("Evidence-scope helper missing claim type: " + token);
}

for (const token of ["Terpene Research Ledger", "Different study types answer different questions", "Chemical analysis", "Functional enzyme assay", "Controlled human experiments"]) {
  if (!researchPage.includes(token)) throw new Error("Research page missing interpretation contract: " + token);
}

for (const token of ["Search evidence", "What this evidence establishes", "Open source", "Review state", "Evidence landscape", "Coverage is not the same thing as evidence strength", "matrixNote"]) {
  if (!researchUi.includes(token)) throw new Error("Research ledger UI missing transparency contract: " + token);
}

if (publicRecords === 0) throw new Error("Research Ledger has no reviewed public evidence records");
console.log("Terpene Research Ledger verified: " + publicRecords + " reviewed records with navigable sources.");


if (!researchLib.includes('record.studyType === "human-experimental"')) {
  throw new Error("Research evidence-scope helper missing human-experimental guardrail");
}

const requiredBiologicalSources = [
  "GERTSCH-2008-BCP-CB2",
  "PEI-2024-BCP-LINALOOL-HUMAN",
  "LORENZETTI-1991-MYRCENE-ANIMAL",
  "HEUBERGER-2001-LIMONENE-HUMAN",
  "FALK-1993-LIMONENE-INHALATION",
];
for (const sourceId of requiredBiologicalSources) {
  if (!sources.has(sourceId)) throw new Error("Biological research source missing: " + sourceId);
}

const requiredBiologicalEvidence = [
  "gertsch2008-bcp-cb2-binding",
  "pei2024-bcp-human-inhalation",
  "pei2024-linalool-human-inhalation",
  "lorenzetti1991-myrcene-animal-antinociception",
  "heuberger2001-limonene-human-enantiomers",
  "falk1993-limonene-human-inhalation-pk",
  "borges2026-humulene-anxiolyticlike-zebrafish",
];
const evidenceIds = new Set(ledger.records.map((record) => record.id));
for (const evidenceId of requiredBiologicalEvidence) {
  if (!evidenceIds.has(evidenceId)) throw new Error("Biological research evidence missing: " + evidenceId);
}
