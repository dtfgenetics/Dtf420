import fs from "node:fs";
import path from "node:path";

const contentDir = path.join(process.cwd(), "content");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8"));

function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const courses = readJson("academy-courses.json");
const atlasModules = readJson("atlas-learning-modules.json");
const plantHealth = [...readJson("plant-health-library.json"), ...readJson("plant-health-expanded.json")];
const cultivation = [
  ...readJson("cultivation-science-library.json"),
  ...readJson("protected-cultivation-library.json"),
  ...readJson("protected-cultivation-lighting.json"),
  ...readJson("outdoor-cultivation-expanded.json"),
  ...readJson("postharvest-science-expanded.json"),
  ...readJson("advanced-cultivation-science-expanded.json"),
  ...readJson("plant-physiology-expanded.json"),
];
const symptoms = readJson("symptom-differential-library.json");
const tools = readJson("learning-tools.json");

const validPaths = new Set([
  "/learn",
  "/learn/academy",
  "/learn/search",
  "/learn/sources",
  "/learn/atlas",
  "/learn/plant-health",
  "/learn/cultivation-science",
  "/learn/symptoms",
  "/learn/tools",
  "/learn/atlas/cases",
  "/learn/atlas/practice",
  "/learn/atlas/review",
  "/learn/atlas/mastery",
  "/learn/atlas/paths",
  "/learn/atlas/dashboard",
  "/learn/atlas/notebook",
  "/learn/atlas/compare",
]);

for (const item of plantHealth) validPaths.add(`/learn/plant-health/${item.slug}`);
for (const item of cultivation) validPaths.add(`/learn/cultivation-science/${item.slug}`);
for (const item of symptoms) validPaths.add(`/learn/symptoms/${item.slug}`);
for (const item of tools) validPaths.add(`/learn/tools/${item.slug}`);
for (const atlasModule of atlasModules) {
  const system = slugify(atlasModule.id);
  validPaths.add(`/learn/atlas/${system}`);
  for (const lesson of atlasModule.lessons) {
    validPaths.add(`/learn/atlas/${system}/${slugify(lesson.title)}`);
  }
}

const errors = [];
const courseSlugs = new Set();
let unitCount = 0;

if (!Array.isArray(courses) || courses.length === 0) {
  errors.push("academy-courses.json must contain at least one course");
} else {
  for (const [courseIndex, course] of courses.entries()) {
    const label = `course[${courseIndex}]`;
    if (typeof course.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(course.slug)) errors.push(`Invalid Academy slug: ${course.slug}`);
    else if (courseSlugs.has(course.slug)) errors.push(`Duplicate Academy slug: ${course.slug}`);
    else courseSlugs.add(course.slug);

    if (typeof course.title !== "string" || !course.title.trim()) errors.push(`Missing Academy title: ${label}`);
    if (typeof course.summary !== "string" || !course.summary.trim()) errors.push(`Missing Academy summary: ${label}`);
    if (!Array.isArray(course.units) || course.units.length === 0) {
      errors.push(`Academy course has no units: ${course.slug ?? label}`);
      continue;
    }

    const seenHrefs = new Set();
    for (const [unitIndex, unit] of course.units.entries()) {
      unitCount += 1;
      const unitLabel = `${course.slug ?? label}.units[${unitIndex}]`;
      if (typeof unit.title !== "string" || !unit.title.trim()) errors.push(`Missing unit title: ${unitLabel}`);
      if (typeof unit.description !== "string" || !unit.description.trim()) errors.push(`Missing unit description: ${unitLabel}`);
      if (typeof unit.href !== "string" || !unit.href.startsWith("/")) {
        errors.push(`Invalid unit href: ${unitLabel} -> ${String(unit.href)}`);
        continue;
      }
      if (!validPaths.has(unit.href)) errors.push(`Academy unit points to unknown route: ${unitLabel} -> ${unit.href}`);
      if (seenHrefs.has(unit.href)) errors.push(`Duplicate route inside Academy course ${course.slug}: ${unit.href}`);
      seenHrefs.add(unit.href);
    }
  }
}

if (errors.length) {
  console.error("THC Academy integrity verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`THC Academy verified: ${courses.length} courses and ${unitCount} linked units.`);
