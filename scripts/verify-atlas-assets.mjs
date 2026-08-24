import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const modules = JSON.parse(fs.readFileSync(path.join(root, "content/atlas-learning-modules.json"), "utf8"));
const overrides = JSON.parse(fs.readFileSync(path.join(root, "content/atlas-asset-overrides.json"), "utf8"));

function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const validKeys = new Set(
  modules.flatMap((atlasModule) =>
    atlasModule.lessons.map((lesson) => `${slugify(atlasModule.id)}__${slugify(lesson.title)}`),
  ),
);

const seenKeys = new Set();
const seenAssetIds = new Set();
const errors = [];

for (const item of overrides) {
  if (!validKeys.has(item.key)) errors.push(`Unknown lesson key: ${item.key}`);
  if (seenKeys.has(item.key)) errors.push(`Duplicate override key: ${item.key}`);
  if (seenAssetIds.has(item.assetId)) errors.push(`Duplicate assetId: ${item.assetId}`);
  seenKeys.add(item.key);
  seenAssetIds.add(item.assetId);

  if (item.status === "ready" && !item.path) {
    errors.push(`Ready asset has no path: ${item.assetId}`);
  }

  if (item.path) {
    if (!item.path.startsWith("/")) errors.push(`Asset path must begin with '/': ${item.assetId}`);
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

console.log(`Atlas asset registry verified: ${validKeys.size} lesson slots, ${overrides.length} production overrides.`);
