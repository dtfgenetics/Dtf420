import { expect, test } from "@playwright/test";

const PROGRESS_KEY = "dtf420.atlas.progress.v1";
const MASTERY_KEY = "dtf420.atlas.mastery.v1";

async function seedDashboardState(page) {
  await page.goto("/learn/atlas", { waitUntil: "networkidle" });
  await page.evaluate(({ progressKey, masteryKey }) => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      completed: [
        "/learn/atlas/seed-germination/seed-anatomy",
        "/learn/atlas/root-system/root-architecture",
      ],
      continueRoute: "/learn/atlas/seed-germination/imbibition",
    }));
    window.localStorage.setItem(masteryKey, JSON.stringify({
      lessons: {
        "/learn/atlas/seed-germination/seed-anatomy": {
          attempts: 1,
          mastered: true,
          lastCorrect: true,
        },
        "/learn/atlas/seed-germination/imbibition": {
          attempts: 1,
          mastered: false,
          lastCorrect: false,
        },
      },
      paths: {
        "plant-foundations": {
          attempts: 1,
          bestScore: 86,
          lastScore: 86,
        },
      },
    }));
  }, { progressKey: PROGRESS_KEY, masteryKey: MASTERY_KEY });
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("study dashboard summarizes shared state and prioritizes recent misses", async ({ page }, testInfo) => {
  await seedDashboardState(page);
  await page.goto("/learn/atlas/dashboard", { waitUntil: "networkidle" });

  const summary = page.locator('section[aria-label="Atlas study dashboard summary"]');
  await expect(summary).toContainText("Atlas Study Dashboard");

  const metrics = page.locator('section[aria-label="Atlas study metrics"]');
  await expect(metrics).toContainText("2/50");
  await expect(metrics).toContainText("1/50");
  await expect(metrics).toContainText("Recent misses");
  await expect(metrics).toContainText("1/6");

  const recommendation = page.locator('section[aria-label="Recommended Atlas study action"]');
  await expect(recommendation).toContainText("1 recent miss needs attention");
  await expect(recommendation.getByRole("link", { name: "Review recent misses" })).toHaveAttribute("href", "/learn/atlas/review");

  const continuePanel = page.locator('section[aria-label="Continue Atlas learning"]');
  await expect(continuePanel).toContainText("Imbibition");
  await expect(continuePanel.getByRole("link", { name: "Open next lesson" })).toHaveAttribute("href", "/learn/atlas/seed-germination/imbibition");

  const pathPanel = page.locator('section[aria-label="Closest guided learning path"]');
  await expect(pathPanel).toContainText("Plant Foundations");
  await expect(pathPanel).toContainText("2/7 lessons complete");

  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-atlas-study-dashboard.png`),
    fullPage: true,
  });
});

test("study dashboard falls back to continue learning when review queue is clear", async ({ page }) => {
  await page.goto("/learn/atlas", { waitUntil: "networkidle" });
  await page.evaluate(({ progressKey, masteryKey }) => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      completed: ["/learn/atlas/seed-germination/seed-anatomy"],
      continueRoute: "/learn/atlas/seed-germination/imbibition",
    }));
    window.localStorage.setItem(masteryKey, JSON.stringify({
      lessons: {
        "/learn/atlas/seed-germination/seed-anatomy": {
          attempts: 1,
          mastered: true,
          lastCorrect: true,
        },
      },
      paths: {},
    }));
  }, { progressKey: PROGRESS_KEY, masteryKey: MASTERY_KEY });

  await page.goto("/learn/atlas/dashboard", { waitUntil: "networkidle" });
  const recommendation = page.locator('section[aria-label="Recommended Atlas study action"]');
  await expect(recommendation).toContainText("Continue with Imbibition");
  await expect(recommendation.getByRole("link", { name: "Continue lesson" })).toHaveAttribute("href", "/learn/atlas/seed-germination/imbibition");
});

test("Atlas hub exposes the study dashboard", async ({ page }) => {
  await page.goto("/learn/atlas", { waitUntil: "networkidle" });
  const link = page.getByRole("link", { name: "Open study dashboard" });
  await expect(link).toHaveAttribute("href", "/learn/atlas/dashboard");
  await link.click();
  await expect(page).toHaveURL(/\/learn\/atlas\/dashboard$/);
  await expect(page.locator('section[aria-label="Atlas study dashboard summary"]')).toBeVisible();
});
