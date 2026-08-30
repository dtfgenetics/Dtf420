import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const growOffs = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/community-growoffs.json"), "utf8"));

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("Community hub exposes permanent grow-off records", async ({ page }) => {
  await page.goto("/community", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: /Grow-off rules/i }).first()).toHaveAttribute("href", "/community/grow-offs");
  await expect(page.getByRole("heading", { name: "Permanent rules are not the same as a currently open event.", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("Grow-off library exposes every permanent event route", async ({ page, request }) => {
  await page.goto("/community/grow-offs", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Grow-Offs", exact: true })).toBeVisible();

  for (const event of growOffs) {
    const route = `/community/grow-offs/${event.slug}`;
    await expect(page.getByRole("link", { name: new RegExp(event.title, "i") })).toHaveAttribute("href", route);
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
  }

  await expectNoHorizontalOverflow(page);
});

test("Solo Cup rules preserve the locked format without claiming registration is open", async ({ page }) => {
  await page.goto("/community/grow-offs/solo-cup-grow-off", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "THC Solo Cup Grow-Off", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Rules reference, not an open-registration notice", exact: true })).toBeVisible();

  const rules = page.locator('section[aria-labelledby="growoff-rules"]');
  await expect(rules).toContainText("500 mL");
  await expect(rules).toContainText("Indoor grows only");
  await expect(rules).toContainText("each week");
  await expect(rules).toContainText("Autoflowers are allowed");

  const timeline = page.locator('section[aria-labelledby="growoff-timeline"]');
  await expect(timeline).toContainText("April 20");
  await expect(timeline).toContainText("June 1");
  await expect(timeline).toContainText("August 10");
  await expect(timeline).toContainText("September 1");

  await expect(page.locator('section[aria-labelledby="growoff-judging"]')).toContainText("community voting with staff review");
  await expectNoHorizontalOverflow(page);
});

test("Freebie Grow-Off preserves its one locked deadline and tagline", async ({ page }) => {
  await page.goto("/community/grow-offs/freebie-grow-off", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Freebie Grow-Off", exact: true })).toBeVisible();
  await expect(page.getByText("That freebie you forgot about might be the one.", { exact: true })).toBeVisible();
  await expect(page.locator('section[aria-labelledby="growoff-rules"]')).toContainText("December 1");
  await expect(page.locator('section[aria-labelledby="growoff-timeline"]')).toContainText("December 1");
  await expect(page.getByRole("heading", { name: "Rules reference, not an open-registration notice", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("Sitemap indexes the grow-off library and every permanent event record", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const xml = await sitemap.text();
  expect(xml).toContain("https://dtfseeds.com/community/grow-offs");
  for (const event of growOffs) {
    expect(xml).toContain(`https://dtfseeds.com/community/grow-offs/${event.slug}`);
  }
});
