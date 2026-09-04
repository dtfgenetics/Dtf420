import fs from "node:fs";
import path from "node:path";

const source = path.resolve("public/atlas-3d");
const target = path.resolve("public/learn/atlas/atlas-3d");
const requiredRuntimeFiles = [
  "index.html",
  "atlas-runtime.js",
  "atlas-production-model.js",
  "models/model-manifest.json",
  "models/MODEL_CONTRACT.md",
  "models/MODEL_PROVENANCE.md",
];

if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) {
  throw new Error("Atlas 3D runtime source is missing: public/atlas-3d");
}

for (const rel of requiredRuntimeFiles) {
  const file = path.join(source, rel);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile() || fs.statSync(file).size === 0) {
    throw new Error(`Atlas runtime source file is missing or empty: ${rel}`);
  }
}

fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.cpSync(source, target, { recursive: true });

for (const rel of requiredRuntimeFiles) {
  const sourceFile = path.join(source, rel);
  const targetFile = path.join(target, rel);
  if (!fs.existsSync(targetFile) || !fs.statSync(targetFile).isFile() || fs.statSync(targetFile).size === 0) {
    throw new Error(`Prepared Atlas runtime file is missing or empty: ${rel}`);
  }
  if (!fs.readFileSync(sourceFile).equals(fs.readFileSync(targetFile))) {
    throw new Error(`Prepared Atlas runtime file differs from source: ${rel}`);
  }
}

console.log(`Prepared and verified Atlas 3D runtime at ${path.relative(process.cwd(), target)} (${requiredRuntimeFiles.length} critical files).`);
