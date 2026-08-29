import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.viewport + 1);
}

async function expectInternalLinksResolve(page) {
  const hrefs = await page
    .locator('header a[href^="/"], main a[href^="/"], footer a[href^="/"]')
    .evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute("href")).filter(Boolean))]);

  for (const href of hrefs) {
    const response = await page.request.get(href);
    expect(response.status(), `${href} should resolve`).toBeLessThan(400);
  }
}

test("homepage shell exposes the intended visual hierarchy and valid destinations", async ({ page }, testInfo) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Better science. Better genetics. Better gardens." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore THC education" })).toHaveAttribute("href", "/learn");
  await expect(page.getByRole("link", { name: "Discover genetics" })).toHaveAttribute("href", "/seeds");
  await expect(page.getByRole("heading", { level: 2, name: "Document the genetics. Understand the plant." })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Observe first. Measure what matters. Make better decisions." })).toBeVisible();
  await expect(page.locator("footer")).toContainText("Dream the Future");

  const mobileProject = testInfo.project.name.includes("mobile");
  if (mobileProject) {
    await expect(page.locator(".desktop-nav")).toBeHidden();
    await expect(page.locator(".mobile-menu")).toBeVisible();
    await page.locator(".mobile-menu summary").click();
    await expect(page.locator(".mobile-menu__panel")).toBeVisible();
    await expect(page.locator(".mobile-menu__panel").getByRole("link", { name: "Genetics" })).toHaveAttribute("href", "/seeds");
  } else {
    await expect(page.locator(".desktop-nav")).toBeVisible();
    await expect(page.locator(".mobile-menu")).toBeHidden();
  }

  await expectNoHorizontalOverflow(page);
  await expectInternalLinksResolve(page);
});

test("mobile homepage remains contained at 390px and 430px", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "mobile-only responsive coverage");

  for (const width of [390, 430]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    await expect(page.locator(".mobile-menu")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Explore THC education" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});
