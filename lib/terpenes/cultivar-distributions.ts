import cultivarDistributions from "@/data/terpenes/reviewed-cultivar-distributions.json";

export type CultivarMedianDistribution = {
  n: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
};

export type ReviewedCultivarDistribution = {
  compoundSlug: string;
  normalizedKey: string;
  measurementKind: string;
  cultivarCount: number;
  cultivarShare: number;
  measuredSamples: number;
  multiLabCultivars: number;
  positiveMedianCultivars: number;
  positiveMedianShare: number;
  cultivarMedianDistribution: CultivarMedianDistribution | null;
};

type ReviewedCultivarDistributionDataset = {
  schemaVersion: number;
  sourceId: string;
  sourceSampleCount: number;
  publishableCultivarCount: number;
  generatedAt: string;
  interpretation: string;
  compounds: ReviewedCultivarDistribution[];
};

const dataset = cultivarDistributions as ReviewedCultivarDistributionDataset;
const bySlug = new Map(dataset.compounds.map((record) => [record.compoundSlug, record]));

export function getReviewedCultivarDistribution(compoundSlug: string) {
  return bySlug.get(compoundSlug) ?? null;
}

export function getReviewedCultivarDistributionDatasetMeta() {
  return {
    schemaVersion: dataset.schemaVersion,
    sourceId: dataset.sourceId,
    sourceSampleCount: dataset.sourceSampleCount,
    publishableCultivarCount: dataset.publishableCultivarCount,
    generatedAt: dataset.generatedAt,
    interpretation: dataset.interpretation,
    compoundCount: dataset.compounds.length,
  };
}

export function hasReviewedCultivarDistribution(compoundSlug: string) {
  return bySlug.has(compoundSlug);
}
