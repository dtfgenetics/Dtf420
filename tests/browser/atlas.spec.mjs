import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const modules = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "content/atlas-learning-modules.json"), "utf8"),
);

function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const lessonRoutes = modules.flatMap((atlasModule) =>
  atlasModule.lessons.map((lesson) => ({
    title: lesson.title,
    route: `/learn/atlas/${slugify(atlasModule.id)}/${slugify(lesson.title)}`,
  })),
);

const representativeRoutes = [
  "/learn/atlas/seed-germination/seed-anatomy",
  "/learn/atlas/root-system/root-architecture",
  "/learn/atlas/stem-vascular/stem-cross-section",
  "/learn/atlas/leaves/healthy-leaf-baseline",
  "/learn/atlas/flowers/female-flower-anatomy",
  "/learn/atlas/trichomes-resin/trichome-types",
  "/learn/atlas/sex-pollen-seed/male-vs-female-preflowers",
  "/learn/atlas/environment-overlay/vpd-and-transpiration",
  "/learn/atlas/diagnostic-overlay/differential-workflow",
];

const PROGRESS_KEY = "dtf420.atlas.progress.v1";

function watchRuntimeErrors(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

async function expectNoInternalProductionLabels(page) {
  const visibleText = await page.locator("body").evaluate((element) => element.innerText);
  expect(visibleText).not.toMatch(/visual under review/i);
  expect(visibleText).not.toMatch(/review build/i);
  expect(visibleText).not.toMatch(/asset:\s*(review|needed|brief ready|in production|ready)/i);
  expect(visibleText).not.toMatch(/atlas-[a-z0-9-]+-v\d+/i);
}

test("all 50 Atlas lesson routes respond successfully", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Run the route sweep once.");
  expect(lessonRoutes).toHaveLength(50);

  for (const lesson of lessonRoutes) {
    const response = await request.get(lesson.route);
    expect(response.status(), `${lesson.route} should return HTTP 200`).toBe(200);
    const html = await response.text();
    expect(html, `${lesson.route} should contain a rendered lesson heading`).toContain("<h1");
  }
});

test("Atlas Explore renders cleanly with consolidated navigation", async ({ page }, testInfo) => {
  const errors = watchRuntimeErrors(page);
  const response = await page.goto("/learn/atlas", { waitUntil: "networkidle" });

  expect(response?.status()).toBe(200);
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.locator("body")).toContainText("Living Plant Atlas");
  const atlasNav = page.getByRole("navigation", { name: "Living Plant Atlas sections" });
  for (const label of ["Dashboard", "Explore", "Paths", "Practice", "Notebook", "Mastery"]) {
    await expect(atlasNav.getByRole("link", { name: label, exact: true })).toBeVisible();
  }
  await expect(atlasNav.getByRole("link", { name: "Explore", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.locator('section[aria-label="Atlas learning progress"]')).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("Atlas expansion path");
  await expectNoHorizontalOverflow(page);
  expect(errors, errors.join("\n")).toEqual([]);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-atlas-hub.png`),
    fullPage: true,
  });
});

test("Atlas lesson completion persists and Dashboard Continue Learning advances", async ({ page }, testInfo) => {
  const errors = watchRuntimeErrors(page);
  await page.goto("/learn/atlas/seed-germination/seed-anatomy", { waitUntil: "networkidle" });
  await page.evaluate((key) => window.localStorage.removeItem(key), PROGRESS_KEY);
  await page.reload({ waitUntil: "networkidle" });

  const completion = page.locator('section[aria-label="Lesson completion"]');
  await expect(completion).toBeVisible();
  const completeButton = completion.getByRole("button", { name: "Mark lesson complete" });
  await expect(completeButton).toBeEnabled();
  await completeButton.click();
  await expect(completion.getByRole("button", { name: "Completed ✓" })).toHaveAttribute("aria-pressed", "true");
  await expect(completion.getByRole("link", { name: "Continue to next lesson" })).toHaveAttribute("href", "/learn/atlas/seed-germination/imbibition");

  const stored = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"), PROGRESS_KEY);
  expect(stored.completed).toContain("/learn/atlas/seed-germination/seed-anatomy");
  expect(stored.continueRoute).toBe("/learn/atlas/seed-germination/imbibition");

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator('section[aria-label="Lesson completion"]').getByRole("button", { name: "Completed ✓" })).toHaveAttribute("aria-pressed", "true");

  await page.goto("/learn/atlas/dashboard", { waitUntil: "networkidle" });
  const metrics = page.locator('section[aria-label="Atlas study metrics"]');
  await expect(metrics).toContainText("1/50");
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
    expect(hrefs).toHaveLength(2);
    for (const href of hrefs) {
      const linkedResponse = await request.get(href);
      expect(linkedResponse.status(), `${href} should return HTTP 200`).toBe(200);
    }
    await expectNoHorizontalOverflow(page);
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
  await visual.locator("button").nth(1).click();
  await expectNoInternalProductionLabels(page);

  const explanation = page.getByText(
    "Embryonic leaf tissue that supports the seedling during the earliest stage after emergence.",
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
