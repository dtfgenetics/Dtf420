import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("Tools hub prioritizes GrowLens and Grow Doc with valid connected references", async ({ page, request }) => {
  await page.goto("/tools", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { level: 1, name: "Better evidence makes better grow decisions." })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "GrowLens" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Grow Doc" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Observe. Measure. Compare." })).toBeVisible();

  const routes = [
    "/tools/growlens",
    "/tools/grow-doc",
    "/learn/tools",
    "/learn/atlas/cases",
    "/learn/symptoms",
    "/learn/sources",
    "/learn/atlas",
    "/learn/search",
  ];

  for (const route of routes) {
    await expect(page.locator(`main a[href="${route}"]`).first()).toBeVisible();
    const response = await request.get(route);
    expect(response.status(), route).toBeLessThan(400);
  }

  await expectNoHorizontalOverflow(page);
});

test("Tools hub remains contained at 390px and 430px", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "mobile-only responsive coverage");

  for (const width of [390, 430]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/tools");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('main a[href="/tools/growlens"]')).toBeVisible();
    await expect(page.locator('main a[href="/tools/grow-doc"]')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await testInfo.attach(`tools-mobile-${width}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  }
});
