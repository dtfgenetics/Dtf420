import fs from "node:fs/promises";
import path from "node:path";
import {
  fetchPugViewHeading,
  normalizePugViewEvidence,
} from "./lib/pubchem-pug-view.mjs";

const manifestPath = path.resolve(process.argv[2] ?? "data/terpenes/reviewed-pubchem-manifest.json");
const outputPath = path.resolve(process.argv[3] ?? "data/terpenes/reviewed-pubchem-experimental-properties.json");

const headings = [
  "Boiling Point",
  "Melting Point",
  "Vapor Pressure",
  "Density",
  "Flash Point",
  "Refractive Index",
];

const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
if (!Array.isArray(manifest.compounds) || manifest.compounds.length === 0) {
  throw new Error("Reviewed PubChem manifest has no compounds.");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const compounds = [];
for (const item of manifest.compounds) {
  const properties = {};

  for (const heading of headings) {
    const payload = await fetchPugViewHeading(item.pubchemCid, heading);
    properties[heading] = normalizePugViewEvidence(payload?.Record, heading);
    await sleep(180);
  }

  compounds.push({
    slug: item.slug,
    pubchemCid: item.pubchemCid,
    sourceId: "PUBCHEM-PUG-VIEW",
    fetchedAt: new Date().toISOString(),
    properties,
  });
}

const output = {
  schemaVersion: "1.0.0",
  status: "compiled",
  sourceId: "PUBCHEM-PUG-VIEW",
  generatedAt: new Date().toISOString(),
  headings,
  compounds,
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(output, null, 2) + "\n", "utf8");

const evidenceCount = compounds.reduce(
  (sum, compound) =>
    sum + Object.values(compound.properties).reduce((inner, entries) => inner + entries.length, 0),
  0,
);

console.log(
  `Compiled ${evidenceCount} reported experimental-property entries across ${compounds.length} reviewed compounds.`,
);
