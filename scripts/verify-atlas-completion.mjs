import fs from "node:fs";
import path from "node:path";

const contentDir = path.join(process.cwd(), "content");
const modules = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-learning-modules.json"), "utf8"));
const completionMap = JSON.parse(fs.readFileSync(path.join(contentDir, "education-source-map-atlas-completion.json"), "utf8"));
const completionChecks = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-knowledge-checks-expansion-05.json"), "utf8"));
const visualBriefs = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-completion-visual-briefs.json"), "utf8"));
const sections = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-sections.json"), "utf8"));
const entities = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-entities.json"), "utf8"));

const finalSystems = new Set([
  "seed_germination",
  "root_system",
  "sex_pollen_seed",
  "environment_overlay",
  "diagnostic_overlay",
]);
const errors = [];

function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

if (!Array.isArray(modules) || modules.length !== 10) {
  errors.push(`Expected exactly 10 Atlas systems but found ${Array.isArray(modules) ? modules.length : "invalid data"}.`);
}

const allRoutes = [];
const completionRoutes = [];
for (const atlasModule of Array.isArray(modules) ? modules : []) {
  if (!Array.isArray(atlasModule.lessons) || atlasModule.lessons.length !== 10) {
    errors.push(`${atlasModule.id ?? "unknown"} must contain exactly 10 canonical lessons.`);
    continue;
  }
  atlasModule.lessons.forEach((lesson, index) => {
    const route = `/learn/atlas/${slugify(atlasModule.id)}/${slugify(lesson.title)}`;
    allRoutes.push(route);
    if (finalSystems.has(atlasModule.id) && index >= 6) completionRoutes.push(route);
  });
}

if (allRoutes.length !== 100) errors.push(`Expected 100 canonical lesson routes but found ${allRoutes.length}.`);
if (new Set(allRoutes).size !== allRoutes.length) errors.push("Canonical Atlas lesson routes must be unique.");
if (completionRoutes.length !== 20) errors.push(`Expected 20 completion routes but found ${completionRoutes.length}.`);

const completionSet = new Set(completionRoutes);
const mapRoutes = new Set(Object.keys(completionMap));
const checkRoutes = new Set(completionChecks.map((check) => check.route));
const briefRoutes = new Set(visualBriefs.map((brief) => brief.route));

for (const route of completionRoutes) {
  if (!Array.isArray(completionMap[route]) || completionMap[route].length === 0) errors.push(`Completion lesson lacks direct evidence mapping: ${route}`);
  if (!checkRoutes.has(route)) errors.push(`Completion lesson lacks a knowledge check: ${route}`);
  if (!briefRoutes.has(route)) errors.push(`Completion lesson lacks a visual brief: ${route}`);
}
for (const route of mapRoutes) if (!completionSet.has(route)) errors.push(`Completion evidence map contains non-completion route: ${route}`);
for (const route of checkRoutes) if (!completionSet.has(route)) errors.push(`Completion checks contain non-completion route: ${route}`);
for (const route of briefRoutes) if (!completionSet.has(route)) errors.push(`Completion visual briefs contain non-completion route: ${route}`);

if (mapRoutes.size !== 20) errors.push(`Expected 20 direct completion evidence mappings but found ${mapRoutes.size}.`);
if (checkRoutes.size !== 20) errors.push(`Expected 20 completion knowledge checks but found ${checkRoutes.size}.`);
if (briefRoutes.size !== 20) errors.push(`Expected 20 completion visual briefs but found ${briefRoutes.size}.`);

const sectionIds = new Set(sections.map((section) => section.id));
const entityIds = new Set(entities.map((entity) => entity.id));
for (const atlasModule of modules) {
  if (!sectionIds.has(atlasModule.id)) errors.push(`Atlas section missing for system: ${atlasModule.id}`);
  if (!entityIds.has(atlasModule.id)) errors.push(`Interactive Atlas entity missing for system: ${atlasModule.id}`);
}
if (sections.length !== 10) errors.push(`Expected 10 Atlas section records but found ${sections.length}.`);
if (entities.length !== 10) errors.push(`Expected 10 interactive Atlas entities but found ${entities.length}.`);

if (errors.length) {
  console.error("Atlas completion verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Atlas completion verified: 10 systems × 10 lessons = 100 canonical lessons; final 20 all have direct evidence, checks, visual briefs, sections, and interactive entities.");
