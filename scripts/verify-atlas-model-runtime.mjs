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

for (const [needle, label] of [
  ["GLTFLoader", "Atlas runtime bootstrap"],
  ["startProductionAtlasRuntime", "Atlas runtime bootstrap"],
  ["startAtlasRuntime", "Atlas procedural fallback"],
  ["data-atlas-model-state", "Atlas model-state contract"],
]) requireText(index, needle, label);

for (const [needle, label] of [
  ["model-manifest.json", "production manifest loader"],
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
if (typeof manifest.model !== "string" || !manifest.model.startsWith("./") || !manifest.model.toLowerCase().endsWith(".glb") || manifest.model.includes("..")) {
  throw new Error("Atlas production model path must be a safe relative .glb path.");
}
if (!Number.isFinite(Number(manifest.targetHeight)) || Number(manifest.targetHeight) <= 0) throw new Error("Atlas model targetHeight must be positive.");

const requiredEntities = ["root_system", "stem_vascular", "nodes_branching", "leaves", "flowers", "trichomes_resin", "sex_pollen_seed"];
const mappedEntities = Object.values(manifest.semanticMeshes || {});
for (const entity of requiredEntities) {
  if (!mappedEntities.includes(entity)) throw new Error(`Atlas model manifest is missing semantic mapping for ${entity}.`);
}

const modelPath = path.join(runtimeDir, "models", manifest.model.replace(/^\.\//, ""));
let modelExists = true;
try { await access(modelPath); } catch { modelExists = false; }

if (manifest.available) {
  if (!modelExists) throw new Error(`Atlas production model is marked available but missing: ${modelPath}`);
  const info = await stat(modelPath);
  if (info.size < 1024) throw new Error("Atlas production GLB is implausibly small.");
  for (const marker of ["license", "sha-256", "triangle", "botanical plausibility"]) {
    if (!provenance.toLowerCase().includes(marker)) throw new Error(`Released Atlas model provenance must document ${marker}.`);
  }
} else {
  if (modelExists) throw new Error("Atlas GLB exists while manifest.available=false. Review provenance and explicitly release it or remove the candidate from the public runtime path.");
  requireText(provenance, "No photorealistic production GLB is released", "unreleased model provenance");
}

console.log(`Atlas production model pipeline verified (released=${manifest.available}, model=${manifest.modelVersion || "unversioned"}).`);
