import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const glossary = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/education-glossary.json"), "utf8"));

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("Learn hub exposes the Plant Science Glossary", async ({ page }) => {
  await page.goto("/learn", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: /Plant Science Glossary/i })).toHaveAttribute("href", "/learn/glossary");
  await expectNoHorizontalOverflow(page);
});

test("Glossary searches definitions and preserves related learning links", async ({ page }) => {
  await page.goto("/learn/glossary", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Plant Science Glossary", exact: true })).toBeVisible();
  await expect(page.getByText("indexed terms", { exact: true })).toBeVisible();
  await expect(page.getByText(String(glossary.length), { exact: true }).first()).toBeVisible();

  const search = page.getByLabel("Search terms and definitions");
  await search.fill("VPD");

  const vpdCard = page.locator("#vapor-pressure-deficit");
  await expect(vpdCard.getByRole("heading", { name: "Vapor pressure deficit (VPD)", exact: true })).toBeVisible();
  await expect(vpdCard.getByRole("link", { name: /Study related topic/i })).toHaveAttribute("href", "/learn/atlas/environment-overlay/vpd-and-transpiration");
  await expectNoHorizontalOverflow(page);
});

test("Glossary category filtering and empty state remain usable", async ({ page }) => {
  await page.goto("/learn/glossary", { waitUntil: "networkidle" });
  await page.getByLabel("Category").selectOption("Diagnostics");
  await page.getByLabel("Search terms and definitions").fill("chlorosis");
  await expect(page.locator("#chlorosis")).toBeVisible();

  await page.getByLabel("Search terms and definitions").fill("xyzzynothing");
  await expect(page.getByRole("heading", { name: "No glossary match", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters", exact: true }).click();
  await expect(page.getByLabel("Category")).toHaveValue("All");
  await expectNoHorizontalOverflow(page);
});

test("Unified education search can filter directly to glossary terms", async ({ page }) => {
  await page.goto("/learn/search", { waitUntil: "networkidle" });
  await page.getByLabel("Search the education system").fill("rhizosphere");
  await page.getByLabel("Filter education search").selectOption("Glossary term");
  const result = page.locator('a[href="/learn/glossary#rhizosphere"]').first();
  await expect(result).toContainText("Rhizosphere");
  await expectNoHorizontalOverflow(page);
});

test("Glossary is discoverable from the public sitemap", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain("https://dtfseeds.com/learn/glossary");
});
