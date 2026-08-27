import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const manifestPath = path.join(root, "content", "thc-project-image-intake.json");
const sourceArg = process.argv.find((arg) => arg.startsWith("--source="));
const sourceDir = sourceArg?.slice("--source=".length) || process.env.THC_PROJECT_IMAGE_SOURCE;
const verifyOnly = process.argv.includes("--verify-only");

if (!sourceDir && !verifyOnly) {
  console.error("Provide --source=/path/to/downloaded/project/images or THC_PROJECT_IMAGE_SOURCE.");
  process.exit(2);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const errors = [];
const imported = [];

function candidateNames(item) {
  const names = new Set([item.sourceName]);
  if (item.sourceMimeType === "image/jpeg" && item.sourceName.toLowerCase().endsWith(".png")) {
    names.add(`${item.sourceName}.jpg`);
    names.add(item.sourceName.replace(/\.png$/i, ".jpg"));
    names.add(item.sourceName.replace(/\.png$/i, ".jpeg"));
  }
  return [...names];
}

function sniff(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return "unknown";
}

for (const item of manifest) {
  const target = path.join(root, "public", item.targetPath.replace(/^\//, ""));

  if (!verifyOnly) {
    const source = candidateNames(item)
      .map((name) => path.join(sourceDir, name))
      .find((candidate) => fs.existsSync(candidate));

    if (!source) {
      errors.push(`Missing source for ${item.assetId}: ${candidateNames(item).join(" | ")}`);
      continue;
    }

    const bytes = fs.readFileSync(source);
    const detected = sniff(bytes);
    if (detected === "unknown") {
      errors.push(`Unsupported or invalid image bytes: ${source}`);
      continue;
    }

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }

  if (!fs.existsSync(target)) {
    errors.push(`Target missing: ${item.targetPath}`);
    continue;
  }

  const bytes = fs.readFileSync(target);
  if (!bytes.length) {
    errors.push(`Target is empty: ${item.targetPath}`);
    continue;
  }

  imported.push({
    assetId: item.assetId,
    path: item.targetPath,
    bytes: bytes.length,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
  });
}

if (errors.length) {
  console.error("THC project image import failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const outputManifest = path.join(root, "public", "images", "thc-project", "manifest.json");
fs.mkdirSync(path.dirname(outputManifest), { recursive: true });
fs.writeFileSync(outputManifest, `${JSON.stringify(imported, null, 2)}\n`);
console.log(`THC project images verified: ${imported.length} assets.`);
