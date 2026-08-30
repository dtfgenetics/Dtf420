import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("Learn hub exposes clear learning, diagnostic, and reference paths", async ({ page, request }) => {
  await page.goto("/learn", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { level: 1, name: "Understand the plant, not just the recipe." })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Two ways to build real plant knowledge." })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Move from symptoms to evidence." })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Go deeper without getting lost." })).toBeVisible();

  const requiredRoutes = [
    "/learn/academy",
    "/learn/atlas",
    "/learn/search",
    "/learn/plant-health",
    "/learn/symptoms",
    "/learn/atlas/cases",
    "/learn/cultivation-science",
    "/learn/glossary",
    "/learn/sops",
    "/learn/sources",
    "/learn/tools",
    "/learn/atlas/practice",
    "/learn/atlas/review",
    "/learn/atlas/paths",
  ];

  for (const route of requiredRoutes) {
    await expect(page.locator(`main a[href="${route}"]`).first()).toBeVisible();
    const response = await request.get(route);
    expect(response.status(), route).toBeLessThan(400);
  }

  await expectNoHorizontalOverflow(page);
});

test("Learn hub remains readable at 390px and 430px", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "mobile-only responsive coverage");

  for (const width of [390, 430]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/learn");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Start learning" })).toBeVisible();
    await expect(page.getByRole("link", { name: "THC Academy", exact: false }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Living Plant Atlas", exact: false }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Plant Science Glossary", exact: false })).toBeVisible();
    await expect(page.getByRole("link", { name: "Measurement & Observation SOPs", exact: false })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await testInfo.attach(`learn-mobile-${width}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  }
});
