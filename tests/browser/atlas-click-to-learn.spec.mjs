import { expect, test } from "@playwright/test";

function makeGenericPlantGlb() {
  const positions = Buffer.alloc(36);
  [-0.65, 0, 0, 0.65, 0, 0, 0, 1.3, 0].forEach((value, index) => positions.writeFloatLE(value, index * 4));
  const indices = Buffer.alloc(8);
  indices.writeUInt16LE(0, 0);
  indices.writeUInt16LE(1, 2);
  indices.writeUInt16LE(2, 4);
  const binary = Buffer.concat([positions, indices]);
  const gltf = {
    asset: { version: "2.0", generator: "DTF Atlas click-to-learn fixture" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "generic_plant_mesh" }],
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
  const json = Buffer.concat([jsonRaw, Buffer.alloc((4 - (jsonRaw.length % 4)) % 4, 0x20)]);
  const bin = Buffer.concat([binary, Buffer.alloc((4 - (binary.length % 4)) % 4)]);
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

test("clicking a 3D plant hotspot opens the matching learn-more panel", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const glb = makeGenericPlantGlb();

  await page.route("**/learn/atlas/atlas-3d/models/model-manifest.json*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        schemaVersion: 1,
        available: true,
        model: "./models/cannabis-plant.glb",
        variants: {
          desktop: { model: "./models/cannabis-plant.glb", maxDpr: 1.5 },
          mobile: { model: "./models/cannabis-plant-mobile.glb", maxDpr: 1.15 },
        },
        modelVersion: "click-to-learn-fixture",
        targetHeight: 5.2,
        exposure: 1.05,
        semanticMeshes: { fan_leaves: "leaves" },
        semanticHotspots: {
          leaves: [{ position: [0.33, 0.956, 0], radius: 0.18 }],
        },
      }),
    });
  });
  await page.route("**/learn/atlas/atlas-3d/models/cannabis-plant.glb*", async (route) => {
    await route.fulfill({ status: 200, contentType: "model/gltf-binary", body: glb });
  });
  await page.route("**/learn/atlas/atlas-3d/models/cannabis-plant-mobile.glb*", async (route) => {
    await route.fulfill({ status: 200, contentType: "model/gltf-binary", body: glb });
  });

  const response = await page.goto("/learn/atlas", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Trichomes" })).toBeVisible();

  const frame = page.frameLocator('iframe[title="Interactive 3D cannabis plant anatomy"]');
  await expect(frame.locator('html[data-atlas-model-state="production"]')).toHaveCount(1, { timeout: 20_000 });
  await expect(frame.locator('html[data-atlas-semantic-proxy-count="1"]')).toHaveCount(1);
  const canvas = frame.locator("canvas");
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

  await expect(page.getByRole("heading", { name: "Fan Leaves" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Learn more" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Leaves" })).toBeVisible();
});
