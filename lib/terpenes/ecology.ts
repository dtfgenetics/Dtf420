import ecologyData from "@/data/terpenes/ecological-roles.json";

export type TerpeneEcologyRecord = {
  id: string;
  sourceId: string;
  title: string;
  compoundSlugs: string[];
  identityScope: string;
  identityResolution: "exact" | "isomer-unresolved" | string;
  roleTypes: string[];
  statement: string;
  organismContext: string;
  evidenceBasis: string;
  reviewStatus: string;
  notes: string;
};

const records = ecologyData.records as TerpeneEcologyRecord[];

export function getReviewedEcologyForCompound(compoundSlug: string) {
  return records.filter(
    (record) =>
      record.reviewStatus === "source-verified" &&
      record.compoundSlugs.includes(compoundSlug),
  );
}

export function countExactEcologyEvidence(compoundSlug: string) {
  return getReviewedEcologyForCompound(compoundSlug).filter(
    (record) => record.identityResolution === "exact",
  ).length;
}

export function countAggregateEcologyEvidence(compoundSlug: string) {
  return getReviewedEcologyForCompound(compoundSlug).filter(
    (record) => record.identityResolution !== "exact",
  ).length;
}
