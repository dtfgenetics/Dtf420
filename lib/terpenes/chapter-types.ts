import type { TerpeneCompound } from "./types";

export type TerpeneChapterSectionId =
  | "identity"
  | "classification"
  | "physical-properties"
  | "stereochemistry"
  | "analytical-methods"
  | "sensory"
  | "natural-occurrence"
  | "ecological-role"
  | "cannabis-occurrence"
  | "biosynthesis"
  | "genetics"
  | "cultivar-chemistry"
  | "cultivation-postharvest"
  | "research"
  | "safety"
  | "applications"
  | "assessment";

export type TerpeneChapterSectionStatus =
  | "complete"
  | "reviewed-foundation"
  | "linked-evidence"
  | "needs-expansion";

export type TerpeneChapterSection = {
  id: TerpeneChapterSectionId;
  label: string;
  summary: string;
  status: TerpeneChapterSectionStatus;
  evidenceCount: number;
  sourceIds: string[];
};

export type TerpeneChapterCompleteness = {
  score: number;
  completeSections: number;
  foundationSections: number;
  linkedEvidenceSections: number;
  needsExpansionSections: number;
  totalSections: number;
};

export type TerpeneCompoundChapter = {
  compoundSlug: string;
  title: string;
  chapterNumber: number;
  introduction: string;
  learningObjectives: string[];
  sections: TerpeneChapterSection[];
  completeness: TerpeneChapterCompleteness;
  relatedCompounds: string[];
};

export type BuildChapterContext = {
  compound: TerpeneCompound;
  chapterNumber: number;
  mappedGeneCount: number;
  reviewedEvidenceCount: number;
  biologicalEvidenceCount?: number;
  safetyEvidenceCount?: number;
  stabilityEvidenceCount?: number;
  generalPostharvestEvidenceCount?: number;
  cultivationEvidenceCount?: number;
  postharvestEvidenceCount?: number;
  hasAssessment?: boolean;
  hasPhysicalPropertyRecord?: boolean;
  experimentalPropertyEvidenceCount?: number;
  sensoryEvidenceCount?: number;
  naturalOccurrenceEvidenceCount?: number;
  cultivarDistributionEvidenceCount?: number;
  stereoEvidenceCount?: number;
  analyticalMethodEvidenceCount?: number;
  exactEcologyEvidenceCount?: number;
  aggregateEcologyEvidenceCount?: number;
  applicationEvidenceCount?: number;
  relatedCompounds: TerpeneCompound[];
};
