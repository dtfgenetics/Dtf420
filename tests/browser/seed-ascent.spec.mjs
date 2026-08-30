import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("Seed Ascent loads the verified 12-stage retro campaign and starts world 1-1", async ({ page }) => {
  await page.goto("/games/seed-ascent", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { level: 1, name: "Seed Ascent" })).toBeVisible();
  await expect(page.getByText(/12 side-scrolling stages across six grow worlds/i)).toBeVisible();

  const frame = page.frameLocator('iframe[title="Seed Ascent browser game"]');
  await expect(frame.locator("#game")).toBeVisible();
  await expect(frame.locator("#startBtn")).toBeVisible();
  await expect(frame.locator("#jumpBtn")).toBeAttached();
  await expect(frame.locator("#runBtn")).toBeAttached();

  const campaign = await frame.locator("body").evaluate(() => ({
    count: window.SEED_ASCENT_LEVELS?.length ?? 0,
    first: window.SEED_ASCENT_LEVELS?.[0]?.world ?? null,
    finalHasBoss: Boolean(window.SEED_ASCENT_LEVELS?.at(-1)?.boss),
  }));

  expect(campaign.count).toBeGreaterThanOrEqual(12);
  expect(campaign.first).toBe("1-1");
  expect(campaign.finalHasBoss).toBeTruthy();

  await frame.locator("#startBtn").click();
  await expect(frame.locator("#levelLabel")).toHaveText("1-1");
  await expect(frame.locator("#healthLabel")).toHaveText("3");
  await expectNoHorizontalOverflow(page);
});

test("Seed Ascent exposes playable touch controls at 390px", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "mobile-only responsive coverage");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/games/seed-ascent", { waitUntil: "networkidle" });

  const frame = page.frameLocator('iframe[title="Seed Ascent browser game"]');
  await expect(frame.locator("#game")).toBeVisible();
  await expect(frame.locator("#leftBtn")).toBeVisible();
  await expect(frame.locator("#rightBtn")).toBeVisible();
  await expect(frame.locator("#jumpBtn")).toBeVisible();
  await expect(frame.locator("#runBtn")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
