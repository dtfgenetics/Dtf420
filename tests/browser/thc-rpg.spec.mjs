import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

async function expectFrameNoHorizontalOverflow(frame) {
  const overflow = await frame.locator("html").evaluate((html) => html.scrollWidth - html.clientWidth);
  expect(overflow, `THC RPG iframe horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("THC RPG is launched from the game hub and completes the first planting flow", async ({ page }) => {
  await page.goto("/games", { waitUntil: "networkidle" });
  const launch = page.getByRole("link", { name: "Play THC RPG", exact: true });
  await expect(launch).toBeVisible();
  await expect(launch).toHaveAttribute("href", "/games/thc-rpg");
  await launch.click();

  await expect(page).toHaveURL(/\/games\/thc-rpg$/);
  await expect(page.getByRole("heading", { name: "THC RPG", exact: true })).toBeVisible();

  const iframe = page.locator('iframe[title="THC RPG: The First Seed"]');
  await expect(iframe).toBeVisible();
  const game = page.frameLocator('iframe[title="THC RPG: The First Seed"]');
  await expect(game.getByRole("heading", { name: /THC RPG/i })).toBeVisible();

  const name = game.locator("#nameInput");
  await name.fill("Browser QA");
  await game.getByRole("button", { name: /Start New Game/i }).click();
  await expect(game.locator("#playerName")).toHaveText("Browser QA");
  await expect(game.getByRole("heading", { name: /Welcome, Grower/i })).toBeVisible();

  await game.getByRole("button", { name: /Go to Main Street/i }).click();
  await game.locator('[data-travel="mentor_shop"]').click();
  await game.locator('[data-action="talk-jenkins"]').click();
  await expect(game.getByText(/I've got a Blue Mango seed here/i)).toBeVisible();
  await game.getByRole("button", { name: /Accept the Blue Mango seed/i }).click();

  await game.locator('[data-travel="main_street"]').click();
  await game.locator('[data-travel="grow_room"]').click();
  await game.locator("#btnPlant").click();
  await expect(game.getByRole("heading", { name: /Seed Planted/i })).toBeVisible();
  await expect(game.locator(".plant-name")).toHaveText("Blue Mango");

  await expectNoHorizontalOverflow(page);
  const innerFrame = page.frames().find((frame) => frame.url().includes("/thc-rpg/index.html"));
  expect(innerFrame).toBeTruthy();
  await expectFrameNoHorizontalOverflow(innerFrame);
});

test("THC RPG remains usable at the 390px phone target", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/games/thc-rpg", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "THC RPG", exact: true })).toBeVisible();
  const iframe = page.locator('iframe[title="THC RPG: The First Seed"]');
  await expect(iframe).toBeVisible();
  const frameBox = await iframe.boundingBox();
  expect(frameBox).not.toBeNull();
  expect(frameBox.width).toBeLessThanOrEqual(358);
  expect(frameBox.width).toBeGreaterThan(280);

  const game = page.frameLocator('iframe[title="THC RPG: The First Seed"]');
  await game.getByRole("button", { name: /Start New Game/i }).click();
  await expect(game.locator("#actionBar")).toBeVisible();
  await expect(game.locator("#btnInteract")).toBeVisible();
  await expect(game.locator("#btnInventory")).toBeVisible();
  await expect(game.locator("#btnSave")).toBeVisible();

  await expectNoHorizontalOverflow(page);
  const innerFrame = page.frames().find((frame) => frame.url().includes("/thc-rpg/index.html"));
  expect(innerFrame).toBeTruthy();
  await expectFrameNoHorizontalOverflow(innerFrame);
  await page.screenshot({ path: "test-results/thc-rpg-mobile.png", fullPage: true });
});
