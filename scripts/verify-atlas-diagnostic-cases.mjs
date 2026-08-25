import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const modules = JSON.parse(fs.readFileSync(path.join(root, "content/atlas-learning-modules.json"), "utf8"));
const cases = JSON.parse(fs.readFileSync(path.join(root, "content/atlas-diagnostic-cases.json"), "utf8"));

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
const ids = new Set();
const titles = new Set();
let linkCount = 0;

if (!Array.isArray(cases) || cases.length < 6) {
  errors.push("Diagnostic case bank must contain at least six cases.");
} else {
  for (const diagnosticCase of cases) {
    if (!diagnosticCase || typeof diagnosticCase !== "object") {
      errors.push("Every diagnostic case must be an object.");
      continue;
    }

    const id = diagnosticCase.id;
    if (typeof id !== "string" || id.trim() === "") {
      errors.push("Every diagnostic case needs a non-empty id.");
    } else if (ids.has(id)) {
      errors.push(`Duplicate diagnostic case id: ${id}`);
    } else {
      ids.add(id);
    }

    if (typeof diagnosticCase.title !== "string" || diagnosticCase.title.trim() === "") {
      errors.push(`${id ?? "unknown case"} is missing title.`);
    } else if (titles.has(diagnosticCase.title)) {
      errors.push(`Duplicate diagnostic case title: ${diagnosticCase.title}`);
    } else {
      titles.add(diagnosticCase.title);
    }

    for (const field of ["focus", "scenario", "question", "takeaway"]) {
      if (typeof diagnosticCase[field] !== "string" || diagnosticCase[field].trim() === "") {
        errors.push(`${id ?? "unknown case"} is missing ${field}.`);
      }
    }

    if (!Array.isArray(diagnosticCase.observations) || diagnosticCase.observations.length < 4) {
      errors.push(`${id ?? "unknown case"} must contain at least four observations.`);
    } else {
      const observationLabels = new Set();
      for (const observation of diagnosticCase.observations) {
        if (!observation || typeof observation !== "object") {
          errors.push(`${id}: observation must be an object.`);
          continue;
        }
        if (typeof observation.label !== "string" || observation.label.trim() === "") {
          errors.push(`${id}: observation is missing label.`);
        } else if (observationLabels.has(observation.label)) {
          errors.push(`${id}: duplicate observation label ${observation.label}.`);
        } else {
          observationLabels.add(observation.label);
        }
        if (typeof observation.value !== "string" || observation.value.trim() === "") {
          errors.push(`${id}: observation ${observation.label ?? "unknown"} is missing value.`);
        }
      }
    }

    if (!Array.isArray(diagnosticCase.options) || diagnosticCase.options.length !== 4) {
      errors.push(`${id ?? "unknown case"} must contain exactly four answer options.`);
    } else {
      const optionLabels = new Set();
      for (const option of diagnosticCase.options) {
        if (!option || typeof option !== "object") {
          errors.push(`${id}: answer option must be an object.`);
          continue;
        }
        if (typeof option.label !== "string" || option.label.trim() === "") {
          errors.push(`${id}: answer option is missing label.`);
        } else if (optionLabels.has(option.label)) {
          errors.push(`${id}: duplicate answer option ${option.label}.`);
        } else {
          optionLabels.add(option.label);
        }
        if (typeof option.rationale !== "string" || option.rationale.trim() === "") {
          errors.push(`${id}: answer option ${option.label ?? "unknown"} is missing rationale.`);
        }
      }
    }

    if (!Number.isInteger(diagnosticCase.correctIndex) || diagnosticCase.correctIndex < 0 || diagnosticCase.correctIndex > 3) {
      errors.push(`${id ?? "unknown case"} has invalid correctIndex ${String(diagnosticCase.correctIndex)}.`);
    }

    if (!Array.isArray(diagnosticCase.differential) || diagnosticCase.differential.length < 2) {
      errors.push(`${id ?? "unknown case"} must contain at least two differential entries.`);
    } else if (diagnosticCase.differential.some((entry) => typeof entry !== "string" || entry.trim() === "")) {
      errors.push(`${id ?? "unknown case"} contains an empty differential entry.`);
    }

    if (!Array.isArray(diagnosticCase.links) || diagnosticCase.links.length < 2) {
      errors.push(`${id ?? "unknown case"} must link to at least two Atlas lessons.`);
    } else {
      const routes = new Set();
      for (const link of diagnosticCase.links) {
        linkCount += 1;
        if (!link || typeof link !== "object") {
          errors.push(`${id}: lesson link must be an object.`);
          continue;
        }
        if (typeof link.label !== "string" || link.label.trim() === "") {
          errors.push(`${id}: lesson link is missing label.`);
        }
        if (typeof link.route !== "string" || !lessonRoutes.has(link.route)) {
          errors.push(`${id}: unknown Atlas lesson route ${String(link.route)}.`);
        } else if (routes.has(link.route)) {
          errors.push(`${id}: duplicate lesson link ${link.route}.`);
        } else {
          routes.add(link.route);
        }
      }
    }
  }
}

if (errors.length > 0) {
  console.error("Atlas diagnostic case verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Atlas diagnostic cases verified: ${cases.length} cases, ${linkCount} validated Atlas lesson links.`);
