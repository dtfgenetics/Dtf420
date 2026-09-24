import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const dataSource = fs.readFileSync(path.join(root, "lib/terpenes/data.ts"), "utf8");
const queueBuilder = fs.readFileSync(
  path.join(root, "scripts/terpenes/build-review-promotion-queue.mjs"),
  "utf8",
);
const queue = JSON.parse(
  fs.readFileSync(path.join(root, "data/terpenes/review-promotion-queue.json"), "utf8"),
);
const evidenceLedger = JSON.parse(
  fs.readFileSync(path.join(root, "data/terpenes/evidence-ledger.json"), "utf8"),
);
const tpsGenes = JSON.parse(
  fs.readFileSync(path.join(root, "data/terpenes/tps-genes.json"), "utf8"),
);
const distributions = JSON.parse(
  fs.readFileSync(path.join(root, "data/terpenes/reviewed-cultivar-distributions.json"), "utf8"),
);
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "data/terpenes/reviewed-pubchem-manifest.json"), "utf8"),
);
const propertyCache = JSON.parse(
  fs.readFileSync(path.join(root, "data/terpenes/reviewed-pubchem-properties.json"), "utf8"),
);
const experimentalCache = JSON.parse(
  fs.readFileSync(path.join(root, "data/terpenes/reviewed-pubchem-experimental-properties.json"), "utf8"),
);
const sensoryCache = JSON.parse(
  fs.readFileSync(path.join(root, "data/terpenes/reviewed-pubchem-sensory-evidence.json"), "utf8"),
);
const promotionPage = fs.readFileSync(
  path.join(root, "app/learn/terpenes/promotion/page.tsx"),
  "utf8",
);

const reviewedSlugs = [...dataSource.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
if (reviewedSlugs.length !== 12) {
  throw new Error(`Promotion wave 1 expects 12 reviewed compounds, found ${reviewedSlugs.length}`);
}

const expectedPromotions = {
  "alpha-terpinene": {
    cid: 7462,
    cas: "99-86-5",
    inchiKey: "YHQGMYUVUMAZJR-UHFFFAOYSA-N",
    tpsEvidenceId: "booth2017-cstps33pk-terpinene",
  },
  "gamma-terpinene": {
    cid: 7461,
    cas: "99-85-4",
    inchiKey: "YKFLAYDHMOASIY-UHFFFAOYSA-N",
    tpsEvidenceId: "booth2017-cstps33pk-gamma-terpinene",
  },
};

for (const [slug, expected] of Object.entries(expectedPromotions)) {
  if (!reviewedSlugs.includes(slug)) {
    throw new Error(`Promoted terpene missing from reviewed data: ${slug}`);
  }

  for (const token of [
    `slug: "${slug}"`,
    `pubchemCid: ${expected.cid}`,
    `casNumber: "${expected.cas}"`,
    'cannabisOccurrence: "documented"',
    '"BOOTH-2017-TPS"',
    '"SMITH-2022-COMMERCIAL-US"',
  ]) {
    if (!dataSource.includes(token)) {
      throw new Error(`Reviewed promotion record ${slug} missing token: ${token}`);
    }
  }

  const evidence = evidenceLedger.records.find((record) => record.id === expected.tpsEvidenceId);
  if (!evidence || evidence.compoundSlug !== slug || evidence.claimType !== "terpene-synthase-function") {
    throw new Error(`Promoted terpene missing exact TPS evidence: ${slug}`);
  }
  if (!["source-verified", "editorial-reviewed"].includes(evidence.reviewStatus)) {
    throw new Error(`Promoted TPS evidence is not reviewed: ${slug}`);
  }

  const distribution = distributions.compounds.find((record) => record.compoundSlug === slug);
  if (!distribution || distribution.measurementKind !== "compound") {
    throw new Error(`Promoted terpene missing exact cultivar distribution: ${slug}`);
  }
  if (distribution.measuredSamples < 20000 || distribution.multiLabCultivars < 800) {
    throw new Error(`Promoted cultivar evidence is implausibly shallow: ${slug}`);
  }

  const manifestRecord = manifest.compounds.find((record) => record.slug === slug);
  if (!manifestRecord || manifestRecord.pubchemCid !== expected.cid) {
    throw new Error(`Promoted terpene missing exact PubChem manifest record: ${slug}`);
  }

  const propertyRecord = propertyCache.compounds.find((record) => record.slug === slug);
  if (
    !propertyRecord ||
    propertyRecord.pubchemCid !== expected.cid ||
    propertyRecord.properties?.InChIKey !== expected.inchiKey ||
    !propertyRecord.properties?.SMILES
  ) {
    throw new Error(`Promoted terpene missing exact PubChem property identity: ${slug}`);
  }

  const experimentalRecord = experimentalCache.compounds.find((record) => record.slug === slug);
  if (!experimentalRecord || experimentalRecord.pubchemCid !== expected.cid) {
    throw new Error(`Promoted terpene is not staged in experimental-property cache: ${slug}`);
  }
  for (const heading of experimentalCache.headings ?? []) {
    if (!Array.isArray(experimentalRecord.properties?.[heading])) {
      throw new Error(`Promoted terpene missing experimental-property array: ${slug} / ${heading}`);
    }
  }

  const sensoryRecord = sensoryCache.compounds.find((record) => record.slug === slug);
  if (!sensoryRecord || sensoryRecord.pubchemCid !== expected.cid) {
    throw new Error(`Promoted terpene is not staged in sensory cache: ${slug}`);
  }
  for (const heading of sensoryCache.headings ?? []) {
    if (!Array.isArray(sensoryRecord.sensory?.[heading])) {
      throw new Error(`Promoted terpene missing sensory evidence array: ${slug} / ${heading}`);
    }
  }

  if (queue.candidates.some((candidate) => candidate.slug === slug)) {
    throw new Error(`Promoted terpene still appears in review queue: ${slug}`);
  }
}

const csTps33 = tpsGenes.genes.find((gene) => gene.id === "CsTPS33PK");
if (!csTps33) throw new Error("CsTPS33PK is missing from TPS registry");
for (const slug of Object.keys(expectedPromotions)) {
  const product = csTps33.majorProducts.find((item) => item.slug === slug);
  if (!product) throw new Error(`CsTPS33PK missing promoted major product: ${slug}`);
}

for (const token of [
  "nameSimilarityEstablishesIdentity: false",
  "aggregateIsomersCountAsExactCompound: false",
  "tentativeTpsProductsCountAsPromotionReady: false",
  'measurementKind === "compound"',
  '"promotion-ready"',
  '"needs-exact-cultivar-or-occurrence-review"',
]) {
  if (!queueBuilder.includes(token)) {
    throw new Error(`Review promotion builder missing policy contract: ${token}`);
  }
}

if (queue.reviewedCompoundCount !== 12) {
  throw new Error(`Review promotion queue reviewed count should be 12, found ${queue.reviewedCompoundCount}`);
}
if (queue.promotionReadyCount !== 0) {
  throw new Error("Review promotion queue should have no remaining promotion-ready candidates after wave 1");
}

const camphene = queue.candidates.find((candidate) => candidate.slug === "camphene");
if (!camphene || camphene.status !== "needs-biological-identity-review" || !camphene.exactCultivarAnalyte) {
  throw new Error("Camphene promotion blocker is not preserved correctly");
}

for (const slug of ["e-beta-ocimene", "z-beta-ocimene"]) {
  const candidate = queue.candidates.find((item) => item.slug === slug);
  if (
    !candidate ||
    candidate.status !== "needs-exact-cultivar-or-occurrence-review" ||
    candidate.exactCultivarAnalyte !== false ||
    candidate.exactTpsMajorProduct !== true
  ) {
    throw new Error(`Ocimene isomer promotion blocker is not preserved correctly: ${slug}`);
  }
}

if (manifest.compounds.length !== reviewedSlugs.length) {
  throw new Error("Reviewed PubChem manifest is not synchronized with reviewed compound count");
}
if (propertyCache.compounds.length !== manifest.compounds.length) {
  throw new Error("Reviewed PubChem property cache is not synchronized with manifest count");
}
if (experimentalCache.compounds.length !== manifest.compounds.length) {
  throw new Error("Reviewed experimental-property cache is not synchronized with manifest count");
}
if (sensoryCache.compounds.length !== manifest.compounds.length) {
  throw new Error("Reviewed sensory cache is not synchronized with manifest count");
}

console.log(
  `Review promotion wave 1 verified: 12 reviewed compounds; alpha/gamma terpinene promoted; ${queue.candidateCount} blocked candidates remain.`,
);


for (const token of [
  "Terpene Review Promotion Queue",
  "Exact evidence outranks name similarity",
  "Promotion wave 01",
  "New reviewed chapters",
  "Blocked candidates",
  "Aggregate-isomer chemistry cannot satisfy this requirement",
]) {
  if (!promotionPage.includes(token)) {
    throw new Error(`Review promotion transparency page missing: ${token}`);
  }
}
