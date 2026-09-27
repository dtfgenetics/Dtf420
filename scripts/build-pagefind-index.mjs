import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const exportRoot = path.join(root, "out");
const inputRoot = path.join(root, ".pagefind-input");
const outputRoot = path.join(exportRoot, "pagefind");
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "deployment/static-overlay.json"), "utf8"),
);

if (!fs.existsSync(exportRoot)) {
  throw new Error("Static export out/ is missing. Run npm run build:static-overlay first.");
}

const educationPrefixes = manifest.routePrefixes.filter(
  (prefix) => prefix.startsWith("learn/") && prefix !== "learn/search",
);

fs.rmSync(inputRoot, { recursive: true, force: true });
fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(inputRoot, { recursive: true });

let sourcePageCount = 0;

function copyHtmlTree(relativeRoot) {
  const sourceRoot = path.join(exportRoot, relativeRoot);
  if (!fs.existsSync(sourceRoot)) {
    throw new Error(`Search-owned route prefix is missing from export: ${relativeRoot}`);
  }

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.isFile() || entry.name !== "index.html") continue;

      const relativeFile = path.relative(exportRoot, full);
      const target = path.join(inputRoot, relativeFile);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(full, target);
      sourcePageCount += 1;
    }
  };

  walk(sourceRoot);
}

for (const prefix of educationPrefixes) copyHtmlTree(prefix);

if (sourcePageCount < 150) {
  throw new Error(`Refusing to build an undersized education search index: ${sourcePageCount} pages.`);
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(
  npx,
  [
    "--yes",
    "pagefind@1.5.2",
    "--site",
    inputRoot,
    "--output-path",
    outputRoot,
    "--force-language",
    "en",
  ],
  { stdio: "inherit", cwd: root },
);

fs.rmSync(inputRoot, { recursive: true, force: true });

if (result.status !== 0) {
  throw new Error(`Pagefind indexing failed with status ${result.status ?? "unknown"}.`);
}

const runtime = path.join(outputRoot, "pagefind.js");
if (!fs.existsSync(runtime) || fs.statSync(runtime).size === 0) {
  throw new Error("Pagefind completed without generating pagefind.js.");
}

const searchManifest = {
  schemaVersion: 1,
  engine: "Pagefind",
  engineVersion: "1.5.2",
  sourcePageCount,
  routePrefixes: educationPrefixes,
  generatedFrom: "Dtf420 static overlay export",
  excludes: ["learn/search", "WordPress-owned routes", "games", "community"],
};

fs.writeFileSync(
  path.join(outputRoot, "dtf-search-manifest.json"),
  JSON.stringify(searchManifest, null, 2) + "\n",
);

console.log(JSON.stringify({ ok: true, ...searchManifest }));
