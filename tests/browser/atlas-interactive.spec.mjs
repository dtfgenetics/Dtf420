import { expect, test } from "@playwright/test";
import { loadAtlasEntities } from "./atlas-test-data.mjs";

const atlasEntities = loadAtlasEntities();
const leafEntity = atlasEntities.find((entity) => entity.id === "leaves");
const stemEntity = atlasEntities.find((entity) => entity.id === "stem_vascular");
if (!leafEntity) throw new Error("Leaves Atlas entity is required for interactive QA.");
if (!stemEntity) throw new Error("Stem Atlas entity is required for interactive QA.");

function watchRuntimeErrors(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

async function expectThreeRuntime(app, page) {
  const status = app.getByText("Three.js live", { exact: true });
  await expect(status).toBeVisible({ timeout: 20_000 });
  const runtime = page.frameLocator('iframe[title="Interactive 3D cannabis plant anatomy"]');
  await expect(runtime.locator("canvas")).toBeVisible({ timeout: 20_000 });
  return runtime;
}

test("interactive Plant Atlas selects structures, switches 3D layers, and controls the live renderer", async ({ page }, testInfo) => {
  const errors = watchRuntimeErrors(page);
  const response = await page.goto("/learn/atlas", { waitUntil: "networkidle" });

  expect(response?.status()).toBe(200);
  const app = page.locator('section[aria-label="THC Living Plant Atlas interactive explorer"]');
  await expect(app).toBeVisible();
  await expect(app.getByRole("heading", { name: "Plant Atlas", exact: true })).toBeVisible();
  await expect(app.getByRole("heading", { name: "Trichomes", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  const runtime = await expectThreeRuntime(app, page);
  await expect(runtime.locator("#runtime-legend")).toContainText("Overview");
  await expect(runtime.locator("#runtime-legend")).toContainText("Stage context: Flower Development");

  const fanLeaves = app.getByRole("button", { name: /Fan Leaves/i }).first();
  await expect(fanLeaves).toBeVisible();
  await fanLeaves.click();
  await expect(app.getByRole("heading", { name: "Fan Leaves", exact: true })).toBeVisible();
  await expect(app.getByText(/Capture light/)).toBeVisible();

  await app.getByRole("tab", { name: "micro", exact: true }).click();
  await expect(app.getByText("Microscopy layer", { exact: true })).toBeVisible();
  await expect(app.getByRole("heading", { name: leafEntity.microTitle, exact: true })).toBeVisible();
  await expect(runtime.locator("#runtime-legend")).toContainText("Micro");

  await app.getByRole("tab", { name: "data", exact: true }).click();
  await expect(app.getByRole("heading", { name: leafEntity.dataTitle, exact: true })).toBeVisible();

  const fallback = app.locator('[aria-label="Accessible fallback plant model viewport"]');
  const beforeTransform = await fallback.getAttribute("style");
  await app.getByRole("button", { name: "Rotate plant left" }).click();
  await expect.poll(() => fallback.getAttribute("style")).not.toBe(beforeTransform);
  await expect(runtime.locator("canvas")).toBeVisible();

  const layerPanel = app.locator('[aria-label="Plant visualization layers"]');
  await layerPanel.getByRole("button", { name: "Physiology", exact: true }).click();
  await expect(runtime.locator("#runtime-legend")).toContainText("conceptual xylem water movement");
  await expect(runtime.locator("#runtime-legend")).toContainText("amber particles");

  const flowSelect = app.getByRole("combobox", { name: "Physiology flow" });
  await expect(flowSelect).toBeVisible();
  await flowSelect.selectOption("xylem");
  await expect(runtime.locator("#runtime-legend")).toContainText("Showing xylem only");
  await expect(page).toHaveURL(/flow=xylem/);

  await app.getByRole("combobox", { name: "Structure view" }).selectOption("xray");
  await expect(runtime.locator("#runtime-legend")).toContainText("X-ray mode");
  await expect(page).toHaveURL(/view=xray/);

  await layerPanel.getByRole("button", { name: "Micro", exact: true }).click();
  await expect(app.getByRole("button", { name: /Trichomes/i }).first()).toBeVisible();
  await expect(runtime.locator("#runtime-legend")).toContainText("schematic");
  await expectNoHorizontalOverflow(page);
  expect(errors, errors.join("\n")).toEqual([]);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-interactive-atlas-webgl.png`),
    fullPage: true,
  });
});

test("Atlas deep links restore lifecycle, layer, focus, view mode, and physiology flow", async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  const response = await page.goto(
    "/learn/atlas?stage=vegetative&layer=physiology&focus=stem_vascular&view=xray&flow=xylem",
    { waitUntil: "networkidle" },
  );
  expect(response?.status()).toBe(200);

  const app = page.locator('section[aria-label="THC Living Plant Atlas interactive explorer"]');
  const runtime = await expectThreeRuntime(app, page);
  await expect(app.getByRole("heading", { name: stemEntity.label, exact: true })).toBeVisible();
  await expect(app.getByRole("combobox", { name: "Growth stage" })).toHaveValue("vegetative");
  await expect(app.getByRole("combobox", { name: "Structure view" })).toHaveValue("xray");
  await expect(app.getByRole("combobox", { name: "Physiology flow" })).toHaveValue("xylem");
  await expect(runtime.locator("#runtime-legend")).toContainText("Stage context: Vegetative Growth");
  await expect(runtime.locator("#runtime-legend")).toContainText("X-ray mode");
  await expect(runtime.locator("#runtime-legend")).toContainText("Showing xylem only");
  expect(errors, errors.join("\n")).toEqual([]);
});

test("changing lifecycle stage changes the relevant hotspot set", async ({ page }) => {
  await page.goto("/learn/atlas", { waitUntil: "networkidle" });
  const app = page.locator('section[aria-label="THC Living Plant Atlas interactive explorer"]');
  const runtime = await expectThreeRuntime(app, page);

  await app.getByRole("combobox", { name: "Growth stage" }).selectOption("germination");
  await expect(page).toHaveURL(/stage=germination/);
  await expect(runtime.locator("#runtime-legend")).toContainText("Stage context: Germination");
  await expect(app.getByRole("button", { name: /Seed & Germination/i }).first()).toBeVisible();
  await expect(app.getByRole("button", { name: /Flowers/i })).toHaveCount(0);

  await app.getByRole("combobox", { name: "Growth stage" }).selectOption("flowering");
  await expect(app.getByRole("button", { name: /Flowers/i }).first()).toBeVisible();
});

test("interactive Plant Atlas keeps hotspots, scene controls, and inspector accessible at phone width", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Run the dedicated phone containment check in the mobile project.");
  const errors = watchRuntimeErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn/atlas", { waitUntil: "networkidle" });

  const app = page.locator('section[aria-label="THC Living Plant Atlas interactive explorer"]');
  await expect(app).toBeVisible();
  await expect(app.getByRole("heading", { name: "Plant Atlas", exact: true })).toBeVisible();
  await expectThreeRuntime(app, page);

  await expect(app.getByRole("combobox", { name: "Growth stage" })).toBeVisible();
  await app.getByRole("combobox", { name: "Growth stage" }).selectOption("vegetative");
  await expect(app.getByRole("combobox", { name: "Structure view" })).toBeVisible();
  await app.getByRole("combobox", { name: "Structure view" }).selectOption("isolate");

  const fanLeaves = app.getByRole("button", { name: /Fan Leaves/i }).first();
  await expect(fanLeaves).toBeVisible();
  await fanLeaves.click();
  await expect(app.getByRole("heading", { name: "Fan Leaves", exact: true })).toBeVisible();

  await expect(app.getByRole("tab", { name: "info", exact: true })).toBeVisible();
  await app.getByRole("tab", { name: "notes", exact: true }).click();
  await expect(app.getByRole("heading", { name: "Record what you observe", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(errors, errors.join("\n")).toEqual([]);

  await page.screenshot({
    path: testInfo.outputPath("390px-interactive-atlas-webgl.png"),
    fullPage: true,
  });
});
