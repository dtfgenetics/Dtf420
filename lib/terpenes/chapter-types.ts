import type { TerpeneCompound } from "./types";

export type TerpeneChapterSectionId =
  | "identity"
  | "classification"
  | "physical-properties"
  | "stereochemistry"
  | "sensory"
  | "natural-occurrence"
  | "cannabis-occurrence"
  | "biosynthesis"
  | "genetics"
  | "cultivar-chemistry"
  | "cultivation-postharvest"
  | "research"
  | "safety"
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
  safetyEvidenceCount?: number;
  stabilityEvidenceCount?: number;
  generalPostharvestEvidenceCount?: number;
  hasAssessment?: boolean;
  hasPhysicalPropertyRecord?: boolean;
  experimentalPropertyEvidenceCount?: number;
  sensoryEvidenceCount?: number;
  stereoEvidenceCount?: number;
  relatedCompounds: TerpeneCompound[];
};
