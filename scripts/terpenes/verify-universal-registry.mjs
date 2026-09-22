import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ui = fs.readFileSync(path.join(root, "components/terpenes/TerpeneRegistryExplorer.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "components/terpenes/TerpeneRegistryExplorer.module.css"), "utf8");
const page = fs.readFileSync(path.join(root, "app/learn/terpenes/registry/page.tsx"), "utf8");
const builder = fs.readFileSync(path.join(root, "scripts/terpenes/build-universal-registry.mjs"), "utf8");
const helpers = fs.readFileSync(path.join(root, "scripts/terpenes/lib/universal-registry.mjs"), "utf8");
const workflow = fs.readFileSync(path.join(root, ".github/workflows/refresh-terpene-registry.yml"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "public/data/terpenes/registry/manifest.json"), "utf8"));
const sources = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/source-registry.json"), "utf8"));

for (const token of [
  "All-Known Terpene Registry",
  "Candidate registry ≠ reviewed cannabis claim",
  "Search loaded family",
  "Identity signal",
  "Family confidence",
  "Exact identity",
  "Classification provenance",
  "Source provenance",
  "Broad coverage without pretending every candidate is reviewed",
]) {
  if (!ui.includes(token)) throw new Error(`Universal registry UI missing contract: ${token}`);
}

for (const token of [".familyGrid", ".controls", ".identityBadge", ".classification", ".sourceRefs", ".guardrail"]) {
  if (!css.includes(token)) throw new Error(`Universal registry styling missing: ${token}`);
}

if (!page.includes('path: "/learn/terpenes/registry"')) {
  throw new Error("Universal registry route metadata missing");
}

for (const token of [
  "shardSize = 5000",
  "unreviewed-source-candidate",
  "identityPolicy",
  "familyPolicy",
  "unresolved-identity-sample.json",
]) {
  if (!builder.includes(token)) throw new Error(`Universal registry builder missing: ${token}`);
}

for (const token of [
  "full-inchikey",
  "canonical-smiles",
  "classification-derived",
  "exact-carbon-count-fallback",
  "unresolved-family",
  "carotenoid",
  "never-name-only",
]) {
  const haystack = helpers + "\n" + builder;
  if (!haystack.includes(token)) throw new Error(`Universal registry identity/family policy missing: ${token}`);
}

if (manifest.sourceId !== "COCONUT") throw new Error("Universal registry manifest sourceId must be COCONUT");
if (manifest.status === "compiled") {
  if (manifest.inputCandidateRecords < 10000 || manifest.resolvedIdentityRecords < 5000) {
    throw new Error("Compiled universal registry is implausibly small");
  }
  if (!Array.isArray(manifest.shards) || manifest.shards.length < 8) {
    throw new Error("Compiled universal registry has too few shards");
  }
} else if (manifest.status !== "not-generated") {
  throw new Error("Universal registry bootstrap must explicitly say not-generated");
}

for (const token of [
  "coconut_csv_lite-09-2026.zip",
  "COCONUT_RELEASE: 2026-09",
  "inputCandidateRecords < 10000",
  "resolvedIdentityRecords < 5000",
  "find \"$OUTPUT_DIR\" -type f -size +30M",
  "Raw universal registry source material leaked",
]) {
  if (!workflow.includes(token)) throw new Error(`Universal registry refresh workflow missing: ${token}`);
}

const coconut = sources.sources.find((source) => source.id === "COCONUT");
if (!coconut || coconut.currentRelease !== "2026-09" || coconut.license !== "CC0-1.0") {
  throw new Error("COCONUT source registry entry is missing September 2026 release metadata");
}
if (!sources.sources.some((source) => source.id === "LOTUS")) {
  throw new Error("LOTUS occurrence cross-check source is not registered");
}

for (const phrase of [
  "all registry candidates are cannabis terpenes",
  "name match proves identity",
  "candidate proves biological effect",
]) {
  if ((ui + "\n" + page).toLowerCase().includes(phrase)) {
    throw new Error(`Universal registry contains prohibited shortcut: ${phrase}`);
  }
}

console.log(
  `Universal terpene registry verified: manifest status=${manifest.status}, release=${manifest.sourceRelease}, resolved=${manifest.resolvedIdentityRecords}.`,
);
