import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8"));
}

const plantHealthFiles = [
  "plant-health-library.json",
  "plant-health-expanded.json",
  "plant-health-abiotic-expanded.json",
  "plant-health-ipm-expanded.json",
];
const cultivationFiles = [
  "cultivation-science-library.json",
  "protected-cultivation-library.json",
  "protected-cultivation-lighting.json",
  "outdoor-cultivation-expanded.json",
  "postharvest-science-expanded.json",
  "advanced-cultivation-science-expanded.json",
  "plant-physiology-expanded.json",
  "propagation-nutrition-genetics-expanded.json",
];
const symptomFiles = ["symptom-differential-library.json", "symptom-differential-expanded.json"];
const toolFiles = ["learning-tools.json"];

const errors = [];

function assertText(value, label) {
  if (typeof value !== "string" || !value.trim()) errors.push(`Missing text: ${label}`);
}

function assertStringArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`Expected a non-empty array: ${label}`);
    return;
  }
  const seen = new Set();
  for (const [index, item] of value.entries()) {
    if (typeof item !== "string" || !item.trim()) errors.push(`Empty item: ${label}[${index}]`);
    const normalized = typeof item === "string" ? item.trim().toLowerCase() : "";
    if (normalized && seen.has(normalized)) errors.push(`Duplicate item: ${label} -> ${item}`);
    seen.add(normalized);
  }
}

function verifyUniqueSlugs(records, namespace) {
  const seen = new Map();
  for (const record of records) {
    const slug = record.slug;
    if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.push(`Invalid slug in ${namespace}: ${String(slug)}`);
      continue;
    }
    if (seen.has(slug)) errors.push(`Duplicate slug in ${namespace}: ${slug} (${seen.get(slug)} and ${record.__file})`);
    else seen.set(slug, record.__file);
  }
}

function withSource(records, file) {
  if (!Array.isArray(records)) {
    errors.push(`Top-level JSON must be an array: ${file}`);
    return [];
  }
  return records.map((record) => ({ ...record, __file: file }));
}

const plantHealth = plantHealthFiles.flatMap((file) => withSource(readJson(file), file));
const cultivation = cultivationFiles.flatMap((file) => withSource(readJson(file), file));
const symptoms = symptomFiles.flatMap((file) => withSource(readJson(file), file));
const tools = toolFiles.flatMap((file) => withSource(readJson(file), file));

verifyUniqueSlugs(plantHealth, "plant health");
verifyUniqueSlugs(cultivation, "cultivation science");
verifyUniqueSlugs(symptoms, "symptom differential");
verifyUniqueSlugs(tools, "printable tools");

for (const item of plantHealth) {
  const id = `${item.__file}:${item.slug}`;
  assertText(item.title, `${id}.title`);
  assertText(item.category, `${id}.category`);
  assertText(item.summary, `${id}.summary`);
  assertStringArray(item.whatToLookFor, `${id}.whatToLookFor`);
  assertStringArray(item.lookAlikes, `${id}.lookAlikes`);
  assertStringArray(item.confirmWith, `${id}.confirmWith`);
  assertStringArray(item.managementPrinciples, `${id}.managementPrinciples`);
  assertStringArray(item.prevention, `${id}.prevention`);
  assertStringArray(item.visualNeeds, `${id}.visualNeeds`);
}

for (const item of cultivation) {
  const id = `${item.__file}:${item.slug}`;
  assertText(item.title, `${id}.title`);
  assertText(item.category, `${id}.category`);
  assertText(item.summary, `${id}.summary`);
  assertStringArray(item.keyConcepts, `${id}.keyConcepts`);
  assertStringArray(item.measureObserve, `${id}.measureObserve`);
  assertStringArray(item.commonMistakes, `${id}.commonMistakes`);
  assertStringArray(item.visualNeeds, `${id}.visualNeeds`);
}

for (const item of symptoms) {
  const id = `${item.__file}:${item.slug}`;
  assertText(item.title, `${id}.title`);
  assertText(item.summary, `${id}.summary`);
  assertStringArray(item.patternQuestions, `${id}.patternQuestions`);
  assertStringArray(item.possibleCategories, `${id}.possibleCategories`);
  assertStringArray(item.discriminatingChecks, `${id}.discriminatingChecks`);
  assertStringArray(item.redFlags, `${id}.redFlags`);
  assertStringArray(item.visualNeeds, `${id}.visualNeeds`);
}

for (const tool of tools) {
  const id = `${tool.__file}:${tool.slug}`;
  assertText(tool.title, `${id}.title`);
  assertText(tool.category, `${id}.category`);
  assertText(tool.purpose, `${id}.purpose`);
  if (!Array.isArray(tool.sections) || tool.sections.length === 0) {
    errors.push(`Printable tool needs at least one section: ${id}`);
  } else {
    const sectionTitles = new Set();
    for (const [index, section] of tool.sections.entries()) {
      assertText(section.title, `${id}.sections[${index}].title`);
      assertStringArray(section.fields, `${id}.sections[${index}].fields`);
      const normalized = section.title?.trim().toLowerCase();
      if (normalized && sectionTitles.has(normalized)) errors.push(`Duplicate tool section: ${id} -> ${section.title}`);
      sectionTitles.add(normalized);
    }
  }
  assertStringArray(tool.related, `${id}.related`);
}

const routeSet = new Set();
for (const item of plantHealth) routeSet.add(`/learn/plant-health/${item.slug}`);
for (const item of cultivation) {
  const route = `/learn/cultivation-science/${item.slug}`;
  if (routeSet.has(route)) errors.push(`Duplicate education route: ${route}`);
  routeSet.add(route);
}
for (const item of symptoms) {
  const route = `/learn/symptoms/${item.slug}`;
  if (routeSet.has(route)) errors.push(`Duplicate education route: ${route}`);
  routeSet.add(route);
}
for (const item of tools) {
  const route = `/learn/tools/${item.slug}`;
  if (routeSet.has(route)) errors.push(`Duplicate education route: ${route}`);
  routeSet.add(route);
}

if (errors.length) {
  console.error("Education content integrity verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const visualBriefs = [
  ...plantHealth.flatMap((item) => item.visualNeeds),
  ...cultivation.flatMap((item) => item.visualNeeds),
  ...symptoms.flatMap((item) => item.visualNeeds),
].length;

console.log(
  `Education content integrity verified: ${plantHealth.length} plant-health references, ${cultivation.length} cultivation-science references, ${symptoms.length} symptom differentials, ${tools.length} printable tools, ${visualBriefs} visual briefs.`,
);
