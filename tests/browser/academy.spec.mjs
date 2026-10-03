import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("legacy Academy root points to canonical course systems", async ({ page }) => {
  await page.goto("/learn/academy", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "THC Academy has moved." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open professional courses" })).toHaveAttribute("href", "/courses/");
  await expect(page.getByRole("link", { name: "Open the Learning Hub" })).toHaveAttribute("href", "/learn/learning-hub/");
  await expect(page.getByRole("link", { name: "Open the 420-entry Encyclopedia" })).toHaveAttribute("href", "/learn/encyclopedia/");
  await expect(page.getByText(/12-guide Academy and THC-C001–THC-C420 catalog/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Open course →" })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("legacy Academy child routes no longer present archived guides as courses", async ({ page }) => {
  await page.goto("/learn/academy/environment-light-vpd", { waitUntil: "networkidle" });
  await expect(page.getByText("Legacy THC Academy compatibility")).toBeVisible();
  await expect(page.getByText(/no longer an active course/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Open professional courses" })).toHaveAttribute("href", "/courses/");
  await expect(page.getByRole("link", { name: "Open Learning Hub" })).toHaveAttribute("href", "/learn/learning-hub/");
  await expect(page.getByRole("heading", { name: "Applied exercises" })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});
