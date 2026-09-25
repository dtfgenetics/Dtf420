import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readSeedSlugs() {
  const source = fs.readFileSync(path.join(root, "lib/terpenes/data.ts"), "utf8");
  return new Set([...source.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]));
}

const validReviewStates = new Set(["source-verified", "editorial-reviewed"]);
const validAnalyticalIdentityStates = new Set([
  "named-reference-standard",
  "general-method-review",
]);
const validEcologyIdentityStates = new Set(["exact", "isomer-unresolved"]);

export function validateStructuredContext({
  analyticalMethods,
  ecologicalRoles,
  applications,
  sourceRegistry,
  seedSlugs,
}) {
  const errors = [];
  const sourceIds = new Set((sourceRegistry.sources ?? []).map((source) => source.id));
  const seenIds = new Set();

  function checkCommon(record, prefix) {
    if (!record.id) errors.push(`${prefix}.id is required`);
    else if (seenIds.has(record.id)) errors.push(`${prefix}.id is duplicated: ${record.id}`);
    else seenIds.add(record.id);

    if (!record.sourceId || !sourceIds.has(record.sourceId)) {
      errors.push(`${prefix}.sourceId is missing or unregistered: ${record.sourceId ?? "(missing)"}`);
    }
    if (!validReviewStates.has(record.reviewStatus)) {
      errors.push(`${prefix}.reviewStatus must be source-verified or editorial-reviewed`);
    }
  }

  if (analyticalMethods.schemaVersion !== "1.0.0") {
    errors.push("analytical-methods schemaVersion must be 1.0.0");
  }
  for (const [index, record] of (analyticalMethods.records ?? []).entries()) {
    const prefix = `analyticalMethods.records[${index}]`;
    checkCommon(record, prefix);
    if (!Array.isArray(record.compoundSlugs)) errors.push(`${prefix}.compoundSlugs must be an array`);
    for (const slug of record.compoundSlugs ?? []) {
      if (!seedSlugs.has(slug)) errors.push(`${prefix}.compoundSlugs contains unknown slug: ${slug}`);
    }
    if (!validAnalyticalIdentityStates.has(record.identityResolution)) {
      errors.push(`${prefix}.identityResolution is invalid: ${record.identityResolution}`);
    }
    for (const field of ["title", "matrix", "technique", "extraction", "validationFramework", "quantificationContext"]) {
      if (!String(record[field] ?? "").trim()) errors.push(`${prefix}.${field} is required`);
    }
    if (record.identityResolution === "named-reference-standard" && !(record.compoundSlugs ?? []).length) {
      errors.push(`${prefix} named-reference-standard requires compoundSlugs`);
    }
    if (record.identityResolution === "general-method-review" && (record.compoundSlugs ?? []).length) {
      errors.push(`${prefix} general-method-review must not imply compound-specific validation`);
    }
  }

  if (ecologicalRoles.schemaVersion !== "1.0.0") {
    errors.push("ecological-roles schemaVersion must be 1.0.0");
  }
  for (const [index, record] of (ecologicalRoles.records ?? []).entries()) {
    const prefix = `ecologicalRoles.records[${index}]`;
    checkCommon(record, prefix);
    if (!Array.isArray(record.compoundSlugs) || !record.compoundSlugs.length) {
      errors.push(`${prefix}.compoundSlugs must contain at least one reviewed compound`);
    }
    for (const slug of record.compoundSlugs ?? []) {
      if (!seedSlugs.has(slug)) errors.push(`${prefix}.compoundSlugs contains unknown slug: ${slug}`);
    }
    if (!validEcologyIdentityStates.has(record.identityResolution)) {
      errors.push(`${prefix}.identityResolution is invalid: ${record.identityResolution}`);
    }
    if (!String(record.identityScope ?? "").trim()) errors.push(`${prefix}.identityScope is required`);
    if (!Array.isArray(record.roleTypes) || !record.roleTypes.length) {
      errors.push(`${prefix}.roleTypes must contain at least one ecological role`);
    }
    for (const field of ["title", "statement", "organismContext", "evidenceBasis", "notes"]) {
      if (!String(record[field] ?? "").trim()) errors.push(`${prefix}.${field} is required`);
    }
    if (
      record.identityResolution === "isomer-unresolved" &&
      record.compoundSlugs.length < 2
    ) {
      errors.push(`${prefix} isomer-unresolved evidence should map to every affected reviewed identity`);
    }
  }

  if (applications.schemaVersion !== "1.0.0") {
    errors.push("applications schemaVersion must be 1.0.0");
  }
  for (const [index, record] of (applications.records ?? []).entries()) {
    const prefix = `applications.records[${index}]`;
    checkCommon(record, prefix);
    if (!seedSlugs.has(record.compoundSlug)) {
      errors.push(`${prefix}.compoundSlug is unknown: ${record.compoundSlug}`);
    }
    if (!Array.isArray(record.sectors) || !record.sectors.length) {
      errors.push(`${prefix}.sectors must contain at least one sector`);
    }
    if (!Array.isArray(record.applications) || !record.applications.length) {
      errors.push(`${prefix}.applications must contain at least one application`);
    }
    for (const field of ["statement", "notes"]) {
      if (!String(record[field] ?? "").trim()) errors.push(`${prefix}.${field} is required`);
    }
  }

  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = validateStructuredContext({
    analyticalMethods: readJson("data/terpenes/analytical-methods.json"),
    ecologicalRoles: readJson("data/terpenes/ecological-roles.json"),
    applications: readJson("data/terpenes/applications.json"),
    sourceRegistry: readJson("data/terpenes/source-registry.json"),
    seedSlugs: readSeedSlugs(),
  });

  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }

  console.log("Structured terpene chapter context valid: analytical methods, ecological roles, applications, source IDs, reviewed slugs, and identity scopes.");
}
