import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "content", "atlas-model-candidates.json");
const reviewPath = path.join(root, "content", "atlas-model-photorealism-review.json");
const specimenSetPath = path.join(root, "content", "atlas-specimen-set.json");
const manifestPath = path.join(root, "public", "atlas-3d", "models", "model-manifest.json");

const [registryText, reviewText, specimenSetText, manifestText] = await Promise.all([
  readFile(registryPath, "utf8"),
  readFile(reviewPath, "utf8"),
  readFile(specimenSetPath, "utf8"),
  readFile(manifestPath, "utf8"),
]);

function parseJson(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} must be valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const registry = parseJson(registryText, "Atlas model candidate registry");
const rubric = parseJson(reviewText, "Atlas model photorealism review");
const specimenSet = parseJson(specimenSetText, "Atlas specimen set");
const manifest = parseJson(manifestText, "Atlas model manifest");

const requiredSpecimenIds = ["seedling", "vegetative", "flowering", "male", "female", "hermaphrodite"];
const requiredCriterionIds = [
  "overall_photographic_realism",
  "leaflet_geometry_and_serration",
  "leaf_surface_and_venation",
  "nodes_internodes_and_branching",
  "stem_texture_and_taper",
  "reproductive_or_stage_accuracy",
  "flower_and_resin_accuracy",
  "root_architecture",
  "material_and_pbr_response",
  "color_and_texture_realism",
  "no_ai_or_generation_deformation",
  "no_low_poly_or_cardboard_read",
  "full_plant_consistency",
  "mobile_lod_fidelity",
];
const requiredViews = [
  "front_full_plant",
  "rear_full_plant",
  "left_profile",
  "right_profile",
  "canopy_top",
  "root_system",
  "leaf_macro",
  "node_stem_macro",
  "reproductive_or_stage_macro",
  "mobile_lod_comparison",
];

function assertExactSet(values, expected, label) {
  if (!Array.isArray(values)) throw new Error(`${label} must be an array.`);
  const actual = new Set(values);
  if (actual.size !== expected.length || expected.some((value) => !actual.has(value))) {
    throw new Error(`${label} must contain exactly: ${expected.join(", ")}.`);
  }
}

function isSafeGlbPath(value) {
  return typeof value === "string" && value.startsWith("./") && value.toLowerCase().endsWith(".glb") && !value.includes("..");
}

if (specimenSet.schemaVersion !== 1) throw new Error("Atlas specimen set schemaVersion must be 1.");
if (specimenSet.defaultSpecimen !== "flowering") throw new Error("Atlas specimen set defaultSpecimen must be flowering.");
if (!Array.isArray(specimenSet.requiredSpecimens)) throw new Error("Atlas specimen set must define requiredSpecimens.");
assertExactSet(specimenSet.requiredSpecimens.map((item) => item.id), requiredSpecimenIds, "Atlas required specimen ids");

for (const specimen of specimenSet.requiredSpecimens) {
  if (specimen.blocking !== true) throw new Error(`${specimen.id} must be a blocking required specimen.`);
  if (!new Set(["growth-stage", "reproductive-phenotype"]).has(specimen.dimension)) throw new Error(`${specimen.id} has invalid dimension ${specimen.dimension}.`);
  if (!Array.isArray(specimen.requiredTraits) || specimen.requiredTraits.length < 3) throw new Error(`${specimen.id} needs substantive requiredTraits.`);
}

const releaseSlots = specimenSet.releaseSlots || {};
assertExactSet(Object.keys(releaseSlots), requiredSpecimenIds, "Atlas specimen release slots");
const allowedSlotStates = new Set(["pending", "approved", "rejected"]);
for (const specimenId of requiredSpecimenIds) {
  const slot = releaseSlots[specimenId];
  if (!allowedSlotStates.has(slot?.state)) throw new Error(`${specimenId} release slot has invalid state ${slot?.state}.`);
  if (slot.state === "approved") {
    if (typeof slot.candidateId !== "string" || slot.candidateId.length < 2) throw new Error(`${specimenId} approved release slot needs candidateId.`);
    if (!isSafeGlbPath(slot.desktopModel)) throw new Error(`${specimenId} approved release slot needs a safe desktop GLB path.`);
    if (!isSafeGlbPath(slot.mobileModel)) throw new Error(`${specimenId} approved release slot needs a safe mobile GLB path.`);
  }
}

if (rubric.schemaVersion !== 2) throw new Error("Atlas photorealism review schemaVersion must be 2.");
const hardRequirement = String(rubric.hardRequirement || "").toLowerCase();
for (const phrase of ["real photographed cannabis plants", "seedling", "vegetative", "flowering", "male", "female", "hermaphrodite/intersex"]) {
  if (!hardRequirement.includes(phrase)) throw new Error(`Atlas photorealism hard requirement must explicitly include ${phrase}.`);
}

if (!Array.isArray(rubric.criteria)) throw new Error("Atlas photorealism review must define criteria.");
const criterionMap = new Map();
for (const criterion of rubric.criteria) {
  if (!criterion?.id || criterionMap.has(criterion.id)) throw new Error(`Invalid or duplicate photorealism criterion: ${criterion?.id || "missing"}.`);
  if (criterion.blocking !== true) throw new Error(`Photorealism criterion ${criterion.id} must be blocking.`);
  if (typeof criterion.requirement !== "string" || criterion.requirement.length < 30) throw new Error(`Photorealism criterion ${criterion.id} needs a substantive requirement.`);
  criterionMap.set(criterion.id, criterion);
}
for (const id of requiredCriterionIds) {
  if (!criterionMap.has(id)) throw new Error(`Atlas photorealism contract is missing required criterion ${id}.`);
}
assertExactSet(rubric.requiredReviewViews, requiredViews, "Atlas required photorealism views");

if (!rubric.specimenSpecificRequirements || typeof rubric.specimenSpecificRequirements !== "object") {
  throw new Error("Atlas photorealism review must define specimenSpecificRequirements.");
}
assertExactSet(Object.keys(rubric.specimenSpecificRequirements), requiredSpecimenIds, "Atlas specimen-specific photorealism requirements");
for (const specimenId of requiredSpecimenIds) {
  const requirements = rubric.specimenSpecificRequirements[specimenId];
  if (!Array.isArray(requirements) || requirements.length < 3) throw new Error(`${specimenId} needs specimen-specific realism requirements.`);
}

if (!Array.isArray(rubric.specimenReviews)) throw new Error("Atlas photorealism review must contain specimenReviews.");
const reviewMap = new Map();
const allowedReviewStates = new Set(["pending", "in-review", "approved", "rejected"]);
const allowedDecisions = new Set(["pending", "approved", "rejected"]);
const allowedResults = new Set(["pending", "pass", "fail"]);

for (const review of rubric.specimenReviews) {
  if (!requiredSpecimenIds.includes(review?.specimenId)) throw new Error(`Unknown photorealism specimen review ${review?.specimenId || "missing"}.`);
  if (reviewMap.has(review.specimenId)) throw new Error(`Duplicate photorealism review for ${review.specimenId}.`);
  if (!allowedReviewStates.has(review.state)) throw new Error(`${review.specimenId} has invalid photorealism review state ${review.state}.`);
  if (!allowedDecisions.has(review.overallDecision)) throw new Error(`${review.specimenId} has invalid photorealism decision ${review.overallDecision}.`);
  if (!review.evidence || typeof review.evidence.views !== "object") throw new Error(`${review.specimenId} needs an evidence.views object.`);
  if (!review.criteriaResults || typeof review.criteriaResults !== "object") throw new Error(`${review.specimenId} needs a criteriaResults object.`);
  for (const [criterionId, result] of Object.entries(review.criteriaResults)) {
    if (!criterionMap.has(criterionId)) throw new Error(`${review.specimenId} references unknown photorealism criterion ${criterionId}.`);
    if (!allowedResults.has(result?.result)) throw new Error(`${review.specimenId}.${criterionId} has invalid result ${result?.result}.`);
  }
  reviewMap.set(review.specimenId, review);
}
assertExactSet([...reviewMap.keys()], requiredSpecimenIds, "Atlas specimen photorealism reviews");

const candidateIds = new Set((registry.candidates || []).map((candidate) => candidate.id));
for (const specimenId of requiredSpecimenIds) {
  const slot = releaseSlots[specimenId];
  const review = reviewMap.get(specimenId);
  if (review.candidateId !== null && !candidateIds.has(review.candidateId)) {
    throw new Error(`${specimenId} photorealism review references unknown candidate ${review.candidateId}.`);
  }
  if (slot.state !== "approved") continue;
  if (!candidateIds.has(slot.candidateId)) throw new Error(`${specimenId} approved release slot references unknown candidate ${slot.candidateId}.`);
  if (review.candidateId !== slot.candidateId) throw new Error(`${specimenId} approved slot candidate must match its photorealism review candidate.`);
  if (review.state !== "approved" || review.overallDecision !== "approved") throw new Error(`${specimenId} cannot be released until its photorealism review is approved.`);
  if (typeof review.reviewer !== "string" || review.reviewer.trim().length < 2) throw new Error(`${specimenId} approved photorealism review needs a reviewer.`);
  if (typeof review.reviewedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt)) throw new Error(`${specimenId} approved photorealism review needs reviewedAt YYYY-MM-DD.`);
  if (!Array.isArray(review.notes) || review.notes.length < 1) throw new Error(`${specimenId} approved photorealism review needs reviewer notes.`);
  for (const view of requiredViews) {
    const evidence = review.evidence.views[view];
    if (typeof evidence !== "string" || evidence.trim().length < 4) throw new Error(`${specimenId} is missing required photorealism evidence view ${view}.`);
  }
  for (const criterionId of requiredCriterionIds) {
    const result = review.criteriaResults[criterionId];
    if (!result || result.result !== "pass") throw new Error(`${specimenId} must pass blocking photorealism criterion ${criterionId}.`);
    if (typeof result.notes !== "string" || result.notes.trim().length < 12) throw new Error(`${specimenId}.${criterionId} needs substantive review notes.`);
  }
}

const manifestSpecimenSet = manifest.specimenSet;
if (!manifestSpecimenSet || typeof manifestSpecimenSet !== "object") throw new Error("Atlas model manifest must define specimenSet metadata.");
if (manifestSpecimenSet.defaultSpecimen !== "flowering") throw new Error("Atlas model manifest specimenSet.defaultSpecimen must be flowering.");
assertExactSet(manifestSpecimenSet.requiredSpecimens, requiredSpecimenIds, "Atlas manifest required specimens");

if (manifest.available === true) {
  if (manifestSpecimenSet.enabled !== true) throw new Error("Released Atlas production model requires specimenSet.enabled=true.");
  const unapproved = requiredSpecimenIds.filter((id) => releaseSlots[id].state !== "approved");
  if (unapproved.length) throw new Error(`Atlas production release is blocked until all six specimen slots are approved: ${unapproved.join(", ")}.`);
} else if (manifestSpecimenSet.enabled === true) {
  throw new Error("Atlas specimenSet cannot be enabled while the public production model manifest is unavailable.");
}

console.log(`Atlas photorealism specimen-set gate verified (${requiredSpecimenIds.length} required specimens, ${rubric.criteria.length} blocking criteria, released=${manifest.available === true}).`);
