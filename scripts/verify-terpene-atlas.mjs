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
  "scripts/terpenes/lib/csv-stream.mjs",
  "scripts/terpenes/normalize-coconut.mjs",
  "scripts/terpenes/inspect-coconut-csv.mjs",
  "scripts/terpenes/build-runtime-shards.mjs",
  "scripts/terpenes/fixtures/coconut-sample.csv",
  "scripts/terpenes/test-coconut-ingestion.mjs",
  "scripts/terpenes/lib/identity.mjs",
  "scripts/terpenes/resolve-identities.mjs",
  "lib/terpenes/evidence.ts",
  "data/terpenes/evidence-ledger.json",
  "scripts/terpenes/validate-evidence-ledger.mjs",
  "scripts/terpenes/fixtures/identity-records.jsonl",
  "scripts/terpenes/fixtures/evidence-ledger.json",
  "scripts/terpenes/test-identity-evidence.mjs",
  "scripts/terpenes/lib/commercial-cannabis-analytes.mjs",
  "scripts/terpenes/lib/cultivar-statistics.mjs",
  "scripts/terpenes/import-commercial-cannabis-samples.mjs",
  "scripts/terpenes/compile-cultivar-statistics.mjs",
  "scripts/terpenes/fixtures/commercial-cannabis-samples.csv",
  "scripts/terpenes/test-cultivar-statistics.mjs",
  "scripts/terpenes/build-cultivar-runtime-shards.mjs",
  "scripts/terpenes/build-cultivar-intelligence-index.mjs",
  "public/data/terpenes/cultivars/index.json",
  "lib/terpenes/cultivar-types.ts",
  "data/terpenes/tps-genes.json",
  "lib/terpenes/genetics.ts",
  "scripts/terpenes/verify-tps-genetics.mjs",
  "app/learn/terpenes/genetics/page.tsx",
  "app/learn/terpenes/genetics/page.module.css",
  "lib/terpenes/research.ts",
  "components/terpenes/TerpeneResearchLedger.tsx",
  "components/terpenes/TerpeneResearchLedger.module.css",
  "app/learn/terpenes/research/page.tsx",
  "app/learn/terpenes/research/page.module.css",
  "scripts/terpenes/verify-research-ledger-ui.mjs",
  "lib/terpenes/evidence-queries.ts",
  "scripts/terpenes/verify-mockup-fidelity.mjs",
  "components/terpenes/TerpeneProfileComparison.tsx",
  "components/terpenes/TerpeneProfileComparison.module.css",
  "app/learn/terpenes/profiles/page.tsx",
  "scripts/terpenes/verify-profile-comparison.mjs",
  "components/terpenes/TerpeneCultivarBrowser.tsx",
  "components/terpenes/TerpeneCultivarBrowser.module.css",
  "app/learn/terpenes/cultivars/page.tsx",
  "public/data/terpenes/cultivars/manifest.json",
  ".github/workflows/refresh-terpene-cultivars.yml",
  "scripts/terpenes/verify-cultivar-browser.mjs",
  "components/terpenes/TerpeneCorpusExplorer.tsx",
  "components/terpenes/TerpeneCorpusExplorer.module.css",
  "app/learn/terpenes/corpus/page.tsx",
  "scripts/terpenes/verify-corpus-explorer.mjs",
  "scripts/terpenes/lib/universal-registry.mjs",
  "scripts/terpenes/build-universal-registry.mjs",
  "scripts/terpenes/verify-universal-registry.mjs",
  "components/terpenes/TerpeneRegistryExplorer.tsx",
  "components/terpenes/TerpeneRegistryExplorer.module.css",
  "app/learn/terpenes/registry/page.tsx",
  "lib/terpenes/chapter-types.ts",
  "lib/terpenes/chapters.ts",
  "lib/terpenes/assessments.ts",
  "components/terpenes/TerpeneChapterQuiz.tsx",
  "app/learn/terpenes/chapters/page.tsx",
  "scripts/terpenes/verify-deep-chapters.mjs",
  "lib/terpenes/properties.ts",
  "data/terpenes/reviewed-pubchem-manifest.json",
  "data/terpenes/reviewed-pubchem-properties.json",
  "scripts/terpenes/build-reviewed-pubchem-properties.mjs",
  "scripts/terpenes/verify-reviewed-pubchem-properties.mjs",
  "data/terpenes/reviewed-pubchem-experimental-properties.json",
  "lib/terpenes/experimental-properties.ts",
  "scripts/terpenes/build-reviewed-pubchem-experimental-properties.mjs",
  "scripts/terpenes/verify-reviewed-pubchem-experimental-properties.mjs",
  "scripts/terpenes/lib/pubchem-pug-view.mjs",
  "data/terpenes/reviewed-pubchem-sensory-evidence.json",
  "lib/terpenes/sensory-evidence.ts",
  "scripts/terpenes/build-reviewed-pubchem-sensory-evidence.mjs",
  "scripts/terpenes/verify-reviewed-pubchem-sensory-evidence.mjs",
  "data/terpenes/reviewed-pubchem-natural-occurrence.json",
  "lib/terpenes/natural-occurrence.ts",
  "scripts/terpenes/build-reviewed-pubchem-natural-occurrence.mjs",
  "scripts/terpenes/verify-reviewed-pubchem-natural-occurrence.mjs",
  ".github/workflows/refresh-reviewed-terpene-occurrence.yml",
  ".github/workflows/refresh-reviewed-terpene-sensory.yml",
  "data/terpenes/stereoisomer-registry.json",
  "lib/terpenes/stereoisomers.ts",
  "scripts/terpenes/verify-stereoisomer-registry.mjs",
  ".github/workflows/refresh-reviewed-terpene-properties.yml",
  "public/data/terpenes/registry/manifest.json",
  ".github/workflows/refresh-terpene-registry.yml",
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

for (const token of ["Cannabis mapped", "All known scope", "Evidence guardrail", "Open full compound record", "Terpenes &amp; Terpenoids Wheel", "Aroma ≠ effect", "classRing", "compoundRing", "aromaRing"]) {
  if (!explorerSource.includes(token)) {
    throw new Error(`Terpene explorer missing required UI contract: ${token}`);
  }
}

if (!learnSource.includes('href: "/learn/terpenes"')) {
  throw new Error("THC learning hub does not link to /learn/terpenes");
}

if (!sitemapSource.includes('item("/learn/terpenes"') || !sitemapSource.includes('item("/learn/terpenes/profiles"') || !sitemapSource.includes('item("/learn/terpenes/cultivars"') || !sitemapSource.includes('item("/learn/terpenes/corpus"') || !sitemapSource.includes('item("/learn/terpenes/registry"') || !sitemapSource.includes('item("/learn/terpenes/chapters"') || !sitemapSource.includes('item("/learn/terpenes/breeding"') || !sitemapSource.includes('item("/learn/terpenes/genetics"') || !sitemapSource.includes('item("/learn/terpenes/research"') || !sitemapSource.includes("terpeneRoutes")) {
  throw new Error("Terpene Atlas routes are not wired into the sitemap");
}

const requiredSourceIds = ["THC-V13", "PUBCHEM", "PUBCHEM-PUG-VIEW", "COCONUT", "LOTUS", "CANNABIS-LITERATURE", "CULTIVAR-LABS", "DTF-GENETICS", "SMITH-2022-COMMERCIAL-US", "BOOTH-2017-TPS", "BOOTH-2020-TPS-VARIATION"];
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

const coconutNormalizerSource = fs.readFileSync(path.join(root, "scripts/terpenes/normalize-coconut.mjs"), "utf8");
for (const token of ["unreviewed-source-candidate", "candidateReason", "candidateConfidence", "np-pathway-terpenoids"]) {
  if (!coconutNormalizerSource.includes(token)) {
    throw new Error(`COCONUT normalizer missing candidate-safety contract: ${token}`);
  }
}

const identitySource = fs.readFileSync(path.join(root, "scripts/terpenes/lib/identity.mjs"), "utf8");
for (const token of [
  'primary: "full-inchikey"',
  'secondary: "verified-pubchem-cid"',
  'fallback: "exact-canonical-structure"',
  'nameSimilarity: "never"',
  'conflictAction: "quarantine"',
  "same-pubchem-cid-different-inchikey",
]) {
  if (!identitySource.includes(token)) {
    throw new Error(`Identity resolver missing safety contract: ${token}`);
  }
}

const evidenceLedger = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/evidence-ledger.json"), "utf8"));
if (evidenceLedger.schemaVersion !== "1.0.0" || !Array.isArray(evidenceLedger.records)) {
  throw new Error("Production terpene evidence ledger has invalid schema");
}

const cultivarImporterSource = fs.readFileSync(path.join(root, "scripts/terpenes/import-commercial-cannabis-samples.mjs"), "utf8");
for (const token of ["dataset-normalized-strain-slug", "SMITH-2022-COMMERCIAL-US"]) {
  if (!cultivarImporterSource.includes(token)) {
    throw new Error(`Cultivar importer missing source-preservation contract: ${token}`);
  }
}
const analyteSource = fs.readFileSync(path.join(root, "scripts/terpenes/lib/commercial-cannabis-analytes.mjs"), "utf8");
for (const token of ['measurementKind: "aggregate-isomers"', 'canonicalSlug: null']) {
  if (!analyteSource.includes(token)) {
    throw new Error(`Cultivar analyte mapping missing aggregate safety contract: ${token}`);
  }
}

const cultivarStatsSource = fs.readFileSync(path.join(root, "scripts/terpenes/lib/cultivar-statistics.mjs"), "utf8");
for (const token of ['minimumSamples = 5', '"high-depth-multi-lab"', "median", "q1", "q3", "producerCount", "totalTerpenes", "topTerpenes", "dataQuality", "summarizeConcentration", "relativeIqr", "labMedianDistribution", "minimumRegionSamples", "regionStrata"]) {
  if (!cultivarStatsSource.includes(token)) {
    throw new Error(`Cultivar statistics missing public-summary contract: ${token}`);
  }
}

const geneticsPageSource = fs.readFileSync(path.join(root, "app/learn/terpenes/genetics/page.tsx"), "utf8");
for (const token of ["Cannabis Terpene Synthases", "Enzyme capability is not the same thing as plant abundance", "Major functional products", "Open primary study"]) {
  if (!geneticsPageSource.includes(token)) {
    throw new Error(`TPS genetics page missing required evidence-aware UI: ${token}`);
  }
}
for (const token of ['href="/learn/terpenes/genetics"', "Open TPS genetics"]) {
  if (!explorerSource.includes(token)) {
    throw new Error(`Terpene Atlas missing genetics navigation: ${token}`);
  }
}

const researchPageSource = fs.readFileSync(path.join(root, "app/learn/terpenes/research/page.tsx"), "utf8");
const researchUiSource = fs.readFileSync(path.join(root, "components/terpenes/TerpeneResearchLedger.tsx"), "utf8");
for (const token of ["Terpene Research Ledger", "Different study types answer different questions"]) {
  if (!researchPageSource.includes(token)) {
    throw new Error(`Research Ledger page missing evidence interpretation UI: ${token}`);
  }
}
for (const token of ["Search evidence", "What this evidence establishes", "Open source"]) {
  if (!researchUiSource.includes(token)) {
    throw new Error(`Research Ledger component missing transparency UI: ${token}`);
  }
}
for (const token of ['href="/learn/terpenes/research"', "Open research ledger"]) {
  if (!explorerSource.includes(token)) {
    throw new Error(`Terpene Atlas missing Research Ledger navigation: ${token}`);
  }
}

const compoundPageSource = fs.readFileSync(path.join(root, "app/learn/terpenes/[slug]/page.tsx"), "utf8");
for (const token of ["Source-verified genetics", "Reviewed evidence", "Open the full TPS genetics map", "Open the research ledger"]) {
  if (!compoundPageSource.includes(token)) {
    throw new Error(`Compound terpene record missing linked evidence UI: ${token}`);
  }
}

const profileUiSource = fs.readFileSync(path.join(root, "components/terpenes/TerpeneProfileComparison.tsx"), "utf8");
for (const token of ["Terpene Profile Comparison", "Visual fingerprint", "Vector similarity", "Similarity is descriptive, not an identity test"]) {
  if (!profileUiSource.includes(token)) {
    throw new Error(`Profile comparison missing Atlas contract: ${token}`);
  }
}
for (const token of ['href="/learn/terpenes/profiles"', "Open profile comparison"]) {
  if (!explorerSource.includes(token)) {
    throw new Error(`Terpene Atlas missing profile comparison navigation: ${token}`);
  }
}

const cultivarBrowserSource = fs.readFileSync(path.join(root, "components/terpenes/TerpeneCultivarBrowser.tsx"), "utf8");
for (const token of [
  "Cultivar Chemistry Explorer",
  "Distribution, not destiny",
  "Measured cultivar distribution",
  "Sample depth",
  "Total terpene distribution",
  "Source context",
  "Cultivar comparison",
  "Median-vector similarity",
  "Global cultivar chemistry",
  "Nearest median chemistry profiles",
  "Global analyte prevalence",
  "Data-quality factors",
  "Laboratory breadth",
  "Lab-median span",
  "Regional source strata",
  "Same cultivar label, separated by source region.",
]) {
  if (!cultivarBrowserSource.includes(token)) {
    throw new Error(`Cultivar browser missing Atlas contract: ${token}`);
  }
}
for (const token of ['href="/learn/terpenes/cultivars"', "Open cultivar distributions"]) {
  if (!explorerSource.includes(token)) {
    throw new Error(`Terpene Atlas missing cultivar browser navigation: ${token}`);
  }
}
for (const token of ['href="/learn/terpenes/corpus"', "Open chemistry corpus"]) {
  if (!explorerSource.includes(token)) {
    throw new Error(`Terpene Atlas missing chemistry corpus navigation: ${token}`);
  }
}

for (const token of ['href="/learn/terpenes/registry"', "Open universal registry"]) {
  if (!explorerSource.includes(token)) {
    throw new Error(`Terpene Atlas missing universal registry navigation: ${token}`);
  }
}

for (const token of ['href="/learn/terpenes/chapters"', "Open chapter readiness"]) {
  if (!explorerSource.includes(token)) {
    throw new Error(`Terpene Atlas missing chapter readiness navigation: ${token}`);
  }
}

const chapterPageSource = fs.readFileSync(path.join(root, "app/learn/terpenes/chapters/page.tsx"), "utf8");
for (const token of ["Terpene Chapter Readiness", "Average readiness", "Sections needing expansion", "Open chapter"]) {
  if (!chapterPageSource.includes(token)) {
    throw new Error(`Chapter readiness page missing Atlas contract: ${token}`);
  }
}

const universalRegistrySource = fs.readFileSync(path.join(root, "components/terpenes/TerpeneRegistryExplorer.tsx"), "utf8");
for (const token of ["All-Known Terpene Registry", "Candidate registry ≠ reviewed cannabis claim", "Exact identity", "Source provenance"]) {
  if (!universalRegistrySource.includes(token)) {
    throw new Error(`Universal registry missing Atlas contract: ${token}`);
  }
}

const corpusSource = fs.readFileSync(path.join(root, "components/terpenes/TerpeneCorpusExplorer.tsx"), "utf8");
for (const token of ["Cultivar Chemistry Corpus", "Minimum labs", "Analyte median filter", "Filtering chemistry is not ranking cultivars"]) {
  if (!corpusSource.includes(token)) {
    throw new Error(`Chemistry corpus missing Atlas contract: ${token}`);
  }
}

console.log(`Terpene Atlas verification passed: ${slugs.length} seed records, ${requiredFamilies.length} family classes, ${registryIds.size} registered sources.`);
