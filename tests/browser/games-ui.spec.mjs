import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("games hub separates playable releases from development previews", async ({ page }) => {
  await page.goto("/games", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "Pick a game. Get into it." })).toBeVisible();
  await expect(page.getByText("Playable now", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Play Bud or Bluff →" })).toHaveAttribute("href", "/games/bud-or-bluff");
  await expect(page.getByText("Development preview", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "View board preview →" })).toHaveAttribute("href", "/games/burn-buds");
  await expect(page.getByRole("link", { name: /Play Burn Buds/i })).toHaveCount(0);
  await expect(page.getByText(/migration standard/i)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("games hub stays readable at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/games", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "Pick a game. Get into it." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Play Bud or Bluff →" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/games-hub-mobile.png", fullPage: true });
});

test("Burn Buds is presented as a board preview without internal validation copy", async ({ page }) => {
  await page.goto("/games/burn-buds", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "Burn Buds", exact: true })).toBeVisible();
  await expect(page.getByText("Development preview", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Burn Buds 15 by 15 board preview")).toBeVisible();
  await expect(page.locator("#burn-buds-game canvas")).toBeVisible();
  await expect(page.getByText(/engine validation/i)).toHaveCount(0);
  await expect(page.getByText(/engine check/i)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("Burn Buds preview canvas remains visible at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/games/burn-buds", { waitUntil: "networkidle" });

  const canvas = page.locator("#burn-buds-game canvas");
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeLessThanOrEqual(358);
  expect(box.width).toBeGreaterThan(280);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/burn-buds-mobile-preview.png", fullPage: true });
});
