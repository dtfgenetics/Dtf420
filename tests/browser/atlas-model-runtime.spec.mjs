import { expect, test } from "@playwright/test";

function makeTriangleGlb() {
  const positions = Buffer.alloc(36);
  const vertices = [
    -0.65, 0, 0,
    0.65, 0, 0,
    0, 1.3, 0,
  ];
  vertices.forEach((value, index) => positions.writeFloatLE(value, index * 4));

  const indices = Buffer.alloc(8);
  indices.writeUInt16LE(0, 0);
  indices.writeUInt16LE(1, 2);
  indices.writeUInt16LE(2, 4);

  const binary = Buffer.concat([positions, indices]);
  const gltf = {
    asset: { version: "2.0", generator: "DTF Atlas browser fixture" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "fan_leaves" }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 0 }] }],
    materials: [{ pbrMetallicRoughness: { baseColorFactor: [0.2, 0.46, 0.22, 1], metallicFactor: 0, roughnessFactor: 0.82 } }],
    buffers: [{ byteLength: binary.length }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: positions.length, target: 34962 },
      { buffer: 0, byteOffset: positions.length, byteLength: 6, target: 34963 },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 3, type: "VEC3", min: [-0.65, 0, 0], max: [0.65, 1.3, 0] },
      { bufferView: 1, componentType: 5123, count: 3, type: "SCALAR", min: [0], max: [2] },
    ],
  };

  const jsonRaw = Buffer.from(JSON.stringify(gltf), "utf8");
  const jsonPadding = (4 - (jsonRaw.length % 4)) % 4;
  const json = Buffer.concat([jsonRaw, Buffer.alloc(jsonPadding, 0x20)]);
  const binPadding = (4 - (binary.length % 4)) % 4;
  const bin = Buffer.concat([binary, Buffer.alloc(binPadding)]);
  const totalLength = 12 + 8 + json.length + 8 + bin.length;
  const glb = Buffer.alloc(totalLength);
  let offset = 0;
  glb.writeUInt32LE(0x46546c67, offset); offset += 4;
  glb.writeUInt32LE(2, offset); offset += 4;
  glb.writeUInt32LE(totalLength, offset); offset += 4;
  glb.writeUInt32LE(json.length, offset); offset += 4;
  glb.writeUInt32LE(0x4e4f534a, offset); offset += 4;
  json.copy(glb, offset); offset += json.length;
  glb.writeUInt32LE(bin.length, offset); offset += 4;
  glb.writeUInt32LE(0x004e4942, offset); offset += 4;
  bin.copy(glb, offset);
  return glb;
}

test("Atlas runtime deliberately stays procedural while no production model is released", async ({ page }) => {
  const modelRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("/models/cannabis-plant.glb")) modelRequests.push(request.url());
  });

  const response = await page.goto("/learn/atlas/atlas-3d/index.html", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await expect(page.locator("canvas")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('html[data-atlas-model-state="procedural"]')).toHaveCount(1);
  expect(modelRequests).toEqual([]);
});

test("Atlas runtime loads and normalizes a released GLB through the production path", async ({ page }) => {
  const glb = makeTriangleGlb();
  await page.route("**/learn/atlas/atlas-3d/models/model-manifest.json*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        schemaVersion: 1,
        available: true,
        model: "./cannabis-plant.glb",
        modelVersion: "browser-fixture",
        targetHeight: 5.2,
        exposure: 1.05,
        semanticMeshes: { fan_leaves: "leaves" },
      }),
    });
  });
  await page.route("**/learn/atlas/atlas-3d/models/cannabis-plant.glb*", async (route) => {
    await route.fulfill({ status: 200, contentType: "model/gltf-binary", body: glb });
  });

  const response = await page.goto("/learn/atlas/atlas-3d/index.html", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await expect(page.locator("canvas")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('html[data-atlas-model-state="production"]')).toHaveCount(1, { timeout: 20_000 });
  await expect(page.locator('html[data-atlas-model-version="browser-fixture"]')).toHaveCount(1);
  await expect(page.locator("#runtime-legend")).toContainText("photorealistic model");
});
