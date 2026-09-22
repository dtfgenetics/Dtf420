import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ui = fs.readFileSync(path.join(root, "components/terpenes/TerpeneCorpusExplorer.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "components/terpenes/TerpeneCorpusExplorer.module.css"), "utf8");
const page = fs.readFileSync(path.join(root, "app/learn/terpenes/corpus/page.tsx"), "utf8");
const builder = fs.readFileSync(path.join(root, "scripts/terpenes/build-cultivar-intelligence-index.mjs"), "utf8");
const workflow = fs.readFileSync(path.join(root, ".github/workflows/refresh-terpene-cultivars.yml"), "utf8");
const index = JSON.parse(fs.readFileSync(path.join(root, "public/data/terpenes/cultivars/index.json"), "utf8"));

for (const token of [
  "Cultivar Chemistry Corpus",
  "14 measured analyte channels ≠ every known terpene",
  "Minimum samples",
  "Minimum labs",
  "Minimum producers",
  "Region represented",
  "Chemotype represented",
  "Most frequent top terpene",
  "Analyte median filter",
  "Minimum total terpene median %",
  "Filtering chemistry is not ranking cultivars",
]) {
  if (!ui.includes(token)) throw new Error(`Corpus explorer UI missing contract: ${token}`);
}

for (const token of [".filters", ".resultList", ".detail", ".depthGrid", ".vectorRow", ".method"]) {
  if (!css.includes(token)) throw new Error(`Corpus explorer styling missing: ${token}`);
}

if (!page.includes('path: "/learn/terpenes/corpus"')) {
  throw new Error("Corpus explorer route metadata missing");
}

for (const token of [
  "schemaVersion: 2",
  "dominantRegion",
  "dominantChemotype",
  "dominantProductCategory",
  "labEffectiveCount",
  "producerEffectiveCount",
  "totalTerpeneCoverage",
  "regions",
  "chemotypes",
  "productCategories",
]) {
  if (!builder.includes(token)) throw new Error(`Corpus index builder missing: ${token}`);
}

if (![1, 2].includes(index.schemaVersion)) {
  throw new Error(`Unsupported checked-in corpus index schema: ${index.schemaVersion}`);
}
if (index.status === "compiled" && (index.cultivarCount < 100 || index.analyteCount < 10)) {
  throw new Error("Checked-in compiled corpus index is implausibly small");
}

for (const token of [
  "index.schemaVersion !== 2",
  "build-cultivar-intelligence-index.mjs",
  '"$OUTPUT_DIR/index.json"',
]) {
  if (!workflow.includes(token)) throw new Error(`Corpus refresh workflow missing: ${token}`);
}

for (const phrase of [
  "best cultivar",
  "best strain",
  "guaranteed effect",
  "predicts your high",
  "higher terpene means better",
]) {
  if ((ui + "\n" + page).toLowerCase().includes(phrase)) {
    throw new Error(`Corpus explorer contains prohibited shortcut: ${phrase}`);
  }
}

console.log(
  `Terpene corpus explorer verified: checked index schema=${index.schemaVersion}, status=${index.status}, cultivars=${index.cultivarCount}.`,
);
