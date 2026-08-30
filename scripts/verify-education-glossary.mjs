import fs from "node:fs";
import path from "node:path";

const glossaryPath = path.join(process.cwd(), "content/education-glossary.json");
const glossary = JSON.parse(fs.readFileSync(glossaryPath, "utf8"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(Array.isArray(glossary), "education-glossary.json must contain an array");
assert(glossary.length >= 70, `expected at least 70 glossary terms, found ${glossary.length}`);

const termKeys = new Set();
const slugs = new Set();
const categories = new Set();

for (const entry of glossary) {
  assert(typeof entry.term === "string" && entry.term.trim().length >= 2, "every glossary entry needs a term");
  assert(typeof entry.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug), `invalid glossary slug: ${entry.slug}`);
  assert(typeof entry.category === "string" && entry.category.trim().length >= 2, `${entry.term}: missing category`);
  assert(typeof entry.definition === "string" && entry.definition.trim().length >= 50, `${entry.term}: definition is too short`);
  assert(Array.isArray(entry.aliases), `${entry.term}: aliases must be an array`);
  assert(Array.isArray(entry.relatedRoutes) && entry.relatedRoutes.length > 0, `${entry.term}: at least one related route is required`);

  const termKey = entry.term.trim().toLowerCase();
  assert(!termKeys.has(termKey), `duplicate glossary term: ${entry.term}`);
  assert(!slugs.has(entry.slug), `duplicate glossary slug: ${entry.slug}`);
  termKeys.add(termKey);
  slugs.add(entry.slug);
  categories.add(entry.category.trim());

  const aliasKeys = new Set();
  for (const alias of entry.aliases) {
    assert(typeof alias === "string" && alias.trim().length > 0, `${entry.term}: aliases cannot be blank`);
    const aliasKey = alias.trim().toLowerCase();
    assert(!aliasKeys.has(aliasKey), `${entry.term}: duplicate alias ${alias}`);
    aliasKeys.add(aliasKey);
  }

  for (const route of entry.relatedRoutes) {
    assert(typeof route === "string" && (route.startsWith("/learn/") || route === "/learn" || route.startsWith("/seeds")), `${entry.term}: invalid related route ${route}`);
  }
}

const requiredTerms = [
  "Electrical conductivity (EC)",
  "Vapor pressure deficit (VPD)",
  "PPFD",
  "Chlorosis",
  "Necrosis",
  "Hop latent viroid (HLVd)",
  "Rhizosphere",
  "Water activity",
];

for (const term of requiredTerms) {
  assert(glossary.some((entry) => entry.term === term), `missing required glossary term: ${term}`);
}

assert(categories.size >= 10, `expected at least 10 glossary categories, found ${categories.size}`);

console.log(`Glossary integrity verified: ${glossary.length} terms across ${categories.size} categories.`);
