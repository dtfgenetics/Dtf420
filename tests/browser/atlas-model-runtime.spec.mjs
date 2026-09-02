import { expect, test } from "@playwright/test";

function makeTriangleGlb(nodeName = "fan_leaves") {
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
    nodes: [{ mesh: 0, name: nodeName }],
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

function releasedManifest(overrides = {}) {
  return {
    schemaVersion: 1,
    available: true,
    model: "./models/cannabis-plant.glb",
    variants: {
      desktop: { model: "./models/cannabis-plant.glb", maxDpr: 1.5 },
      mobile: { model: "./models/cannabis-plant-mobile.glb", maxDpr: 1.15 },
    },
    modelVersion: "browser-fixture",
    targetHeight: 5.2,
    exposure: 1.05,
    semanticMeshes: { fan_leaves: "leaves" },
    semanticHotspots: {},
    ...overrides,
  };
}

async function routeReleasedFixture(page, requests, options = {}) {
  const glb = makeTriangleGlb(options.nodeName);
  await page.route("**/learn/atlas/atlas-3d/models/model-manifest.json*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(releasedManifest(options.manifest || {})),
    });
  });
  for (const file of ["cannabis-plant.glb", "cannabis-plant-mobile.glb"]) {
    await page.route(`**/learn/atlas/atlas-3d/models/${file}*`, async (route) => {
      requests.push(file);
      await route.fulfill({ status: 200, contentType: "model/gltf-binary", body: glb });
    });
  }
}

test("Atlas runtime deliberately stays procedural while no production model is released", async ({ page }) => {
  const modelRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("/models/cannabis-plant")) modelRequests.push(request.url());
  });

  const response = await page.goto("/learn/atlas/atlas-3d/index.html", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await expect(page.locator("canvas")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('html[data-atlas-model-state="procedural"]')).toHaveCount(1);
  expect(modelRequests).toEqual([]);
});

test("Atlas runtime loads the desktop production GLB on a desktop viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  const requests = [];
  await routeReleasedFixture(page, requests, {
    manifest: {
      semanticHotspots: {
        leaves: [{ position: [0, 0.5, 0], radius: 0.12 }],
      },
    },
  });

  const response = await page.goto("/learn/atlas/atlas-3d/index.html", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await expect(page.locator("canvas")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('html[data-atlas-model-state="production"]')).toHaveCount(1, { timeout: 20_000 });
  await expect(page.locator('html[data-atlas-model-version="browser-fixture"]')).toHaveCount(1);
  await expect(page.locator('html[data-atlas-model-tier="desktop"]')).toHaveCount(1);
  await expect(page.locator('html[data-atlas-semantic-proxy-count="0"]')).toHaveCount(1);
  await expect(page.locator("#runtime-legend")).toContainText("photorealistic model");
  expect(requests).toEqual(["cannabis-plant.glb"]);
});

test("Atlas runtime chooses the mobile GLB on a compact viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const requests = [];
  await routeReleasedFixture(page, requests);

  const response = await page.goto("/learn/atlas/atlas-3d/index.html", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await expect(page.locator("canvas")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('html[data-atlas-model-state="production"]')).toHaveCount(1, { timeout: 20_000 });
  await expect(page.locator('html[data-atlas-model-tier="mobile"]')).toHaveCount(1);
  expect(requests).toEqual(["cannabis-plant-mobile.glb"]);
});

test("Atlas runtime creates selectable semantic proxies for generically named GLB meshes", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  const requests = [];
  await page.addInitScript(() => {
    window.__atlasSelections = [];
    window.addEventListener("message", (event) => {
      if (event.data?.type === "atlas:select") window.__atlasSelections.push(event.data.id);
    });
  });
  await routeReleasedFixture(page, requests, {
    nodeName: "generic_plant_mesh",
    manifest: {
      semanticMeshes: { fan_leaves: "leaves" },
      semanticHotspots: {
        leaves: [{ position: [0.33, 0.956, 0], radius: 0.18 }],
      },
    },
  });

  const response = await page.goto("/learn/atlas/atlas-3d/index.html", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await expect(page.locator('html[data-atlas-model-state="production"]')).toHaveCount(1, { timeout: 20_000 });
  await expect(page.locator('html[data-atlas-semantic-proxy-count="1"]')).toHaveCount(1);

  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect.poll(async () => page.evaluate(() => window.__atlasSelections || [])).toContain("leaves");
  expect(requests).toEqual(["cannabis-plant.glb"]);
});
