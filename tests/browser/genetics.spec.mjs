import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const projects = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/genetics-projects.json"), "utf8"));

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("Genetics library exposes every permanent project route", async ({ page, request }) => {
  await page.goto("/seeds", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Genetics", exact: true })).toBeVisible();

  for (const project of projects) {
    const route = `/seeds/${project.slug}`;
    const projectCard = page.locator(`a[href="${route}"]`).first();
    await expect(projectCard).toContainText(project.name);
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
  }

  await expectNoHorizontalOverflow(page);
});

test("Blue Mango publishes generation history without presenting planned generations as completed releases", async ({ page }) => {
  await page.goto("/seeds/blue-mango", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Blue Mango", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recorded breeding progression", exact: true })).toBeVisible();

  const generationSection = page.locator('section[aria-labelledby="generation-history"]');
  await expect(generationSection).toContainText("F1");
  await expect(generationSection).toContainText("F2");
  await expect(generationSection).toContainText("F3");
  await expect(generationSection).toContainText("F4");
  await expect(generationSection).toContainText("F5");
  await expect(generationSection).toContainText("Later-generation project direction");
  await expect(generationSection).toContainText("does not assert a release date or completion state");

  await expect(page.getByRole("heading", { name: "Traits being preserved or selected toward", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Mango Bubbles", exact: true })).toHaveAttribute("href", "/seeds/mango-bubbles");
  await expectNoHorizontalOverflow(page);
});

test("Mango Bubbles preserves its locked name milestone and both parent links", async ({ page }) => {
  await page.goto("/seeds/mango-bubbles", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Mango Bubbles", exact: true })).toBeVisible();

  const chronology = page.locator('section[aria-labelledby="record-milestones"]');
  await expect(chronology).toContainText("June 15, 2026");
  await expect(chronology).toContainText("Project name locked");

  const related = page.locator('section[aria-labelledby="related-projects"]');
  await expect(related.getByRole("link", { name: "Blue Mango", exact: true })).toHaveAttribute("href", "/seeds/blue-mango");
  await expect(related.getByRole("link", { name: "Blue Bubblegum", exact: true })).toHaveAttribute("href", "/seeds/blue-bubblegum");
  await expectNoHorizontalOverflow(page);
});
