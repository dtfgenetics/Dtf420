import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

async function expectGameBelowStickyHeader(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const positions = await page.evaluate(() => {
    const game = document.getElementById("bud-or-bluff-game");
    const header = document.querySelector("header");
    if (!game || !header) return null;
    return {
      gameTop: game.getBoundingClientRect().top,
      headerBottom: header.getBoundingClientRect().bottom,
    };
  });
  expect(positions).not.toBeNull();
  expect(positions.gameTop).toBeGreaterThanOrEqual(positions.headerBottom - 2);
}

test("Bud or Bluff master web pool includes Dick Pix pedigree", async () => {
  const source = fs.readFileSync(path.resolve("lib/games/bud-or-bluff.ts"), "utf8");
  expect(source).toContain('realCard("BOB-121", "Dick Pix", "Hard", "No-Way Real"');
  expect(source).toContain('lineage: "Pixy Drip × Moby Dick"');
  expect(source).toContain("User-supplied breeder genetic pedigree, verified 2026-08-29");
});

test("Bud or Bluff plays a complete guess, reveal, and multiplayer handoff", async ({ page }) => {
  await page.goto("/games/bud-or-bluff", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "Bud or Bluff", exact: true })).toBeVisible();
  await expect(page.getByText("50 curated cards", { exact: false })).toBeVisible();
  await expect(page.getByText(/answer order is not predictable/i)).toBeVisible();

  const timerToggle = page.getByRole("checkbox", { name: "20-second turn timer" });
  await timerToggle.uncheck();
  await page.getByRole("button", { name: "Start game" }).click();
  await expectGameBelowStickyHeader(page);

  await expect(page.getByText("REAL STRAIN OR FAKE NAME?", { exact: true })).toBeVisible();
  const budButton = page.getByRole("button", { name: /BUD That strain is real/i });
  const bluffButton = page.getByRole("button", { name: /BLUFF That name is fake/i });
  await expect(budButton).toBeEnabled();
  await expect(bluffButton).toBeEnabled();

  await budButton.click();
  await expect(page.getByText(/Correct\.|Wrong call\./)).toBeVisible();
  const nextButton = page.getByRole("button", { name: /Next turn|See final scores/ });
  await expect(nextButton).toBeVisible();
  await nextButton.click();

  await expect(page.getByText("Pass the device", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Player 2, you’re up\./ })).toBeVisible();
  await expect(page.getByText("REAL STRAIN OR FAKE NAME?", { exact: true })).toBeHidden();
  await expectGameBelowStickyHeader(page);

  await page.getByRole("button", { name: /Ready · show card/i }).click();
  await expect(page.getByText("REAL STRAIN OR FAKE NAME?", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("Bud or Bluff gives multiplayer competitors equal turn counts", async ({ page }) => {
  await page.goto("/games/bud-or-bluff", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "+ Add player" }).click();
  await expect(page.getByText(/use 18 cards so every player gets the same number of turns/i)).toBeVisible();
  await page.getByRole("checkbox", { name: "20-second turn timer" }).uncheck();
  await page.getByRole("button", { name: "Start game" }).click();
  await expect(page.getByText("1/18", { exact: true })).toBeVisible();
});

test("Bud or Bluff protects an active session from accidental quit", async ({ page }) => {
  await page.goto("/games/bud-or-bluff", { waitUntil: "networkidle" });
  await page.getByRole("checkbox", { name: "20-second turn timer" }).uncheck();
  await page.getByRole("button", { name: "Start game" }).click();

  await page.getByRole("button", { name: "End session" }).click();
  await expect(page.getByText("End this session?", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Keep playing" }).click();
  await expect(page.getByText("REAL STRAIN OR FAKE NAME?", { exact: true })).toBeVisible();
});

test("Bud or Bluff remains playable at 390px mobile width", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/games/bud-or-bluff", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Start game" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.locator("#bud-or-bluff-game").screenshot({ path: testInfo.outputPath("bud-or-bluff-mobile-setup.png") });

  await page.getByRole("checkbox", { name: "20-second turn timer" }).uncheck();
  await page.getByRole("button", { name: "Start game" }).click();
  await expectGameBelowStickyHeader(page);
  await expect(page.getByRole("button", { name: /BUD That strain is real/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /BLUFF That name is fake/i })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.locator("#bud-or-bluff-game").screenshot({ path: testInfo.outputPath("bud-or-bluff-mobile-playing.png") });
});

test("Games hub exposes Bud or Bluff as a playable game", async ({ page }) => {
  await page.goto("/games", { waitUntil: "networkidle" });
  const link = page.getByRole("link", { name: "Play Bud or Bluff", exact: true });
  await expect(link).toHaveAttribute("href", "/games/bud-or-bluff");
  await expectNoHorizontalOverflow(page);
});
