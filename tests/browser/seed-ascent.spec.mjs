import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

async function getGameFrame(page) {
  return page.frameLocator('iframe[title="Seed Ascent browser game"]');
}

async function snapshot(frame) {
  return frame.locator("#game").evaluate(() => window.__seedAscentDebug?.snapshot?.());
}

test("Seed Ascent loads the verified 12-stage retro campaign and starts world 1-1 on solid ground", async ({ page }) => {
  await page.goto("/games/seed-ascent", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { level: 1, name: "Seed Ascent" })).toBeVisible();
  await expect(page.getByText(/12 side-scrolling stages across six grow worlds/i)).toBeVisible();

  const frame = await getGameFrame(page);
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

  await expect.poll(async () => (await snapshot(frame))?.player?.grounded, {
    message: "player should remain on the stage floor instead of tunneling through it",
    timeout: 4000,
  }).toBe(true);

  const state = await snapshot(frame);
  expect(state.player.y).toBeCloseTo(414, 1);
  expect(state.maxSafePit).toBeLessThanOrEqual(180);
  expect(Math.max(...state.pits)).toBeLessThanOrEqual(state.maxSafePit);
  expect(state.simulationHz).toBe(60);
  await expectNoHorizontalOverflow(page);
});

test("Seed Ascent jump control lifts the player from the floor", async ({ page }) => {
  await page.goto("/games/seed-ascent", { waitUntil: "networkidle" });
  const frame = await getGameFrame(page);
  await frame.locator("#startBtn").click();
  await expect.poll(async () => (await snapshot(frame))?.player?.grounded).toBe(true);

  const jump = frame.locator("#jumpBtn");
  await jump.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "touch", isPrimary: true });
  await page.waitForTimeout(120);
  await jump.dispatchEvent("pointerup", { pointerId: 1, pointerType: "touch", isPrimary: true });

  await expect.poll(async () => (await snapshot(frame))?.player?.y, {
    message: "jump should visibly lift the player above the 414px floor standing position",
  }).toBeLessThan(410);
});

test("Seed Ascent keyboard start does not carry a queued jump into the stage", async ({ page }) => {
  await page.goto("/games/seed-ascent", { waitUntil: "networkidle" });
  const frame = await getGameFrame(page);
  await frame.locator("#game").focus();

  await page.keyboard.press("Space");
  await expect.poll(async () => (await snapshot(frame))?.mode).toBe("playing");
  await page.waitForTimeout(180);

  const state = await snapshot(frame);
  expect(state.player.grounded).toBe(true);
  expect(state.player.y).toBeCloseTo(414, 1);
  expect(Math.abs(state.player.vy)).toBeLessThan(0.1);
});

test("Seed Ascent clears held movement when the game window loses focus", async ({ page }) => {
  await page.goto("/games/seed-ascent", { waitUntil: "networkidle" });
  const frame = await getGameFrame(page);
  await frame.locator("#startBtn").click();
  await expect.poll(async () => (await snapshot(frame))?.player?.grounded).toBe(true);

  await frame.locator("#game").focus();
  await page.keyboard.down("ArrowRight");
  await expect.poll(async () => (await snapshot(frame))?.player?.vx, {
    message: "held right input should accelerate the player before blur",
  }).toBeGreaterThan(2);

  const moving = await snapshot(frame);
  await frame.locator("body").evaluate(() => window.dispatchEvent(new Event("blur")));

  await expect.poll(async () => Math.abs((await snapshot(frame))?.player?.vx ?? 99), {
    message: "blur should clear held movement so horizontal velocity decays instead of ghost-driving the player",
    timeout: 2500,
  }).toBeLessThan(Math.abs(moving.player.vx));

  await page.keyboard.up("ArrowRight");
});

test("Seed Ascent pointer cancel releases held touch movement", async ({ page }) => {
  await page.goto("/games/seed-ascent", { waitUntil: "networkidle" });
  const frame = await getGameFrame(page);
  await frame.locator("#startBtn").click();
  await expect.poll(async () => (await snapshot(frame))?.player?.grounded).toBe(true);

  const right = frame.locator("#rightBtn");
  await right.dispatchEvent("pointerdown", { pointerId: 7, pointerType: "touch", isPrimary: true });
  await expect.poll(async () => (await snapshot(frame))?.player?.vx).toBeGreaterThan(1.5);
  const beforeCancel = await snapshot(frame);

  await right.dispatchEvent("pointercancel", { pointerId: 7, pointerType: "touch", isPrimary: true });
  await expect.poll(async () => Math.abs((await snapshot(frame))?.player?.vx ?? 99), {
    message: "pointercancel should release held touch movement",
    timeout: 2500,
  }).toBeLessThan(Math.abs(beforeCancel.player.vx));
});

test("Seed Ascent level selectors cannot corrupt a paused game state", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem("seedAscentUnlocked", "2"));
  await page.goto("/games/seed-ascent", { waitUntil: "networkidle" });
  const frame = await getGameFrame(page);

  await frame.locator("#nextBtn").click();
  await expect(frame.locator("#levelLabel")).toHaveText("1-2");
  await frame.locator("#startBtn").click();
  await expect.poll(async () => (await snapshot(frame))?.mode).toBe("playing");
  await frame.locator("#pauseBtn").click();
  await expect.poll(async () => (await snapshot(frame))?.mode).toBe("paused");

  await frame.locator("#prevBtn").click();
  await page.waitForTimeout(150);
  expect((await snapshot(frame)).mode).toBe("paused");
  await expect(frame.locator("#levelLabel")).toHaveText("1-2");
  expect(errors).toEqual([]);

  await frame.locator("#pauseBtn").click();
  await expect.poll(async () => (await snapshot(frame))?.mode).toBe("playing");
});

test("Seed Ascent restart cannot farm the same stage rewards", async ({ page }) => {
  await page.goto("/games/seed-ascent", { waitUntil: "networkidle" });
  const frame = await getGameFrame(page);
  await frame.locator("#startBtn").click();
  await expect.poll(async () => (await snapshot(frame))?.player?.grounded).toBe(true);

  await frame.locator("#game").focus();
  await page.keyboard.down("ArrowRight");
  await expect.poll(async () => (await snapshot(frame))?.score, {
    message: "moving through the opening coin line should earn score before restart",
    timeout: 5000,
  }).toBeGreaterThan(0);
  await page.keyboard.up("ArrowRight");

  const earned = await snapshot(frame);
  expect(earned.trichomes).toBeGreaterThan(0);

  await frame.locator("#restartBtn").click();
  await expect.poll(async () => (await snapshot(frame))?.player?.grounded).toBe(true);
  const restarted = await snapshot(frame);
  expect(restarted.mode).toBe("playing");
  expect(restarted.score).toBe(0);
  expect(restarted.trichomes).toBe(0);
  expect(restarted.player.y).toBeCloseTo(414, 1);
});

test("Seed Ascent exposes playable touch controls at 390px", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "mobile-only responsive coverage");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/games/seed-ascent", { waitUntil: "networkidle" });

  const frame = await getGameFrame(page);
  await expect(frame.locator("#game")).toBeVisible();
  await expect(frame.locator("#leftBtn")).toBeVisible();
  await expect(frame.locator("#rightBtn")).toBeVisible();
  await expect(frame.locator("#jumpBtn")).toBeVisible();
  await expect(frame.locator("#runBtn")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});