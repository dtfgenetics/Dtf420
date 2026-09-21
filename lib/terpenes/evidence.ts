export type EvidenceStudyType =
  | "chemical-analysis"
  | "genomics"
  | "enzyme-functional"
  | "human-clinical"
  | "human-observational"
  | "animal"
  | "in-vitro"
  | "mechanistic"
  | "sensory"
  | "traditional-anecdotal";

export type EvidenceClaimType =
  | "cannabis-occurrence"
  | "terpene-synthase-function"
  | "cultivar-sample"
  | "sensory-descriptor"
  | "biological-effect"
  | "biosynthetic-pathway";

export type EvidenceReviewStatus =
  | "draft"
  | "source-verified"
  | "editorial-reviewed"
  | "rejected";

export type TerpeneEvidenceRecord = {
  id: string;
  compoundSlug: string;
  claimType: EvidenceClaimType;
  statement: string;
  sourceId: string;
  sourceLocator: string;
  studyType: EvidenceStudyType;
  populationOrMaterial: string;
  analyticalMethod: string | null;
  value: number | null;
  unit: string | null;
  reviewStatus: EvidenceReviewStatus;
  reviewedAt: string | null;
  notes: string | null;
  geneId?: string | null;
  productRole?: "major" | "minor" | "coproduct" | null;
  substrate?: string | null;
  cultivarOrStrain?: string | null;
};

export type TerpeneEvidenceLedger = {
  schemaVersion: string;
  records: TerpeneEvidenceRecord[];
};
