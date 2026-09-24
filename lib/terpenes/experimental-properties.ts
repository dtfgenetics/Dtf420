import experimentalCache from "@/data/terpenes/reviewed-pubchem-experimental-properties.json";

export type ExperimentalPropertyReference = {
  referenceNumber: number;
  sourceName: string | null;
  sourceId: string | null;
  name: string | null;
  description: string | null;
  url: string | null;
};

export type ExperimentalPropertyEvidence = {
  reportedValue: string;
  name: string | null;
  description: string | null;
  references: ExperimentalPropertyReference[];
};

export type ExperimentalPropertyHeading =
  | "Boiling Point"
  | "Melting Point"
  | "Vapor Pressure"
  | "Density"
  | "Flash Point"
  | "Refractive Index";

export type ReviewedExperimentalPropertyRecord = {
  slug: string;
  pubchemCid: number;
  sourceId: "PUBCHEM-PUG-VIEW";
  fetchedAt: string;
  properties: Record<ExperimentalPropertyHeading, ExperimentalPropertyEvidence[]>;
};

type CacheShape = {
  schemaVersion: string;
  status: string;
  sourceId: string;
  generatedAt: string | null;
  headings: ExperimentalPropertyHeading[];
  compounds: ReviewedExperimentalPropertyRecord[];
};

const cache = experimentalCache as CacheShape;
const bySlug = new Map(cache.compounds.map((record) => [record.slug, record]));

export function getReviewedExperimentalPropertyRecord(slug: string) {
  return bySlug.get(slug) ?? null;
}

export function countExperimentalPropertyEvidence(record: ReviewedExperimentalPropertyRecord | null) {
  if (!record) return 0;
  return Object.values(record.properties).reduce((sum, entries) => sum + entries.length, 0);
}

export function getReviewedExperimentalPropertyCacheStatus() {
  return {
    status: cache.status,
    generatedAt: cache.generatedAt,
    compoundCount: cache.compounds.length,
    headings: cache.headings,
  };
}
