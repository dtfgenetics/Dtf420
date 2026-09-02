import fs from "node:fs";
import path from "node:path";

const source = path.resolve("public/atlas-3d");
const target = path.resolve("public/learn/atlas/atlas-3d");

if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) {
  throw new Error("Atlas 3D runtime source is missing: public/atlas-3d");
}

fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.cpSync(source, target, { recursive: true });

for (const rel of ["index.html", "atlas-runtime.js"]) {
  const file = path.join(target, rel);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile() || fs.statSync(file).size === 0) {
    throw new Error(`Prepared Atlas runtime file is missing or empty: ${rel}`);
  }
}

console.log(`Prepared Atlas 3D runtime at ${path.relative(process.cwd(), target)}`);
