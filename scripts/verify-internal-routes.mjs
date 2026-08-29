import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appDir = path.join(root, "app");
const publicDir = path.join(root, "public");
const scanRoots = ["app", "components", "lib"]
  .map((entry) => path.join(root, entry))
  .filter((entry) => fs.existsSync(entry));

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function routePatternFromPage(file) {
  const relativeDir = path.relative(appDir, path.dirname(file));
  const segments = relativeDir === "" ? [] : relativeDir.split(path.sep);
  const visibleSegments = segments.filter(
    (segment) => !segment.startsWith("(") && !segment.startsWith("@")
  );

  const patternSegments = visibleSegments.map((segment) => {
    if (/^\[\[\.\.\.[^\]]+\]\]$/.test(segment)) return ".*";
    if (/^\[\.\.\.[^\]]+\]$/.test(segment)) return ".+";
    if (/^\[[^\]]+\]$/.test(segment)) return "[^/]+";
    return escapeRegex(segment);
  });

  return new RegExp(`^/${patternSegments.join("/")}/?$`);
}

function redirectPattern(source) {
  const pattern = source
    .split("/")
    .map((segment) => {
      if (!segment) return "";
      if (/^:[^/]+\*$/.test(segment)) return ".*";
      if (/^:[^/]+\+$/.test(segment)) return ".+";
      if (/^:[^/]+$/.test(segment)) return "[^/]+";
      return escapeRegex(segment);
    })
    .join("/");
  return new RegExp(`^${pattern}/?$`);
}

const routePatterns = walk(appDir)
  .filter((file) => /(?:^|\/)page\.(?:tsx|ts|jsx|js)$/.test(file.replaceAll("\\", "/")))
  .map(routePatternFromPage);

const nextConfigPath = path.join(root, "next.config.ts");
if (fs.existsSync(nextConfigPath)) {
  const config = fs.readFileSync(nextConfigPath, "utf8");
  const sources = [...config.matchAll(/source:\s*["'`]([^"'`]+)["'`]/g)].map(
    (match) => match[1]
  );
  routePatterns.push(...sources.map(redirectPattern));
}

const publicPaths = new Set();
if (fs.existsSync(publicDir)) {
  for (const file of walk(publicDir)) {
    publicPaths.add(`/${path.relative(publicDir, file).split(path.sep).join("/")}`);
  }
}

const sourceFiles = scanRoots.flatMap(walk).filter((file) => /\.(?:tsx|ts|jsx|js)$/.test(file));
const hrefPattern = /\bhref\s*(?::|=)\s*["'`]([^"'`]+)["'`]/g;
const failures = [];
let checked = 0;

for (const file of sourceFiles) {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(hrefPattern)) {
    const rawHref = match[1];
    if (!rawHref.startsWith("/") || rawHref.startsWith("//")) continue;
    if (rawHref.includes("${")) continue;

    const pathname = rawHref.split(/[?#]/, 1)[0] || "/";
    checked += 1;

    const resolves =
      publicPaths.has(pathname) || routePatterns.some((pattern) => pattern.test(pathname));

    if (!resolves) {
      failures.push({
        file: path.relative(root, file).split(path.sep).join("/"),
        href: rawHref,
      });
    }
  }
}

if (failures.length > 0) {
  console.error("Broken literal internal links detected:");
  for (const failure of failures) {
    console.error(`- ${failure.file}: ${failure.href}`);
  }
  process.exit(1);
}

console.log(`Internal route verification passed (${checked} literal internal links checked).`);
