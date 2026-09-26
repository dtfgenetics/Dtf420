import fs from "node:fs/promises";
import path from "node:path";
import {
  fetchPugViewHeading,
  normalizePugViewEvidence,
} from "./lib/pubchem-pug-view.mjs";

const manifestPath = path.resolve(process.argv[2] ?? "data/terpenes/reviewed-pubchem-manifest.json");
const outputPath = path.resolve(process.argv[3] ?? "data/terpenes/reviewed-pubchem-natural-occurrence.json");

const headings = ["Natural Occurrence"];
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

if (!Array.isArray(manifest.compounds) || manifest.compounds.length === 0) {
  throw new Error("Reviewed PubChem manifest has no compounds.");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchHeadingWithRetry(pubchemCid, heading, attempts = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetchPugViewHeading(pubchemCid, heading);
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      await sleep(350 * attempt);
    }
  }

  throw lastError;
}

const compounds = [];

for (const item of manifest.compounds) {
  const occurrence = {};

  for (const heading of headings) {
    const payload = await fetchHeadingWithRetry(item.pubchemCid, heading);
    occurrence[heading] = normalizePugViewEvidence(payload?.Record, heading, 75);
    await sleep(180);
  }

  const naturalEntries = occurrence["Natural Occurrence"] ?? [];
  const referencedEntries = naturalEntries.filter((entry) => (entry.references ?? []).length > 0);

  compounds.push({
    slug: item.slug,
    pubchemCid: item.pubchemCid,
    sourceId: "PUBCHEM-PUG-VIEW",
    fetchedAt: new Date().toISOString(),
    occurrence,
    evidenceCount: naturalEntries.length,
    referencedEvidenceCount: referencedEntries.length,
  });
}

const evidenceCount = compounds.reduce((sum, compound) => sum + compound.evidenceCount, 0);
const referencedEvidenceCount = compounds.reduce(
  (sum, compound) => sum + compound.referencedEvidenceCount,
  0,
);
const compoundsWithEvidence = compounds.filter((compound) => compound.evidenceCount > 0).length;
const compoundsWithReferencedEvidence = compounds.filter(
  (compound) => compound.referencedEvidenceCount > 0,
).length;

const output = {
  schemaVersion: "1.1.0",
  status: "compiled",
  sourceId: "PUBCHEM-PUG-VIEW",
  generatedAt: new Date().toISOString(),
  headings,
  coverage: {
    manifestCompoundCount: manifest.compounds.length,
    compoundsWithEvidence,
    compoundsWithReferencedEvidence,
    evidenceCount,
    referencedEvidenceCount,
    compoundCoverageShare: manifest.compounds.length
      ? compoundsWithEvidence / manifest.compounds.length
      : 0,
  },
  compounds,
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(output, null, 2) + "\n", "utf8");

console.log(
  `Compiled ${evidenceCount} natural-occurrence reports (${referencedEvidenceCount} referenced) across ${compoundsWithEvidence}/${manifest.compounds.length} reviewed compounds.`,
);
