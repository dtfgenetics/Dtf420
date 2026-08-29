import { expect, test } from "@playwright/test";

const PROGRESS_KEY = "dtf-atlas-progress-v1";
const representativeRoutes = [
  "/learn/atlas/seed-germination/seed-anatomy",
  "/learn/atlas/root-system/root-architecture",
  "/learn/atlas/stem-vascular/xylem-transport",
  "/learn/atlas/nodes-branching/apical-dominance",
  "/learn/atlas/leaves/photosynthesis",
  "/learn/atlas/flowers/bud-development",
  "/learn/atlas/trichomes-resin/gland-anatomy",
  "/learn/atlas/sex-pollen-seed/pollen-biology",
  "/learn/atlas/environment-overlay/vpd-and-transpiration",
  "/learn/atlas/diagnostic-overlay/differential-workflow",
];

const lessonRoutes = [
  "/learn/atlas/seed-germination/seed-anatomy",
  "/learn/atlas/seed-germination/imbibition",
  "/learn/atlas/seed-germination/radicle-emergence",
  "/learn/atlas/seed-germination/cotyledon-transition",
  "/learn/atlas/seed-germination/germination-failure-patterns",
  "/learn/atlas/seed-germination/reserve-mobilization",
  "/learn/atlas/root-system/root-architecture",
  "/learn/atlas/root-system/root-hairs-and-absorption",
  "/learn/atlas/root-system/rhizosphere",
  "/learn/atlas/root-system/water-and-nutrient-uptake",
  "/learn/atlas/root-system/root-stress",
  "/learn/atlas/root-system/root-zone-oxygen-diffusion",
  "/learn/atlas/stem-vascular/stem-cross-section",
  "/learn/atlas/stem-vascular/xylem-transport",
  "/learn/atlas/stem-vascular/phloem-transport",
  "/learn/atlas/stem-vascular/internodal-spacing",
  "/learn/atlas/stem-vascular/damage-and-recovery",
  "/learn/atlas/stem-vascular/source-sink-integration",
  "/learn/atlas/nodes-branching/node-anatomy",
  "/learn/atlas/nodes-branching/apical-dominance",
  "/learn/atlas/nodes-branching/topping-and-fim",
  "/learn/atlas/nodes-branching/lst-and-directional-growth",
  "/learn/atlas/nodes-branching/mainlining-and-scrog",
  "/learn/atlas/nodes-branching/branch-angle-and-mechanical-support",
  "/learn/atlas/leaves/healthy-leaf-baseline",
  "/learn/atlas/leaves/photosynthesis",
  "/learn/atlas/leaves/stomata-and-transpiration",
  "/learn/atlas/leaves/symptom-pattern-language",
  "/learn/atlas/leaves/leaf-inspection-workflow",
  "/learn/atlas/leaves/leaf-temperature-and-energy-balance",
  "/learn/atlas/flowers/female-flower-anatomy",
  "/learn/atlas/flowers/flower-initiation",
  "/learn/atlas/flowers/bud-development",
  "/learn/atlas/flowers/pollination-response",
  "/learn/atlas/flowers/maturity-and-risk-inspection",
  "/learn/atlas/flowers/photoperiod-sensing-and-floral-transition",
  "/learn/atlas/trichomes-resin/trichome-types",
  "/learn/atlas/trichomes-resin/gland-anatomy",
  "/learn/atlas/trichomes-resin/where-to-inspect",
  "/learn/atlas/trichomes-resin/clear-cloudy-and-amber",
  "/learn/atlas/trichomes-resin/microscope-workflow",
  "/learn/atlas/trichomes-resin/secretory-disk-and-storage-cavity",
  "/learn/atlas/sex-pollen-seed/male-vs-female-preflowers",
  "/learn/atlas/sex-pollen-seed/mixed-sex-expression",
  "/learn/atlas/sex-pollen-seed/pollen-biology",
  "/learn/atlas/sex-pollen-seed/seed-formation",
  "/learn/atlas/sex-pollen-seed/controlled-pollination",
  "/learn/atlas/sex-pollen-seed/fertilization-and-seed-filling",
  "/learn/atlas/environment-overlay/light-distribution",
  "/learn/atlas/environment-overlay/temperature-and-humidity",
  "/learn/atlas/environment-overlay/vpd-and-transpiration",
  "/learn/atlas/environment-overlay/airflow-and-boundary-layer",
  "/learn/atlas/environment-overlay/root-zone-interaction",
  "/learn/atlas/environment-overlay/leaf-temperature-vs-air-temperature",
  "/learn/atlas/diagnostic-overlay/symptom-location",
  "/learn/atlas/diagnostic-overlay/pattern-description",
  "/learn/atlas/diagnostic-overlay/progression-over-time",
  "/learn/atlas/diagnostic-overlay/measurement-context",
  "/learn/atlas/diagnostic-overlay/differential-workflow",
  "/learn/atlas/diagnostic-overlay/genotype-x-environment-context",
];

function watchRuntimeErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "page should not overflow horizontally").toBeLessThanOrEqual(2);
}

async function expectNoInternalProductionLabels(page) {
  await expect(page.getByText(/internal production|production brief|asset pending|final asset pending/i)).toHaveCount(0);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => window.localStorage.removeItem(key), PROGRESS_KEY);
});

test("Atlas Explore renders with consolidated navigation", async ({ page }, testInfo) => {
  const errors = watchRuntimeErrors(page);
  const response = await page.goto("/learn/atlas", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "THC Living Plant Atlas" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectNoInternalProductionLabels(page);
  expect(errors, errors.join("\n")).toEqual([]);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-atlas-hub.png`),
    fullPage: true,
  });
});

test("Atlas lesson completion persists and Continue Learning advances", async ({ page }, testInfo) => {
  const errors = watchRuntimeErrors(page);
  const response = await page.goto("/learn/atlas/seed-germination/seed-anatomy", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);

  const completion = page.locator('section[aria-label="Lesson completion"]');
  await completion.getByRole("button", { name: "Mark lesson complete" }).click();
  await expect(completion.getByRole("button", { name: "Completed ✓" })).toHaveAttribute("aria-pressed", "true");
  await expect(completion.getByRole("link", { name: "Continue to next lesson" })).toHaveAttribute("href", "/learn/atlas/seed-germination/imbibition");

  const stored = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"), PROGRESS_KEY);
  expect(stored.completed).toContain("/learn/atlas/seed-germination/seed-anatomy");
  expect(stored.continueRoute).toBe("/learn/atlas/seed-germination/imbibition");

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator('section[aria-label="Lesson completion"]').getByRole("button", { name: "Completed ✓" })).toHaveAttribute("aria-pressed", "true");

  await page.goto("/learn/atlas/dashboard", { waitUntil: "networkidle" });
  const metrics = page.locator('section[aria-label="Atlas study metrics"]');
  await expect(metrics).toContainText(`1/${lessonRoutes.length}`);
  const continuePanel = page.locator('section[aria-label="Continue Atlas learning"]');
  await expect(continuePanel).toContainText("Imbibition");
  await expect(continuePanel.getByRole("link", { name: "Open next lesson" })).toHaveAttribute("href", "/learn/atlas/seed-germination/imbibition");
  await expectNoHorizontalOverflow(page);
  expect(errors, errors.join("\n")).toEqual([]);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-atlas-progress.png`),
    fullPage: true,
  });
});

test("Compare & Contrast mode switches evidence sets and keeps lesson links valid", async ({ page, request }, testInfo) => {
  const errors = watchRuntimeErrors(page);
  const response = await page.goto("/learn/atlas/compare", { waitUntil: "networkidle" });

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Compare & Contrast" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Healthy roots vs root stress" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Healthy root pattern" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Root stress pattern" })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  const topicNav = page.getByRole("navigation", { name: "Atlas comparison topics" });
  const topicButtons = topicNav.getByRole("button");
  await expect(topicButtons).toHaveCount(6);

  for (let index = 0; index < await topicButtons.count(); index += 1) {
    await topicButtons.nth(index).click();
    const comparison = page.locator('section[aria-label$=" comparison"]');
    await expect(comparison).toBeVisible();
    const hrefs = await comparison.locator("a").evaluateAll((links) => links.map((link) => link.getAttribute("href")).filter(Boolean));
    for (const href of hrefs) {
      const linkResponse = await request.get(href);
      expect(linkResponse.status(), href).toBe(200);
    }
  }

  await topicNav.getByRole("button", { name: "Xylem vs phloem" }).click();
  await expect(page.getByRole("heading", { name: "Xylem", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Phloem", exact: true })).toBeVisible();
  await expect(page.getByText(/Source-to-sink transport can occur in different directions/i)).toBeVisible();
  expect(errors, errors.join("\n")).toEqual([]);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-atlas-compare.png`),
    fullPage: true,
  });
});

test("representative Atlas lessons render and interactive visuals change state", async ({ page }, testInfo) => {
  const errors = watchRuntimeErrors(page);

  for (const route of representativeRoutes) {
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status(), route).toBe(200);

    await expect(page.locator("h1").first(), `${route} heading`).toBeVisible();
    const visual = page.locator('section[aria-label="Atlas primary visual"]');
    await expect(visual, `${route} visual`).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectNoInternalProductionLabels(page);

    const buttons = visual.locator("button");
    const buttonCount = await buttons.count();
    expect(buttonCount, `${route} should expose interactive visual controls`).toBeGreaterThanOrEqual(2);

    const before = await visual.innerHTML();
    await buttons.nth(1).click();
    await expect.poll(() => visual.innerHTML(), {
      message: `${route} should change visual state after interaction`,
    }).not.toBe(before);
  }

  expect(errors, errors.join("\n")).toEqual([]);

  await page.goto("/learn/atlas/seed-germination/seed-anatomy", { waitUntil: "networkidle" });
  const visual = page.locator('section[aria-label="Atlas primary visual"]');
  await visual.getByRole("button", { name: /Pericarp \/ fruit wall/ }).click();
  await expectNoInternalProductionLabels(page);

  const explanation = visual.getByText(
    "The visible protective shell includes the pericarp, which develops from the ovary wall. It is fruit tissue and must not be labeled as if the whole shell were the true seed coat.",
    { exact: true },
  );
  await expect(explanation).toBeVisible();
  const explanationBox = await explanation.boundingBox();
  expect(explanationBox, "selected-structure explanation should have a measurable layout box").not.toBeNull();
  expect(explanationBox.width, "selected-structure explanation should remain comfortably readable").toBeGreaterThan(150);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-seed-anatomy-interaction.png`),
    fullPage: true,
  });
});