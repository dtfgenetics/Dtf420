import fs from "node:fs";
import path from "node:path";

const contentPath = path.join(process.cwd(), "content/community-growoffs.json");
const growOffs = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const errors = [];

if (!Array.isArray(growOffs) || growOffs.length === 0) {
  errors.push("community-growoffs.json must contain at least one event");
}

const slugs = new Set();
for (const event of Array.isArray(growOffs) ? growOffs : []) {
  if (typeof event.slug !== "string" || !event.slug.trim()) errors.push("Grow-off is missing a slug");
  else if (slugs.has(event.slug)) errors.push(`Duplicate grow-off slug: ${event.slug}`);
  else slugs.add(event.slug);

  for (const field of ["title", "status", "summary", "editionNotice"]) {
    if (typeof event[field] !== "string" || !event[field].trim()) errors.push(`${event.slug ?? "unknown"} is missing ${field}`);
  }

  if (!Array.isArray(event.rules) || event.rules.length === 0) errors.push(`${event.slug ?? "unknown"} must contain at least one rule`);
  if (!Array.isArray(event.timeline) || event.timeline.length === 0) errors.push(`${event.slug ?? "unknown"} must contain at least one timeline record`);
  if (!Array.isArray(event.judging)) errors.push(`${event.slug ?? "unknown"}.judging must be an array`);

  for (const step of Array.isArray(event.timeline) ? event.timeline : []) {
    if (![step.label, step.dateLabel, step.detail].every((value) => typeof value === "string" && value.trim())) {
      errors.push(`${event.slug ?? "unknown"} contains an incomplete timeline record`);
    }
  }

  if (!event.editionNotice?.toLowerCase().includes("year-specific") && !event.editionNotice?.toLowerCase().includes("year-specific announcement")) {
    errors.push(`${event.slug ?? "unknown"} must explicitly separate permanent rules from year-specific edition status`);
  }
}

if (errors.length) {
  console.error("Community grow-off verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Community grow-offs verified: ${growOffs.length} event records, ${growOffs.reduce((sum, event) => sum + event.rules.length, 0)} rules, ${growOffs.reduce((sum, event) => sum + event.timeline.length, 0)} timeline markers.`);
