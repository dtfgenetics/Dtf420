import fs from "node:fs";
import path from "node:path";

const validClaimTypes = new Set([
  "cannabis-occurrence",
  "terpene-synthase-function",
  "cultivar-sample",
  "sensory-descriptor",
  "biological-effect",
  "biosynthetic-pathway",
]);

const validStudyTypes = new Set([
  "chemical-analysis",
  "genomics",
  "enzyme-functional",
  "human-clinical",
  "human-observational",
  "animal",
  "in-vitro",
  "mechanistic",
  "sensory",
  "traditional-anecdotal",
]);

const validReviewStatuses = new Set([
  "draft",
  "source-verified",
  "editorial-reviewed",
  "rejected",
]);

export function validateEvidenceLedger(ledger, sourceRegistry) {
  const errors = [];
  const sourceIds = new Set((sourceRegistry.sources ?? []).map((source) => source.id));
  const ids = new Set();

  if (ledger.schemaVersion !== "1.0.0") errors.push("unsupported schemaVersion");
  if (!Array.isArray(ledger.records)) errors.push("records must be an array");

  for (const [index, record] of (ledger.records ?? []).entries()) {
    const prefix = `records[${index}]`;
    if (!record.id) errors.push(`${prefix}.id is required`);
    else if (ids.has(record.id)) errors.push(`${prefix}.id is duplicated: ${record.id}`);
    else ids.add(record.id);

    for (const field of ["compoundSlug", "statement", "sourceId", "sourceLocator", "populationOrMaterial"]) {
      if (!String(record[field] ?? "").trim()) errors.push(`${prefix}.${field} is required`);
    }

    if (!validClaimTypes.has(record.claimType)) errors.push(`${prefix}.claimType is invalid`);
    if (!validStudyTypes.has(record.studyType)) errors.push(`${prefix}.studyType is invalid`);
    if (!validReviewStatuses.has(record.reviewStatus)) errors.push(`${prefix}.reviewStatus is invalid`);
    if (record.sourceId && !sourceIds.has(record.sourceId)) {
      errors.push(`${prefix}.sourceId is not registered: ${record.sourceId}`);
    }

    if (record.value !== null && (!Number.isFinite(record.value) || !record.unit)) {
      errors.push(`${prefix} quantitative value requires a finite value and unit`);
    }

    if (record.claimType === "biological-effect" && record.studyType === "chemical-analysis") {
      errors.push(`${prefix} biological-effect cannot be supported only by chemical-analysis study type`);
    }

    if (record.reviewStatus === "editorial-reviewed" && !record.reviewedAt) {
      errors.push(`${prefix} editorial-reviewed requires reviewedAt`);
    }
  }

  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , ledgerArg = "data/terpenes/evidence-ledger.json", registryArg = "data/terpenes/source-registry.json"] = process.argv;
  const ledger = JSON.parse(fs.readFileSync(path.resolve(ledgerArg), "utf8"));
  const registry = JSON.parse(fs.readFileSync(path.resolve(registryArg), "utf8"));
  const errors = validateEvidenceLedger(ledger, registry);

  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }

  console.log(`Terpene evidence ledger valid: ${ledger.records.length} records.`);
}
