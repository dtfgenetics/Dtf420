import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/stereoisomer-registry.json"), "utf8"));
const querySource = fs.readFileSync(path.join(root, "lib/terpenes/stereoisomers.ts"), "utf8");
const page = fs.readFileSync(path.join(root, "app/learn/terpenes/[slug]/page.tsx"), "utf8");
const pageCss = fs.readFileSync(path.join(root, "app/learn/terpenes/[slug]/page.module.css"), "utf8");
const dashboard = fs.readFileSync(path.join(root, "app/learn/terpenes/chapters/page.tsx"), "utf8");

if (registry.schemaVersion !== "1.0.0" || registry.sourceId !== "PUBCHEM") {
  throw new Error("Invalid stereoisomer registry header.");
}
if (!Array.isArray(registry.compounds) || registry.compounds.length !== 5) {
  throw new Error("Expected 5 curated stereoisomer registry entries.");
}

const expected = {
  limonene: [440917, 439250],
  "alpha-pinene": [82227, 440968],
  "beta-pinene": [10290825, 440967],
  linalool: [443158, 67179],
  "beta-caryophyllene": [5281515, 20831623],
};

for (const [slug, cids] of Object.entries(expected)) {
  const entry = registry.compounds.find((item) => item.slug === slug);
  if (!entry) throw new Error(`Missing stereoisomer registry entry: ${slug}`);
  if (!["stereo-unspecified", "stereospecific"].includes(entry.parentIdentityScope)) {
    throw new Error(`Invalid parent identity scope for ${slug}`);
  }
  const observed = new Set(entry.isomers.map((item) => item.pubchemCid));
  for (const cid of cids) {
    if (!observed.has(cid)) throw new Error(`Missing PubChem stereoisomer CID ${cid} for ${slug}`);
  }
  for (const isomer of entry.isomers) {
    if (!isomer.label || !isomer.configuration || !isomer.rotation || !isomer.pubchemCid) {
      throw new Error(`Incomplete stereoisomer record for ${slug}`);
    }
  }
}

const caryophyllene = registry.compounds.find((item) => item.slug === "beta-caryophyllene");
if (caryophyllene?.parentIdentityScope !== "stereospecific") {
  throw new Error("Beta-caryophyllene chapter identity must be marked stereospecific.");
}
if (!caryophyllene?.isomers.some((item) => item.pubchemCid === 5281515 && item.chapterIdentity === true)) {
  throw new Error("Beta-caryophyllene chapter identity is not explicitly marked.");
}

for (const token of [
  "getTerpeneStereoRegistryEntry",
  "getTerpeneStereoRegistryCount",
]) {
  if (!querySource.includes(token)) throw new Error(`Stereoisomer query layer missing: ${token}`);
}

for (const token of [
  "Parent identity scope",
  "Chapter identity",
  "Optical rotation label",
  "No curated enantiomer pair is registered",
]) {
  if (!page.includes(token)) throw new Error(`Compound stereoisomer UI missing: ${token}`);
}

for (const token of [".isomerRegistry", ".isomerSummary", ".isomerGrid"]) {
  if (!pageCss.includes(token)) throw new Error(`Stereoisomer UI styling missing: ${token}`);
}

if (!dashboard.includes("getTerpeneStereoRegistryEntry") || !dashboard.includes("stereoRegistryEntry?.isomers.length")) {
  throw new Error("Chapter readiness dashboard is not counting curated stereoisomer coverage.");
}

console.log("Curated terpene stereoisomer registry verified: 5 chapter identities, 10 explicit isomer records.");
