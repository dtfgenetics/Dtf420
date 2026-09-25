import applicationData from "@/data/terpenes/applications.json";

export type TerpeneApplicationRecord = {
  id: string;
  sourceId: string;
  compoundSlug: string;
  sectors: string[];
  applications: string[];
  statement: string;
  reviewStatus: string;
  notes: string;
};

const records = applicationData.records as TerpeneApplicationRecord[];

export function getReviewedApplicationsForCompound(compoundSlug: string) {
  return records.filter(
    (record) =>
      record.reviewStatus === "source-verified" &&
      record.compoundSlug === compoundSlug,
  );
}
