import { expect, test } from "@playwright/test";

const forbiddenProductionLanguage = [
  /primary visual specification/i,
  /production brief/i,
  /production media/i,
  /teaching fallback/i,
  /visual under review/i,
  /review build/i,
  /asset:\s*(review|needed|brief ready|in production|ready)/i,
];

async function expectLearnerFacingVisual(page) {
  const visual = page.locator('section[aria-label="Atlas primary visual"]');
  await expect(visual).toBeVisible();
  const bodyText = await page.locator("body").innerText();
  for (const pattern of forbiddenProductionLanguage) expect(bodyText).not.toMatch(pattern);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
  return visual;
}

test("Atlas exposes the existing advanced concept visual instead of a production placeholder", async ({ page }) => {
  const response = await page.goto("/learn/atlas/seed-germination/reserve-mobilization", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);

  const visual = await expectLearnerFacingVisual(page);
  await expect(visual.getByText("Interactive concept map", { exact: true })).toBeVisible();
  await expect(visual.getByRole("tab")).toHaveCount(3);

  const before = await visual.innerHTML();
  await visual.getByRole("tab").nth(1).click();
  await expect.poll(() => visual.innerHTML()).not.toBe(before);
});

test("Atlas gives lessons without specialized media a visual system study map", async ({ page }) => {
  const response = await page.goto("/learn/atlas/seed-germination/thermal-limits-and-germination-rate", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);

  const visual = await expectLearnerFacingVisual(page);
  await expect(visual.locator('[data-atlas-visual="system-study-map"]')).toBeVisible();
  await expect(visual.getByText("System study map", { exact: true })).toBeVisible();
  await expect(
    visual.getByRole("strong", {
      name: "Temperature-response curve with germination percentage and rate separated",
      exact: true,
    }),
  ).toBeVisible();
  await expect(visual.getByText("Seed & Germination", { exact: true })).toBeVisible();
});
