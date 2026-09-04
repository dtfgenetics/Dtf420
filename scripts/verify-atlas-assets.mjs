import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content");
const modules = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-learning-modules.json"), "utf8"));
const manifestFiles = fs
  .readdirSync(contentDir)
  .filter((name) => name.startsWith("atlas-asset-overrides") && name.endsWith(".json"))
  .sort();
const overrides = manifestFiles.flatMap((name) =>
  JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8")),
);

const EXPECTED_SYSTEM_COUNT = 10;
const EXPECTED_LESSON_COUNT = 100;
const allowedStatuses = new Set(["needed", "brief_ready", "in_production", "review", "ready"]);
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
    visual: lesson.visual,
  })),
);
const validKeys = new Set(lessonRecords.map((lesson) => lesson.key));

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
    errors.push(`Ready asset has no path: ${item.assetId}`);
  }

  if (item.path) {
    if (!item.path.startsWith("/")) errors.push(`Asset path must begin with '/': ${item.assetId}`);

    if (disallowedEducationalPathPatterns.some((pattern) => pattern.test(item.path))) {
      errors.push(`Commercial or strain artwork cannot be used as an Atlas lesson visual: ${item.assetId} -> ${item.path}`);
    }

    const diskPath = path.join(root, "public", item.path.replace(/^\//, ""));
    if (!fs.existsSync(diskPath)) errors.push(`Asset file not found: ${item.assetId} -> ${diskPath}`);
  }

  if (!item.altText?.trim()) errors.push(`Missing altText: ${item.assetId}`);
  if (!item.productionBrief?.trim()) errors.push(`Missing productionBrief: ${item.assetId}`);
}

if (errors.length) {
  console.error("Atlas asset registry verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const pendingDefaultSlots = lessonRecords.length - overrides.length;
console.log(
  `Atlas asset registry verified: ${lessonRecords.length} lesson slots across ${modules.length} systems; ` +
  `${overrides.length} production overrides in ${manifestFiles.length} manifests; ${pendingDefaultSlots} default registry slots.`,
);
