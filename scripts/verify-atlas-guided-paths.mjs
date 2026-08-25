import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const modules = JSON.parse(fs.readFileSync(path.join(root, "content/atlas-learning-modules.json"), "utf8"));
const guidedPaths = JSON.parse(fs.readFileSync(path.join(root, "content/atlas-guided-paths.json"), "utf8"));

function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const lessonRoutes = new Set(
  modules.flatMap((atlasModule) =>
    atlasModule.lessons.map(
      (lesson) => `/learn/atlas/${slugify(atlasModule.id)}/${slugify(lesson.title)}`,
    ),
  ),
);

const errors = [];
const pathIds = new Set();
const allPathLessons = new Set();
let stepCount = 0;

if (!Array.isArray(guidedPaths) || guidedPaths.length === 0) {
  errors.push("Guided path manifest must contain at least one path.");
} else {
  for (const guidedPath of guidedPaths) {
    if (!guidedPath || typeof guidedPath !== "object") {
      errors.push("Every guided path must be an object.");
      continue;
    }

    if (typeof guidedPath.id !== "string" || guidedPath.id.trim() === "") {
      errors.push("Every guided path needs a non-empty id.");
    } else if (pathIds.has(guidedPath.id)) {
      errors.push(`Duplicate guided path id: ${guidedPath.id}`);
    } else {
      pathIds.add(guidedPath.id);
    }

    for (const field of ["title", "summary", "outcome"]) {
      if (typeof guidedPath[field] !== "string" || guidedPath[field].trim() === "") {
        errors.push(`${guidedPath.id ?? "unknown path"} is missing ${field}.`);
      }
    }

    if (!Array.isArray(guidedPath.lessons) || guidedPath.lessons.length < 3) {
      errors.push(`${guidedPath.id ?? "unknown path"} must contain at least three lessons.`);
      continue;
    }

    const seenInPath = new Set();
    for (const route of guidedPath.lessons) {
      stepCount += 1;
      if (typeof route !== "string" || !route.startsWith("/learn/atlas/")) {
        errors.push(`${guidedPath.id}: invalid lesson route ${String(route)}`);
        continue;
      }
      if (seenInPath.has(route)) {
        errors.push(`${guidedPath.id}: duplicate lesson step ${route}`);
      }
      seenInPath.add(route);
      allPathLessons.add(route);
      if (!lessonRoutes.has(route)) {
        errors.push(`${guidedPath.id}: unknown Atlas lesson route ${route}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error("Atlas guided path verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Atlas guided paths verified: ${guidedPaths.length} paths, ${stepCount} ordered steps, ${allPathLessons.size} unique Atlas lessons.`,
);
