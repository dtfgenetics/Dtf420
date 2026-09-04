import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const acquisitionPath = path.join(root, "content", "atlas-specimen-acquisition.json");
const specimenSetPath = path.join(root, "content", "atlas-specimen-set.json");

const [acquisitionText, specimenSetText] = await Promise.all([
  readFile(acquisitionPath, "utf8"),
  readFile(specimenSetPath, "utf8"),
]);

function parseJson(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} must be valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function assertExactSet(values, expected, label) {
  if (!Array.isArray(values)) throw new Error(`${label} must be an array.`);
  const actual = new Set(values);
  if (actual.size !== expected.length || expected.some((value) => !actual.has(value))) {
    throw new Error(`${label} must contain exactly: ${expected.join(", ")}.`);
  }
}

function assertHttps(value, label) {
  if (typeof value !== "string" || !value.startsWith("https://")) {
    throw new Error(`${label} must be an https URL.`);
  }
}

function assertAuditDate(value, label) {
  if (typeof value !== "string" || !/^20\d{2}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD.`);
  }
}

const acquisition = parseJson(acquisitionText, "Atlas specimen acquisition queue");
const specimenSet = parseJson(specimenSetText, "Atlas specimen set");

if (acquisition.schemaVersion !== 1) throw new Error("Atlas specimen acquisition schemaVersion must be 1.");
assertAuditDate(acquisition.updatedAt, "Atlas specimen acquisition updatedAt");
if (typeof acquisition.policy !== "string" || acquisition.policy.length < 120) {
  throw new Error("Atlas specimen acquisition policy must explicitly describe the fail-closed release boundary.");
}
if (!Array.isArray(acquisition.specimens)) throw new Error("Atlas specimen acquisition queue must define specimens.");

const requiredIds = (specimenSet.requiredSpecimens || []).map((specimen) => specimen.id);
if (!requiredIds.length) throw new Error("Atlas specimen set must define required specimens before acquisition can be verified.");
assertExactSet(acquisition.specimens.map((specimen) => specimen.id), requiredIds, "Atlas acquisition specimen ids");

const allowedRoutes = new Set([
  "acquire-or-custom-build",
  "acquire-and-adapt",
  "custom-scientific-build",
  "custom-build-or-distinct-acquisition",
]);
const allowedLeadStates = new Set(["research-only", "blocked-acquisition", "acquired-for-review", "rejected"]);
const seenPriorities = new Set();

for (const specimen of acquisition.specimens) {
  if (!allowedRoutes.has(specimen.productionRoute)) {
    throw new Error(`${specimen.id} has unsupported productionRoute ${specimen.productionRoute}.`);
  }
  if (!Number.isInteger(specimen.priority) || specimen.priority < 1 || specimen.priority > 6) {
    throw new Error(`${specimen.id} priority must be an integer from 1 through 6.`);
  }
  seenPriorities.add(specimen.priority);
  if (!Array.isArray(specimen.sourceLeads)) throw new Error(`${specimen.id} sourceLeads must be an array.`);
  if (typeof specimen.blockingNeed !== "string" || specimen.blockingNeed.trim().length < 40) {
    throw new Error(`${specimen.id} needs a substantive blockingNeed.`);
  }
  if (!specimen.scientificReference || typeof specimen.scientificReference !== "object") {
    throw new Error(`${specimen.id} needs a scientificReference object.`);
  }

  const reference = specimen.scientificReference;
  if (typeof reference.type !== "string" || reference.type.length < 3) {
    throw new Error(`${specimen.id} scientificReference.type is required.`);
  }
  const references = [];
  if (typeof reference.source === "string") references.push(reference.source);
  if (Array.isArray(reference.sources)) references.push(...reference.sources);
  if (!references.length) throw new Error(`${specimen.id} must provide at least one scientific reference source.`);
  for (const [index, source] of references.entries()) {
    if (source.startsWith("content/")) continue;
    assertHttps(source, `${specimen.id} scientific reference ${index + 1}`);
  }
  if (!references.every((source) => source.startsWith("content/"))) {
    assertAuditDate(reference.auditedAt, `${specimen.id} scientificReference.auditedAt`);
    if (typeof reference.license !== "string" || reference.license.trim().length < 2) {
      throw new Error(`${specimen.id} external scientific reference needs an audited license statement.`);
    }
  }
  if (typeof reference.notes === "string" && reference.notes.trim().length < 30) {
    throw new Error(`${specimen.id} scientificReference.notes must be substantive when present.`);
  }

  for (const [index, lead] of specimen.sourceLeads.entries()) {
    const label = `${specimen.id} source lead ${index + 1}`;
    for (const key of ["kind", "provider", "title", "license", "state", "notes"]) {
      if (typeof lead?.[key] !== "string" || lead[key].trim().length < 2) {
        throw new Error(`${label} needs ${key}.`);
      }
    }
    if (!allowedLeadStates.has(lead.state)) throw new Error(`${label} has unsupported state ${lead.state}.`);
    assertHttps(lead.url, `${label} url`);
    assertAuditDate(lead.auditedAt, `${label} auditedAt`);
    if (lead.notes.trim().length < 40) throw new Error(`${label} needs substantive review notes.`);
  }
}

const byId = new Map(acquisition.specimens.map((specimen) => [specimen.id, specimen]));
for (const specimenId of ["male", "hermaphrodite"]) {
  const specimen = byId.get(specimenId);
  if (specimen?.productionRoute !== "custom-scientific-build") {
    throw new Error(`${specimenId} must remain a custom-scientific-build lane until a reviewed reusable sex-specific 3D candidate is explicitly introduced.`);
  }
}

const flowering = byId.get("flowering");
if (flowering?.priority !== 1) {
  throw new Error("Flowering must remain priority 1 while it is the Atlas default specimen and first end-to-end production asset lane.");
}
if (!seenPriorities.has(1) || !seenPriorities.has(2)) {
  throw new Error("Atlas acquisition queue must retain an explicit primary lane and high-priority sex-phenotype lane.");
}

for (const [specimenId, slot] of Object.entries(specimenSet.releaseSlots || {})) {
  if (slot?.state !== "pending" || slot?.candidateId || slot?.desktopModel || slot?.mobileModel) {
    throw new Error(`Acquisition research cannot silently populate the production release slot for ${specimenId}.`);
  }
}

const leadCount = acquisition.specimens.reduce((total, specimen) => total + specimen.sourceLeads.length, 0);
console.log(`Atlas specimen acquisition queue verified (${acquisition.specimens.length} required specimens, ${leadCount} audited source leads, production slots remain fail-closed).`);
