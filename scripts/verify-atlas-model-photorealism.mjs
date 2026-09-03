import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "content", "atlas-model-candidates.json");
const reviewPath = path.join(root, "content", "atlas-model-photorealism-review.json");
const manifestPath = path.join(root, "public", "atlas-3d", "models", "model-manifest.json");

const [registryText, reviewText, manifestText] = await Promise.all([
  readFile(registryPath, "utf8"),
  readFile(reviewPath, "utf8"),
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
const manifest = parseJson(manifestText, "Atlas model manifest");

if (rubric.schemaVersion !== 1) throw new Error("Atlas photorealism review schemaVersion must be 1.");
if (typeof rubric.hardRequirement !== "string" || !rubric.hardRequirement.toLowerCase().includes("real photographed flowering cannabis plant")) {
  throw new Error("Atlas photorealism contract must explicitly require a real photographed flowering cannabis plant appearance.");
}

const requiredCriterionIds = [
  "overall_photographic_realism",
  "leaflet_geometry_and_serration",
  "leaf_surface_and_venation",
  "nodes_internodes_and_branching",
  "stem_texture_and_taper",
  "mature_flower_morphology",
  "sugar_leaves_and_resin_character",
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
  "flower_macro",
  "node_stem_macro",
  "mobile_lod_comparison",
];

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

if (!Array.isArray(rubric.requiredReviewViews)) throw new Error("Atlas photorealism review must define requiredReviewViews.");
const viewSet = new Set(rubric.requiredReviewViews);
for (const view of requiredViews) {
  if (!viewSet.has(view)) throw new Error(`Atlas photorealism contract is missing required review view ${view}.`);
}

if (!Array.isArray(rubric.reviews)) throw new Error("Atlas photorealism review must contain candidate reviews.");
const reviewMap = new Map();
const allowedReviewStates = new Set(["pending", "in-review", "approved", "rejected"]);
const allowedDecisions = new Set(["pending", "approved", "rejected"]);
const allowedResults = new Set(["pending", "pass", "fail"]);

for (const review of rubric.reviews) {
  if (!review?.candidateId || reviewMap.has(review.candidateId)) throw new Error(`Invalid or duplicate photorealism review for ${review?.candidateId || "missing candidate"}.`);
  if (!allowedReviewStates.has(review.state)) throw new Error(`${review.candidateId} has invalid photorealism review state ${review.state}.`);
  if (!allowedDecisions.has(review.overallDecision)) throw new Error(`${review.candidateId} has invalid photorealism decision ${review.overallDecision}.`);
  if (!review.evidence || typeof review.evidence.views !== "object") throw new Error(`${review.candidateId} needs an evidence.views object.`);
  if (!review.criteriaResults || typeof review.criteriaResults !== "object") throw new Error(`${review.candidateId} needs a criteriaResults object.`);

  for (const [criterionId, result] of Object.entries(review.criteriaResults)) {
    if (!criterionMap.has(criterionId)) throw new Error(`${review.candidateId} references unknown photorealism criterion ${criterionId}.`);
    if (!allowedResults.has(result?.result)) throw new Error(`${review.candidateId}.${criterionId} has invalid result ${result?.result}.`);
  }
  reviewMap.set(review.candidateId, review);
}

const candidateIds = new Set((registry.candidates || []).map((candidate) => candidate.id));
for (const candidateId of candidateIds) {
  if (!reviewMap.has(candidateId)) throw new Error(`Atlas model candidate ${candidateId} is missing a photorealism review record.`);
}
for (const candidateId of reviewMap.keys()) {
  if (!candidateIds.has(candidateId)) throw new Error(`Photorealism review references unknown Atlas candidate ${candidateId}.`);
}

const releaseEligible = (registry.candidates || []).filter((candidate) => candidate.releaseEligible === true);
for (const candidate of releaseEligible) {
  const review = reviewMap.get(candidate.id);
  if (review.state !== "approved" || review.overallDecision !== "approved") {
    throw new Error(`${candidate.id} cannot be released until photorealism review is explicitly approved.`);
  }
  if (typeof review.reviewer !== "string" || review.reviewer.trim().length < 2) throw new Error(`${candidate.id} approved photorealism review needs a reviewer.`);
  if (typeof review.reviewedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt)) throw new Error(`${candidate.id} approved photorealism review needs reviewedAt YYYY-MM-DD.`);
  if (!Array.isArray(review.notes) || review.notes.length < 1) throw new Error(`${candidate.id} approved photorealism review needs reviewer notes.`);

  for (const view of requiredViews) {
    const evidence = review.evidence.views[view];
    if (typeof evidence !== "string" || evidence.trim().length < 4) throw new Error(`${candidate.id} is missing required photorealism evidence view ${view}.`);
  }

  for (const criterionId of requiredCriterionIds) {
    const result = review.criteriaResults[criterionId];
    if (!result || result.result !== "pass") throw new Error(`${candidate.id} must pass blocking photorealism criterion ${criterionId}.`);
    if (typeof result.notes !== "string" || result.notes.trim().length < 12) throw new Error(`${candidate.id}.${criterionId} needs substantive review notes.`);
  }
}

if (manifest.available === true) {
  if (releaseEligible.length !== 1) throw new Error("A released Atlas production model requires exactly one release-eligible candidate.");
  const released = releaseEligible[0];
  const review = reviewMap.get(released.id);
  if (review.state !== "approved" || review.overallDecision !== "approved") {
    throw new Error(`Public Atlas model ${released.id} is released without approved photorealism review.`);
  }
}

console.log(`Atlas photorealism release gate verified (${rubric.criteria.length} blocking criteria, ${rubric.requiredReviewViews.length} required views, ${releaseEligible.length} release-eligible).`);
