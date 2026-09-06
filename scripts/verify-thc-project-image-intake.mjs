import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "content", "thc-project-image-intake.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const errors = [];
const seenAssetIds = new Set();
const seenDriveIds = new Set();
const seenTargets = new Set();
const allowedSelectionStates = new Set(["approved", "final-no-warning"]);
const allowedPublicationStates = new Set(["approved-source-only", "published", "rejected"]);
const extensionByMime = new Map([
  ["image/jpeg", new Set([".jpg", ".jpeg"])],
  ["image/png", new Set([".png"])],
  ["image/webp", new Set([".webp"])],
]);

function sniff(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return "unknown";
}

if (!Array.isArray(manifest) || manifest.length < 1) errors.push("THC project image intake manifest must be a non-empty array.");

let published = 0;
let approvedSourceOnly = 0;
for (const item of manifest) {
  if (!item.assetId || !/^[a-z0-9][a-z0-9-]+$/.test(item.assetId)) errors.push(`Invalid assetId: ${item.assetId || "missing"}`);
  if (seenAssetIds.has(item.assetId)) errors.push(`Duplicate assetId: ${item.assetId}`);
  seenAssetIds.add(item.assetId);

  if (!item.sourceDriveId?.trim()) errors.push(`Missing sourceDriveId: ${item.assetId}`);
  if (seenDriveIds.has(item.sourceDriveId)) errors.push(`Duplicate sourceDriveId: ${item.sourceDriveId}`);
  seenDriveIds.add(item.sourceDriveId);

  if (!item.sourceName?.trim()) errors.push(`Missing Drive display title/sourceName: ${item.assetId}`);
  if (!item.sourceResolvedName?.trim()) errors.push(`Missing resolved Drive download filename: ${item.assetId}`);
  if (!extensionByMime.has(item.sourceMimeType)) errors.push(`Unsupported sourceMimeType '${item.sourceMimeType}' for ${item.assetId}`);
  if (!Number.isInteger(item.sourceBytes) || item.sourceBytes <= 0) errors.push(`Invalid sourceBytes for ${item.assetId}`);
  if (typeof item.sourceModifiedAt !== "string" || Number.isNaN(Date.parse(item.sourceModifiedAt))) errors.push(`Invalid sourceModifiedAt for ${item.assetId}`);
  if (typeof item.sourceVerifiedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(item.sourceVerifiedAt)) errors.push(`Invalid sourceVerifiedAt for ${item.assetId}`);
  if (!allowedSelectionStates.has(item.selectionStatus)) errors.push(`Invalid selectionStatus '${item.selectionStatus}' for ${item.assetId}`);
  if (!allowedPublicationStates.has(item.publicationState)) errors.push(`Invalid publicationState '${item.publicationState}' for ${item.assetId}`);

  const allowedExtensions = extensionByMime.get(item.sourceMimeType);
  if (allowedExtensions && !allowedExtensions.has(path.extname(item.sourceResolvedName).toLowerCase())) {
    errors.push(`Resolved Drive filename extension does not match ${item.sourceMimeType}: ${item.assetId} -> ${item.sourceResolvedName}`);
  }

  if (typeof item.targetPath !== "string" || !item.targetPath.startsWith("/images/thc-project/education/")) {
    errors.push(`Invalid targetPath for ${item.assetId}: ${item.targetPath || "missing"}`);
    continue;
  }
  if (seenTargets.has(item.targetPath)) errors.push(`Duplicate targetPath: ${item.targetPath}`);
  seenTargets.add(item.targetPath);
  if (allowedExtensions && !allowedExtensions.has(path.extname(item.targetPath).toLowerCase())) {
    errors.push(`Target extension does not match ${item.sourceMimeType}: ${item.assetId} -> ${item.targetPath}`);
  }

  const target = path.join(root, "public", item.targetPath.replace(/^\//, ""));
  const targetExists = fs.existsSync(target);
  if (item.publicationState === "published") {
    published += 1;
    if (!targetExists) {
      errors.push(`Published THC project image is missing from public/: ${item.assetId} -> ${item.targetPath}`);
    } else {
      const bytes = fs.readFileSync(target);
      const detected = sniff(bytes);
      if (detected !== item.sourceMimeType) errors.push(`Published file MIME mismatch for ${item.assetId}: expected ${item.sourceMimeType}, detected ${detected}`);
    }
  } else if (item.publicationState === "approved-source-only") {
    approvedSourceOnly += 1;
    if (targetExists) errors.push(`THC project image exists in public/ but remains approved-source-only; explicitly review and mark published: ${item.assetId}`);
  }
}

if (errors.length) {
  console.error("THC project image intake verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`THC project image intake verified: ${manifest.length} approved records; ${published} published; ${approvedSourceOnly} approved-source-only.`);
