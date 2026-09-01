import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

async function expectGameBelowStickyHeader(page) {
  await expect.poll(async () => page.evaluate(() => {
    const game = document.getElementById("grower-conversations-game");
    const header = document.querySelector("header");
    if (!game || !header) return Number.NEGATIVE_INFINITY;
    return game.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
  }), {
    message: "Grower Conversations game shell should settle below the sticky header",
    timeout: 5000,
  }).toBeGreaterThanOrEqual(-2);
}

test("Grower Conversations plays a prompt, follow-up, and hidden multiplayer handoff", async ({ page }) => {
  await page.goto("/games/grower-conversations", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "Grower Conversations", exact: true })).toBeVisible();
  await expect(page.getByText("48 starter prompts", { exact: true })).toBeVisible();
  await expect(page.getByText(/No right answers\. No points\./)).toBeVisible();

  await page.getByRole("button", { name: "Start conversation" }).click();
  await expectGameBelowStickyHeader(page);
  await expect(page.getByText("PLAYER 1", { exact: true })).toBeVisible();

  const followButton = page.getByRole("button", { name: "Show follow-up" });
  await followButton.click();
  await expect(page.getByText("GO DEEPER", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Discussed · Next" }).click();
  await expect(page.getByText("PASS THE DEVICE", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Player 2, you’re up." })).toBeVisible();
  await expect(page.getByText("GO DEEPER", { exact: true })).toBeHidden();

  await page.getByRole("button", { name: "Reveal my card" }).click();
  await expect(page.getByText("PLAYER 2", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await expect(page.getByText("PASS THE DEVICE", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Player 1, you’re up." })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("Grower Conversations trims sessions to equal turns for every player", async ({ page }) => {
  await page.goto("/games/grower-conversations", { waitUntil: "networkidle" });
  const addPlayer = page.getByRole("button", { name: "+ Add player" });
  await addPlayer.click();
  await addPlayer.click();
  await addPlayer.click();
  await expect(page.getByText("10 turns will be dealt.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Start conversation" }).click();
  await expect(page.getByRole("heading", { name: /Turn 1/ })).toBeVisible();
  await expect(page.getByText("/ 10", { exact: true })).toBeVisible();
});

test("Grower Conversations category and depth filters change the available pool", async ({ page }) => {
  await page.goto("/games/grower-conversations", { waitUntil: "networkidle" });
  await page.getByLabel("Category").selectOption("Genetics & Breeding");
  await expect(page.getByText("8 prompts match", { exact: true })).toBeVisible();
  await page.getByLabel("Conversation depth").selectOption("Debate");
  await expect(page.getByText("2 prompts match", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start conversation" })).toBeDisabled();
});

test("Grower Conversations remains usable at 390px mobile width", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/games/grower-conversations", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Start conversation" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.locator("#grower-conversations-game").screenshot({ path: testInfo.outputPath("grower-conversations-mobile-setup.png") });

  await page.getByRole("button", { name: "Start conversation" }).click();
  await expectGameBelowStickyHeader(page);
  await expect(page.getByRole("button", { name: "Discussed · Next" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Skip", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.locator("#grower-conversations-game").screenshot({ path: testInfo.outputPath("grower-conversations-mobile-playing.png") });
});
