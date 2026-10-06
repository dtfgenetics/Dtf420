import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { toolCatalog } from "../lib/tool-catalog.ts";

const root = process.cwd();
const appToolsDir = path.join(root, "app", "tools");
const toolsPagePath = path.join(appToolsDir, "page.tsx");
const errors = [];

function fail(message) {
  errors.push(message);
}

function duplicates(values) {
  const seen = new Set();
  const duplicate = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicate.add(value);
    seen.add(value);
  }
  return [...duplicate];
}

for (const field of ["id", "href"]) {
  const dupes = duplicates(toolCatalog.map((entry) => entry[field]));
  if (dupes.length) fail(`duplicate tool ${field}: ${dupes.join(", ")}`);
}

const nextOwned = toolCatalog.filter((entry) => entry.owner === "next");
for (const tool of nextOwned) {
  if (!tool.href.startsWith("/tools/")) {
    fail(`Next-owned tool "${tool.id}" must use a /tools/* href`);
    continue;
  }

  const relative = tool.href.replace(/^\/tools\//, "").replace(/\/$/, "");
  const page = path.join(appToolsDir, relative, "page.tsx");
  if (!fs.existsSync(page)) {
    fail(`Next-owned tool "${tool.id}" has no route page at ${path.relative(root, page)}`);
  }
}

const directToolRoutes = fs
  .readdirSync(appToolsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .filter((entry) => fs.existsSync(path.join(appToolsDir, entry.name, "page.tsx")))
  .map((entry) => `/tools/${entry.name}`);

const registeredNextRoutes = new Set(nextOwned.map((entry) => entry.href.replace(/\/$/, "")));
for (const route of directToolRoutes) {
  if (!registeredNextRoutes.has(route)) {
    fail(`direct tool route "${route}" is missing from lib/tool-catalog.ts`);
  }
}

const toolsPage = fs.readFileSync(toolsPagePath, "utf8");
if (!toolsPage.includes('from "@/lib/tool-catalog"')) {
  fail("app/tools/page.tsx must consume lib/tool-catalog.ts");
}
for (const symbol of ["primaryTools", "supportingTools", "liveToolCount", "connectedReferenceCount"]) {
  if (!toolsPage.includes(symbol)) {
    fail(`app/tools/page.tsx must use ${symbol} from the canonical tool catalog`);
  }
}

if (errors.length) {
  console.error("Tool catalog verification failed:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log(
  `Tool catalog verified: ${nextOwned.length} Next-owned tools and ${toolCatalog.length - nextOwned.length} connected references.`,
);
