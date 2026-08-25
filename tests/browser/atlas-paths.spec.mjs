import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const guidedPaths = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "content/atlas-guided-paths.json"), "utf8"),
);

const PROGRESS_KEY = "dtf420.atlas.progress.v1";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("guided path manifest points only to live Atlas lessons", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Run path route integrity once.");
  expect(guidedPaths).toHaveLength(6);

  const pathIds = new Set();
  for (const guidedPath of guidedPaths) {
    expect(pathIds.has(guidedPath.id), `duplicate path id ${guidedPath.id}`).toBe(false);
    pathIds.add(guidedPath.id);
    expect(guidedPath.lessons.length, `${guidedPath.title} should contain a useful sequence`).toBeGreaterThanOrEqual(6);
    expect(new Set(guidedPath.lessons).size, `${guidedPath.title} should not repeat a lesson`).toBe(guidedPath.lessons.length);

    for (const route of guidedPath.lessons) {
      const response = await request.get(route);
      expect(response.status(), `${guidedPath.title}: ${route} should return HTTP 200`).toBe(200);
    }
  }
});

test("Atlas hub exposes guided paths and all six path views render cleanly", async ({ page }, testInfo) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

  await page.goto("/learn/atlas", { waitUntil: "networkidle" });
  const guidedLink = page.getByRole("link", { name: "Follow guided learning paths" });
  await expect(guidedLink).toBeVisible();
  await expect(guidedLink).toHaveAttribute("href", "/learn/atlas/paths");
  await guidedLink.click();
  await expect(page).toHaveURL(/\/learn\/atlas\/paths$/);
  await expect(page.getByRole("heading", { name: "Guided Learning Paths" })).toBeVisible();

  const pathNav = page.getByRole("navigation", { name: "Atlas guided learning paths" });
  const buttons = pathNav.getByRole("button");
  await expect(buttons).toHaveCount(6);

  for (const guidedPath of guidedPaths) {
    await pathNav.getByRole("button", { name: new RegExp(guidedPath.title, "i") }).click();
    const detail = page.locator(`section[aria-label="${guidedPath.title} learning path"]`);
    await expect(detail).toBeVisible();
    await expect(detail.getByRole("heading", { name: guidedPath.title })).toBeVisible();
    await expect(detail.getByRole("list", { name: `${guidedPath.title} lesson sequence` }).getByRole("listitem")).toHaveCount(guidedPath.lessons.length);
    await expectNoHorizontalOverflow(page);
  }

  expect(errors, errors.join("\n")).toEqual([]);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-atlas-guided-paths.png`),
    fullPage: true,
  });
});

test("guided paths reuse Atlas completion state and resume at the first unfinished lesson", async ({ page }) => {
  await page.goto("/learn/atlas", { waitUntil: "networkidle" });
  await page.evaluate((key) => {
    window.localStorage.setItem(key, JSON.stringify({
      completed: ["/learn/atlas/seed-germination/seed-anatomy"],
      continueRoute: "/learn/atlas/root-system/root-architecture",
    }));
  }, PROGRESS_KEY);

  await page.goto("/learn/atlas/paths", { waitUntil: "networkidle" });
  const detail = page.locator('section[aria-label="Plant Foundations learning path"]');
  await expect(detail).toContainText("1 of 7 complete");
  await expect(detail.getByRole("progressbar", { name: "Plant Foundations progress" })).toHaveAttribute("aria-valuenow", "1");
  await expect(detail.getByRole("link", { name: "Continue this path" })).toHaveAttribute("href", "/learn/atlas/root-system/root-architecture");
  await expect(detail.getByRole("listitem").first()).toContainText("Review");

  const pathNav = page.getByRole("navigation", { name: "Atlas guided learning paths" });
  await pathNav.getByRole("button", { name: /Water & Transport/i }).click();
  const waterDetail = page.locator('section[aria-label="Water & Transport learning path"]');
  await expect(waterDetail).toContainText("0 of 6 complete");
  await expect(waterDetail.getByRole("link", { name: "Start this path" })).toHaveAttribute("href", "/learn/atlas/root-system/root-hairs-and-absorption");
  await expectNoHorizontalOverflow(page);
});
