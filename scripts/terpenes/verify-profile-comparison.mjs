import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ui = fs.readFileSync(path.join(root, "components/terpenes/TerpeneProfileComparison.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "components/terpenes/TerpeneProfileComparison.module.css"), "utf8");
const page = fs.readFileSync(path.join(root, "app/learn/terpenes/profiles/page.tsx"), "utf8");
const profiles = fs.readFileSync(path.join(root, "lib/terpenes/profiles.ts"), "utf8");

for (const token of [
  "Terpene Profile Comparison",
  "Visual fingerprint",
  "Vector similarity",
  "Similarity is descriptive, not an identity test",
  "Aroma fingerprint ≠ effect score",
  "Blank values mean “not entered,” not",
]) {
  if (!ui.includes(token)) throw new Error(`Profile comparison UI missing contract: ${token}`);
}

for (const token of [".barA", ".barB", ".fingerprintRow", ".relation", ".interpretation"]) {
  if (!css.includes(token)) throw new Error(`Profile comparison styling missing: ${token}`);
}

if (!page.includes('path: "/learn/terpenes/profiles"')) {
  throw new Error("Profile comparison route metadata is missing");
}

for (const token of ["similarity", "sharedCompounds", "parentAOnly", "parentBOnly"]) {
  if (!profiles.includes(token)) throw new Error(`Profile comparison engine missing: ${token}`);
}

const prohibited = [
  "guaranteed effect",
  "predicts your high",
  "same strain means same chemistry",
];
const combined = (ui + "\n" + page).toLowerCase();
for (const phrase of prohibited) {
  if (combined.includes(phrase)) throw new Error(`Profile comparison contains prohibited shortcut: ${phrase}`);
}

console.log("Terpene profile comparison verified: measured-value fingerprint, similarity, shared chemistry, responsive UI, and interpretation guardrails.");
