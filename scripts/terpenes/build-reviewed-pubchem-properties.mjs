import fs from "node:fs/promises";
import path from "node:path";

const PUBCHEM_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
const manifestPath = path.resolve(process.argv[2] ?? "data/terpenes/reviewed-pubchem-manifest.json");
const outputPath = path.resolve(process.argv[3] ?? "data/terpenes/reviewed-pubchem-properties.json");

const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
if (!Array.isArray(manifest.compounds) || manifest.compounds.length === 0) {
  throw new Error("Reviewed PubChem manifest has no compounds.");
}

const propertyTags = [
  "Title",
  "MolecularFormula",
  "MolecularWeight",
  "SMILES",
  "ConnectivitySMILES",
  "InChI",
  "InChIKey",
  "IUPACName",
  "XLogP",
  "ExactMass",
  "MonoisotopicMass",
  "TPSA",
  "Complexity",
  "HBondDonorCount",
  "HBondAcceptorCount",
  "RotatableBondCount",
  "HeavyAtomCount",
  "IsotopeAtomCount",
  "AtomStereoCount",
  "DefinedAtomStereoCount",
  "UndefinedAtomStereoCount",
  "BondStereoCount",
  "DefinedBondStereoCount",
  "UndefinedBondStereoCount"
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchProperties(cid) {
  const url = `${PUBCHEM_BASE}/compound/cid/${encodeURIComponent(cid)}/property/${propertyTags.join(",")}/JSON`;
  const response = await fetch(url, {
    headers: { "User-Agent": "DTF-Terpene-Atlas/1.0 (+https://dtfseeds.com)" },
  });
  if (!response.ok) {
    throw new Error(`PubChem property request failed for CID ${cid}: ${response.status} ${response.statusText}`);
  }
  const payload = await response.json();
  return payload?.PropertyTable?.Properties?.[0] ?? null;
}

const compounds = [];
for (const item of manifest.compounds) {
  const properties = await fetchProperties(item.pubchemCid);
  if (!properties) throw new Error(`No PubChem properties returned for ${item.slug}`);

  compounds.push({
    slug: item.slug,
    pubchemCid: item.pubchemCid,
    sourceId: "PUBCHEM",
    fetchedAt: new Date().toISOString(),
    properties,
  });
  await sleep(250);
}

const output = {
  schemaVersion: "1.0.0",
  status: "compiled",
  sourceId: "PUBCHEM",
  generatedAt: new Date().toISOString(),
  propertyTags,
  compounds,
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(output, null, 2) + "\n", "utf8");
console.log(`Compiled PubChem physical/stereochemical cache for ${compounds.length} reviewed compounds.`);
