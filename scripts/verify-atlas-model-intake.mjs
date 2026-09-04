import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const source = await readFile(path.join(root, "scripts", "stage-atlas-model-candidate.mjs"), "utf8");
const docs = await readFile(path.join(root, "docs", "ATLAS_MODEL_INTAKE.md"), "utf8");

const errors = [];
function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) errors.push(`${label} is missing required marker: ${needle}`);
}

if (packageJson.scripts?.["stage:atlas-model"] !== "node scripts/stage-atlas-model-candidate.mjs") {
  errors.push("package.json must expose stage:atlas-model.");
}

for (const [needle, label] of [
  ["publicWebsiteUseApproved", "rights gate"],
  ["modificationApproved", "rights gate"],
  ["redistributionApproved", "rights gate"],
  ["inspect-atlas-glb.mjs", "GLB inspector integration"],
  ["--tier=", "desktop/mobile budget integration"],
  ["mobileBudget.maxTriangles", "mobile reuse triangle gate"],
  ["mobileBudget.maxGlbBytes", "mobile reuse byte gate"],
  ["mobileBudget.maxTextureEdge", "mobile reuse texture gate"],
  ["intake-pass", "non-release staging state"],
  ["Proceed to botanical plausibility", "post-intake review contract"],
]) requireText(source, needle, label);

for (const [needle, label] of [
  ["Intake pass is not release approval", "intake documentation"],
  ["Never flip `available` or `specimenSet.enabled`", "release safety documentation"],
  ["--require-semantics", "semantic mapping documentation"],
]) requireText(docs, needle, label);

if (errors.length) {
  console.error("Atlas model intake verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Atlas model intake gate verified: rights, GLB inspection, mobile budget, semantic option, and non-release contract are present.");
