import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagefindRoot = path.join(root, "out", "pagefind");
const manifestPath = path.join(pagefindRoot, "dtf-search-manifest.json");

function fail(message) {
  console.error(`search-index verification failed: ${message}`);
  process.exitCode = 1;
}

if (!fs.existsSync(pagefindRoot) || !fs.statSync(pagefindRoot).isDirectory()) {
  fail("out/pagefind is missing");
} else {
  for (const required of ["pagefind.js", "dtf-search-manifest.json"]) {
    const file = path.join(pagefindRoot, required);
    if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
      fail(`required generated search asset is missing: ${required}`);
    }
  }

  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (manifest.engine !== "Pagefind" || manifest.engineVersion !== "1.5.2") {
      fail("unexpected Pagefind engine/version");
    }
    if (!Number.isInteger(manifest.sourcePageCount) || manifest.sourcePageCount < 150) {
      fail(`search corpus is unexpectedly small: ${manifest.sourcePageCount}`);
    }
    if (!Array.isArray(manifest.routePrefixes) || manifest.routePrefixes.some((prefix) => !prefix.startsWith("learn/"))) {
      fail("search index contains a non-education route family");
    }
    if (manifest.routePrefixes.includes("learn/search")) {
      fail("search route must not index itself");
    }
  }

  const generatedFiles = fs
    .readdirSync(pagefindRoot, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile());
  if (generatedFiles.length < 5) {
    fail(`generated Pagefind bundle is unexpectedly small: ${generatedFiles.length} files`);
  }
}

if (!process.exitCode) {
  console.log("Search-index verification passed.");
}
