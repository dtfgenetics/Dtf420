import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const modules = JSON.parse(fs.readFileSync(path.join(root, "content/atlas-learning-modules.json"), "utf8"));
const exercises = JSON.parse(fs.readFileSync(path.join(root, "content/atlas-visual-identification.json"), "utf8"));

function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const systemIds = new Set(modules.map((item) => item.id));
const lessonRoutes = new Set(
  modules.flatMap((atlasModule) =>
    atlasModule.lessons.map(
      (lesson) => `/learn/atlas/${slugify(atlasModule.id)}/${slugify(lesson.title)}`,
    ),
  ),
);

const errors = [];
const ids = new Set();
const systemsCovered = new Set();

if (!Array.isArray(exercises) || exercises.length === 0) {
  errors.push("Visual identification practice must contain at least one exercise.");
} else {
  for (const exercise of exercises) {
    if (!exercise || typeof exercise !== "object") {
      errors.push("Every visual identification exercise must be an object.");
      continue;
    }

    if (typeof exercise.id !== "string" || exercise.id.trim() === "") {
      errors.push("Every visual identification exercise needs an id.");
    } else if (ids.has(exercise.id)) {
      errors.push(`Duplicate visual identification id: ${exercise.id}`);
    } else {
      ids.add(exercise.id);
    }

    if (!systemIds.has(exercise.systemId)) {
      errors.push(`${exercise.id}: unknown Atlas system ${String(exercise.systemId)}`);
    } else {
      systemsCovered.add(exercise.systemId);
    }

    for (const field of ["systemLabel", "prompt", "explanation", "href"]) {
      if (typeof exercise[field] !== "string" || exercise[field].trim() === "") {
        errors.push(`${exercise.id}: missing ${field}.`);
      }
    }

    if (!Array.isArray(exercise.options) || exercise.options.length !== 4) {
      errors.push(`${exercise.id}: exactly four answer options are required.`);
    } else if (new Set(exercise.options).size !== exercise.options.length) {
      errors.push(`${exercise.id}: answer options must be unique.`);
    }

    if (!Number.isInteger(exercise.correctIndex) || exercise.correctIndex < 0 || exercise.correctIndex > 3) {
      errors.push(`${exercise.id}: correctIndex must be an integer from 0 through 3.`);
    }

    if (typeof exercise.href === "string" && !lessonRoutes.has(exercise.href)) {
      errors.push(`${exercise.id}: connected lesson route does not exist: ${exercise.href}`);
    }
  }
}

for (const systemId of systemIds) {
  if (!systemsCovered.has(systemId)) errors.push(`Visual identification practice does not cover Atlas system ${systemId}.`);
}

if (errors.length > 0) {
  console.error("Atlas visual identification verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Atlas visual identification verified: ${exercises.length} exercises across ${systemsCovered.size} systems.`);
