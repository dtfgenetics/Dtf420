import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8"));
}

function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const plantHealth = [
  ...readJson("plant-health-library.json"),
  ...readJson("plant-health-expanded.json"),
];
const cultivation = [
  ...readJson("cultivation-science-library.json"),
  ...readJson("protected-cultivation-library.json"),
  ...readJson("protected-cultivation-lighting.json"),
  ...readJson("outdoor-cultivation-expanded.json"),
  ...readJson("postharvest-science-expanded.json"),
  ...readJson("advanced-cultivation-science-expanded.json"),
];
const symptoms = readJson("symptom-differential-library.json");
const tools = readJson("learning-tools.json");
const atlasModules = readJson("atlas-learning-modules.json");
const relatedMap = readJson("education-related-links.json");

const validLearnPaths = new Set([
  "/learn",
  "/learn/search",
  "/learn/plant-health",
  "/learn/cultivation-science",
  "/learn/symptoms",
  "/learn/tools",
  "/learn/atlas",
  "/learn/atlas/cases",
  "/learn/atlas/practice",
  "/learn/atlas/review",
  "/learn/atlas/mastery",
  "/learn/atlas/dashboard",
  "/learn/atlas/search",
  "/learn/atlas/compare",
  "/learn/atlas/notebook",
  "/learn/atlas/notebook/compare",
  "/learn/atlas/paths",
]);

for (const item of plantHealth) validLearnPaths.add(`/learn/plant-health/${item.slug}`);
for (const item of cultivation) validLearnPaths.add(`/learn/cultivation-science/${item.slug}`);
for (const item of symptoms) validLearnPaths.add(`/learn/symptoms/${item.slug}`);
for (const item of tools) validLearnPaths.add(`/learn/tools/${item.slug}`);

for (const atlasModule of atlasModules) {
  const systemSlug = slugify(atlasModule.id);
  validLearnPaths.add(`/learn/atlas/${systemSlug}`);
  for (const lesson of atlasModule.lessons) {
    validLearnPaths.add(`/learn/atlas/${systemSlug}/${slugify(lesson.title)}`);
  }
}

const errors = [];
let linkCount = 0;

for (const [source, links] of Object.entries(relatedMap)) {
  if (!validLearnPaths.has(source)) errors.push(`Unknown related-link source: ${source}`);
  if (!Array.isArray(links) || links.length === 0) {
    errors.push(`Related-link source has no links: ${source}`);
    continue;
  }

  const seenTargets = new Set();
  for (const link of links) {
    linkCount += 1;
    if (!link?.kind?.trim()) errors.push(`Missing related-link kind: ${source}`);
    if (!link?.title?.trim()) errors.push(`Missing related-link title: ${source}`);
    if (!link?.href?.trim()) {
      errors.push(`Missing related-link href: ${source}`);
      continue;
    }

    const href = link.href.trim();
    const isAbsolute = /^https?:\/\//i.test(href);
    const isInternal = href.startsWith("/");
    if (!isAbsolute && !isInternal) errors.push(`Related link must be an internal path or http(s) URL: ${source} -> ${href}`);
    if (href.startsWith("/learn") && !validLearnPaths.has(href)) errors.push(`Unknown learning target: ${source} -> ${href}`);
    if (href === source) errors.push(`Self-referencing related link: ${source}`);
    if (seenTargets.has(href)) errors.push(`Duplicate related-link target: ${source} -> ${href}`);
    seenTargets.add(href);
  }
}

if (errors.length) {
  console.error("Education related-link integrity verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Education related-link integrity verified: ${Object.keys(relatedMap).length} source pages and ${linkCount} links.`);
