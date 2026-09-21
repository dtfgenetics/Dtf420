import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "app/learn/terpenes/page.tsx",
  "app/learn/terpenes/[slug]/page.tsx",
  "components/terpenes/TerpeneAtlasExplorer.tsx",
  "components/terpenes/TerpeneAtlasExplorer.module.css",
  "lib/terpenes/types.ts",
  "lib/terpenes/data.ts",
  "lib/terpenes/queries.ts",
  "data/terpenes/source-registry.json",
  "docs/TERPENE_ATLAS_DATA_PIPELINE.md",
  "scripts/terpenes/enrich-pubchem.mjs",
  "app/learn/terpenes/breeding/page.tsx",
  "components/terpenes/TerpeneBreedingExplorer.tsx",
  "lib/terpenes/profiles.ts",
  "lib/terpenes/breeding.ts",
];

for (const file of requiredFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Terpene Atlas missing required file: ${file}`);
  }
}

const dataSource = fs.readFileSync(path.join(root, "lib/terpenes/data.ts"), "utf8");
const explorerSource = fs.readFileSync(path.join(root, "components/terpenes/TerpeneAtlasExplorer.tsx"), "utf8");
const learnSource = fs.readFileSync(path.join(root, "app/learn/page.tsx"), "utf8");
const sitemapSource = fs.readFileSync(path.join(root, "app/sitemap.ts"), "utf8");
const sourceRegistry = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/source-registry.json"), "utf8"));

const slugs = [...dataSource.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
if (slugs.length < 8) {
  throw new Error(`Expected at least 8 curated terpene seed records, found ${slugs.length}`);
}
if (new Set(slugs).size !== slugs.length) {
  throw new Error("Duplicate terpene slugs detected");
}

const requiredFamilies = [
  "hemiterpene",
  "monoterpene",
  "sesquiterpene",
  "diterpene",
  "sesterterpene",
  "triterpene",
  "tetraterpene",
  "polyterpene",
];

for (const family of requiredFamilies) {
  if (!dataSource.includes(`id: "${family}"`)) {
    throw new Error(`Missing terpene family definition: ${family}`);
  }
}

for (const token of ["researchGuardrail", "cannabisOccurrence", "sourceIds", "viewNotes"]) {
  if (!dataSource.includes(token)) {
    throw new Error(`Terpene seed data missing required field: ${token}`);
  }
}

for (const token of ["Cannabis mapped", "Global seed set", "Evidence guardrail", "Open full compound record"]) {
  if (!explorerSource.includes(token)) {
    throw new Error(`Terpene explorer missing required UI contract: ${token}`);
  }
}

if (!learnSource.includes('href: "/learn/terpenes"')) {
  throw new Error("THC learning hub does not link to /learn/terpenes");
}

if (!sitemapSource.includes('item("/learn/terpenes"') || !sitemapSource.includes('item("/learn/terpenes/breeding"') || !sitemapSource.includes("terpeneRoutes")) {
  throw new Error("Terpene Atlas routes are not wired into the sitemap");
}

const requiredSourceIds = ["THC-V13", "PUBCHEM", "COCONUT", "CANNABIS-LITERATURE", "CULTIVAR-LABS", "DTF-GENETICS"];
const registryIds = new Set((sourceRegistry.sources ?? []).map((source) => source.id));
for (const sourceId of requiredSourceIds) {
  if (!registryIds.has(sourceId)) {
    throw new Error(`Terpene source registry missing required source: ${sourceId}`);
  }
}

const breedingSource = fs.readFileSync(path.join(root, "lib/terpenes/breeding.ts"), "utf8");
const breedingUiSource = fs.readFileSync(path.join(root, "components/terpenes/TerpeneBreedingExplorer.tsx"), "utf8");
for (const token of ["does not predict exact offspring terpene percentages", "Offspring measurements should replace parent-only assumptions"]) {
  if (!breedingSource.includes(token)) {
    throw new Error(`Breeding engine missing inheritance guardrail: ${token}`);
  }
}
for (const token of ["Parent midpoint", "What to screen for in offspring", "It does not output guaranteed F1 percentages"]) {
  if (!breedingUiSource.includes(token)) {
    throw new Error(`Breeding explorer missing required UI contract: ${token}`);
  }
}

const prohibitedShortcutClaims = [
  "guaranteed relaxing",
  "guaranteed uplifting",
  "guaranteed sedating",
  "guaranteed energizing",
];
for (const claim of prohibitedShortcutClaims) {
  if (dataSource.toLowerCase().includes(claim)) {
    throw new Error(`Unqualified effect shortcut found in terpene seed data: ${claim}`);
  }
}

console.log(`Terpene Atlas verification passed: ${slugs.length} seed records, ${requiredFamilies.length} family classes, ${registryIds.size} registered sources.`);
