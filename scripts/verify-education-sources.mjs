import fs from "node:fs";
import path from "node:path";

const contentDir = path.join(process.cwd(), "content");
const sourceFiles = fs
  .readdirSync(contentDir)
  .filter((name) => name.startsWith("education-sources") && name.endsWith(".json"))
  .sort();
const sourceMapFiles = fs
  .readdirSync(contentDir)
  .filter((name) => name.startsWith("education-source-map") && name.endsWith(".json"))
  .sort();

const sources = sourceFiles.flatMap((name) => {
  const pack = JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8"));
  if (!Array.isArray(pack)) throw new Error(`${name} must contain an array`);
  return pack;
});

const sourceMap = {};
const routeOwners = new Map();
for (const name of sourceMapFiles) {
  const map = JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8"));
  if (!map || typeof map !== "object" || Array.isArray(map)) throw new Error(`${name} must contain an object`);
  for (const [route, ids] of Object.entries(map)) {
    if (routeOwners.has(route)) {
      throw new Error(`Duplicate evidence route mapping: ${route} appears in ${routeOwners.get(route)} and ${name}`);
    }
    routeOwners.set(route, name);
    sourceMap[route] = ids;
  }
}

const atlasSourceDefaults = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-source-defaults.json"), "utf8"));
const atlasModules = JSON.parse(fs.readFileSync(path.join(contentDir, "atlas-learning-modules.json"), "utf8"));
const errors = [];
const ids = new Set();

for (const source of sources) {
  if (typeof source.id !== "string" || !source.id.trim()) errors.push("Evidence source is missing an id");
  else if (ids.has(source.id)) errors.push(`Duplicate evidence source id: ${source.id}`);
  else ids.add(source.id);

  if (typeof source.title !== "string" || !source.title.trim()) errors.push(`Missing source title: ${source.id ?? "unknown"}`);
  if (typeof source.publisher !== "string" || !source.publisher.trim()) errors.push(`Missing source publisher: ${source.id ?? "unknown"}`);
  if (typeof source.sourceType !== "string" || !source.sourceType.trim()) errors.push(`Missing source type: ${source.id ?? "unknown"}`);
  if (typeof source.scope !== "string" || !source.scope.trim()) errors.push(`Missing source scope: ${source.id ?? "unknown"}`);
  if (typeof source.url !== "string" || !/^https?:\/\//i.test(source.url)) errors.push(`Invalid source URL: ${source.id ?? "unknown"}`);
}

function verifyMappings(mapping, label, routeKeys = false) {
  if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) {
    errors.push(`${label} must contain an object`);
    return;
  }

  for (const [key, mappedIds] of Object.entries(mapping)) {
    if (routeKeys && !key.startsWith("/learn/")) errors.push(`Evidence map key must be a learning route: ${key}`);
    if (!Array.isArray(mappedIds) || mappedIds.length === 0) {
      errors.push(`${label} entry must contain at least one source: ${key}`);
      continue;
    }
    const seen = new Set();
    for (const id of mappedIds) {
      if (!ids.has(id)) errors.push(`Unknown evidence source id: ${key} -> ${id}`);
      if (seen.has(id)) errors.push(`Duplicate evidence source mapping: ${key} -> ${id}`);
      seen.add(id);
    }
  }
}

verifyMappings(sourceMap, sourceMapFiles.join(", "), true);
verifyMappings(atlasSourceDefaults, "atlas-source-defaults.json");

const atlasIds = new Set(atlasModules.map((atlasModule) => atlasModule.id));
for (const atlasId of atlasIds) {
  if (!Array.isArray(atlasSourceDefaults[atlasId]) || atlasSourceDefaults[atlasId].length === 0) {
    errors.push(`Atlas system is missing default evidence sources: ${atlasId}`);
  }
}
for (const atlasId of Object.keys(atlasSourceDefaults)) {
  if (!atlasIds.has(atlasId)) errors.push(`Atlas evidence defaults reference unknown system: ${atlasId}`);
}

if (errors.length) {
  console.error("Education evidence-source integrity verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Education evidence sources verified: ${ids.size} sources across ${sourceFiles.length} packs, ${Object.keys(sourceMap).length} page mappings across ${sourceMapFiles.length} maps, and ${Object.keys(atlasSourceDefaults).length} Atlas system defaults.`,
);
