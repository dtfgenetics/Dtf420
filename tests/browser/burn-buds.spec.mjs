import { expect, test } from "@playwright/test";

async function snapshot(page) {
  return page.locator("#burn-buds-game canvas").evaluate(() => window.__burnBudsDebug?.snapshot?.());
}

async function clickInternal(page, x, y) {
  const canvas = page.locator("#burn-buds-game canvas");
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box.x + (x / 600) * box.width, box.y + (y / 840) * box.height);
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("Burn Buds auto-places a fleet and completes a player/opponent turn", async ({ page }) => {
  await page.goto("/games/burn-buds", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1, name: "Burn Buds" })).toBeVisible();
  await expect(page.getByText("Playable beta", { exact: true })).toBeVisible();

  await expect.poll(async () => (await snapshot(page))?.phase, {
    message: "Phaser game should initialize into fleet placement",
    timeout: 8000,
  }).toBe("placement");

  await clickInternal(page, 229, 760);
  await expect.poll(async () => (await snapshot(page))?.placed).toBe(5);

  await clickInternal(page, 513, 760);
  await expect.poll(async () => (await snapshot(page))?.phase).toBe("player");
  await expect.poll(async () => (await snapshot(page))?.view).toBe("target");

  await clickInternal(page, 300, 400);
  await expect.poll(async () => (await snapshot(page))?.cursor).toBe("H8");
  await clickInternal(page, 538, 760);

  await expect.poll(async () => (await snapshot(page))?.playerShots, {
    message: "player shot should be committed",
  }).toBe(1);
  await expect.poll(async () => (await snapshot(page))?.aiShots, {
    message: "opponent should answer with one legal shot",
    timeout: 3000,
  }).toBe(1);
  await expect.poll(async () => (await snapshot(page))?.phase).toBe("player");
  await expectNoHorizontalOverflow(page);
});

test("Burn Buds keeps its real controls usable at 390px", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "mobile-only responsive coverage");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/games/burn-buds", { waitUntil: "networkidle" });

  const canvas = page.locator("#burn-buds-game canvas");
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeGreaterThan(300);
  expect(box.x).toBeGreaterThanOrEqual(-2);
  expect(box.x + box.width).toBeLessThanOrEqual(392);
  expect(box.height / box.width).toBeGreaterThan(1.35);

  await canvas.scrollIntoViewIfNeeded();
  await clickInternal(page, 229, 760);
  await expect.poll(async () => (await snapshot(page))?.placed).toBe(5);
  await clickInternal(page, 513, 760);
  await expect.poll(async () => (await snapshot(page))?.phase).toBe("player");

  await clickInternal(page, 300, 400);
  await clickInternal(page, 538, 760);
  await expect.poll(async () => (await snapshot(page))?.playerShots).toBe(1);
  await expect.poll(async () => (await snapshot(page))?.aiShots, { timeout: 3000 }).toBe(1);

  await expectNoHorizontalOverflow(page);
});
