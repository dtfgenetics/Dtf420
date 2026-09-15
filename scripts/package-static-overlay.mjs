import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceRoot = path.join(root, "out");
const packageRoot = path.join(root, "overlay-dist");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "deployment/static-overlay.json"), "utf8"));

if (!fs.existsSync(sourceRoot) || !fs.statSync(sourceRoot).isDirectory()) {
  throw new Error("Static export directory out/ is missing. Run npm run build:static-overlay first.");
}

fs.rmSync(packageRoot, { recursive: true, force: true });
fs.mkdirSync(packageRoot, { recursive: true });

function copyOwnedPath(relativePath) {
  const normalized = String(relativePath).replace(/^\/+|\/+$/g, "");
  if (!normalized) throw new Error(`Refusing to package empty path from ${relativePath}`);

  const source = path.join(sourceRoot, normalized);
  const destination = path.join(packageRoot, normalized);
  if (!fs.existsSync(source)) throw new Error(`Owned overlay path missing from export: ${relativePath}`);

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
}

for (const prefix of manifest.routePrefixes) copyOwnedPath(prefix);
for (const sharedPath of manifest.sharedPaths) copyOwnedPath(sharedPath);

for (const requiredRoute of manifest.requiredRoutes) {
  const packaged = path.join(packageRoot, requiredRoute);
  if (!fs.existsSync(packaged) || !fs.statSync(packaged).isFile() || fs.statSync(packaged).size === 0) {
    throw new Error(`Required route missing from packaged overlay: ${requiredRoute}`);
  }
}

const forbiddenTopLevelFiles = ["index.html", "robots.txt", "sitemap.xml", "manifest.webmanifest"];
for (const file of forbiddenTopLevelFiles) {
  if (fs.existsSync(path.join(packageRoot, file))) {
    throw new Error(`Packaged overlay must not contain WordPress-owned root file: ${file}`);
  }
}

for (const route of manifest.wordpressOwnedRoutes) {
  const normalized = String(route).replace(/^\/+|\/+$/g, "");
  if (!normalized) continue;
  const candidate = path.join(packageRoot, normalized, "index.html");
  if (fs.existsSync(candidate)) {
    throw new Error(`Packaged overlay leaked WordPress-owned route: ${route}`);
  }
}

const allowedTopLevel = new Set([
  ...manifest.routePrefixes.map((prefix) => String(prefix).replace(/^\/+|\/+$/g, "").split("/")[0]),
  ...manifest.sharedPaths.map((item) => String(item).replace(/^\/+|\/+$/g, "").split("/")[0]),
]);

for (const entry of fs.readdirSync(packageRoot, { withFileTypes: true })) {
  if (!allowedTopLevel.has(entry.name)) {
    throw new Error(`Unexpected top-level path in packaged overlay: ${entry.name}`);
  }
}

let fileCount = 0;
for (const entry of fs.readdirSync(packageRoot, { recursive: true, withFileTypes: true })) {
  if (entry.isFile()) fileCount += 1;
}
if (fileCount === 0) throw new Error("Packaged overlay is empty.");

console.log(JSON.stringify({
  ok: true,
  packageRoot: "overlay-dist",
  routePrefixes: manifest.routePrefixes.length,
  sharedPaths: manifest.sharedPaths.length,
  requiredRoutes: manifest.requiredRoutes.length,
  files: fileCount,
}));
