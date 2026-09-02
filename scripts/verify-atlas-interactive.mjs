import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content");
const entities = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-entities.json"), "utf8"));
const sections = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-sections.json"), "utf8"));
const modules = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-learning-modules.json"), "utf8"));
const viewportPath = path.join(root, "components", "atlas", "AtlasInteractiveViewport.tsx");
const runtimeHtmlPath = path.join(root, "public", "atlas-3d", "index.html");
const runtimeJsPath = path.join(root, "public", "atlas-3d", "atlas-runtime.js");
const viewportSource = fs.readFileSync(viewportPath, "utf8");
const runtimeHtml = fs.readFileSync(runtimeHtmlPath, "utf8");
const runtimeJs = fs.readFileSync(runtimeJsPath, "utf8");

const validLayers = new Set(["overview", "anatomy", "physiology", "micro", "environment", "diagnostics"]);
const sectionIds = new Set(sections.map((section) => section.id));
const entityIds = new Set();
const modelTargets = new Set();
const errors = [];

if (entities.length !== sections.length) {
  errors.push(`Expected one interactive entity per Atlas section (${sections.length}); found ${entities.length}.`);
}

for (const entity of entities) {
  if (!entity || typeof entity !== "object") {
    errors.push("Interactive entity must be an object.");
    continue;
  }

  if (!sectionIds.has(entity.id)) errors.push(`Interactive entity references unknown Atlas section: ${entity.id}`);
  if (entityIds.has(entity.id)) errors.push(`Duplicate interactive entity id: ${entity.id}`);
  entityIds.add(entity.id);

  if (typeof entity.label !== "string" || entity.label.trim().length < 2) errors.push(`${entity.id}: invalid label.`);
  if (typeof entity.systemLabel !== "string" || entity.systemLabel.trim().length < 2) errors.push(`${entity.id}: invalid systemLabel.`);

  if (typeof entity.modelTarget !== "string" || !/^(plant|overlay)\.[a-z0-9_.-]+$/.test(entity.modelTarget)) {
    errors.push(`${entity.id}: invalid modelTarget ${entity.modelTarget}.`);
  } else if (modelTargets.has(entity.modelTarget)) {
    errors.push(`${entity.id}: duplicate modelTarget ${entity.modelTarget}.`);
  } else modelTargets.add(entity.modelTarget);

  if (!entity.hotspot || !Number.isFinite(entity.hotspot.x) || !Number.isFinite(entity.hotspot.y)) {
    errors.push(`${entity.id}: hotspot requires numeric x/y.`);
  } else if (entity.hotspot.x < 4 || entity.hotspot.x > 96 || entity.hotspot.y < 4 || entity.hotspot.y > 96) {
    errors.push(`${entity.id}: hotspot must remain inside the interactive viewport.`);
  }

  if (!entity.camera || !Number.isFinite(entity.camera.yaw) || !Number.isFinite(entity.camera.pitch) || !Number.isFinite(entity.camera.zoom)) {
    errors.push(`${entity.id}: camera preset requires yaw, pitch, and zoom.`);
  } else {
    if (Math.abs(entity.camera.yaw) > 180) errors.push(`${entity.id}: camera yaw is outside supported range.`);
    if (Math.abs(entity.camera.pitch) > 90) errors.push(`${entity.id}: camera pitch is outside supported range.`);
    if (entity.camera.zoom < 0.5 || entity.camera.zoom > 3) errors.push(`${entity.id}: camera zoom is outside supported range.`);
  }

  if (!Array.isArray(entity.layers) || entity.layers.length === 0) errors.push(`${entity.id}: must belong to at least one Atlas layer.`);
  else {
    for (const layer of entity.layers) if (!validLayers.has(layer)) errors.push(`${entity.id}: unknown layer ${layer}.`);
  }

  if (!Array.isArray(entity.keyFunctions) || entity.keyFunctions.length < 2) errors.push(`${entity.id}: expected at least two key functions.`);
  if (typeof entity.microTitle !== "string" || entity.microTitle.trim().length < 3) errors.push(`${entity.id}: missing microTitle.`);
  if (typeof entity.dataTitle !== "string" || entity.dataTitle.trim().length < 3) errors.push(`${entity.id}: missing dataTitle.`);
}

for (const sectionId of sectionIds) {
  if (!entityIds.has(sectionId)) errors.push(`Atlas section is missing an interactive entity: ${sectionId}`);
}

for (const atlasModule of modules) {
  if (!entityIds.has(atlasModule.id)) errors.push(`Learning module is not represented in the interactive Atlas: ${atlasModule.id}`);
}

const requiredPlantTargets = [
  "plant.root_system",
  "plant.stem.main",
  "plant.nodes",
  "plant.leaves.fan",
  "plant.flowers",
  "plant.trichomes",
  "plant.reproductive",
];
for (const target of requiredPlantTargets) if (!modelTargets.has(target)) errors.push(`Missing canonical 3D model target: ${target}`);

const runtimeContracts = [
  [runtimeHtml.includes("three@0.185.1"), "3D runtime must pin Three.js 0.185.1."],
  [runtimeHtml.includes("OrbitControls"), "3D runtime must load OrbitControls."],
  [runtimeHtml.includes("./atlas-runtime.js"), "3D runtime HTML must load the project-owned Atlas scene."],
  [runtimeJs.includes("new THREE.WebGLRenderer"), "Atlas runtime must create a real WebGL renderer."],
  [runtimeJs.includes("new THREE.Raycaster"), "Atlas runtime must use mesh picking rather than DOM-only selection."],
  [runtimeJs.includes("atlas:select"), "Atlas runtime must send mesh selections to the React inspector."],
  [runtimeJs.includes("atlas:set-state"), "Atlas runtime must accept selected-entity and layer state from React."],
  [runtimeJs.includes("atlas:command"), "Atlas runtime must accept camera/viewer commands."],
  [runtimeJs.includes("anatomyGroup"), "Atlas runtime must expose an anatomy layer."],
  [runtimeJs.includes("physiologyGroup"), "Atlas runtime must expose a physiology layer."],
  [runtimeJs.includes("microGroup"), "Atlas runtime must expose a micro/tissue teaching layer."],
  [runtimeJs.includes("environmentGroup"), "Atlas runtime must expose an environment layer."],
  [runtimeJs.includes("diagnosticGroup"), "Atlas runtime must expose a diagnostic observation layer."],
  [runtimeJs.includes("prefers-reduced-motion"), "Atlas runtime must provide reduced-motion behavior."],
  [runtimeJs.includes("conceptual xylem water movement"), "Physiology legend must prevent flow particles from being misread as measured flux."],
  [runtimeJs.includes("do not assert a diagnosis"), "Diagnostic overlay must not present markers as diagnoses."],
  [viewportSource.includes('src="/learn/atlas/atlas-3d/index.html"'), "React viewport must mount the Three.js runtime inside the owned Atlas child route."],
  [viewportSource.includes('aria-label={`${entity.label}.'), "Hotspots must keep explicit accessible names when compact mobile labels are hidden."],
];
for (const [condition, message] of runtimeContracts) if (!condition) errors.push(message);

if (errors.length) {
  console.error("Interactive Atlas verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Interactive Atlas verified: ${entities.length} entities, ${modelTargets.size} unique model targets, ${validLayers.size} supported layers, real Three.js renderer + fallback contract.`);
