import fs from "node:fs/promises";
import path from "node:path";

const PUBCHEM_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
const MIN_DELAY_MS = 250;

function usage() {
  console.error("Usage: node scripts/terpenes/enrich-pubchem.mjs <identifiers.json> <output.json>");
  process.exit(1);
}

const [, , inputArg, outputArg] = process.argv;
if (!inputArg || !outputArg) usage();

const inputPath = path.resolve(inputArg);
const outputPath = path.resolve(outputArg);
const input = JSON.parse(await fs.readFile(inputPath, "utf8"));
const compounds = Array.isArray(input) ? input : input.compounds;

if (!Array.isArray(compounds)) {
  throw new Error("PubChem enrichment input must be an array or contain a compounds array");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchProperties(cid) {
  const properties = [
    "Title",
    "MolecularFormula",
    "MolecularWeight",
    "CanonicalSMILES",
    "IsomericSMILES",
    "InChI",
    "InChIKey",
    "IUPACName",
    "XLogP",
    "TPSA",
    "Complexity",
    "HBondDonorCount",
    "HBondAcceptorCount",
    "RotatableBondCount",
    "ExactMass",
    "MonoisotopicMass",
  ].join(",");

  const response = await fetch(
    `${PUBCHEM_BASE}/compound/cid/${encodeURIComponent(cid)}/property/${properties}/JSON`,
    { headers: { "User-Agent": "DTF-Terpene-Atlas/2.0" } },
  );

  if (!response.ok) {
    throw new Error(`PubChem request failed for CID ${cid}: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  return payload?.PropertyTable?.Properties?.[0] ?? null;
}

function normalizeRecord(identifier, properties) {
  if (!properties) {
    return {
      slug: identifier.slug,
      pubchemCid: identifier.pubchemCid,
      status: "not-found",
      sourceId: "PUBCHEM",
    };
  }

  return {
    slug: identifier.slug,
    pubchemCid: identifier.pubchemCid,
    status: "enriched",
    sourceId: "PUBCHEM",
    title: properties.Title ?? null,
    iupacName: properties.IUPACName ?? null,
    molecularFormula: properties.MolecularFormula ?? null,
    molecularWeight: properties.MolecularWeight ?? null,
    exactMass: properties.ExactMass ?? null,
    monoisotopicMass: properties.MonoisotopicMass ?? null,
    canonicalSmiles: properties.CanonicalSMILES ?? null,
    isomericSmiles: properties.IsomericSMILES ?? null,
    inchi: properties.InChI ?? null,
    inchiKey: properties.InChIKey ?? null,
    xlogP: properties.XLogP ?? null,
    topologicalPolarSurfaceArea: properties.TPSA ?? null,
    complexity: properties.Complexity ?? null,
    hydrogenBondDonorCount: properties.HBondDonorCount ?? null,
    hydrogenBondAcceptorCount: properties.HBondAcceptorCount ?? null,
    rotatableBondCount: properties.RotatableBondCount ?? null,
  };
}

const records = [];
for (const identifier of compounds) {
  if (!identifier?.slug || !identifier?.pubchemCid) {
    throw new Error("Each reviewed compound identifier requires slug and pubchemCid");
  }

  const properties = await fetchProperties(identifier.pubchemCid);
  records.push(normalizeRecord(identifier, properties));
  await sleep(MIN_DELAY_MS);
}

const output = {
  schemaVersion: "1.0.0",
  sourceId: "PUBCHEM",
  generatedAt: new Date().toISOString(),
  status: "compiled",
  records,
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(output, null, 2) + "\n", "utf8");

const enrichedCount = records.filter((record) => record.status === "enriched").length;
console.log(`Wrote ${enrichedCount}/${records.length} PubChem specification records to ${outputPath}`);
