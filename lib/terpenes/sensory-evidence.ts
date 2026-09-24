import sensoryCache from "@/data/terpenes/reviewed-pubchem-sensory-evidence.json";
import type { ExperimentalPropertyEvidence } from "./experimental-properties";

export type SensoryEvidenceHeading = "Odor" | "Odor Threshold" | "Taste";

export type ReviewedSensoryEvidenceRecord = {
  slug: string;
  pubchemCid: number;
  sourceId: "PUBCHEM-PUG-VIEW";
  fetchedAt: string;
  sensory: Record<SensoryEvidenceHeading, ExperimentalPropertyEvidence[]>;
};

type CacheShape = {
  schemaVersion: string;
  status: string;
  sourceId: string;
  generatedAt: string | null;
  headings: SensoryEvidenceHeading[];
  compounds: ReviewedSensoryEvidenceRecord[];
};

const cache = sensoryCache as CacheShape;
const bySlug = new Map(cache.compounds.map((record) => [record.slug, record]));

export function getReviewedSensoryEvidenceRecord(slug: string) {
  return bySlug.get(slug) ?? null;
}

export function countSensoryEvidence(record: ReviewedSensoryEvidenceRecord | null) {
  if (!record) return 0;
  return Object.values(record.sensory).reduce((sum, entries) => sum + entries.length, 0);
}

export function getReviewedSensoryEvidenceCacheStatus() {
  return {
    status: cache.status,
    generatedAt: cache.generatedAt,
    compoundCount: cache.compounds.length,
    headings: cache.headings,
  };
}
