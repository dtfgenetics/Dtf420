import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("Strain Showdown launches from the Games hub and resolves representative Tier 1 battles", async ({ page }) => {
  await page.goto("/games", { waitUntil: "networkidle" });
  const launch = page.getByRole("link", { name: "Test Strain Showdown Battle Lab", exact: true });
  await expect(launch).toHaveAttribute("href", "/games/strain-showdown");
  await launch.click();
  await expect(page).toHaveURL(/\/games\/strain-showdown$/);

  await expect(page.getByRole("heading", { name: "Strain Showdown", exact: true })).toBeVisible();
  await expect(page.getByText("48", { exact: true })).toBeVisible();
  await expect(page.getByText(/Development preview · rules lab/i)).toBeVisible();
  await expect(page.getByText(/experimental ruleset/i)).toBeVisible();

  await expect(page.getByRole("heading", { name: "Chemdawg", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hindu Kush", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Resolve showdown", exact: true }).click();
  await expect(page.getByText("Attacker wins", { exact: true })).toBeVisible();
  await expect(page.getByText(/Final Vigor 1–0/i)).toBeVisible();

  const attacker = page.locator("fieldset").nth(0);
  const defender = page.locator("fieldset").nth(1);
  await attacker.getByLabel("Family").selectOption("Skunk");
  await attacker.getByLabel("Strain").selectOption("skunk-1");
  await defender.getByLabel("Family").selectOption("Gas");
  await defender.getByLabel("Strain").selectOption("chemdawg");
  await page.getByRole("button", { name: "Resolve showdown", exact: true }).click();
  await expect(page.getByText("Double knockout", { exact: true })).toBeVisible();
  await expect(page.getByText(/Skunk #1 vs Chemdawg/i)).toBeVisible();

  await expectNoHorizontalOverflow(page);
});

test("Strain Showdown distinguishes resolved and unresolved lineage review", async ({ page }) => {
  await page.goto("/games/strain-showdown", { waitUntil: "networkidle" });

  const attacker = page.locator("fieldset").nth(0);
  await attacker.getByLabel("Family").selectOption("Haze");
  await attacker.getByLabel("Strain").selectOption("mango-haze");
  await expect(page.getByRole("heading", { name: "Mango Haze", exact: true })).toBeVisible();
  await expect(page.getByText("Lineage source review still open", { exact: true })).toHaveCount(0);

  await attacker.getByLabel("Family").selectOption("Fruit");
  await attacker.getByLabel("Strain").selectOption("mango-kush");
  await expect(page.getByRole("heading", { name: "Mango Kush", exact: true })).toBeVisible();
  await expect(page.getByText("Lineage source review still open", { exact: true })).toBeVisible();
});

test("Strain Showdown Battle Lab remains usable at the 390px phone target", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/games/strain-showdown", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "Strain Showdown", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Resolve showdown", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Resolve showdown", exact: true }).click();
  await expect(page.getByText("Attacker wins", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/strain-showdown-mobile.png", fullPage: true });
});
