import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content");
const entities = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-entities.json"), "utf8"));
const sections = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-sections.json"), "utf8"));
const modules = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-learning-modules.json"), "utf8"));

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

if (errors.length) {
  console.error("Interactive Atlas verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Interactive Atlas verified: ${entities.length} entities, ${modelTargets.size} unique model targets, ${validLayers.size} supported layers.`);
