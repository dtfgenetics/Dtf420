import { expect, test } from "@playwright/test";

async function openWorldLab(page) {
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await page.goto("/games/dtf-world-lab", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "DTF World Lab", exact: true })).toBeVisible();

  const frame = page.frameLocator('iframe[title="DTF World Lab 3D technology preview"]');
  await expect(frame.locator("#loading")).toBeHidden({ timeout: 20_000 });
  await expect(frame.locator("#error-panel")).toBeHidden();
  await expect(frame.locator("canvas")).toBeVisible();

  const state = await frame.locator("body").evaluate(() => window.__DTF_WORLD_LAB__?.getState?.());
  expect(state).toBeTruthy();
  expect(state.renderer.calls).toBeGreaterThan(0);
  expect(state.renderer.triangles).toBeGreaterThan(0);

  return { frame, runtimeErrors };
}

async function dispatchJump(frame) {
  await frame.locator("canvas").evaluate((canvas) => {
    canvas.dispatchEvent(new KeyboardEvent("keydown", {
      code: "Space",
      key: " ",
      bubbles: true,
      cancelable: true,
    }));
    canvas.dispatchEvent(new KeyboardEvent("keyup", {
      code: "Space",
      key: " ",
      bubbles: true,
      cancelable: true,
    }));
  });
}

test("DTF World Lab initializes a real WebGL world without runtime errors", async ({ page }, testInfo) => {
  const { frame, runtimeErrors } = await openWorldLab(page);
  await expect(frame.locator("#objective-title")).toHaveText("Reach the research greenhouse");
  expect(runtimeErrors, runtimeErrors.join("\n")).toEqual([]);

  await page.screenshot({ path: testInfo.outputPath("dtf-world-lab-initial.png"), fullPage: false });
});

test("DTF World Lab forward input moves toward the greenhouse and jump returns to ground", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium", "Keyboard movement is covered on desktop; mobile controls have a dedicated visibility test.");
  const { frame, runtimeErrors } = await openWorldLab(page);
  const canvas = frame.locator("canvas");

  const before = await frame.locator("body").evaluate(() => window.__DTF_WORLD_LAB__.getState());
  await canvas.focus();
  await page.keyboard.down("w");
  await page.waitForTimeout(900);
  await page.keyboard.up("w");

  const afterMove = await frame.locator("body").evaluate(() => window.__DTF_WORLD_LAB__.getState());
  expect(afterMove.player.z).toBeLessThan(before.player.z - 1.5);
  expect(afterMove.grounded).toBe(true);

  await dispatchJump(frame);
  await page.waitForTimeout(180);
  const airborne = await frame.locator("body").evaluate(() => window.__DTF_WORLD_LAB__.getState());
  expect(airborne.player.y).toBeGreaterThan(0.1);

  await expect.poll(
    async () => frame.locator("body").evaluate(() => window.__DTF_WORLD_LAB__.getState().grounded),
    { timeout: 2500, message: "player should land after jumping" },
  ).toBe(true);

  expect(runtimeErrors, runtimeErrors.join("\n")).toEqual([]);
});

test("DTF World Lab objective can be completed through player movement and interaction", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium", "Long-form objective traversal runs once on desktop to keep browser QA bounded.");
  const { frame, runtimeErrors } = await openWorldLab(page);
  const canvas = frame.locator("canvas");
  const getState = () => frame.locator("body").evaluate(() => window.__DTF_WORLD_LAB__.getState());
  await canvas.focus();

  // Use real held-key input, but stop each leg based on world coordinates instead of runner timing.
  await page.keyboard.down("Shift");
  await page.keyboard.down("w");
  await expect.poll(async () => (await getState()).player.z, {
    timeout: 7000,
    message: "player should reach the greenhouse approach lane",
  }).toBeLessThan(-5);
  await page.keyboard.up("w");

  await page.keyboard.down("d");
  await expect.poll(async () => (await getState()).player.x, {
    timeout: 5000,
    message: "player should line up with the greenhouse center doorway",
  }).toBeGreaterThan(15);
  await page.keyboard.up("d");

  await page.keyboard.down("w");
  await expect.poll(async () => (await getState()).player.z, {
    timeout: 3000,
    message: "player should move through the greenhouse doorway",
  }).toBeLessThan(-9);
  await page.keyboard.up("w");
  await page.keyboard.up("Shift");

  await expect.poll(
    async () => (await getState()).objectiveStage,
    { timeout: 3000, message: "player should enter the greenhouse through the open center doorway" },
  ).toBeGreaterThanOrEqual(1);

  await expect(frame.locator("#prompt")).toBeVisible();
  await canvas.press("e");

  await expect(frame.locator("#complete-card")).toBeVisible();
  const completed = await getState();
  expect(completed.completed).toBe(true);
  expect(completed.objectiveStage).toBe(2);
  expect(runtimeErrors, runtimeErrors.join("\n")).toEqual([]);

  await page.screenshot({ path: testInfo.outputPath("dtf-world-lab-complete.png"), fullPage: false });
});

test("DTF World Lab exposes usable touch controls on mobile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Touch-control assertions only apply to the mobile project.");
  const { frame, runtimeErrors } = await openWorldLab(page);

  await expect(frame.locator("#move-pad")).toBeVisible();
  await expect(frame.locator("#look-pad")).toBeVisible();
  await expect(frame.locator("#jump-button")).toBeVisible();
  await expect(frame.locator("#interact-button")).toBeVisible();

  const overflow = await frame.locator("body").evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `3D iframe horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
  expect(runtimeErrors, runtimeErrors.join("\n")).toEqual([]);

  await page.screenshot({ path: testInfo.outputPath("dtf-world-lab-mobile.png"), fullPage: false });
});
