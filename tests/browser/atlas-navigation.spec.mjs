import { expect, test } from "@playwright/test";

const destinations = [
  ["Dashboard", "/learn/atlas/dashboard"],
  ["Explore", "/learn/atlas"],
  ["Paths", "/learn/atlas/paths"],
  ["Practice", "/learn/atlas/practice"],
  ["Notebook", "/learn/atlas/notebook"],
  ["Mastery", "/learn/atlas/mastery"],
];

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("Atlas section navigation exposes six stable destinations", async ({ page }) => {
  await page.goto("/learn/atlas", { waitUntil: "networkidle" });
  const nav = page.getByRole("navigation", { name: "Living Plant Atlas sections" });

  for (const [label, href] of destinations) {
    await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("href", href);
  }

  await expect(nav.getByRole("link", { name: "Explore", exact: true })).toHaveAttribute("aria-current", "page");
  await expectNoHorizontalOverflow(page);
});

test("Atlas section navigation keeps the right destination active on deep routes", async ({ page }) => {
  const checks = [
    ["/learn/atlas/seed-germination/seed-anatomy", "Explore"],
    ["/learn/atlas/paths/plant-foundations", "Paths"],
    ["/learn/atlas/cases", "Practice"],
    ["/learn/atlas/review", "Practice"],
    ["/learn/atlas/compare", "Practice"],
    ["/learn/atlas/notebook/compare", "Notebook"],
    ["/learn/atlas/mastery", "Mastery"],
  ];

  for (const [route, activeLabel] of checks) {
    await page.goto(route, { waitUntil: "networkidle" });
    const nav = page.getByRole("navigation", { name: "Living Plant Atlas sections" });
    await expect(nav.getByRole("link", { name: activeLabel, exact: true })).toHaveAttribute("aria-current", "page");
    await expectNoHorizontalOverflow(page);
  }
});

test("Practice hub groups review, diagnostic reasoning, and plant-system comparison", async ({ page }, testInfo) => {
  await page.goto("/learn/atlas/practice", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Turn plant knowledge into usable reasoning." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Review weak concepts" })).toHaveAttribute("href", "/learn/atlas/review");
  await expect(page.getByRole("link", { name: "Practice diagnostic reasoning" })).toHaveAttribute("href", "/learn/atlas/cases");
  await expect(page.getByRole("link", { name: "Compare plant systems" })).toHaveAttribute("href", "/learn/atlas/compare");
  await expectNoHorizontalOverflow(page);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-atlas-practice-hub.png`),
    fullPage: true,
  });
});
