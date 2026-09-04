import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content");
const modules = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-learning-modules.json"), "utf8"));
const manifestFiles = fs
  .readdirSync(contentDir)
  .filter((name) => name.startsWith("atlas-asset-overrides") && name.endsWith(".json"))
  .sort();
const visualBriefFiles = fs
  .readdirSync(contentDir)
  .filter((name) => name.endsWith("-visual-briefs.json"))
  .sort();
const overrides = manifestFiles.flatMap((name) =>
  JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8")),
);
const visualBriefs = visualBriefFiles.flatMap((name) =>
  JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8")).map((item) => ({ ...item, sourceFile: name })),
);

const assetManifestSource = fs.readFileSync(path.join(root, "lib", "atlas-asset-manifests.ts"), "utf8");
const visualBriefManifestSource = fs.readFileSync(path.join(root, "lib", "atlas-visual-brief-manifests.ts"), "utf8");
const assetRegistrySource = fs.readFileSync(path.join(root, "lib", "atlas-assets.ts"), "utf8");
const visualPipelineDoc = fs.readFileSync(path.join(root, "docs", "ATLAS_VISUAL_PIPELINE.md"), "utf8");
const planningMap = fs.readFileSync(path.join(root, "configuration", "image-placement-map.csv"), "utf8");

const EXPECTED_SYSTEM_COUNT = 10;
const EXPECTED_LESSON_COUNT = 100;
const EXPECTED_EXPLICIT_OVERRIDE_COUNT = 60;
const EXPECTED_DETAILED_BRIEF_COUNT = 40;
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
  atlasModule.lessons.map((lesson) => {
    const systemSlug = slugify(atlasModule.id);
    const lessonSlug = slugify(lesson.title);
    return {
      key: `${systemSlug}__${lessonSlug}`,
      route: `/learn/atlas/${systemSlug}/${lessonSlug}`,
      systemId: atlasModule.id,
      title: lesson.title,
      visual: lesson.visual,
    };
  }),
);
const validKeys = new Set(lessonRecords.map((lesson) => lesson.key));
const lessonByRoute = new Map(lessonRecords.map((lesson) => [lesson.route, lesson]));

const seenKeys = new Set();
const seenAssetIds = new Set();
const seenBriefRoutes = new Set();
const coveredKeys = new Set();
const errors = [];

if (modules.length !== EXPECTED_SYSTEM_COUNT) errors.push(`Expected ${EXPECTED_SYSTEM_COUNT} Atlas systems, found ${modules.length}.`);
if (lessonRecords.length !== EXPECTED_LESSON_COUNT) errors.push(`Expected ${EXPECTED_LESSON_COUNT} Atlas lesson visual slots, found ${lessonRecords.length}.`);
if (validKeys.size !== lessonRecords.length) errors.push(`Canonical lesson keys are not unique: ${lessonRecords.length} lessons produced ${validKeys.size} unique keys.`);

for (const lesson of lessonRecords) {
  if (!lesson.visual || typeof lesson.visual !== "string" || !lesson.visual.trim()) {
    errors.push(`Missing visual specification: ${lesson.systemId} / ${lesson.title}`);
  }
}

for (const manifestFile of manifestFiles) {
  if (!assetManifestSource.includes(`@/content/${manifestFile}`)) errors.push(`Runtime asset manifest does not import production override file: ${manifestFile}`);
}
for (const briefFile of visualBriefFiles) {
  if (!visualBriefManifestSource.includes(`@/content/${briefFile}`)) errors.push(`Runtime visual-brief manifest does not import detailed brief file: ${briefFile}`);
}
if (!assetRegistrySource.includes("atlasVisualBriefs") || !assetRegistrySource.includes('visualBrief ? "brief_ready"')) {
  errors.push("Atlas asset registry must resolve detailed visual briefs as brief_ready production metadata.");
}

for (const item of overrides) {
  if (!validKeys.has(item.key)) errors.push(`Unknown lesson key: ${item.key}`);
  if (!item.assetId?.trim()) errors.push(`Missing assetId for override: ${item.key}`);
  if (seenKeys.has(item.key)) errors.push(`Duplicate override key: ${item.key}`);
  if (item.assetId && seenAssetIds.has(item.assetId)) errors.push(`Duplicate assetId: ${item.assetId}`);
  seenKeys.add(item.key);
  coveredKeys.add(item.key);
  if (item.assetId) seenAssetIds.add(item.assetId);

  if (!allowedStatuses.has(item.status)) errors.push(`Unsupported asset status '${item.status}' for ${item.assetId || item.key}`);
  if (item.status === "needed") errors.push(`Explicit Atlas production metadata cannot remain 'needed': ${item.assetId || item.key}`);
  if (!Number.isInteger(item.version) || item.version < 0) errors.push(`Asset version must be a non-negative integer: ${item.assetId || item.key}`);
  if (!item.assetType?.trim()) errors.push(`Missing assetType: ${item.assetId || item.key}`);
  if (item.status === "ready" && !item.path) errors.push(`Ready asset has no path: ${item.assetId}`);

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

for (const item of visualBriefs) {
  if (typeof item.route !== "string" || !item.route.startsWith("/learn/atlas/")) {
    errors.push(`Invalid visual brief route in ${item.sourceFile}: ${String(item.route)}`);
    continue;
  }
  const lesson = lessonByRoute.get(item.route);
  if (!lesson) {
    errors.push(`Visual brief points to unknown Atlas lesson route: ${item.route} (${item.sourceFile})`);
    continue;
  }
  if (seenBriefRoutes.has(item.route)) errors.push(`Duplicate visual brief route: ${item.route}`);
  seenBriefRoutes.add(item.route);
  if (seenKeys.has(lesson.key)) errors.push(`Atlas lesson has both an explicit override and a detailed brief-only record: ${lesson.key}`);
  coveredKeys.add(lesson.key);

  if (typeof item.title !== "string" || item.title.trim() !== lesson.title) {
    errors.push(`Visual brief title mismatch for ${item.route}: expected '${lesson.title}', found '${String(item.title)}'.`);
  }
  if (Object.hasOwn(item, "lesson")) errors.push(`Visual brief schema still uses legacy 'lesson' field instead of 'title': ${item.route}`);
  if (typeof item.brief !== "string" || item.brief.trim().length < 100) errors.push(`Visual brief must contain a substantive production brief: ${item.route}`);
  if (item.assetType !== undefined && (typeof item.assetType !== "string" || !item.assetType.trim())) errors.push(`Visual brief assetType must be non-empty when provided: ${item.route}`);
}

if (overrides.length !== EXPECTED_EXPLICIT_OVERRIDE_COUNT) errors.push(`Expected ${EXPECTED_EXPLICIT_OVERRIDE_COUNT} explicit Atlas production overrides, found ${overrides.length}.`);
if (visualBriefs.length !== EXPECTED_DETAILED_BRIEF_COUNT) errors.push(`Expected ${EXPECTED_DETAILED_BRIEF_COUNT} detailed brief-only Atlas slots, found ${visualBriefs.length}.`);
if (coveredKeys.size !== EXPECTED_LESSON_COUNT) {
  const missing = lessonRecords.filter((lesson) => !coveredKeys.has(lesson.key)).map((lesson) => lesson.key);
  errors.push(`Every canonical lesson must have explicit production metadata; covered ${coveredKeys.size}/${EXPECTED_LESSON_COUNT}. Missing: ${missing.join(", ") || "none"}.`);
}

const planningHeader = "asset_id,section,page_slug,asset_type,placement,description,style,priority,status";
if (!planningMap.startsWith(planningHeader)) errors.push("configuration/image-placement-map.csv header drifted from the documented planning-map contract.");
for (const assetId of seenAssetIds) {
  if (planningMap.includes(`${assetId},`)) errors.push(`Legacy image-placement planning map reuses canonical production assetId ${assetId}.`);
}
for (const marker of ["configuration/image-placement-map.csv", "planning-only", "non-authoritative"]) {
  if (!visualPipelineDoc.toLowerCase().includes(marker.toLowerCase())) errors.push(`ATLAS_VISUAL_PIPELINE.md must document '${marker}'.`);
}

if (errors.length) {
  console.error("Atlas asset registry verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Atlas asset registry verified: ${lessonRecords.length} lesson slots across ${modules.length} systems; ` +
  `${overrides.length} explicit interactive/media records in ${manifestFiles.length} override manifests; ` +
  `${visualBriefs.length} detailed brief-ready records in ${visualBriefFiles.length} brief manifests; ` +
  `0 unplanned needed slots; legacy placement map isolated as non-authoritative planning metadata.`,
);
