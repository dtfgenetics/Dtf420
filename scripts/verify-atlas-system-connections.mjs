import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const modules = JSON.parse(fs.readFileSync(path.join(root, "content/atlas-learning-modules.json"), "utf8"));
const connections = JSON.parse(fs.readFileSync(path.join(root, "content/atlas-system-connections.json"), "utf8"));

const moduleIds = new Set(modules.map((item) => item.id));
const errors = [];
const seen = new Set();

if (!Array.isArray(connections)) {
  errors.push("Atlas system connections must be an array.");
} else {
  for (const item of connections) {
    if (!item || typeof item !== "object") {
      errors.push("Every Atlas system connection must be an object.");
      continue;
    }

    if (typeof item.id !== "string" || !moduleIds.has(item.id)) {
      errors.push(`Unknown or missing Atlas system id: ${String(item.id)}`);
      continue;
    }
    if (seen.has(item.id)) errors.push(`Duplicate Atlas system connection: ${item.id}`);
    seen.add(item.id);

    if (typeof item.reason !== "string" || item.reason.trim().length < 30) {
      errors.push(`${item.id}: reason must be a meaningful explanatory sentence.`);
    }

    if (!Array.isArray(item.stages) || item.stages.length === 0) {
      errors.push(`${item.id}: at least one developmental stage is required.`);
    }
    if (!Array.isArray(item.measurements) || item.measurements.length < 2) {
      errors.push(`${item.id}: at least two measurements or observations are required.`);
    }
    if (!Array.isArray(item.related) || item.related.length < 2) {
      errors.push(`${item.id}: at least two related systems are required.`);
    } else {
      const relatedSeen = new Set();
      for (const relatedId of item.related) {
        if (!moduleIds.has(relatedId)) errors.push(`${item.id}: unknown related system ${relatedId}`);
        if (relatedId === item.id) errors.push(`${item.id}: system cannot relate to itself.`);
        if (relatedSeen.has(relatedId)) errors.push(`${item.id}: duplicate related system ${relatedId}`);
        relatedSeen.add(relatedId);
      }
    }
  }
}

for (const moduleId of moduleIds) {
  if (!seen.has(moduleId)) errors.push(`Missing Atlas system connection record for ${moduleId}`);
}

if (errors.length > 0) {
  console.error("Atlas system connection verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Atlas system connections verified: ${connections.length} systems with valid cross-system links.`);
