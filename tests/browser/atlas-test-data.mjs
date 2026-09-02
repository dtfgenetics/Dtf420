import fs from "node:fs";
import path from "node:path";

export function loadAtlasKnowledgeChecks() {
  const contentDir = path.join(process.cwd(), "content");
  const expansionFiles = fs
    .readdirSync(contentDir)
    .filter((name) => /^atlas-knowledge-checks-expansion-\d+\.json$/.test(name))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

  return ["atlas-knowledge-checks.json", ...expansionFiles].flatMap((name) =>
    JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8")),
  );
}

export function loadAtlasEntities() {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "content/atlas-entities.json"), "utf8"),
  );
}
