import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/reviewed-pubchem-manifest.json"), "utf8"));
const cache = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/reviewed-pubchem-properties.json"), "utf8"));
const builder = fs.readFileSync(path.join(root, "scripts/terpenes/build-reviewed-pubchem-properties.mjs"), "utf8");
const workflow = fs.readFileSync(path.join(root, ".github/workflows/refresh-reviewed-terpene-properties.yml"), "utf8");
const propertiesLib = fs.readFileSync(path.join(root, "lib/terpenes/properties.ts"), "utf8");
const chapterTypes = fs.readFileSync(path.join(root, "lib/terpenes/chapter-types.ts"), "utf8");
const chapters = fs.readFileSync(path.join(root, "lib/terpenes/chapters.ts"), "utf8");
const chapterPage = fs.readFileSync(path.join(root, "app/learn/terpenes/[slug]/page.tsx"), "utf8");
const dashboard = fs.readFileSync(path.join(root, "app/learn/terpenes/chapters/page.tsx"), "utf8");

if (!Array.isArray(manifest.compounds) || manifest.compounds.length !== 10) {
  throw new Error("Reviewed PubChem manifest must contain exactly 10 reviewed compounds.");
}
if (new Set(manifest.compounds.map((item) => item.slug)).size !== manifest.compounds.length) {
  throw new Error("Reviewed PubChem manifest contains duplicate slugs.");
}

for (const token of [
  '"SMILES"',
  '"ConnectivitySMILES"',
  '"InChI"',
  '"InChIKey"',
  '"IUPACName"',
  '"XLogP"',
  '"ExactMass"',
  '"MonoisotopicMass"',
  '"TPSA"',
  '"Complexity"',
  '"HBondDonorCount"',
  '"HBondAcceptorCount"',
  '"RotatableBondCount"',
  '"HeavyAtomCount"',
  '"AtomStereoCount"',
  '"DefinedAtomStereoCount"',
  '"UndefinedAtomStereoCount"',
  '"BondStereoCount"',
  '"DefinedBondStereoCount"',
  '"UndefinedBondStereoCount"',
]) {
  if (!builder.includes(token)) throw new Error(`Reviewed PubChem builder missing property tag: ${token}`);
}

for (const token of [
  "getReviewedPubChemPropertyRecord",
  "getReviewedPubChemPropertyCacheStatus",
  "summarizeStereochemistry",
]) {
  if (!propertiesLib.includes(token)) throw new Error(`Reviewed PubChem property query missing: ${token}`);
}

for (const token of ['"physical-properties"', '"stereochemistry"']) {
  if (!chapterTypes.includes(token)) throw new Error(`Chapter model missing property section: ${token}`);
}
for (const token of ["hasPhysicalPropertyRecord", "stereoEvidenceCount"]) {
  if (!chapters.includes(token)) throw new Error(`Chapter readiness missing property coverage: ${token}`);
}

for (const token of [
  "Physical &amp; molecular properties",
  "Stereochemistry &amp; isomer handling",
  "Connectivity SMILES",
  "Defined atom stereocenters",
  "Routine cannabis laboratory",
]) {
  if (!chapterPage.includes(token)) throw new Error(`Compound property UI missing: ${token}`);
}

for (const token of ["getReviewedPubChemPropertyRecord", "summarizeStereochemistry", "hasPhysicalPropertyRecord"]) {
  if (!dashboard.includes(token)) throw new Error(`Chapter dashboard property wiring missing: ${token}`);
}

for (const token of [
  "Refresh Reviewed Terpene Properties",
  "build-reviewed-pubchem-properties.mjs",
  "Expected 10 reviewed PubChem property records",
  "Missing stereochemistry counts",
]) {
  if (!workflow.includes(token)) throw new Error(`Reviewed PubChem refresh workflow missing: ${token}`);
}

if (cache.status === "compiled") {
  if (!Array.isArray(cache.compounds) || cache.compounds.length !== 10) {
    throw new Error("Compiled reviewed PubChem cache must contain 10 compounds.");
  }
  for (const record of cache.compounds) {
    if (!record.properties?.InChIKey || !record.properties?.SMILES) {
      throw new Error(`Compiled PubChem cache record is missing exact structure identifiers: ${record.slug}`);
    }
  }
} else if (cache.status !== "not-generated") {
  throw new Error("Reviewed PubChem cache status must be compiled or not-generated.");
}

console.log(`Reviewed PubChem physical/stereochemistry layer verified: cache status=${cache.status}, manifest compounds=${manifest.compounds.length}.`);
