import occurrenceCache from "@/data/terpenes/reviewed-pubchem-natural-occurrence.json";
import type { ExperimentalPropertyEvidence } from "./experimental-properties";

export type NaturalOccurrenceHeading = "Natural Occurrence";

export type ReviewedNaturalOccurrenceRecord = {
  slug: string;
  pubchemCid: number;
  sourceId: "PUBCHEM-PUG-VIEW";
  fetchedAt: string;
  occurrence: Record<NaturalOccurrenceHeading, ExperimentalPropertyEvidence[]>;
};

type CacheShape = {
  schemaVersion: string;
  status: string;
  sourceId: string;
  generatedAt: string | null;
  headings: NaturalOccurrenceHeading[];
  compounds: ReviewedNaturalOccurrenceRecord[];
};

const cache = occurrenceCache as CacheShape;
const bySlug = new Map(cache.compounds.map((record) => [record.slug, record]));

export function getReviewedNaturalOccurrenceRecord(slug: string) {
  return bySlug.get(slug) ?? null;
}

export function countNaturalOccurrenceEvidence(record: ReviewedNaturalOccurrenceRecord | null) {
  if (!record) return 0;
  return Object.values(record.occurrence).reduce((sum, entries) => sum + entries.length, 0);
}

export function getReviewedNaturalOccurrenceCacheStatus() {
  return {
    status: cache.status,
    generatedAt: cache.generatedAt,
    compoundCount: cache.compounds.length,
    headings: cache.headings,
  };
}
