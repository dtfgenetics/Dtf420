import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const guidedPaths = JSON.parse(fs.readFileSync(path.join(root, "content/atlas-guided-paths.json"), "utf8"));
const badges = JSON.parse(fs.readFileSync(path.join(root, "content/atlas-mastery-badges.json"), "utf8"));
const errors = [];
const pathIds = new Set(guidedPaths.map((item) => item.id));
const badgeIds = new Set();
const marks = new Set();

if (badges.length !== guidedPaths.length) {
  errors.push(`Expected ${guidedPaths.length} path badges but found ${badges.length}.`);
}

for (const badge of badges) {
  if (!badge || typeof badge !== "object") {
    errors.push("Badge entry is not an object.");
    continue;
  }

  if (typeof badge.id !== "string" || !pathIds.has(badge.id)) {
    errors.push(`Badge references unknown path: ${badge.id}`);
  } else if (badgeIds.has(badge.id)) {
    errors.push(`Duplicate badge id: ${badge.id}`);
  } else {
    badgeIds.add(badge.id);
  }

  for (const field of ["title", "shortLabel", "mark", "description"]) {
    if (typeof badge[field] !== "string" || !badge[field].trim()) {
      errors.push(`${badge.id ?? "unknown badge"}: missing ${field}.`);
    }
  }

  if (typeof badge.mark === "string") {
    if (!/^[A-Z0-9]{2,3}$/.test(badge.mark)) errors.push(`${badge.id}: mark must be 2-3 uppercase letters/numbers.`);
    if (marks.has(badge.mark)) errors.push(`Duplicate badge mark: ${badge.mark}`);
    marks.add(badge.mark);
  }

  if (typeof badge.description === "string" && badge.description.trim().length < 50) {
    errors.push(`${badge.id}: description is too short to explain the achievement.`);
  }
}

for (const guidedPath of guidedPaths) {
  if (!badgeIds.has(guidedPath.id)) errors.push(`Missing badge for guided path: ${guidedPath.id}`);
}

if (errors.length) {
  console.error("Atlas mastery-badge verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Atlas mastery badges verified: ${badges.length} path badges mapped one-to-one with ${guidedPaths.length} guided paths.`);
