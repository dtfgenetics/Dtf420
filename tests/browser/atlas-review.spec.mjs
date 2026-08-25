import { expect, test } from "@playwright/test";

const MASTERY_KEY = "dtf420.atlas.mastery.v1";

async function seedReviewState(page) {
  await page.goto("/learn/atlas", { waitUntil: "networkidle" });
  await page.evaluate((key) => {
    window.localStorage.setItem(key, JSON.stringify({
      lessons: {
        "/learn/atlas/seed-germination/seed-anatomy": {
          attempts: 1,
          mastered: false,
          lastCorrect: false,
        },
        "/learn/atlas/seed-germination/imbibition": {
          attempts: 1,
          mastered: true,
          lastCorrect: true,
        },
      },
      paths: {},
    }));
  }, MASTERY_KEY);
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("review lab prioritizes recent misses and updates shared mastery", async ({ page }, testInfo) => {
  await seedReviewState(page);
  await page.goto("/learn/atlas/review", { waitUntil: "networkidle" });

  const summary = page.locator('section[aria-label="Atlas review summary"]');
  await expect(summary).toContainText("1");
  await expect(summary).toContainText("recent misses");
  await expect(summary).toContainText("49");
  await expect(summary).toContainText("unmastered");
  await expect(summary).toContainText("mastered");

  const practice = page.locator('section[aria-label="Atlas review practice"]');
  await expect(practice).toContainText("Seed anatomy");
  await expect(practice).toContainText("Which seed structure becomes the first root organ after germination begins?");
  const attempts = practice.locator('[aria-label="Previous attempts"]');
  await expect(attempts.getByText("1", { exact: true })).toBeVisible();
  await expect(attempts).toContainText("previous attempt");

  await practice.getByRole("radio", { name: /Radicle/ }).click();
  await practice.getByRole("button", { name: "Check answer" }).click();
  await expect(practice.getByRole("status")).toContainText("Correct — mastery updated.");

  const stored = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"), MASTERY_KEY);
  expect(stored.lessons["/learn/atlas/seed-germination/seed-anatomy"].mastered).toBe(true);
  expect(stored.lessons["/learn/atlas/seed-germination/seed-anatomy"].lastCorrect).toBe(true);
  expect(stored.lessons["/learn/atlas/seed-germination/seed-anatomy"].attempts).toBe(2);

  await practice.getByRole("button", { name: "Next review" }).click();
  await expect(practice).toContainText("Radicle emergence");
  await expect(practice).toContainText("What is the clearest sign that radicle emergence has occurred?");

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator('section[aria-label="Atlas review summary"]')).toContainText("0");
  await expect(page.locator('section[aria-label="Atlas review summary"]')).toContainText("recent misses");
  await expectNoHorizontalOverflow(page);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-atlas-review-lab.png`),
    fullPage: true,
  });
});

test("Practice hub exposes the mastery review lab", async ({ page }) => {
  await page.goto("/learn/atlas/practice", { waitUntil: "networkidle" });
  const link = page.getByRole("link", { name: "Review weak concepts" });
  await expect(link).toHaveAttribute("href", "/learn/atlas/review");
  await link.click();
  await expect(page).toHaveURL(/\/learn\/atlas\/review$/);
  await expect(page.locator('section[aria-label="Atlas review summary"]')).toBeVisible();
});
