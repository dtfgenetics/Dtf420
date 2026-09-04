import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content");
const modules = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-learning-modules.json"), "utf8"));
const specimenSet = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-specimen-set.json"), "utf8"));
const specimenAcquisition = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-specimen-acquisition.json"), "utf8"));
const photorealismReview = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-model-photorealism-review.json"), "utf8"));
const candidateRegistry = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-model-candidates.json"), "utf8"));
const publicManifest = JSON.parse(fs.readFileSync(path.join(root, "public", "atlas-3d", "models", "model-manifest.json"), "utf8"));
const slotSource = fs.readFileSync(path.join(root, "components", "atlas", "AtlasAssetSlot.tsx"), "utf8");
const visualPipelineDoc = fs.readFileSync(path.join(root, "docs", "ATLAS_VISUAL_PIPELINE.md"), "utf8");
const planningMap = fs.readFileSync(path.join(root, "configuration", "image-placement-map.csv"), "utf8");

function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function exactSet(values, expected) {
  const actual = new Set(values);
  return actual.size === expected.length && expected.every((value) => actual.has(value));
}

const errors = [];
const lessonRecords = modules.flatMap((atlasModule) =>
  atlasModule.lessons.map((lesson) => {
    const systemSlug = slugify(atlasModule.id);
    const lessonSlug = slugify(lesson.title);
    return {
      key: `${systemSlug}__${lessonSlug}`,
      route: `/learn/atlas/${systemSlug}/${lessonSlug}`,
      title: lesson.title,
      systemId: atlasModule.id,
      defaultAssetId: `atlas-${systemSlug}-${lessonSlug}-v0`,
    };
  }),
);

if (modules.length !== 10) errors.push(`Expected 10 Atlas systems, found ${modules.length}.`);
if (lessonRecords.length !== 100) errors.push(`Expected 100 canonical Atlas lessons, found ${lessonRecords.length}.`);
const routeMap = new Map(lessonRecords.map((lesson) => [lesson.route, lesson]));
const keyMap = new Map(lessonRecords.map((lesson) => [lesson.key, lesson]));
if (routeMap.size !== lessonRecords.length) errors.push("Canonical Atlas lesson routes are not unique.");
if (keyMap.size !== lessonRecords.length) errors.push("Canonical Atlas lesson asset keys are not unique.");

const overrideFiles = fs.readdirSync(contentDir).filter((name) => name.startsWith("atlas-asset-overrides") && name.endsWith(".json")).sort();
const overrides = overrideFiles.flatMap((name) => JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8")));
const overrideByKey = new Map();
const assetIds = new Set();
for (const item of overrides) {
  if (!keyMap.has(item.key)) errors.push(`Asset override references unknown lesson key: ${item.key}`);
  if (overrideByKey.has(item.key)) errors.push(`Duplicate asset override key: ${item.key}`);
  if (assetIds.has(item.assetId)) errors.push(`Duplicate Atlas assetId across override manifests: ${item.assetId}`);
  overrideByKey.set(item.key, item);
  assetIds.add(item.assetId);
  if (item.path && /(?:strain|seed|product)[-_ ]?card|packaging|merch|\/products?\/|\/strains?\//i.test(item.path)) {
    errors.push(`Commercial/product artwork cannot back an Atlas lesson: ${item.assetId} -> ${item.path}`);
  }
  if (item.path) {
    const diskPath = path.join(root, "public", item.path.replace(/^\//, ""));
    if (!fs.existsSync(diskPath)) errors.push(`Atlas override file does not exist: ${item.assetId} -> ${diskPath}`);
  }
}

const briefFiles = fs.readdirSync(contentDir).filter((name) => /^atlas-.*-visual-briefs\.json$/.test(name)).sort();
const briefs = briefFiles.flatMap((name) => JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8")).map((item) => ({ ...item, sourceFile: name })));
const briefByRoute = new Map();
for (const brief of briefs) {
  const canonical = routeMap.get(brief.route);
  if (!canonical) errors.push(`Visual brief references unknown Atlas route: ${brief.route} (${brief.sourceFile})`);
  if (briefByRoute.has(brief.route)) errors.push(`Duplicate detailed visual brief route: ${brief.route}`);
  briefByRoute.set(brief.route, brief);
  if (canonical && brief.title !== canonical.title) errors.push(`Visual brief title drift at ${brief.route}: '${brief.title}' != '${canonical.title}'.`);
  if (typeof brief.brief !== "string" || brief.brief.trim().length < 100) errors.push(`Visual brief is too short: ${brief.route}`);
}

if (!slotSource.includes('data-atlas-visual="system-study-map"')) {
  errors.push("AtlasAssetSlot must retain the learner-facing system study-map fallback.");
}
if (slotSource.includes("Primary visual specification")) {
  errors.push("Learner-facing AtlasAssetSlot still exposes internal production-brief placeholder language.");
}

const visualCounts = { codeNative: 0, fileBacked: 0, detailedBrief: 0, studyMap: 0 };
for (const lesson of lessonRecords) {
  const override = overrideByKey.get(lesson.key);
  const assetId = override?.assetId || lesson.defaultAssetId;
  const codeNative = slotSource.includes(`\"${assetId}\"`);
  const fileBacked = Boolean(override?.path);
  const detailedBrief = briefByRoute.has(lesson.route);

  if (fileBacked) visualCounts.fileBacked += 1;
  else if (codeNative) visualCounts.codeNative += 1;
  else if (detailedBrief) visualCounts.detailedBrief += 1;
  else visualCounts.studyMap += 1;

  if (override?.status === "review" && !fileBacked && !codeNative) {
    errors.push(`Asset override is in review but has neither shipped media nor a wired code-native visual: ${assetId}`);
  }
}

const planningHeader = "asset_id,section,page_slug,asset_type,placement,description,style,priority,status";
if (!planningMap.startsWith(planningHeader)) errors.push("configuration/image-placement-map.csv header drifted from the documented planning-map contract.");
for (const assetId of assetIds) {
  if (planningMap.includes(`${assetId},`)) errors.push(`Legacy planning map reuses canonical production assetId ${assetId}; keep planning and production IDs distinct.`);
}
for (const marker of ["configuration/image-placement-map.csv", "planning", "non-authoritative"]) {
  if (!visualPipelineDoc.toLowerCase().includes(marker.toLowerCase())) errors.push(`ATLAS_VISUAL_PIPELINE.md must document '${marker}'.`);
}

const specimenIds = (specimenSet.requiredSpecimens || []).map((item) => item.id);
const acquisitionIds = (specimenAcquisition.specimens || []).map((item) => item.id);
const reviewIds = (photorealismReview.specimenReviews || []).map((item) => item.specimenId);
const manifestRequiredIds = publicManifest.specimenSet?.requiredSpecimens || [];
const manifestStateIds = Object.keys(publicManifest.specimenSet?.specimens || {});
if (!specimenIds.length) errors.push("Atlas specimen set has no required specimens.");
for (const [label, values] of [
  ["acquisition queue", acquisitionIds],
  ["photorealism reviews", reviewIds],
  ["public manifest requiredSpecimens", manifestRequiredIds],
  ["public manifest specimen states", manifestStateIds],
]) {
  if (!exactSet(values, specimenIds)) errors.push(`Six-specimen ID drift between atlas-specimen-set and ${label}.`);
}

const candidateIds = new Set((candidateRegistry.candidates || []).map((candidate) => candidate.id));
for (const slot of specimenSet.requiredSpecimens || []) {
  const release = slot.releaseSlot || {};
  if (release.candidateId && !candidateIds.has(release.candidateId)) errors.push(`${slot.id} release slot references unknown candidate ${release.candidateId}.`);
}

if (publicManifest.available === true || publicManifest.specimenSet?.enabled === true) {
  const approved = (specimenSet.requiredSpecimens || []).filter((slot) => slot.releaseSlot?.status === "approved");
  if (approved.length !== specimenIds.length) errors.push("Public photorealistic specimen manifest cannot be enabled before all six specimen slots are approved.");
} else {
  for (const modelPath of [publicManifest.variants?.desktop?.model, publicManifest.variants?.mobile?.model]) {
    if (!modelPath) continue;
    const diskPath = path.join(root, "public", "atlas-3d", modelPath.replace(/^\.\//, ""));
    if (fs.existsSync(diskPath)) errors.push(`Unreleased production GLB leaked into public runtime path: ${diskPath}`);
  }
}

if (errors.length) {
  console.error("Atlas cross-manifest asset inventory audit failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Atlas asset inventory verified: ${lessonRecords.length} lessons; ${overrides.length} overrides; ${briefs.length} detailed briefs; ` +
  `${visualCounts.codeNative} code-native, ${visualCounts.fileBacked} file-backed, ${visualCounts.detailedBrief} detailed-brief/study-map, ${visualCounts.studyMap} generic study-map lessons; ` +
  `${specimenIds.length} photorealistic specimen slots reconciled.`,
);
