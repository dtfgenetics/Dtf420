import { expect, test } from "@playwright/test";

const STORAGE_KEY = "dtf420.atlas.observation-notebook.v1";

const baseline = {
  id: "baseline-1",
  createdAt: "2026-08-20T14:00:00.000Z",
  updatedAt: "2026-08-20T14:00:00.000Z",
  observedAt: "2026-08-20T09:00",
  title: "Baseline upper-canopy observation",
  stage: "Vegetative",
  plantArea: "Upper canopy",
  pattern: "Interveinal",
  progression: "Just noticed",
  observations: "Newest leaves are paler than older leaves, with veins remaining more visible. No spotting or necrosis is visible.",
  rootZoneMoisture: "Moderately moist",
  temperatureContext: "78 °F air",
  relativeHumidity: "58",
  ph: "6.2",
  ec: "1.8",
  irrigationContext: "Watered the previous evening.",
  lightAirflowContext: "No recent light change; airflow is even across the upper canopy.",
  workingDifferential: "Root-zone availability; root stress; actual micronutrient shortage.",
  nextCheck: "Repeat root-zone pH and EC using the same calibrated method.",
  status: "Monitoring",
};

const followup = {
  id: "followup-1",
  createdAt: "2026-08-22T14:00:00.000Z",
  updatedAt: "2026-08-22T14:00:00.000Z",
  observedAt: "2026-08-22T09:00",
  title: "Follow-up upper-canopy observation",
  stage: "Vegetative",
  plantArea: "Upper canopy",
  pattern: "Interveinal",
  progression: "Stable",
  observations: "Pale new growth has not expanded into additional nodes. Existing affected tissue remains pale without new necrosis.",
  rootZoneMoisture: "Dry",
  temperatureContext: "80 °F air",
  relativeHumidity: "52",
  ph: "6.4",
  ec: "1.5",
  irrigationContext: "Root zone has dried back since the prior observation and is due for irrigation.",
  lightAirflowContext: "No recent light change; airflow is even across the upper canopy.",
  workingDifferential: "Root-zone availability remains plausible; rapidly progressive toxicity is less consistent with the stable pattern.",
  nextCheck: "Recheck pH and EC after the next irrigation, then compare the newest emerging tissue.",
  status: "Monitoring",
};

const third = {
  ...followup,
  id: "third-1",
  createdAt: "2026-08-24T14:00:00.000Z",
  updatedAt: "2026-08-24T14:00:00.000Z",
  observedAt: "2026-08-24T09:00",
  title: "Third upper-canopy observation",
  progression: "Improving",
  observations: "Newest emerging tissue is closer to the established healthy green baseline while older pale tissue remains visible.",
  ph: "6.3",
  ec: "1.6",
  relativeHumidity: "55",
  rootZoneMoisture: "Moderately moist",
  status: "Resolved",
};

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

async function seedEntries(page, entries) {
  await page.goto("/learn/atlas/notebook/compare", { waitUntil: "networkidle" });
  await page.evaluate(({ key, seeded }) => {
    window.localStorage.setItem(key, JSON.stringify({ version: 1, entries: seeded }));
    window.dispatchEvent(new Event("dtf420-atlas-observation-notebook-change"));
  }, { key: STORAGE_KEY, seeded: entries });
  await page.reload({ waitUntil: "networkidle" });
}

test("Compare Saved Observations shows stable and changed evidence plus numeric deltas", async ({ page }, testInfo) => {
  await seedEntries(page, [followup, baseline]);

  await expect(page.locator('section[aria-label="Observation comparison introduction"]')).toContainText("Track change from recorded evidence, not memory.");
  const summaries = page.locator('section[aria-label="Selected observation summaries"]');
  await expect(summaries).toContainText("Baseline upper-canopy observation");
  await expect(summaries).toContainText("Follow-up upper-canopy observation");

  const matrix = page.locator('section[aria-label="Observation field comparison"]');
  await expect(matrix).toContainText("Growth stage");
  await expect(matrix).toContainText("Same");
  await expect(matrix).toContainText("Progression");
  await expect(matrix).toContainText("Changed");
  await expect(matrix).toContainText("Root-zone moisture");

  const measurements = page.locator('section[aria-label="Measurement comparison"]');
  await expect(measurements).toContainText("Δ +0.2");
  await expect(measurements).toContainText("Δ -0.3 mS/cm");
  await expect(measurements).toContainText("Δ -6%");
  await expect(measurements).toContainText("Context changed");

  await expect(page.locator('section[aria-label="Observed evidence comparison"]')).toContainText("Pale new growth has not expanded");
  await expect(page.locator('section[aria-label="Working differential comparison"]')).toContainText("rapidly progressive toxicity is less consistent");
  await expect(page.locator('section[aria-label="Next discriminating check comparison"]')).toContainText("Recheck pH and EC after the next irrigation");

  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-atlas-observation-compare.png`),
    fullPage: true,
  });
});

test("Compare Saved Observations can switch the follow-up note without allowing self-comparison", async ({ page }) => {
  await seedEntries(page, [third, followup, baseline]);

  const baselineSelect = page.getByLabel("Baseline observation");
  const followupSelect = page.getByLabel("Follow-up observation");

  await baselineSelect.selectOption(baseline.id);
  await followupSelect.selectOption(third.id);

  const summaries = page.locator('section[aria-label="Selected observation summaries"]');
  await expect(summaries).toContainText("Baseline upper-canopy observation");
  await expect(summaries).toContainText("Third upper-canopy observation");
  await expect(page.locator('section[aria-label="Observation field comparison"]')).toContainText("Improving");
  await expect(page.locator('section[aria-label="Measurement comparison"]')).toContainText("Δ +0.1");

  const baselineOptionForThird = baselineSelect.locator(`option[value="${third.id}"]`);
  await expect(baselineOptionForThird).toBeDisabled();
  await expectNoHorizontalOverflow(page);
});

test("Compare Saved Observations explains when fewer than two notes exist", async ({ page }) => {
  await seedEntries(page, [baseline]);
  const needMore = page.locator('section[aria-label="Observation comparison needs more notes"]');
  await expect(needMore).toContainText("Save one more observation to begin comparing.");
  await expect(needMore.getByRole("link", { name: "Open Observation Notebook" })).toHaveAttribute("href", "/learn/atlas/notebook");
  await expectNoHorizontalOverflow(page);

  await seedEntries(page, []);
  await expect(page.locator('section[aria-label="Observation comparison needs more notes"]')).toContainText("Save two observations to begin comparing.");
});

test("Atlas hub and Study Dashboard expose saved observation comparison", async ({ page }) => {
  await page.goto("/learn/atlas", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: "Compare saved observations" })).toHaveAttribute("href", "/learn/atlas/notebook/compare");

  await page.goto("/learn/atlas/dashboard", { waitUntil: "networkidle" });
  const dashboardLink = page.getByRole("link", { name: /Compare Saved Observations/i });
  await expect(dashboardLink).toHaveAttribute("href", "/learn/atlas/notebook/compare");
  await dashboardLink.click();
  await expect(page).toHaveURL(/\/learn\/atlas\/notebook\/compare$/);
  await expect(page.locator('section[aria-label="Observation comparison introduction"]')).toBeVisible();
});
