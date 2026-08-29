import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const modules = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/atlas-learning-modules.json"), "utf8"));
const rawChecks = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/atlas-knowledge-checks.json"), "utf8"));
const guidedPaths = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/atlas-guided-paths.json"), "utf8"));
const MASTERY_KEY = "dtf420.atlas.mastery.v1";

function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const lessonRoutes = modules.flatMap((atlasModule) =>
  atlasModule.lessons.map((lesson) => `/learn/atlas/${slugify(atlasModule.id)}/${slugify(lesson.title)}`),
);

const balancedChecks = rawChecks.map((check, index) => {
  const targetIndex = index % check.options.length;
  const correctOption = check.options[check.correctIndex];
  const distractors = check.options.filter((_, optionIndex) => optionIndex !== check.correctIndex);
  const options = [...distractors];
  options.splice(targetIndex, 0, correctOption);
  return { ...check, options, correctIndex: targetIndex };
});
const checkByRoute = new Map(balancedChecks.map((check) => [check.route, check]));

async function clearMastery(page) {
  await page.goto("/learn/atlas", { waitUntil: "networkidle" });
  await page.evaluate((key) => window.localStorage.removeItem(key), MASTERY_KEY);
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("knowledge-check manifest covers every canonical lesson", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Run manifest sweep once.");
  expect(lessonRoutes.length).toBeGreaterThan(0);
  expect(rawChecks).toHaveLength(lessonRoutes.length);
  expect(new Set(rawChecks.map((check) => check.route))).toEqual(new Set(lessonRoutes));

  for (const guidedPath of guidedPaths) {
    const response = await request.get(`/learn/atlas/paths/${guidedPath.id}`);
    expect(response.status(), `${guidedPath.id} mastery route`).toBe(200);
  }
});

test("lesson knowledge check explains mistakes, retries, and persists mastery", async ({ page }) => {
  await clearMastery(page);
  await page.goto("/learn/atlas/seed-germination/seed-anatomy", { waitUntil: "networkidle" });

  const check = page.locator('section[aria-label="Lesson knowledge check"]');
  await expect(check).toBeVisible();
  await expect(check).toContainText("Practice");
  await expect(check.getByText("Which seed structure becomes the first root organ after germination begins?")).toBeVisible();

  await check.getByRole("radio", { name: /Cotyledon/ }).click();
  await check.getByRole("button", { name: "Check answer" }).click();
  await expect(check.getByRole("status")).toContainText("Not yet.");
  await expect(check.getByRole("status")).toContainText("The radicle is the embryonic root");

  await check.getByRole("button", { name: "Try again" }).click();
  await check.getByRole("radio", { name: /Radicle/ }).click();
  await check.getByRole("button", { name: "Check answer" }).click();
  await expect(check.getByRole("status")).toContainText("Correct.");
  await expect(check).toContainText("Mastered ✓");

  const stored = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"), MASTERY_KEY);
  expect(stored.lessons["/learn/atlas/seed-germination/seed-anatomy"].mastered).toBe(true);
  expect(stored.lessons["/learn/atlas/seed-germination/seed-anatomy"].attempts).toBe(2);

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator('section[aria-label="Lesson knowledge check"]')).toContainText("Mastered ✓");
  await expectNoHorizontalOverflow(page);
});

test("Study Dashboard and guided paths reflect shared mastery state", async ({ page }, testInfo) => {
  await clearMastery(page);
  await page.goto("/learn/atlas/seed-germination/seed-anatomy", { waitUntil: "networkidle" });
  const check = page.locator('section[aria-label="Lesson knowledge check"]');
  await check.getByRole("radio", { name: /Radicle/ }).click();
  await check.getByRole("button", { name: "Check answer" }).click();
  await expect(check.getByRole("status")).toContainText("Correct.");

  await page.goto("/learn/atlas/dashboard", { waitUntil: "networkidle" });
  const metrics = page.locator('section[aria-label="Atlas study metrics"]');
  await expect(metrics).toContainText("Knowledge");
  await expect(metrics).toContainText(`1/${lessonRoutes.length}`);
  const destinations = page.locator('section[aria-label="Atlas learner destinations"]');
  await expect(destinations.getByRole("link", { name: /Mastery Passport/i })).toHaveAttribute("href", "/learn/atlas/mastery");

  await page.goto("/learn/atlas/paths", { waitUntil: "networkidle" });
  const summary = page.locator('[aria-label="Path mastery summary"]');
  await expect(summary).toContainText("1/7 mastered");
  await expect(summary.getByRole("link", { name: "Take mastery quiz" })).toHaveAttribute("href", "/learn/atlas/paths/plant-foundations");
  await expectNoHorizontalOverflow(page);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-atlas-mastery-summary.png`),
    fullPage: true,
  });
});

test("path mastery quiz scores, explains, saves, and unlocks its passport badge", async ({ page }, testInfo) => {
  await clearMastery(page);
  const pathData = guidedPaths.find((item) => item.id === "plant-foundations");
  expect(pathData).toBeTruthy();

  await page.goto("/learn/atlas/paths/plant-foundations", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Plant Foundations" })).toBeVisible();
  await expect(page.getByText("Mastery target: 80%")).toBeVisible();

  const questions = page.locator("ol > li");
  await expect(questions).toHaveCount(pathData.lessons.length);

  for (let index = 0; index < pathData.lessons.length; index += 1) {
    const route = pathData.lessons[index];
    const check = checkByRoute.get(route);
    expect(check, route).toBeTruthy();
    await questions.nth(index).locator("label").nth(check.correctIndex).click();
  }

  await page.getByRole("button", { name: "Submit mastery quiz" }).click();
  const result = page.locator('section[aria-label="Path mastery result"]');
  await expect(result).toContainText("Mastery achieved");
  await expect(result).toContainText("100%");
  await expect(result).toContainText("unlocked its Atlas Mastery Passport badge");
  await expect(page.getByText("Correct", { exact: true })).toHaveCount(pathData.lessons.length);

  const stored = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"), MASTERY_KEY);
  expect(stored.paths["plant-foundations"].bestScore).toBe(100);
  expect(stored.paths["plant-foundations"].attempts).toBe(1);
  for (const route of pathData.lessons) expect(stored.lessons[route].mastered, route).toBe(true);

  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-atlas-mastery-quiz.png`),
    fullPage: true,
  });

  await result.getByRole("link", { name: "View mastery passport" }).click();
  await expect(page).toHaveURL(/\/learn\/atlas\/mastery$/);
  const plantBadge = page.locator('section[aria-label="Atlas path mastery badges"] article').filter({ hasText: "Plant Systems" });
  await expect(plantBadge).toContainText("Unlocked ✓");
  await expect(plantBadge).toContainText("Best score 100%");
  await expectNoHorizontalOverflow(page);
});
