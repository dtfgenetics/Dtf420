import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const caseBank = [
  ...JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/atlas-diagnostic-cases.json"), "utf8")),
  ...JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/atlas-diagnostic-cases-expanded.json"), "utf8")),
];

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

test("Diagnostic Case Lab renders the complete case bank and keeps lesson links live", async ({ page, request }) => {
  await page.goto("/learn/atlas/cases", { waitUntil: "networkidle" });
  await expect(page.locator('section[aria-label="Diagnostic case lab introduction"]')).toContainText("Reason from evidence before naming a cause.");
  await expect(page.getByRole("navigation", { name: "Atlas diagnostic cases" }).getByRole("button")).toHaveCount(caseBank.length);

  for (const diagnosticCase of caseBank) {
    const selector = page.getByRole("button", { name: new RegExp(diagnosticCase.title, "i") });
    await selector.click();
    const caseSection = page.locator(`section[aria-label="${diagnosticCase.title} diagnostic case"]`);
    await expect(caseSection).toBeVisible();
    await expect(caseSection.locator('section[aria-label="Case observations"] article')).toHaveCount(diagnosticCase.observations.length);

    for (const link of diagnosticCase.links) {
      const response = await request.get(link.route);
      expect(response.status(), `${link.route} should respond successfully`).toBe(200);
      await expect(caseSection.getByRole("link", { name: link.label })).toHaveAttribute("href", link.route);
    }
  }

  await expectNoHorizontalOverflow(page);
});

test("Diagnostic Case Lab explains weak reasoning and reveals the differential after a strong next step", async ({ page }, testInfo) => {
  await page.goto("/learn/atlas/cases", { waitUntil: "networkidle" });
  const caseSection = page.locator('section[aria-label="Upper-canopy chlorosis diagnostic case"]');

  await caseSection.getByRole("radio", { name: /Add a concentrated micronutrient supplement immediately/i }).click();
  await caseSection.getByRole("button", { name: "Check reasoning" }).click();
  await expect(caseSection.getByRole("status")).toContainText("does not separate the strongest competing explanations");
  await expect(caseSection.locator('section[aria-label="Case differential reasoning"]')).toHaveCount(0);

  await caseSection.getByRole("button", { name: "Try another next step" }).click();
  await caseSection.getByRole("radio", { name: /Measure root-zone pH and EC with a consistent method/i }).click();
  await caseSection.getByRole("button", { name: "Check reasoning" }).click();
  await expect(caseSection.getByRole("status")).toContainText("Strong next step.");

  const reasoning = caseSection.locator('section[aria-label="Case differential reasoning"]');
  await expect(reasoning).toContainText("Working differential");
  await expect(reasoning).toContainText("Root-zone pH affecting micronutrient availability");
  await expect(reasoning).toContainText("Young-growth chlorosis narrows the field");
  await expectNoHorizontalOverflow(page);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-atlas-diagnostic-case-lab.png`),
    fullPage: true,
  });
});

test("Practice hub and Study Dashboard expose the Diagnostic Case Lab", async ({ page }) => {
  await page.goto("/learn/atlas", { waitUntil: "networkidle" });
  const atlasNav = page.getByRole("navigation", { name: "Living Plant Atlas sections" });
  await atlasNav.getByRole("link", { name: "Practice", exact: true }).click();
  await expect(page).toHaveURL(/\/learn\/atlas\/practice$/);

  const practiceLink = page.getByRole("link", { name: "Practice diagnostic reasoning" });
  await expect(practiceLink).toHaveAttribute("href", "/learn/atlas/cases");
  await practiceLink.click();
  await expect(page).toHaveURL(/\/learn\/atlas\/cases$/);
  await expect(page.locator('section[aria-label="Diagnostic case lab introduction"]')).toBeVisible();

  await page.goto("/learn/atlas/dashboard", { waitUntil: "networkidle" });
  const dashboardLink = page.getByRole("link", { name: /Open Practice Hub/i });
  await expect(dashboardLink).toHaveAttribute("href", "/learn/atlas/practice");
});
