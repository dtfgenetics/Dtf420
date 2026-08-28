import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("THC Academy exposes guided courses and course detail routes", async ({ page }) => {
  await page.goto("/learn/academy", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "THC Academy", exact: true })).toBeVisible();
  await expect(page.getByText("12", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("60", { exact: true }).first()).toBeVisible();

  const firstCourse = page.getByRole("link", { name: "Open course →" }).first();
  await expect(firstCourse).toHaveAttribute("href", "/learn/academy/evidence-observation-diagnosis");
  await firstCourse.click();

  await expect(page).toHaveURL(/\/learn\/academy\/evidence-observation-diagnosis$/);
  await expect(page.getByRole("heading", { name: "Evidence, Observation & Diagnosis" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What you should be able to do" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Applied exercises" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Evidence packet and ranked differential" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("Academy course connects to real learning resources", async ({ page }) => {
  await page.goto("/learn/academy/environment-light-vpd", { waitUntil: "networkidle" });

  await expect(page.getByRole("link", { name: /VPD & transpiration/i }).first()).toHaveAttribute(
    "href",
    "/learn/atlas/environment-overlay/vpd-and-transpiration",
  );
  await expect(page.getByRole("link", { name: /Open related learning tool/i }).first()).toHaveAttribute(
    "href",
    "/learn/tools/vpd-environment-log",
  );
  await expect(page.getByRole("link", { name: /Search all education/i })).toHaveAttribute("href", "/learn/search");
  await expectNoHorizontalOverflow(page);
});
