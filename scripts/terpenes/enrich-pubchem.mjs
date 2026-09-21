import fs from "node:fs/promises";
import path from "node:path";

const PUBCHEM_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
const MIN_DELAY_MS = 250;

function usage() {
  console.error("Usage: node scripts/terpenes/enrich-pubchem.mjs <input.json> <output.json>");
  process.exit(1);
}

const [, , inputArg, outputArg] = process.argv;
if (!inputArg || !outputArg) usage();

const inputPath = path.resolve(inputArg);
const outputPath = path.resolve(outputArg);
const records = JSON.parse(await fs.readFile(inputPath, "utf8"));

if (!Array.isArray(records)) {
  throw new Error("PubChem enrichment input must be a JSON array");
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
  ].join(",");

  const response = await fetch(
    `${PUBCHEM_BASE}/compound/cid/${encodeURIComponent(cid)}/property/${properties}/JSON`,
    { headers: { "User-Agent": "DTF-Terpene-Atlas/1.0" } },
  );

  if (!response.ok) {
    throw new Error(`PubChem request failed for CID ${cid}: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  return payload?.PropertyTable?.Properties?.[0] ?? null;
}

const enriched = [];
for (const record of records) {
  if (!record || typeof record !== "object") continue;

  if (!record.pubchemCid) {
    enriched.push({ ...record, pubchem: null, enrichmentStatus: "missing-cid" });
    continue;
  }

  const properties = await fetchProperties(record.pubchemCid);
  enriched.push({
    ...record,
    pubchem: properties,
    enrichmentStatus: properties ? "enriched" : "not-found",
    enrichedAt: new Date().toISOString(),
  });

  await sleep(MIN_DELAY_MS);
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(enriched, null, 2) + "\n", "utf8");
console.log(`Wrote ${enriched.length} PubChem-enriched records to ${outputPath}`);
