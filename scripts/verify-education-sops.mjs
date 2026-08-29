import fs from "node:fs";
import path from "node:path";

const sops = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/education-sops.json"), "utf8"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(Array.isArray(sops), "education-sops.json must contain an array");
assert(sops.length >= 10, `expected at least 10 SOPs, found ${sops.length}`);

const slugs = new Set();
const titles = new Set();
const categories = new Set();

for (const sop of sops) {
  assert(typeof sop.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sop.slug), `invalid SOP slug: ${sop.slug}`);
  assert(typeof sop.title === "string" && sop.title.trim().length >= 8, `${sop.slug}: title is missing or too short`);
  assert(typeof sop.category === "string" && sop.category.trim().length >= 3, `${sop.title}: category is required`);
  assert(typeof sop.purpose === "string" && sop.purpose.trim().length >= 50, `${sop.title}: purpose is too short`);
  assert(typeof sop.scope === "string" && sop.scope.trim().length >= 50, `${sop.title}: scope is too short`);
  assert(typeof sop.frequency === "string" && sop.frequency.trim().length >= 30, `${sop.title}: frequency is too short`);

  assert(!slugs.has(sop.slug), `duplicate SOP slug: ${sop.slug}`);
  assert(!titles.has(sop.title.toLowerCase()), `duplicate SOP title: ${sop.title}`);
  slugs.add(sop.slug);
  titles.add(sop.title.toLowerCase());
  categories.add(sop.category);

  assert(Array.isArray(sop.tools) && sop.tools.length >= 3, `${sop.title}: at least three tools are required`);
  assert(Array.isArray(sop.preconditions) && sop.preconditions.length >= 2, `${sop.title}: at least two preconditions are required`);
  assert(Array.isArray(sop.steps) && sop.steps.length >= 4, `${sop.title}: at least four procedure steps are required`);
  assert(Array.isArray(sop.verification) && sop.verification.length >= 2, `${sop.title}: verification checks are required`);
  assert(Array.isArray(sop.records) && sop.records.length >= 5, `${sop.title}: record fields are incomplete`);
  assert(Array.isArray(sop.relatedRoutes) && sop.relatedRoutes.length >= 2, `${sop.title}: related learning routes are required`);
  assert(Array.isArray(sop.limitations) && sop.limitations.length >= 1, `${sop.title}: interpretation limitations are required`);

  for (const [index, step] of sop.steps.entries()) {
    assert(typeof step.title === "string" && step.title.trim(), `${sop.title}: step ${index + 1} needs a title`);
    assert(typeof step.action === "string" && step.action.trim().length >= 30, `${sop.title}: step ${index + 1} action is too short`);
    assert(typeof step.record === "string" && step.record.trim().length >= 15, `${sop.title}: step ${index + 1} record instruction is too short`);
  }

  for (const route of sop.relatedRoutes) {
    assert(typeof route === "string" && (route.startsWith("/learn/") || route.startsWith("/seeds")), `${sop.title}: invalid related route ${route}`);
  }
}

const requiredSlugs = [
  "ph-meter-calibration-and-measurement",
  "ec-meter-verification-and-measurement",
  "ppfd-grid-survey",
  "dli-calculation-and-logging",
  "air-temperature-rh-sensor-check",
  "leaf-temperature-measurement",
  "vpd-observation-record",
  "plant-health-scouting-record",
  "incoming-plant-quarantine-intake",
  "root-zone-moisture-irrigation-observation",
];

for (const slug of requiredSlugs) {
  assert(slugs.has(slug), `missing required SOP: ${slug}`);
}

assert(categories.size >= 4, `expected at least four SOP categories, found ${categories.size}`);
console.log(`SOP integrity verified: ${sops.length} procedures across ${categories.size} categories.`);
