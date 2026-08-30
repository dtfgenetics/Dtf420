import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const sops = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/education-sops.json"), "utf8"));

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("Learn hub exposes the SOP library and every SOP route responds", async ({ page, request }) => {
  await page.goto("/learn", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: /Measurement & Observation SOPs/i })).toHaveAttribute("href", "/learn/sops");

  await page.goto("/learn/sops", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Measurement & Observation SOPs", exact: true })).toBeVisible();
  for (const sop of sops) {
    const route = `/learn/sops/${sop.slug}`;
    const card = page.locator(`a[href="${route}"]`).first();
    await expect(card).toContainText(sop.title);
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
  }
  await expectNoHorizontalOverflow(page);
});

test("pH SOP renders ordered method, quality checks, records, and print action", async ({ page }) => {
  await page.goto("/learn/sops/ph-meter-calibration-and-measurement", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "pH Meter Calibration & Measurement", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Print this SOP", exact: true })).toBeVisible();
  await expect(page.locator('section[aria-labelledby="sop-procedure"]')).toContainText("Step 1");
  await expect(page.locator('section[aria-labelledby="sop-procedure"]')).toContainText("Calibrate");
  await expect(page.locator('section[aria-labelledby="sop-verification"]')).toContainText("Calibration routine passes");
  await expect(page.locator('section[aria-labelledby="sop-records"]')).toContainText("calibration date/time");
  await expect(page.locator('section[aria-labelledby="sop-limitations"]')).toContainText("pH does not directly report nutrient concentration");
  await expectNoHorizontalOverflow(page);
});

test("DLI SOP preserves calculation basis and units", async ({ page }) => {
  await page.goto("/learn/sops/dli-calculation-and-logging", { waitUntil: "networkidle" });
  const procedure = page.locator('section[aria-labelledby="sop-procedure"]');
  await expect(procedure).toContainText("PPFD × light seconds per day ÷ 1,000,000");
  await expect(procedure).toContainText("mol m⁻² d⁻¹");
  await expect(page.locator('section[aria-labelledby="sop-limitations"]')).toContainText("does not preserve the timing");
  await expectNoHorizontalOverflow(page);
});

test("Unified education search can filter directly to SOPs", async ({ page }) => {
  await page.goto("/learn/search", { waitUntil: "networkidle" });
  await page.getByLabel("Search the education system").fill("pH meter");
  await page.getByLabel("Filter education search").selectOption("SOP");
  const result = page.locator('a[href="/learn/sops/ph-meter-calibration-and-measurement"]').first();
  await expect(result).toContainText("pH Meter Calibration & Measurement");
  await expectNoHorizontalOverflow(page);
});

test("SOP routes are discoverable from the public sitemap", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const xml = await sitemap.text();
  expect(xml).toContain("https://dtfseeds.com/learn/sops");
  expect(xml).toContain("https://dtfseeds.com/learn/sops/ph-meter-calibration-and-measurement");
  expect(xml).toContain("https://dtfseeds.com/learn/sops/plant-health-scouting-record");
});
