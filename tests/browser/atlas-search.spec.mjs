import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

async function openSearch(page) {
  await page.goto("/learn/atlas/search", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Find the structure, stage, measurement, case, or tool you need." })).toBeVisible();
  return page.getByLabel("Search the Atlas");
}

test("Atlas search finds exact lessons, diagnostic cases, and tools", async ({ page }, testInfo) => {
  const search = await openSearch(page);

  await search.fill("VPD");
  const vpdResult = page.getByRole("link", { name: /VPD & transpiration/i }).first();
  await expect(vpdResult).toHaveAttribute("href", "/learn/atlas/environment-overlay/vpd-and-transpiration");

  await search.fill("yellow lower leaves");
  const results = page.locator('section[aria-label="Atlas search results"]');
  await expect(results).toContainText("Lower-leaf yellowing");
  await expect(results).toContainText("Diagnostic case");

  await search.fill("notebook");
  const notebookResult = page.getByRole("link", { name: /Observation Notebook/i }).first();
  await expect(notebookResult).toHaveAttribute("href", "/learn/atlas/notebook");

  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-atlas-search.png`),
    fullPage: true,
  });
});

test("Atlas search provides examples and a useful no-results state", async ({ page }) => {
  const search = await openSearch(page);

  await page.getByRole("button", { name: "trichomes", exact: true }).click();
  await expect(search).toHaveValue("trichomes");
  await expect(page.locator('section[aria-label="Atlas search results"]')).toContainText("Trichome types");

  await search.fill("xyzzynothing");
  await expect(page.locator('section[aria-label="Atlas search results"]')).toContainText("No Atlas matches yet.");
  await expect(page.locator('aside[aria-label="Atlas search scope"]')).toContainText("Search is for discovery, not diagnosis.");
  await expectNoHorizontalOverflow(page);
});

test("Atlas navigation exposes search without adding another core section tab", async ({ page }) => {
  await page.goto("/learn/atlas", { waitUntil: "networkidle" });
  const nav = page.getByRole("navigation", { name: "Living Plant Atlas sections" });
  const searchLink = nav.getByRole("link", { name: "Search", exact: true });
  await expect(searchLink).toHaveAttribute("href", "/learn/atlas/search");
  await searchLink.click();
  await expect(page).toHaveURL(/\/learn\/atlas\/search$/);
  await expect(page.getByLabel("Search the Atlas")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("Study Dashboard Start Here choices orient learners by intent", async ({ page }) => {
  await page.goto("/learn/atlas/dashboard", { waitUntil: "networkidle" });
  const start = page.locator('section[aria-label="Atlas start here choices"]');

  await expect(start).toContainText("What are you here to do?");
  await expect(start.getByRole("link", { name: /Learn how the plant works/i })).toHaveAttribute("href", "/learn/atlas");
  await expect(start.getByRole("link", { name: /Start from the beginning/i })).toHaveAttribute("href", "/learn/atlas/paths");
  await expect(start.getByRole("link", { name: /Figure out what I am seeing/i })).toHaveAttribute("href", "/learn/atlas/cases");
  await expect(start.getByRole("link", { name: "Search instead" })).toHaveAttribute("href", "/learn/atlas/search");
  await expectNoHorizontalOverflow(page);
});
