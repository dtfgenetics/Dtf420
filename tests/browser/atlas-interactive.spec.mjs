import { expect, test } from "@playwright/test";

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

test("interactive Plant Atlas selects structures, switches inspector modes, and rotates the specimen", async ({ page }, testInfo) => {
  const errors = watchRuntimeErrors(page);
  const response = await page.goto("/learn/atlas", { waitUntil: "networkidle" });

  expect(response?.status()).toBe(200);
  const app = page.locator('section[aria-label="THC Living Plant Atlas interactive explorer"]');
  await expect(app).toBeVisible();
  await expect(app.getByRole("heading", { name: "Plant Atlas", exact: true })).toBeVisible();
  await expect(app.getByRole("heading", { name: "Trichomes", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  const fanLeaves = app.getByRole("button", { name: /Fan Leaves/i }).first();
  await expect(fanLeaves).toBeVisible();
  await fanLeaves.click();
  await expect(app.getByRole("heading", { name: "Fan Leaves", exact: true })).toBeVisible();
  await expect(app.getByText(/Capture light/)).toBeVisible();

  await app.getByRole("tab", { name: "micro", exact: true }).click();
  await expect(app.getByText("Microscopy layer", { exact: true })).toBeVisible();
  await expect(app.getByRole("heading", { name: "Stomata & epidermis", exact: true })).toBeVisible();

  await app.getByRole("tab", { name: "data", exact: true }).click();
  await expect(app.getByRole("heading", { name: "Photosynthesis & gas exchange", exact: true })).toBeVisible();

  const model = app.locator('[aria-label="3D-ready interactive plant model viewport"]');
  await expect(model).toBeVisible();
  const beforeTransform = await model.getAttribute("style");
  await app.getByRole("button", { name: "Rotate plant left" }).click();
  await expect.poll(() => model.getAttribute("style")).not.toBe(beforeTransform);

  await app.getByRole("button", { name: "Micro", exact: true }).click();
  await expect(app.getByRole("button", { name: /Trichomes/i }).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(errors, errors.join("\n")).toEqual([]);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-interactive-atlas.png`),
    fullPage: true,
  });
});

test("interactive Plant Atlas remains contained at phone width", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Run the dedicated phone containment check in the mobile project.");
  const errors = watchRuntimeErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn/atlas", { waitUntil: "networkidle" });

  const app = page.locator('section[aria-label="THC Living Plant Atlas interactive explorer"]');
  await expect(app).toBeVisible();
  await expect(app.getByRole("heading", { name: "Plant Atlas", exact: true })).toBeVisible();
  await expect(app.getByRole("tab", { name: "info", exact: true })).toBeVisible();
  await app.getByRole("tab", { name: "notes", exact: true }).click();
  await expect(app.getByRole("heading", { name: "Record what you observe", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(errors, errors.join("\n")).toEqual([]);

  await page.screenshot({
    path: testInfo.outputPath("390px-interactive-atlas.png"),
    fullPage: true,
  });
});
