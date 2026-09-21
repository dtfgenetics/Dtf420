import evidenceLedger from "@/data/terpenes/evidence-ledger.json";
import sourceRegistry from "@/data/terpenes/source-registry.json";
import type { ResearchEvidenceRecord, ResearchSource } from "./research";

const records = evidenceLedger.records as ResearchEvidenceRecord[];
const sources = sourceRegistry.sources as ResearchSource[];
const sourceById = new Map(sources.map((source) => [source.id, source]));
const publicReviewStates = new Set(["source-verified", "editorial-reviewed"]);

export type ReviewedCompoundEvidence = {
  record: ResearchEvidenceRecord;
  source: ResearchSource | null;
};

export function getReviewedEvidenceForCompound(compoundSlug: string): ReviewedCompoundEvidence[] {
  return records
    .filter((record) => record.compoundSlug === compoundSlug && publicReviewStates.has(record.reviewStatus))
    .map((record) => ({ record, source: sourceById.get(record.sourceId) ?? null }));
}

export function getReviewedEvidenceCountForCompound(compoundSlug: string) {
  return records.filter(
    (record) => record.compoundSlug === compoundSlug && publicReviewStates.has(record.reviewStatus),
  ).length;
}
