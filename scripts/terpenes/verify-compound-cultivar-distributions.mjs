import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distributionPath = path.join(root, "data/terpenes/reviewed-cultivar-distributions.json");
const sourceIndexPath = path.join(root, "public/data/terpenes/cultivars/index.json");
const pagePath = path.join(root, "app/learn/terpenes/[slug]/page.tsx");
const helperPath = path.join(root, "lib/terpenes/cultivar-distributions.ts");
const chapterTypesPath = path.join(root, "lib/terpenes/chapter-types.ts");
const chaptersPath = path.join(root, "lib/terpenes/chapters.ts");
const dashboardPath = path.join(root, "app/learn/terpenes/chapters/page.tsx");

const dataset = JSON.parse(fs.readFileSync(distributionPath, "utf8"));
const sourceIndex = JSON.parse(fs.readFileSync(sourceIndexPath, "utf8"));
const page = fs.readFileSync(pagePath, "utf8");
const helper = fs.readFileSync(helperPath, "utf8");
const chapterTypes = fs.readFileSync(chapterTypesPath, "utf8");
const chapters = fs.readFileSync(chaptersPath, "utf8");
const dashboard = fs.readFileSync(dashboardPath, "utf8");

if (dataset.schemaVersion !== 1) throw new Error("Reviewed cultivar distribution schema must be version 1");
if (dataset.sourceId !== sourceIndex.sourceId) throw new Error("Cultivar distribution sourceId does not match corpus index");
if (dataset.sourceSampleCount !== sourceIndex.sourceSampleCount) throw new Error("Cultivar distribution source sample count does not match corpus index");
if (dataset.publishableCultivarCount !== sourceIndex.cultivarCount) throw new Error("Cultivar distribution group count does not match corpus index");
if (!Array.isArray(dataset.compounds) || dataset.compounds.length !== 8) {
  throw new Error(`Expected 8 reviewed cannabis terpene distributions, found ${dataset.compounds?.length ?? 0}`);
}

const expected = new Set([
  "alpha-humulene",
  "alpha-pinene",
  "beta-caryophyllene",
  "beta-myrcene",
  "beta-pinene",
  "limonene",
  "linalool",
  "terpinolene",
]);

const seen = new Set();
for (const record of dataset.compounds) {
  if (!expected.has(record.compoundSlug)) throw new Error(`Unexpected cultivar distribution compound: ${record.compoundSlug}`);
  if (seen.has(record.compoundSlug)) throw new Error(`Duplicate cultivar distribution compound: ${record.compoundSlug}`);
  seen.add(record.compoundSlug);

  if (!Number.isInteger(record.cultivarCount) || record.cultivarCount < 1000) {
    throw new Error(`Implausible cultivarCount for ${record.compoundSlug}`);
  }
  if (!Number.isInteger(record.measuredSamples) || record.measuredSamples < 20000) {
    throw new Error(`Implausible measuredSamples for ${record.compoundSlug}`);
  }
  if (!Number.isInteger(record.multiLabCultivars) || record.multiLabCultivars < 800) {
    throw new Error(`Implausible multiLabCultivars for ${record.compoundSlug}`);
  }
  if (!(record.cultivarShare > 0 && record.cultivarShare <= 1)) {
    throw new Error(`Invalid cultivarShare for ${record.compoundSlug}`);
  }
  if (!(record.positiveMedianShare >= 0 && record.positiveMedianShare <= 1)) {
    throw new Error(`Invalid positiveMedianShare for ${record.compoundSlug}`);
  }

  const distribution = record.cultivarMedianDistribution;
  if (!distribution || distribution.n !== record.cultivarCount) {
    throw new Error(`Missing cultivar median distribution for ${record.compoundSlug}`);
  }
  if (!(distribution.min <= distribution.q1 && distribution.q1 <= distribution.median && distribution.median <= distribution.q3 && distribution.q3 <= distribution.max)) {
    throw new Error(`Invalid quartile ordering for ${record.compoundSlug}`);
  }
}

for (const unsupported of ["squalene", "beta-carotene"]) {
  if (seen.has(unsupported)) throw new Error(`Global reference compound must not receive cannabis cultivar distribution: ${unsupported}`);
}

for (const token of [
  "getReviewedCultivarDistribution",
  "getReviewedCultivarDistributionDatasetMeta",
  "hasReviewedCultivarDistribution",
]) {
  if (!helper.includes(token)) throw new Error(`Cultivar distribution helper missing: ${token}`);
}

for (const token of [
  "Measured cultivar-group distribution",
  "positive median",
  "Multi-lab cultivar groups",
  "Distribution of cultivar medians",
  "not a fixed value for every sample",
  "Open full cultivar chemistry explorer",
]) {
  if (!page.includes(token)) throw new Error(`Compound cultivar distribution UI missing: ${token}`);
}

for (const token of [
  "cultivarDistributionEvidenceCount",
]) {
  if (!chapterTypes.includes(token) || !chapters.includes(token) || !dashboard.includes(token)) {
    throw new Error(`Cultivar distribution readiness wiring missing: ${token}`);
  }
}

if (!chapters.includes('cultivarDistributionEvidenceCount > 0') || !chapters.includes('"linked-evidence"')) {
  throw new Error("Cultivar chemistry does not promote measured distributions to linked evidence");
}

for (const phrase of [
  "fixed strain percentage",
  "guaranteed cultivar value",
  "proves genetic identity",
  "predicts effect",
]) {
  if ((page + "\n" + JSON.stringify(dataset)).toLowerCase().includes(phrase)) {
    throw new Error(`Prohibited cultivar-distribution shortcut found: ${phrase}`);
  }
}

console.log(
  `Reviewed cultivar distributions verified: ${dataset.compounds.length} compounds, ${dataset.sourceSampleCount} source samples, ${dataset.publishableCultivarCount} publishable cultivar groups.`,
);
