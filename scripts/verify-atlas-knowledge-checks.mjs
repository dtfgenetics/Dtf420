import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content");
const modules = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-learning-modules.json"), "utf8"));
const checkFiles = fs
  .readdirSync(contentDir)
  .filter((name) => name.startsWith("atlas-knowledge-checks") && name.endsWith(".json"))
  .sort();
const checks = checkFiles.flatMap((name) => JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8")));
const guidedPaths = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-guided-paths.json"), "utf8"));

function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const canonicalRoutes = modules.flatMap((atlasModule) =>
  atlasModule.lessons.map((lesson) => `/learn/atlas/${slugify(atlasModule.id)}/${slugify(lesson.title)}`),
);
const canonicalSet = new Set(canonicalRoutes);
const ids = new Set();
const routes = new Set();
const errors = [];

if (checks.length !== canonicalRoutes.length) {
  errors.push(`Expected ${canonicalRoutes.length} knowledge checks but found ${checks.length} across ${checkFiles.length} files.`);
}

checks.forEach((check, index) => {
  if (!check || typeof check !== "object") {
    errors.push(`Check ${index + 1} is not an object.`);
    return;
  }

  if (typeof check.id !== "string" || check.id.trim().length < 4) errors.push(`Check ${index + 1} has an invalid id.`);
  else if (ids.has(check.id)) errors.push(`Duplicate check id: ${check.id}`);
  else ids.add(check.id);

  if (typeof check.route !== "string" || !canonicalSet.has(check.route)) errors.push(`Unknown lesson route: ${check.route}`);
  else if (routes.has(check.route)) errors.push(`Duplicate knowledge check route: ${check.route}`);
  else routes.add(check.route);

  if (typeof check.prompt !== "string" || check.prompt.trim().length < 12) errors.push(`${check.id ?? index}: prompt is too short.`);
  if (typeof check.explanation !== "string" || check.explanation.trim().length < 20) errors.push(`${check.id ?? index}: explanation is too short.`);

  if (!Array.isArray(check.options) || check.options.length !== 4) {
    errors.push(`${check.id ?? index}: expected exactly 4 answer options.`);
  } else {
    const normalized = check.options.map((option) => typeof option === "string" ? option.trim().toLowerCase() : "");
    if (normalized.some((option) => !option)) errors.push(`${check.id ?? index}: answer options must be non-empty strings.`);
    if (new Set(normalized).size !== normalized.length) errors.push(`${check.id ?? index}: answer options must be unique.`);
  }

  if (!Number.isInteger(check.correctIndex) || check.correctIndex < 0 || check.correctIndex >= (check.options?.length ?? 0)) {
    errors.push(`${check.id ?? index}: correctIndex is out of range.`);
  }
});

for (const route of canonicalRoutes) {
  if (!routes.has(route)) errors.push(`Missing knowledge check for canonical lesson: ${route}`);
}

for (const guidedPath of guidedPaths) {
  for (const route of guidedPath.lessons) {
    if (!routes.has(route)) errors.push(`Guided path ${guidedPath.id} references a lesson without a knowledge check: ${route}`);
  }
}

const renderedDistribution = [0, 0, 0, 0];
checks.forEach((_, index) => { renderedDistribution[index % 4] += 1; });
const spread = Math.max(...renderedDistribution) - Math.min(...renderedDistribution);
const minimumExpected = Math.floor(checks.length / 4);
if (spread > 1 || renderedDistribution.some((count) => count < minimumExpected)) {
  errors.push(`Rendered correct-answer distribution is unbalanced: ${renderedDistribution.join("/")}.`);
}

if (errors.length) {
  console.error("Atlas knowledge-check verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Atlas knowledge checks verified: ${checks.length} checks across ${checkFiles.length} files for ${canonicalRoutes.length} lessons; rendered answer distribution A/B/C/D = ${renderedDistribution.join("/")}.`);
