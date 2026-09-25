import analyticalData from "@/data/terpenes/analytical-methods.json";

export type TerpeneAnalyticalMethodRecord = {
  id: string;
  sourceId: string;
  title: string;
  matrix: string;
  technique: string;
  extraction: string;
  validationFramework: string;
  quantificationContext: string;
  compoundSlugs: string[];
  identityResolution: string;
  reviewStatus: string;
  notes: string;
};

const records = analyticalData.records as TerpeneAnalyticalMethodRecord[];

export function getReviewedAnalyticalMethodsForCompound(compoundSlug: string) {
  return records.filter(
    (record) =>
      record.reviewStatus === "source-verified" &&
      record.compoundSlugs.includes(compoundSlug),
  );
}

export function getReviewedGeneralAnalyticalMethods() {
  return records.filter(
    (record) =>
      record.reviewStatus === "source-verified" &&
      record.compoundSlugs.length === 0,
  );
}
