import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content");
const modules = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-learning-modules.json"), "utf8"));
const defaults = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-source-defaults.json"), "utf8"));

const sourceFiles = fs
  .readdirSync(contentDir)
  .filter((name) => name.startsWith("education-sources") && name.endsWith(".json"))
  .sort();
const mapFiles = fs
  .readdirSync(contentDir)
  .filter((name) => name.startsWith("education-source-map") && name.endsWith(".json"))
  .sort();

const sources = sourceFiles.flatMap((name) => JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8")));
const maps = Object.assign(
  {},
  ...mapFiles.map((name) => JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8"))),
);
const sourceIds = new Set(sources.map((source) => source.id));
const errors = [];

function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const lessonRoutes = [];
for (const atlasModule of modules) {
  const defaultIds = defaults[atlasModule.id];
  if (!Array.isArray(defaultIds) || defaultIds.length < 2) {
    errors.push(`${atlasModule.id} must define at least two system-level evidence sources.`);
  } else {
    for (const id of defaultIds) {
      if (!sourceIds.has(id)) errors.push(`${atlasModule.id} references unknown default evidence source: ${id}`);
    }
  }

  for (const lesson of atlasModule.lessons ?? []) {
    const route = `/learn/atlas/${slugify(atlasModule.id)}/${slugify(lesson.title)}`;
    lessonRoutes.push(route);
    const directIds = Array.isArray(maps[route]) ? maps[route] : [];
    const resolvedIds = [...new Set([...directIds, ...(Array.isArray(defaultIds) ? defaultIds : [])])];
    if (resolvedIds.length < 2) errors.push(`${route} resolves to fewer than two evidence sources.`);
    for (const id of resolvedIds) {
      if (!sourceIds.has(id)) errors.push(`${route} resolves to unknown evidence source: ${id}`);
    }
  }
}

if (lessonRoutes.length !== 100) errors.push(`Expected 100 Atlas lesson routes but found ${lessonRoutes.length}.`);
if (new Set(lessonRoutes).size !== lessonRoutes.length) errors.push("Atlas lesson routes must be unique before evidence resolution.");

if (errors.length) {
  console.error("Atlas evidence coverage verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const directCount = lessonRoutes.filter((route) => Array.isArray(maps[route]) && maps[route].length > 0).length;
console.log(
  `Atlas evidence coverage verified: ${lessonRoutes.length} lessons resolve to at least two known sources; ` +
  `${directCount} lessons also have direct route-level evidence mappings.`,
);
