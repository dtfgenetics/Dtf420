import fs from "node:fs";
import path from "node:path";

const root = path.resolve("out");
const manifestPath = path.resolve("deployment/static-overlay.json");
const atlasModulesPath = path.resolve("content/atlas-learning-modules.json");

if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
  throw new Error("Static export directory out/ is missing. Run npm run build:static-overlay first.");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const atlasModules = JSON.parse(fs.readFileSync(atlasModulesPath, "utf8"));
if (manifest.schemaVersion !== 1 || manifest.purpose !== "dtfseeds-wordpress-child-route-overlay") {
  throw new Error("Unexpected static overlay manifest schema/purpose.");
}
if (manifest.canonicalOrigin !== "https://dtfseeds.com") {
  throw new Error(`Wrong canonical origin: ${manifest.canonicalOrigin}`);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const forbiddenOwnership = new Set(["", "learn", "blog", "journal", "community", "games", "seeds", "tools"]);
for (const prefix of manifest.routePrefixes) {
  const normalized = String(prefix).replace(/^\/+|\/+$/g, "");
  if (!normalized || forbiddenOwnership.has(normalized)) {
    throw new Error(`Unsafe or broad overlay route prefix: ${prefix}`);
  }
  const first = normalized.split("/")[0];
  if (!["learn", "community", "games"].includes(first)) {
    throw new Error(`Unexpected overlay route family: ${prefix}`);
  }
  const target = path.join(root, normalized);
  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    throw new Error(`Overlay route prefix missing from export: ${prefix}`);
  }
}

for (const rel of manifest.requiredRoutes) {
  const target = path.join(root, rel);
  if (!fs.existsSync(target) || !fs.statSync(target).isFile() || fs.statSync(target).size === 0) {
    throw new Error(`Required static overlay file missing or empty: ${rel}`);
  }
}

for (const rel of manifest.sharedPaths) {
  const target = path.join(root, rel);
  if (!fs.existsSync(target)) throw new Error(`Required shared export path missing: ${rel}`);
}

for (const rel of [
  "learn/atlas/atlas-3d/index.html",
  "learn/atlas/atlas-3d/atlas-runtime.js",
]) {
  const target = path.join(root, rel);
  if (!fs.existsSync(target) || !fs.statSync(target).isFile() || fs.statSync(target).size === 0) {
    throw new Error(`Atlas 3D runtime is missing from the owned child-route export: ${rel}`);
  }
}

const canonicalAtlasLessonFiles = atlasModules.flatMap((atlasModule) =>
  atlasModule.lessons.map((lesson) =>
    `learn/atlas/${slugify(atlasModule.id)}/${slugify(lesson.title)}/index.html`,
  ),
);
if (atlasModules.length !== 10 || canonicalAtlasLessonFiles.length !== 100) {
  throw new Error(`Static overlay expects 10 Atlas systems and 100 lessons; found ${atlasModules.length} systems and ${canonicalAtlasLessonFiles.length} lessons.`);
}
for (const rel of canonicalAtlasLessonFiles) {
  const target = path.join(root, rel);
  if (!fs.existsSync(target) || !fs.statSync(target).isFile() || fs.statSync(target).size === 0) {
    throw new Error(`Canonical Atlas lesson is missing from the static export: ${rel}`);
  }
}

const nextStatic = path.join(root, "_next", "static");
let nextAssetCount = 0;
for (const entry of fs.readdirSync(nextStatic, { recursive: true, withFileTypes: true })) {
  if (entry.isFile()) nextAssetCount += 1;
}
if (nextAssetCount < 5) throw new Error(`Static export has too few _next/static assets: ${nextAssetCount}`);

const representativeHtml = [
  "learn/atlas/index.html",
  "learn/atlas/seed-germination/thermal-limits-and-germination-rate/index.html",
  "learn/atlas/root-system/root-tip-zones-and-apical-growth/index.html",
  "learn/atlas/stem-vascular/hydraulic-disruption-and-embolism/index.html",
  "learn/atlas/nodes-branching/axillary-bud-activation/index.html",
  "learn/atlas/leaves/leaf-tissue-anatomy/index.html",
  "learn/atlas/flowers/bract-ovary-and-stigma-anatomy/index.html",
  "learn/atlas/trichomes-resin/head-stipe-and-stalk-specialization/index.html",
  "learn/atlas/sex-pollen-seed/sex-chromosomes-and-early-gene-regulation/index.html",
  "learn/atlas/environment-overlay/co2-diffusion-and-photosynthetic-response/index.html",
  "learn/atlas/diagnostic-overlay/evidence-weighting-and-confirmatory-testing/index.html",
  "learn/cultivation-science/outdoor-site-and-sun-mapping/index.html",
  "learn/plant-health/two-spotted-spider-mite/index.html",
  "community/grow-offs/solo-cup-grow-off/index.html",
  "games/seed-ascent/index.html",
];
for (const rel of representativeHtml) {
  const html = fs.readFileSync(path.join(root, rel), "utf8");
  if (!html.includes("https://dtfseeds.com")) {
    throw new Error(`Representative page lacks dtfseeds.com canonical metadata: ${rel}`);
  }
  if (/https?:\/\/(?:www\.)?dtf420\.com/i.test(html)) {
    throw new Error(`Retired dtf420.com URL leaked into static export: ${rel}`);
  }
}

const atlasIndex = fs.readFileSync(path.join(root, "learn/atlas/index.html"), "utf8");
if (!atlasIndex.includes("/learn/atlas/atlas-3d/index.html")) {
  throw new Error("Atlas index does not reference the owned nested Three.js runtime path.");
}

const routeCount = manifest.routePrefixes.reduce((sum, prefix) => {
  const target = path.join(root, prefix);
  let count = 0;
  const walk = (dir) => {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) walk(full);
      else if (item.isFile() && item.name === "index.html") count += 1;
    }
  };
  walk(target);
  return sum + count;
}, 0);

if (routeCount < 200) {
  throw new Error(`Expected at least 200 publishable child routes, found ${routeCount}`);
}

console.log(JSON.stringify({
  ok: true,
  canonicalOrigin: manifest.canonicalOrigin,
  routePrefixes: manifest.routePrefixes.length,
  publishableIndexRoutes: routeCount,
  nextStaticFiles: nextAssetCount,
  requiredRoutes: manifest.requiredRoutes.length,
  atlasSystems: atlasModules.length,
  atlasLessons: canonicalAtlasLessonFiles.length,
  atlasRuntime: "learn/atlas/atlas-3d",
}));
