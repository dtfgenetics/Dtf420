import { readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const args = process.argv.slice(2);
const fileArg = args.find((arg) => !arg.startsWith("--"));
if (!fileArg) {
  throw new Error("Usage: node scripts/inspect-atlas-glb.mjs <model.glb> [--tier=desktop|mobile] [--require-semantics]");
}
const tierArg = args.find((arg) => arg.startsWith("--tier="));
const tier = tierArg ? tierArg.slice("--tier=".length) : "desktop";
const requireSemantics = args.includes("--require-semantics");
if (!new Set(["desktop", "mobile"]).has(tier)) throw new Error(`Unknown Atlas GLB budget tier: ${tier}`);

const root = process.cwd();
const registry = JSON.parse(await readFile(path.join(root, "content", "atlas-model-candidates.json"), "utf8"));
const budget = registry.performanceBudget?.[tier];
if (!budget) throw new Error(`Missing ${tier} budget in atlas-model-candidates.json.`);

const filePath = path.resolve(root, fileArg);
const bytes = await readFile(filePath);
if (bytes.length < 20) throw new Error("GLB is too small to be valid.");
if (bytes.readUInt32LE(0) !== 0x46546c67) throw new Error("GLB magic header is invalid.");
const version = bytes.readUInt32LE(4);
if (version !== 2) throw new Error(`Atlas requires glTF 2.0 GLB; found version ${version}.`);
const declaredLength = bytes.readUInt32LE(8);
if (declaredLength !== bytes.length) throw new Error(`GLB declared length ${declaredLength} does not match file length ${bytes.length}.`);

let offset = 12;
let jsonChunk = null;
let binChunk = null;
while (offset + 8 <= bytes.length) {
  const chunkLength = bytes.readUInt32LE(offset);
  const chunkType = bytes.readUInt32LE(offset + 4);
  const start = offset + 8;
  const end = start + chunkLength;
  if (end > bytes.length) throw new Error("GLB chunk exceeds file boundary.");
  if (chunkType === 0x4e4f534a) jsonChunk = bytes.subarray(start, end);
  if (chunkType === 0x004e4942) binChunk = bytes.subarray(start, end);
  offset = end;
}
if (!jsonChunk) throw new Error("GLB is missing its JSON chunk.");

const gltf = JSON.parse(jsonChunk.toString("utf8").replace(/\u0000+$/g, "").trim());
if (gltf.asset?.version !== "2.0") throw new Error(`GLB JSON asset.version must be 2.0; found ${gltf.asset?.version || "missing"}.`);

const accessors = gltf.accessors || [];
const meshes = gltf.meshes || [];
const nodes = gltf.nodes || [];
const materials = gltf.materials || [];
const textures = gltf.textures || [];
const images = gltf.images || [];
const bufferViews = gltf.bufferViews || [];

function accessorCount(index) {
  const value = accessors[index]?.count;
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function primitiveTriangles(primitive) {
  const count = primitive.indices !== undefined
    ? accessorCount(primitive.indices)
    : accessorCount(primitive.attributes?.POSITION);
  const mode = primitive.mode ?? 4;
  if (mode === 4) return Math.floor(count / 3);
  if (mode === 5 || mode === 6) return Math.max(0, count - 2);
  return 0;
}

let triangles = 0;
let vertices = 0;
let primitives = 0;
let positionBounds = null;
for (const mesh of meshes) {
  for (const primitive of mesh.primitives || []) {
    primitives += 1;
    triangles += primitiveTriangles(primitive);
    const positionAccessor = accessors[primitive.attributes?.POSITION];
    vertices += Number(positionAccessor?.count || 0);
    if (Array.isArray(positionAccessor?.min) && Array.isArray(positionAccessor?.max)) {
      if (!positionBounds) {
        positionBounds = { min: [...positionAccessor.min], max: [...positionAccessor.max] };
      } else {
        for (let axis = 0; axis < 3; axis += 1) {
          positionBounds.min[axis] = Math.min(positionBounds.min[axis], positionAccessor.min[axis]);
          positionBounds.max[axis] = Math.max(positionBounds.max[axis], positionAccessor.max[axis]);
        }
      }
    }
  }
}

function pngDimensions(buffer) {
  if (buffer.length < 24) return null;
  const signature = "89504e470d0a1a0a";
  if (buffer.subarray(0, 8).toString("hex") !== signature) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), format: "png" };
}

function jpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let cursor = 2;
  while (cursor + 9 < buffer.length) {
    if (buffer[cursor] !== 0xff) { cursor += 1; continue; }
    const marker = buffer[cursor + 1];
    if (marker === 0xd8 || marker === 0xd9) { cursor += 2; continue; }
    const length = buffer.readUInt16BE(cursor + 2);
    if (length < 2 || cursor + 2 + length > buffer.length) return null;
    const isSof = [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker);
    if (isSof && length >= 7) {
      return { width: buffer.readUInt16BE(cursor + 7), height: buffer.readUInt16BE(cursor + 5), format: "jpeg" };
    }
    cursor += 2 + length;
  }
  return null;
}

function embeddedImageBytes(image) {
  if (!binChunk || image.bufferView === undefined) return null;
  const view = bufferViews[image.bufferView];
  if (!view) return null;
  const start = Number(view.byteOffset || 0);
  const end = start + Number(view.byteLength || 0);
  if (start < 0 || end > binChunk.length || end <= start) return null;
  return binChunk.subarray(start, end);
}

const imageQa = images.map((image, index) => {
  const embedded = embeddedImageBytes(image);
  let dimensions = null;
  if (embedded) dimensions = pngDimensions(embedded) || jpegDimensions(embedded);
  return {
    index,
    name: image.name || null,
    mimeType: image.mimeType || null,
    uri: image.uri || null,
    embedded: Boolean(embedded),
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
    format: dimensions?.format ?? null,
  };
});
const knownTextureEdges = imageQa.flatMap((image) => [image.width, image.height]).filter((value) => Number.isFinite(value));
const maxTextureEdge = knownTextureEdges.length ? Math.max(...knownTextureEdges) : null;

const nodeNames = nodes.map((node) => node.name).filter(Boolean);
const meshNames = meshes.map((mesh) => mesh.name).filter(Boolean);
const searchableNames = [...nodeNames, ...meshNames].map((name) => name.toLowerCase());
const semanticMatches = Object.fromEntries(
  (registry.requiredSemanticEntities || []).map((entity) => {
    const normalized = entity.toLowerCase();
    const parts = normalized.split("_").filter((part) => part.length > 3);
    const matches = searchableNames.filter((name) => name.includes(normalized) || parts.some((part) => name.includes(part)));
    return [entity, [...new Set(matches)]];
  }),
);
const missingSemanticEntities = Object.entries(semanticMatches).filter(([, matches]) => matches.length === 0).map(([entity]) => entity);

const warnings = [];
const failures = [];
if (triangles <= 0) failures.push("No triangle primitives were detected.");
if (triangles > budget.maxTriangles) failures.push(`Triangle count ${triangles} exceeds ${tier} budget ${budget.maxTriangles}.`);
if (bytes.length > budget.maxGlbBytes) failures.push(`GLB size ${bytes.length} exceeds ${tier} budget ${budget.maxGlbBytes}.`);
if (maxTextureEdge === null && images.length > 0) warnings.push("One or more texture dimensions could not be decoded from embedded PNG/JPEG data; review external/WebP textures manually.");
if (maxTextureEdge !== null && maxTextureEdge > budget.maxTextureEdge) failures.push(`Texture edge ${maxTextureEdge}px exceeds ${tier} budget ${budget.maxTextureEdge}px.`);
if (images.length === 0) warnings.push("No textures are declared; a photorealistic Atlas specimen normally requires reviewed PBR/base-color texture data.");
if (missingSemanticEntities.length > 0) {
  const message = `Semantic names are missing for: ${missingSemanticEntities.join(", ")}.`;
  if (requireSemantics) failures.push(message); else warnings.push(message);
}
if (!positionBounds) warnings.push("POSITION accessors do not expose min/max bounds; framing bounds require runtime or DCC inspection.");

const report = {
  file: path.relative(root, filePath) || path.basename(filePath),
  sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
  gltfVersion: gltf.asset.version,
  generator: gltf.asset.generator || null,
  fileBytes: bytes.length,
  tier,
  budget,
  counts: {
    scenes: (gltf.scenes || []).length,
    nodes: nodes.length,
    meshes: meshes.length,
    primitives,
    triangles,
    vertices,
    materials: materials.length,
    textures: textures.length,
    images: images.length,
    animations: (gltf.animations || []).length,
  },
  positionBounds,
  extensionsUsed: gltf.extensionsUsed || [],
  extensionsRequired: gltf.extensionsRequired || [],
  nodeNames,
  meshNames,
  imageQa,
  maxTextureEdge,
  semanticMatches,
  missingSemanticEntities,
  warnings,
  failures,
  result: failures.length ? "fail" : "pass",
};

console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
