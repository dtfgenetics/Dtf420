import fs from "node:fs";
import path from "node:path";

const contentDir = path.join(process.cwd(), "content");
const sources = JSON.parse(fs.readFileSync(path.join(contentDir, "education-sources.json"), "utf8"));
const sourceMap = JSON.parse(fs.readFileSync(path.join(contentDir, "education-source-map.json"), "utf8"));
const errors = [];

if (!Array.isArray(sources)) {
  errors.push("education-sources.json must contain an array");
}

const ids = new Set();
for (const source of Array.isArray(sources) ? sources : []) {
  if (typeof source.id !== "string" || !source.id.trim()) errors.push("Evidence source is missing an id");
  else if (ids.has(source.id)) errors.push(`Duplicate evidence source id: ${source.id}`);
  else ids.add(source.id);

  if (typeof source.title !== "string" || !source.title.trim()) errors.push(`Missing source title: ${source.id ?? "unknown"}`);
  if (typeof source.publisher !== "string" || !source.publisher.trim()) errors.push(`Missing source publisher: ${source.id ?? "unknown"}`);
  if (typeof source.sourceType !== "string" || !source.sourceType.trim()) errors.push(`Missing source type: ${source.id ?? "unknown"}`);
  if (typeof source.scope !== "string" || !source.scope.trim()) errors.push(`Missing source scope: ${source.id ?? "unknown"}`);
  if (typeof source.url !== "string" || !/^https?:\/\//i.test(source.url)) errors.push(`Invalid source URL: ${source.id ?? "unknown"}`);
}

if (!sourceMap || typeof sourceMap !== "object" || Array.isArray(sourceMap)) {
  errors.push("education-source-map.json must contain an object");
} else {
  for (const [route, mappedIds] of Object.entries(sourceMap)) {
    if (!route.startsWith("/learn/")) errors.push(`Evidence map key must be a learning route: ${route}`);
    if (!Array.isArray(mappedIds) || mappedIds.length === 0) {
      errors.push(`Evidence map entry must contain at least one source: ${route}`);
      continue;
    }
    const seen = new Set();
    for (const id of mappedIds) {
      if (!ids.has(id)) errors.push(`Unknown evidence source id: ${route} -> ${id}`);
      if (seen.has(id)) errors.push(`Duplicate evidence source mapping: ${route} -> ${id}`);
      seen.add(id);
    }
  }
}

if (errors.length) {
  console.error("Education evidence-source integrity verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Education evidence sources verified: ${ids.size} sources mapped to ${Object.keys(sourceMap).length} learning pages.`);
