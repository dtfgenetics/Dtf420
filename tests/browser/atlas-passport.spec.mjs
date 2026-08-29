import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const rawChecks = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/atlas-knowledge-checks.json"), "utf8"));
const badges = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/atlas-mastery-badges.json"), "utf8"));
const LESSON_COUNT = rawChecks.length;
const TOTAL_BADGES = badges.length + 1;
const MASTERY_KEY = "dtf420.atlas.mastery.v1";

async function setMastery(page, state) {
  await page.goto("/learn/atlas", { waitUntil: "networkidle" });
  await page.evaluate(({ key, value }) => window.localStorage.setItem(key, JSON.stringify(value)), {
    key: MASTERY_KEY,
    value: state,
  });
}

async function clearMastery(page) {
  await setMastery(page, { lessons: {}, paths: {} });
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("mastery passport route and Atlas navigation entry are available", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Run route check once.");
  const response = await request.get("/learn/atlas/mastery");
  expect(response.status()).toBe(200);

  await page.goto("/learn/atlas", { waitUntil: "networkidle" });
  const atlasNav = page.getByRole("navigation", { name: "Living Plant Atlas sections" });
  await expect(atlasNav.getByRole("link", { name: "Mastery", exact: true })).toHaveAttribute("href", "/learn/atlas/mastery");
});

test("mastery passport starts locked and explains its educational scope", async ({ page }, testInfo) => {
  await clearMastery(page);
  await page.goto("/learn/atlas/mastery", { waitUntil: "networkidle" });

  const summary = page.locator('section[aria-label="Atlas mastery passport summary"]');
  await expect(summary).toContainText(`0/${TOTAL_BADGES}`);
  await expect(summary).toContainText(`0/${LESSON_COUNT} lesson checks mastered`);
  await expect(page.locator('section[aria-label="Atlas path mastery badges"] article').getByText("Locked", { exact: true })).toHaveCount(badges.length);
  await expect(page.locator('section[aria-label="Atlas mastery passport scope"]')).toContainText("not a professional license, accreditation, or regulated credential");
  await expect(page.locator('section[aria-label="Whole Atlas mastery badge"]')).toContainText(`${LESSON_COUNT} checks remaining`);
  await expectNoHorizontalOverflow(page);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-atlas-mastery-passport-locked.png`),
    fullPage: true,
  });
});

test("path quiz score unlocks the matching passport badge", async ({ page }, testInfo) => {
  await setMastery(page, {
    lessons: {},
    paths: {
      "plant-foundations": { attempts: 1, bestScore: 86, lastScore: 86 },
    },
  });
  await page.goto("/learn/atlas/mastery", { waitUntil: "networkidle" });

  const summary = page.locator('section[aria-label="Atlas mastery passport summary"]');
  await expect(summary).toContainText(`1/${TOTAL_BADGES}`);
  const plantBadge = page.locator('section[aria-label="Atlas path mastery badges"] article').filter({ hasText: "Plant Systems" });
  await expect(plantBadge).toContainText("Unlocked ✓");
  await expect(plantBadge).toContainText("Best score 86%");
  await expect(plantBadge.getByRole("link", { name: "Review mastery quiz" })).toHaveAttribute("href", "/learn/atlas/paths/plant-foundations");
  await expectNoHorizontalOverflow(page);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-atlas-mastery-passport-path-unlocked.png`),
    fullPage: true,
  });
});

test("mastering every lesson check unlocks the whole-Atlas badge", async ({ page }, testInfo) => {
  const lessons = Object.fromEntries(
    rawChecks.map((check) => [check.route, { attempts: 1, mastered: true, lastCorrect: true }]),
  );
  await setMastery(page, { lessons, paths: {} });
  await page.goto("/learn/atlas/mastery", { waitUntil: "networkidle" });

  const finalBadge = page.locator('section[aria-label="Whole Atlas mastery badge"]');
  await expect(finalBadge).toContainText(String(LESSON_COUNT));
  await expect(finalBadge).toContainText("Unlocked ✓");
  await expect(finalBadge).toContainText("All lesson checks mastered");
  await expect(page.locator('section[aria-label="Atlas mastery passport summary"]')).toContainText(`${LESSON_COUNT}/${LESSON_COUNT} lesson checks mastered`);
  await expectNoHorizontalOverflow(page);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-atlas-mastery-passport-atlas-unlocked.png`),
    fullPage: true,
  });
});
