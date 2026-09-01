import { expect, test } from "@playwright/test";

async function openPhenoQuest(page) {
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await page.goto("/games/phenoquest", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "PhenoQuest: The Living Seed Vault", exact: true })).toBeVisible();

  const frame = page.frameLocator('iframe[title="PhenoQuest 3D game preview"]');
  await expect(frame.locator("#loading")).toBeHidden({ timeout: 20_000 });
  await expect(frame.locator("#error-panel")).toBeHidden();
  await expect(frame.locator("canvas")).toBeVisible();

  const state = await frame.locator("body").evaluate(() => window.__PHENOQUEST__?.getState?.());
  expect(state).toBeTruthy();
  expect(state.renderer.calls).toBeGreaterThan(0);
  expect(state.renderer.triangles).toBeGreaterThan(0);
  return { frame, runtimeErrors };
}

test("PhenoQuest initializes a real WebGL world with six canonical Phenos", async ({ page }, testInfo) => {
  const { frame, runtimeErrors } = await openPhenoQuest(page);
  await expect(frame.locator("#objective-title")).toHaveText("Choose a starter Pheno");
  expect(runtimeErrors, runtimeErrors.join("\n")).toEqual([]);

  await page.locator('iframe[title="PhenoQuest 3D game preview"]').screenshot({
    path: testInfo.outputPath("phenoquest-initial.png"),
  });
});

test("PhenoQuest starter choice and PhenoLog persist in the local save", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium", "Keyboard starter flow is covered on desktop; mobile controls have a dedicated test.");
  const { frame, runtimeErrors } = await openPhenoQuest(page);
  const canvas = frame.locator("canvas");

  await canvas.focus();
  await page.keyboard.down("w");
  await page.waitForTimeout(850);
  await page.keyboard.up("w");
  await canvas.press("e");

  await expect(frame.locator("#starter-panel")).toBeVisible();
  const starter = frame.getByRole("button").filter({ hasText: "Citravale" }).first();
  await starter.click();

  await expect(frame.locator("#active-name")).toHaveText("Citravale");
  let state = await frame.locator("body").evaluate(() => window.__PHENOQUEST__.getState());
  expect(state.activeId).toBe("citravale");
  expect(state.archived).toContain("citravale");

  await frame.getByRole("button", { name: "PhenoLog" }).click();
  await expect(frame.locator("#log-panel")).toBeVisible();
  await expect(frame.locator("#log-summary")).toContainText("1 of 6 Phenos archived");
  await expect(frame.locator("#log-grid")).toContainText("Citravale");
  await frame.getByRole("button", { name: "Close PhenoLog" }).click();

  await page.reload({ waitUntil: "domcontentloaded" });
  const reloaded = page.frameLocator('iframe[title="PhenoQuest 3D game preview"]');
  await expect(reloaded.locator("#loading")).toBeHidden({ timeout: 20_000 });
  await expect(reloaded.locator("#active-name")).toHaveText("Citravale");
  state = await reloaded.locator("body").evaluate(() => window.__PHENOQUEST__.getState());
  expect(state.archived).toContain("citravale");
  expect(runtimeErrors, runtimeErrors.join("\n")).toEqual([]);

  await page.locator('iframe[title="PhenoQuest 3D game preview"]').screenshot({
    path: testInfo.outputPath("phenoquest-starter-save.png"),
  });
});

test("PhenoQuest movement and jump respond to focused game input", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium", "Keyboard movement is covered on desktop.");
  const { frame, runtimeErrors } = await openPhenoQuest(page);
  const canvas = frame.locator("canvas");
  const before = await frame.locator("body").evaluate(() => window.__PHENOQUEST__.getState());

  await canvas.focus();
  await page.keyboard.down("w");
  await page.waitForTimeout(700);
  await page.keyboard.up("w");
  const afterMove = await frame.locator("body").evaluate(() => window.__PHENOQUEST__.getState());
  expect(afterMove.player.z).toBeLessThan(before.player.z - 1.2);

  await canvas.press("Space");
  await page.waitForTimeout(180);
  const airborne = await frame.locator("body").evaluate(() => window.__PHENOQUEST__.getState());
  expect(airborne.player.y).toBeGreaterThan(0.1);

  await expect.poll(
    async () => frame.locator("body").evaluate(() => window.__PHENOQUEST__.getState().player.y),
    { timeout: 2500, message: "PhenoQuest player should land after jumping" },
  ).toBe(0);
  expect(runtimeErrors, runtimeErrors.join("\n")).toEqual([]);
});

test("PhenoQuest exposes contained touch controls on mobile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Touch assertions only apply to the mobile project.");
  const { frame, runtimeErrors } = await openPhenoQuest(page);

  await expect(frame.locator("#move-pad")).toBeVisible();
  await expect(frame.locator("#look-pad")).toBeVisible();
  await expect(frame.locator("#jump-button")).toBeVisible();
  await expect(frame.locator("#interact-button")).toBeVisible();
  const overflow = await frame.locator("body").evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `PhenoQuest iframe horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
  expect(runtimeErrors, runtimeErrors.join("\n")).toEqual([]);

  await page.locator('iframe[title="PhenoQuest 3D game preview"]').screenshot({
    path: testInfo.outputPath("phenoquest-mobile.png"),
  });
});
