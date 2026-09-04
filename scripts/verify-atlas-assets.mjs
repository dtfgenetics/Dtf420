import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content");
const modules = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-learning-modules.json"), "utf8"));
const codeNativeVisuals = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-code-native-visuals.json"), "utf8"));
const manifestFiles = fs
  .readdirSync(contentDir)
  .filter((name) => name.startsWith("atlas-asset-overrides") && name.endsWith(".json"))
  .sort();
const overrides = manifestFiles.flatMap((name) =>
  JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8")),
);

const EXPECTED_SYSTEM_COUNT = 10;
const EXPECTED_LESSON_COUNT = 100;
const EXPECTED_CODE_NATIVE_COUNT = 60;
const allowedStatuses = new Set(["needed", "brief_ready", "in_production", "review", "ready"]);
const allowedRenderers = new Set([
  "achene",
  "priority",
  "process",
  "concept",
  "cross-system",
  "core-structure",
  "growth-diagnostic",
  "final-a",
  "final-b",
  "advanced",
]);
const allowedMediaExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);
const disallowedEducationalPathPatterns = [
  /strain[-_ ]?card/i,
  /seed[-_ ]?card/i,
  /product[-_ ]?card/i,
  /packaging/i,
  /merch/i,
  /\/products?\//i,
  /\/strains?\//i,
];

function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const lessonRecords = modules.flatMap((atlasModule) =>
  atlasModule.lessons.map((lesson) => ({
    key: `${slugify(atlasModule.id)}__${slugify(lesson.title)}`,
    systemId: atlasModule.id,
    title: lesson.title,
    lessonSlug: slugify(lesson.title),
    systemSlug: slugify(atlasModule.id),
    visual: lesson.visual,
  })),
);
const validKeys = new Set(lessonRecords.map((lesson) => lesson.key));
const overrideByKey = new Map(overrides.map((item) => [item.key, item]));
const canonicalAssetIds = new Set(
  lessonRecords.map((lesson) => overrideByKey.get(lesson.key)?.assetId ?? `atlas-${lesson.systemSlug}-${lesson.lessonSlug}-v0`),
);

const seenKeys = new Set();
const seenAssetIds = new Set();
const errors = [];

if (modules.length !== EXPECTED_SYSTEM_COUNT) {
  errors.push(`Expected ${EXPECTED_SYSTEM_COUNT} Atlas systems, found ${modules.length}.`);
}
if (lessonRecords.length !== EXPECTED_LESSON_COUNT) {
  errors.push(`Expected ${EXPECTED_LESSON_COUNT} Atlas lesson visual slots, found ${lessonRecords.length}.`);
}
if (validKeys.size !== lessonRecords.length) {
  errors.push(`Canonical lesson keys are not unique: ${lessonRecords.length} lessons produced ${validKeys.size} unique keys.`);
}
if (canonicalAssetIds.size !== lessonRecords.length) {
  errors.push(`Canonical asset IDs are not unique: ${lessonRecords.length} lessons produced ${canonicalAssetIds.size} unique asset IDs.`);
}

for (const lesson of lessonRecords) {
  if (!lesson.visual || typeof lesson.visual !== "string" || !lesson.visual.trim()) {
    errors.push(`Missing visual specification: ${lesson.systemId} / ${lesson.title}`);
  }
}

for (const item of overrides) {
  if (!validKeys.has(item.key)) errors.push(`Unknown lesson key: ${item.key}`);
  if (!item.assetId?.trim()) errors.push(`Missing assetId for override: ${item.key}`);
  if (seenKeys.has(item.key)) errors.push(`Duplicate override key: ${item.key}`);
  if (item.assetId && seenAssetIds.has(item.assetId)) errors.push(`Duplicate assetId: ${item.assetId}`);
  seenKeys.add(item.key);
  if (item.assetId) seenAssetIds.add(item.assetId);

  if (!allowedStatuses.has(item.status)) {
    errors.push(`Unsupported asset status '${item.status}' for ${item.assetId || item.key}`);
  }
  if (!Number.isInteger(item.version) || item.version < 0) {
    errors.push(`Asset version must be a non-negative integer: ${item.assetId || item.key}`);
  }
  if (!item.assetType?.trim()) errors.push(`Missing assetType: ${item.assetId || item.key}`);

  if (item.status === "ready" && !item.path) {
    errors.push(`Ready production-media asset has no path: ${item.assetId}`);
  }
  if (item.path && item.status !== "ready") {
    errors.push(`Only ready production media may declare a public path: ${item.assetId} (${item.status})`);
  }

  if (item.path) {
    if (!item.path.startsWith("/")) errors.push(`Asset path must begin with '/': ${item.assetId}`);
    const extension = path.extname(item.path).toLowerCase();
    if (!allowedMediaExtensions.has(extension)) errors.push(`Unsupported Atlas production-media extension '${extension}': ${item.assetId}`);

    if (disallowedEducationalPathPatterns.some((pattern) => pattern.test(item.path))) {
      errors.push(`Commercial or strain artwork cannot be used as an Atlas lesson visual: ${item.assetId} -> ${item.path}`);
    }

    const diskPath = path.join(root, "public", item.path.replace(/^\//, ""));
    if (!fs.existsSync(diskPath)) errors.push(`Asset file not found: ${item.assetId} -> ${diskPath}`);
  }

  if (!item.altText?.trim() || item.altText.trim().length < 20) errors.push(`Missing or weak altText: ${item.assetId}`);
  if (!item.productionBrief?.trim() || item.productionBrief.trim().length < 40) errors.push(`Missing or weak productionBrief: ${item.assetId}`);
}

if (codeNativeVisuals.schemaVersion !== 1) errors.push("Atlas code-native visual registry schemaVersion must be 1.");
if (!Array.isArray(codeNativeVisuals.renderers)) errors.push("Atlas code-native visual registry must define renderers[].");
const rendererAssetIds = new Set();
for (const item of codeNativeVisuals.renderers || []) {
  if (!item.assetId || !canonicalAssetIds.has(item.assetId)) errors.push(`Code-native renderer references unknown Atlas asset ID: ${item.assetId || "missing"}`);
  if (rendererAssetIds.has(item.assetId)) errors.push(`Duplicate code-native renderer assetId: ${item.assetId}`);
  rendererAssetIds.add(item.assetId);
  if (!allowedRenderers.has(item.renderer)) errors.push(`Unsupported code-native renderer '${item.renderer}' for ${item.assetId}`);
}
if (rendererAssetIds.size !== EXPECTED_CODE_NATIVE_COUNT) {
  errors.push(`Expected ${EXPECTED_CODE_NATIVE_COUNT} code-native learner visuals, found ${rendererAssetIds.size}.`);
}

const runtimeManifestSource = fs.readFileSync(path.join(root, "lib", "atlas-asset-manifests.ts"), "utf8");
const importedManifestFiles = [...runtimeManifestSource.matchAll(/@\/content\/(atlas-asset-overrides[^"']+\.json)/g)]
  .map((match) => match[1])
  .sort();
if (JSON.stringify(importedManifestFiles) !== JSON.stringify(manifestFiles)) {
  errors.push(
    `Atlas override manifest drift: verifier discovers [${manifestFiles.join(", ")}], runtime imports [${importedManifestFiles.join(", ")}].`,
  );
}

const slotSource = fs.readFileSync(path.join(root, "components", "atlas", "AtlasAssetSlot.tsx"), "utf8");
for (const marker of ["asset.learnerSurface", "asset.renderer", "production-media", "system-study-map"]) {
  if (!slotSource.includes(marker)) errors.push(`AtlasAssetSlot is missing audited learner-surface marker: ${marker}`);
}
if (/new Set\(\[\s*["']atlas-/m.test(slotSource)) {
  errors.push("AtlasAssetSlot must not maintain a second hard-coded asset-ID renderer registry.");
}

if (errors.length) {
  console.error("Atlas asset registry verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const pendingDefaultSlots = lessonRecords.length - overrides.length;
const productionMediaCount = overrides.filter((item) => item.status === "ready" && item.path).length;
const studyMapCount = lessonRecords.length - rendererAssetIds.size - productionMediaCount;
console.log(
  `Atlas asset registry verified: ${lessonRecords.length} lesson slots across ${modules.length} systems; ` +
  `${rendererAssetIds.size} code-native learner visuals; ${productionMediaCount} approved production-media visuals; ` +
  `${studyMapCount} system study-map surfaces; ${overrides.length} production overrides in ${manifestFiles.length} manifests; ` +
  `${pendingDefaultSlots} default registry slots.`,
);
