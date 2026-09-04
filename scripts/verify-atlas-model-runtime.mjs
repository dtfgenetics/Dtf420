import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const runtimeDir = path.join(root, "public", "atlas-3d");
const indexPath = path.join(runtimeDir, "index.html");
const productionRuntimePath = path.join(runtimeDir, "atlas-production-model.js");
const manifestPath = path.join(runtimeDir, "models", "model-manifest.json");
const provenancePath = path.join(runtimeDir, "models", "MODEL_PROVENANCE.md");

const [index, productionRuntime, manifestText, provenance] = await Promise.all([
  readFile(indexPath, "utf8"),
  readFile(productionRuntimePath, "utf8"),
  readFile(manifestPath, "utf8"),
  readFile(provenancePath, "utf8"),
]);

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`${label} is missing required marker: ${needle}`);
}

function rejectText(haystack, needle, label) {
  if (haystack.includes(needle)) throw new Error(`${label} contains forbidden marker: ${needle}`);
}

function safeModelPath(value, label) {
  if (typeof value !== "string" || !value.startsWith("./") || !value.toLowerCase().endsWith(".glb") || value.includes("..")) {
    throw new Error(`${label} must be a safe relative .glb path.`);
  }
  return value;
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

for (const [needle, label] of [
  ["GLTFLoader", "Atlas runtime bootstrap"],
  ["startProductionAtlasRuntime", "Atlas runtime bootstrap"],
  ["startAtlasRuntime", "Atlas procedural fallback"],
  ["data-atlas-model-state", "Atlas model-state contract"],
  ["async function loadRuntimeModules()", "Atlas recoverable module loader"],
  ["import(\"three\")", "Atlas recoverable Three.js loader"],
  ["Promise.all([", "Atlas recoverable module loader"],
  ["announceRuntimeError", "Atlas bootstrap error surface"],
  ["module-load-failed", "Atlas module-load fallback contract"],
  ["boot-failed", "Atlas boot fallback contract"],
  ["atlas:runtime-error", "Atlas parent error contract"],
  ["dataset.atlasModelState = \"unavailable\"", "Atlas unavailable-state contract"],
  ["The accessible Atlas navigation remains active.", "Atlas accessible runtime fallback"],
]) requireText(index, needle, label);

for (const [needle, label] of [
  ["import * as THREE from \"three\";", "Atlas runtime bootstrap"],
  ["import { OrbitControls } from \"three/addons/controls/OrbitControls.js\";", "Atlas runtime bootstrap"],
  ["import { GLTFLoader } from \"three/addons/loaders/GLTFLoader.js\";", "Atlas runtime bootstrap"],
]) rejectText(index, needle, label);

for (const [needle, label] of [
  ["model-manifest.json", "production manifest loader"],
  ["selectModelVariant", "model variant selector"],
  ["navigator.connection", "data-saver model selection"],
  ["deviceMemory", "device-memory model selection"],
  ["atlasModelTier", "model-tier reporting"],
  ["loadAsync", "GLB loader"],
  ["new THREE.Box3", "model normalization"],
  ["targetHeight", "height normalization"],
  ["semanticMeshes", "semantic mesh mapping"],
  ["atlas:model-state", "model-state reporting"],
  ["production-model-load-failed", "GLB fallback handling"],
  ["webglcontextlost", "WebGL resilience"],
  ["pagehide", "runtime cleanup"],
]) requireText(productionRuntime, needle, label);

let manifest;
try {
  manifest = JSON.parse(manifestText);
} catch (error) {
  throw new Error(`Atlas model manifest must be valid JSON: ${error instanceof Error ? error.message : String(error)}`);
}

if (manifest.schemaVersion !== 1) throw new Error("Atlas model manifest schemaVersion must be 1.");
if (typeof manifest.available !== "boolean") throw new Error("Atlas model manifest available must be boolean.");
safeModelPath(manifest.model, "Atlas production model path");
if (!Number.isFinite(Number(manifest.targetHeight)) || Number(manifest.targetHeight) <= 0) throw new Error("Atlas model targetHeight must be positive.");

const variantPaths = new Map();
if (manifest.variants !== undefined) {
  if (!manifest.variants || typeof manifest.variants !== "object" || Array.isArray(manifest.variants)) {
    throw new Error("Atlas model variants must be an object when provided.");
  }
  for (const tier of ["desktop", "mobile"]) {
    const variant = manifest.variants[tier];
    if (!variant || typeof variant !== "object" || Array.isArray(variant)) {
      throw new Error(`Atlas model variants must define ${tier}.`);
    }
    const model = safeModelPath(variant.model, `Atlas ${tier} model path`);
    const maxDpr = Number(variant.maxDpr);
    if (!Number.isFinite(maxDpr) || maxDpr < 0.75 || maxDpr > 2) {
      throw new Error(`Atlas ${tier} maxDpr must be between 0.75 and 2.`);
    }
    variantPaths.set(tier, model);
  }
  if (manifest.variants.mobile.maxDpr > manifest.variants.desktop.maxDpr) {
    throw new Error("Atlas mobile maxDpr must not exceed desktop maxDpr.");
  }
}

const requiredEntities = ["root_system", "stem_vascular", "nodes_branching", "leaves", "flowers", "trichomes_resin", "sex_pollen_seed"];
const mappedEntities = Object.values(manifest.semanticMeshes || {});
for (const entity of requiredEntities) {
  if (!mappedEntities.includes(entity)) throw new Error(`Atlas model manifest is missing semantic mapping for ${entity}.`);
}

const releasePaths = new Set([manifest.model, ...variantPaths.values()]);
const resolvedReleasePaths = [...releasePaths].map((relativePath) => ({
  relativePath,
  filePath: path.join(runtimeDir, relativePath.replace(/^\.\//, "")),
}));

if (manifest.available) {
  for (const { relativePath, filePath } of resolvedReleasePaths) {
    if (!(await fileExists(filePath))) throw new Error(`Atlas production model is marked available but missing: ${relativePath}`);
    const info = await stat(filePath);
    if (info.size < 1024) throw new Error(`Atlas production GLB is implausibly small: ${relativePath}`);
  }
  for (const marker of ["license", "sha-256", "triangle", "botanical plausibility"]) {
    if (!provenance.toLowerCase().includes(marker)) throw new Error(`Released Atlas model provenance must document ${marker}.`);
  }
} else {
  for (const { relativePath, filePath } of resolvedReleasePaths) {
    if (await fileExists(filePath)) {
      throw new Error(`Atlas GLB exists while manifest.available=false (${relativePath}). Review provenance and explicitly release it or remove the candidate from the public runtime path.`);
    }
  }
  requireText(provenance, "No photorealistic production specimen set is released", "unreleased model provenance");
}

console.log(`Atlas production model pipeline verified (released=${manifest.available}, model=${manifest.modelVersion || "unversioned"}, variants=${variantPaths.size || 0}, recoverableModuleLoad=true).`);
