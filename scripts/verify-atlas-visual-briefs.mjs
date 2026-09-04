import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content");
const modules = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-learning-modules.json"), "utf8"));
const briefFiles = fs.readdirSync(contentDir)
  .filter((name) => /^atlas-.*-visual-briefs\.json$/.test(name))
  .sort();

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const canonical = new Map();
for (const module of modules) {
  const systemSlug = slugify(module.id);
  for (const lesson of module.lessons || []) {
    const route = `/learn/atlas/${systemSlug}/${slugify(lesson.title)}`;
    canonical.set(route, { systemId: module.id, title: lesson.title });
  }
}

const errors = [];
const seenRoutes = new Map();
let total = 0;
for (const fileName of briefFiles) {
  let records;
  try {
    records = JSON.parse(fs.readFileSync(path.join(contentDir, fileName), "utf8"));
  } catch (error) {
    errors.push(`${fileName} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    continue;
  }
  if (!Array.isArray(records)) {
    errors.push(`${fileName} must contain an array.`);
    continue;
  }

  for (const record of records) {
    total += 1;
    const route = record?.route;
    const label = record?.title ?? record?.lesson;
    if (typeof route !== "string" || !route.startsWith("/learn/atlas/")) {
      errors.push(`${fileName} has invalid route: ${route || "missing"}`);
      continue;
    }
    const lesson = canonical.get(route);
    if (!lesson) {
      errors.push(`${fileName} references a non-canonical lesson route: ${route}`);
      continue;
    }
    if (seenRoutes.has(route)) {
      errors.push(`Duplicate Atlas visual brief route ${route} in ${seenRoutes.get(route)} and ${fileName}.`);
    }
    seenRoutes.set(route, fileName);

    if (typeof label !== "string" || slugify(label) !== slugify(lesson.title)) {
      errors.push(`${fileName} title/lesson mismatch for ${route}: expected '${lesson.title}', found '${label || "missing"}'.`);
    }
    if (typeof record.brief !== "string" || record.brief.trim().length < 120) {
      errors.push(`${fileName} needs a substantive visual brief for ${route}.`);
    }
    if (record.assetType !== undefined && (typeof record.assetType !== "string" || record.assetType.trim().length < 4)) {
      errors.push(`${fileName} has invalid assetType for ${route}.`);
    }
  }
}

if (!briefFiles.length) errors.push("No Atlas visual brief files were discovered.");

if (errors.length) {
  console.error("Atlas visual brief verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Atlas visual briefs verified: ${total} unique lesson briefs across ${briefFiles.length} files; ${canonical.size} canonical lesson routes available.`);
