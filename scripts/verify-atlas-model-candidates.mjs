import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "content", "atlas-model-candidates.json");
const manifestPath = path.join(root, "public", "atlas-3d", "models", "model-manifest.json");

const [registryText, manifestText] = await Promise.all([
  readFile(registryPath, "utf8"),
  readFile(manifestPath, "utf8"),
]);

let registry;
let manifest;
try {
  registry = JSON.parse(registryText);
} catch (error) {
  throw new Error(`Atlas model candidate registry must be valid JSON: ${error instanceof Error ? error.message : String(error)}`);
}
try {
  manifest = JSON.parse(manifestText);
} catch (error) {
  throw new Error(`Atlas model manifest must be valid JSON: ${error instanceof Error ? error.message : String(error)}`);
}

if (registry.schemaVersion !== 1) throw new Error("Atlas model candidate registry schemaVersion must be 1.");
if (!Array.isArray(registry.candidates) || registry.candidates.length < 1) throw new Error("Atlas model candidate registry must contain candidates.");
if (!Array.isArray(registry.requiredSemanticEntities) || registry.requiredSemanticEntities.length < 7) {
  throw new Error("Atlas candidate registry must declare all required semantic entities.");
}

for (const tier of ["desktop", "mobile"]) {
  const budget = registry.performanceBudget?.[tier];
  if (!budget) throw new Error(`Atlas candidate registry is missing ${tier} performance budget.`);
  for (const field of ["maxTriangles", "maxGlbBytes", "maxTextureEdge"]) {
    if (!Number.isFinite(Number(budget[field])) || Number(budget[field]) <= 0) {
      throw new Error(`${tier}.${field} must be a positive number.`);
    }
  }
}
if (registry.performanceBudget.mobile.maxTriangles >= registry.performanceBudget.desktop.maxTriangles) {
  throw new Error("Atlas mobile triangle budget must be lower than desktop.");
}
if (registry.performanceBudget.mobile.maxGlbBytes >= registry.performanceBudget.desktop.maxGlbBytes) {
  throw new Error("Atlas mobile GLB byte budget must be lower than desktop.");
}
if (registry.performanceBudget.mobile.maxTextureEdge >= registry.performanceBudget.desktop.maxTextureEdge) {
  throw new Error("Atlas mobile texture-edge budget must be lower than desktop.");
}

const ids = new Set();
const releaseEligible = [];
const primaryCandidates = [];
const allowedRoles = new Set(["primary-candidate", "alternate-candidate", "quality-benchmark"]);
const allowedStatuses = new Set([
  "researching",
  "blocked-acquisition",
  "ingested",
  "qa-failed",
  "qa-passed",
  "approved-for-release",
  "benchmark-only",
  "rejected",
]);
const allowedRights = new Set([
  "unknown",
  "listing-indicates-attribution-license",
  "commercial-license-required",
  "verified-for-public-web",
  "rejected",
]);
const allowedAcquisition = new Set(["not-ingested", "ingested"]);
const triState = new Set(["yes", "no", "pending-review", "no-per-listing-category"]);

function requireMeasuredNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} must be a positive measured number.`);
  return number;
}

function verifyMobileMetrics(metrics, candidateId) {
  if (!metrics || metrics.result !== "pass") throw new Error(`${candidateId} requires a passing mobileVariant.`);
  const mobileBudget = registry.performanceBudget.mobile;
  const triangles = requireMeasuredNumber(metrics.triangles, `${candidateId} mobileVariant.triangles`);
  const fileBytes = requireMeasuredNumber(metrics.fileBytes, `${candidateId} mobileVariant.fileBytes`);
  const maxTextureEdge = requireMeasuredNumber(metrics.maxTextureEdge, `${candidateId} mobileVariant.maxTextureEdge`);
  if (triangles > mobileBudget.maxTriangles) throw new Error(`${candidateId} mobile LOD exceeds triangle budget.`);
  if (fileBytes > mobileBudget.maxGlbBytes) throw new Error(`${candidateId} mobile LOD exceeds GLB byte budget.`);
  if (maxTextureEdge > mobileBudget.maxTextureEdge) throw new Error(`${candidateId} mobile LOD exceeds texture-edge budget.`);
}

function hasClickableAtlasCoverage() {
  const hotspots = manifest.semanticHotspots;
  if (!hotspots || typeof hotspots !== "object" || Array.isArray(hotspots)) return false;
  return registry.requiredSemanticEntities.every((entityId) => {
    const entry = hotspots[entityId];
    return Array.isArray(entry) ? entry.length > 0 : Boolean(entry);
  });
}

for (const candidate of registry.candidates) {
  if (!candidate?.id || !/^[a-z0-9][a-z0-9-]+$/.test(candidate.id)) {
    throw new Error("Every Atlas model candidate needs a stable kebab-case id.");
  }
  if (ids.has(candidate.id)) throw new Error(`Duplicate Atlas model candidate id: ${candidate.id}`);
  ids.add(candidate.id);

  if (!allowedRoles.has(candidate.role)) throw new Error(`${candidate.id} has invalid role ${candidate.role}.`);
  if (candidate.role === "primary-candidate") primaryCandidates.push(candidate.id);
  if (!allowedStatuses.has(candidate.status)) throw new Error(`${candidate.id} has invalid status ${candidate.status}.`);
  if (!candidate.title || !candidate.creator) throw new Error(`${candidate.id} needs title and creator.`);
  if (!candidate.source?.provider || typeof candidate.source.url !== "string" || !candidate.source.url.startsWith("https://")) {
    throw new Error(`${candidate.id} needs an HTTPS source URL and provider.`);
  }
  if (!allowedRights.has(candidate.rights?.state)) throw new Error(`${candidate.id} has invalid rights state ${candidate.rights?.state}.`);
  if (!candidate.rights?.rightsBasis) throw new Error(`${candidate.id} needs a rightsBasis note.`);
  if (candidate.rights.state === "verified-for-public-web") {
    for (const field of ["publicWebsiteUseApproved", "modificationApproved", "redistributionApproved"]) {
      if (candidate.rights[field] !== true) throw new Error(`${candidate.id} verified rights require rights.${field}=true.`);
    }
  }
  if (!allowedAcquisition.has(candidate.acquisition?.state)) throw new Error(`${candidate.id} has invalid acquisition state ${candidate.acquisition?.state}.`);

  for (const field of ["fullCanopyPresent", "exposedRootsPresent", "potOrSceneryBakedIntoPlant"]) {
    if (!triState.has(candidate.atlasFit?.[field])) throw new Error(`${candidate.id} has invalid atlasFit.${field}.`);
  }
  if (!["pending", "approved", "rejected"].includes(candidate.atlasFit?.botanicalReview)) {
    throw new Error(`${candidate.id} has invalid botanicalReview.`);
  }
  if (!["pending", "complete", "not-applicable"].includes(candidate.atlasFit?.semanticMeshMapping)) {
    throw new Error(`${candidate.id} has invalid semanticMeshMapping.`);
  }
  if (!["pending", "required", "complete", "not-required"].includes(candidate.atlasFit?.mobileLod)) {
    throw new Error(`${candidate.id} has invalid mobileLod.`);
  }
  if (!Array.isArray(candidate.atlasFit?.notes) || candidate.atlasFit.notes.length < 1) {
    throw new Error(`${candidate.id} needs Atlas fit notes.`);
  }

  const localPath = candidate.acquisition.localCandidatePath;
  if (localPath) {
    if (path.isAbsolute(localPath) || localPath.includes("..") || !localPath.startsWith("assets/atlas-model-candidates/")) {
      throw new Error(`${candidate.id} candidate path must stay under assets/atlas-model-candidates/.`);
    }
    if (!candidate.rights.redistributionApproved) {
      throw new Error(`${candidate.id} cannot commit a candidate binary before redistribution rights are approved.`);
    }
    try {
      await access(path.join(root, localPath));
    } catch {
      throw new Error(`${candidate.id} references a missing candidate binary: ${localPath}`);
    }
  }

  if (!candidate.releaseEligible) continue;
  releaseEligible.push(candidate);
  if (candidate.role === "quality-benchmark") throw new Error(`${candidate.id} is a benchmark and cannot be releaseEligible.`);
  if (candidate.status !== "approved-for-release") throw new Error(`${candidate.id} must be approved-for-release before releaseEligible=true.`);
  if (candidate.rights.state !== "verified-for-public-web") throw new Error(`${candidate.id} rights must be verified-for-public-web before release.`);
  for (const field of ["publicWebsiteUseApproved", "modificationApproved", "redistributionApproved"]) {
    if (candidate.rights[field] !== true) throw new Error(`${candidate.id} rights.${field} must be true before release.`);
  }
  if (candidate.acquisition.state !== "ingested" || !localPath) throw new Error(`${candidate.id} must be ingested before release.`);
  if (!/^[a-f0-9]{64}$/i.test(candidate.acquisition.sha256 || "")) throw new Error(`${candidate.id} needs a final SHA-256 before release.`);
  const fileBytes = requireMeasuredNumber(candidate.acquisition.fileBytes, `${candidate.id} acquisition.fileBytes`);
  if (candidate.atlasFit.fullCanopyPresent !== "yes") throw new Error(`${candidate.id} must include the full canopy before release.`);
  if (candidate.atlasFit.exposedRootsPresent !== "yes") throw new Error(`${candidate.id} must include exposed roots before release.`);
  if (candidate.atlasFit.potOrSceneryBakedIntoPlant !== "no") throw new Error(`${candidate.id} must contain no baked pot/scenery before release.`);
  if (candidate.atlasFit.botanicalReview !== "approved") throw new Error(`${candidate.id} needs approved botanical review before release.`);

  const hasExactMeshMapping = candidate.atlasFit.semanticMeshMapping === "complete";
  const usesClickableHotspots = candidate.atlasFit.semanticMeshMapping === "not-applicable" && hasClickableAtlasCoverage();
  if (!hasExactMeshMapping && !usesClickableHotspots) {
    throw new Error(`${candidate.id} needs either complete semantic meshes or complete clickable semanticHotspots before release.`);
  }

  if (!candidate.measuredQa || candidate.measuredQa.result !== "pass") throw new Error(`${candidate.id} needs measuredQa.result=pass before release.`);

  const desktop = registry.performanceBudget.desktop;
  const desktopTriangles = requireMeasuredNumber(candidate.measuredQa.triangles, `${candidate.id} measuredQa.triangles`);
  const desktopTextureEdge = requireMeasuredNumber(candidate.measuredQa.maxTextureEdge, `${candidate.id} measuredQa.maxTextureEdge`);
  if (desktopTriangles > desktop.maxTriangles) throw new Error(`${candidate.id} exceeds desktop triangle budget.`);
  if (fileBytes > desktop.maxGlbBytes) throw new Error(`${candidate.id} exceeds desktop GLB byte budget.`);
  if (desktopTextureEdge > desktop.maxTextureEdge) throw new Error(`${candidate.id} exceeds desktop texture-edge budget.`);

  if (candidate.atlasFit.mobileLod === "complete") {
    verifyMobileMetrics(candidate.mobileVariant, candidate.id);
  } else if (candidate.atlasFit.mobileLod === "not-required") {
    const mobile = registry.performanceBudget.mobile;
    if (desktopTriangles > mobile.maxTriangles) throw new Error(`${candidate.id} cannot mark mobileLod=not-required because the desktop model exceeds the mobile triangle budget.`);
    if (fileBytes > mobile.maxGlbBytes) throw new Error(`${candidate.id} cannot mark mobileLod=not-required because the desktop model exceeds the mobile GLB byte budget.`);
    if (desktopTextureEdge > mobile.maxTextureEdge) throw new Error(`${candidate.id} cannot mark mobileLod=not-required because the desktop textures exceed the mobile texture budget.`);
  } else {
    throw new Error(`${candidate.id} must resolve mobileLod to complete or not-required before release.`);
  }
}

if (primaryCandidates.length !== 1) {
  throw new Error(`Atlas candidate registry must have exactly one primary-candidate; found ${primaryCandidates.length}.`);
}

if (manifest.available === true) {
  if (releaseEligible.length !== 1) {
    throw new Error(`Public Atlas manifest is released but candidate registry has ${releaseEligible.length} release-eligible candidates; exactly one is required.`);
  }
  const released = releaseEligible[0];
  if (manifest.modelVersion !== released.id) {
    throw new Error(`Public Atlas modelVersion (${manifest.modelVersion}) must equal the approved candidate id (${released.id}).`);
  }
  if (manifest.variants?.mobile) {
    if (released.atlasFit.mobileLod === "complete" && !released.mobileVariant) {
      throw new Error(`${released.id} manifest exposes a mobile model but registry lacks mobileVariant evidence.`);
    }
    if (released.atlasFit.mobileLod === "not-required" && manifest.variants.desktop?.model !== manifest.variants.mobile?.model) {
      throw new Error(`${released.id} marks mobileLod=not-required but manifest points mobile to a different GLB.`);
    }
  }
} else if (releaseEligible.length > 0) {
  throw new Error("A candidate is marked releaseEligible while the public Atlas manifest remains unavailable. Promote both in one reviewed release change.");
}

console.log(`Atlas model candidate policy verified (${registry.candidates.length} candidates, ${releaseEligible.length} release-eligible, primary=${primaryCandidates[0]}).`);
