import { expect, test } from "@playwright/test";

const STORAGE_KEY = "dtf420.atlas.observation-notebook.v1";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

async function resetNotebook(page) {
  await page.goto("/learn/atlas/notebook", { waitUntil: "networkidle" });
  await page.evaluate((key) => window.localStorage.removeItem(key), STORAGE_KEY);
  await page.reload({ waitUntil: "networkidle" });
}

async function createObservation(page) {
  await page.getByLabel("Observation title *").fill("Upper-canopy pale new growth");
  await page.getByLabel("Growth stage").selectOption({ label: "Vegetative" });
  await page.getByLabel("Plant area / location").selectOption({ label: "Upper canopy" });
  await page.getByLabel("Visible pattern").selectOption({ label: "Interveinal" });
  await page.getByLabel("Progression").selectOption({ label: "Slowly expanding" });
  await page.getByLabel("What do you actually see? *").fill("Newest leaves are paler than older leaves, with veins remaining somewhat more visible. No spotting or necrosis is visible.");
  await page.getByLabel("Root-zone moisture").selectOption({ label: "Moderately moist" });
  await page.getByLabel("Temperature context").fill("78 °F air, 80 °F leaf");
  await page.getByLabel("Relative humidity (%)").fill("58");
  await page.getByLabel("Root-zone pH").fill("6.2");
  await page.getByLabel("EC (mS/cm)").fill("1.8");
  await page.getByLabel("Irrigation context").fill("Watered yesterday; symptom was present before irrigation and is still visible today.");
  await page.getByLabel("Light / airflow context").fill("Upper canopy only; no recent light increase and airflow is similar across the canopy.");
  await page.getByLabel("Working differential").fill("Root-zone pH limiting availability; root stress affecting uptake; actual micronutrient shortage in the supplied solution.");
  await page.getByLabel("Best next observation / measurement").fill("Repeat root-zone pH and EC with the same calibrated method, then compare new growth after the measurement is confirmed.");
  await page.getByLabel("Status").selectOption({ label: "Monitoring" });
  await page.getByRole("button", { name: "Save observation" }).click();
}

test("Observation Notebook saves structured evidence, persists it, and supports editing", async ({ page }, testInfo) => {
  await resetNotebook(page);
  await expect(page.locator('section[aria-label="Atlas observation notebook introduction"]')).toContainText("Record evidence before you decide what it means.");
  await expect(page.locator('section[aria-label="Saved observation notes"]')).toContainText("No observations saved yet.");

  await createObservation(page);
  await expect(page.getByRole("status")).toContainText("Observation saved on this device.");

  let savedNote = page.locator('section[aria-label="Saved observation notes"] article').filter({ hasText: "Upper-canopy pale new growth" });
  await expect(savedNote).toContainText("Monitoring");
  await expect(savedNote).toContainText("Interveinal");
  await expect(savedNote).toContainText("6.2");
  await expect(savedNote).toContainText("Next discriminating check");

  await page.reload({ waitUntil: "networkidle" });
  savedNote = page.locator('section[aria-label="Saved observation notes"] article').filter({ hasText: "Upper-canopy pale new growth" });
  await expect(savedNote).toBeVisible();

  await savedNote.getByRole("button", { name: "Edit" }).click();
  await expect(page.getByRole("button", { name: "Save changes" })).toBeVisible();
  await page.getByLabel("Progression").selectOption({ label: "Stable" });
  await page.getByLabel("Best next observation / measurement").fill("Recheck root-zone pH and EC in 24 hours, then compare whether the newest tissue remains stable or expands.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toContainText("Observation updated.");

  savedNote = page.locator('section[aria-label="Saved observation notes"] article').filter({ hasText: "Upper-canopy pale new growth" });
  await expect(savedNote).toContainText("Stable");
  await expect(savedNote).toContainText("Recheck root-zone pH and EC in 24 hours");
  await expectNoHorizontalOverflow(page);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-atlas-observation-notebook.png`),
    fullPage: true,
  });
});

test("Observation Notebook filters, exports, and deletes saved notes", async ({ page }) => {
  await resetNotebook(page);
  await createObservation(page);

  await page.getByLabel("Filter").selectOption({ label: "Resolved" });
  await expect(page.locator('section[aria-label="Saved observation notes"]')).toContainText("No observations match this filter.");
  await page.getByLabel("Filter").selectOption({ label: "Monitoring" });
  const savedNote = page.locator('section[aria-label="Saved observation notes"] article').filter({ hasText: "Upper-canopy pale new growth" });
  await expect(savedNote).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^dtf420-atlas-observations-\d{4}-\d{2}-\d{2}\.json$/);

  page.once("dialog", (dialog) => dialog.accept());
  await savedNote.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("status")).toContainText("Observation deleted.");
  await expect(page.locator('section[aria-label="Saved observation notes"]')).toContainText("No observations saved yet.");
  await expectNoHorizontalOverflow(page);
});

test("Atlas hub, Study Dashboard, and Diagnostic Case Lab expose the Observation Notebook", async ({ page }) => {
  await page.goto("/learn/atlas", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: "Open observation notebook" })).toHaveAttribute("href", "/learn/atlas/notebook");

  await page.goto("/learn/atlas/dashboard", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: /Observation Notebook/i })).toHaveAttribute("href", "/learn/atlas/notebook");

  await page.goto("/learn/atlas/cases", { waitUntil: "networkidle" });
  const caseLink = page.getByRole("link", { name: "Record field observation" });
  await expect(caseLink).toHaveAttribute("href", "/learn/atlas/notebook");
  await caseLink.click();
  await expect(page).toHaveURL(/\/learn\/atlas\/notebook$/);
  await expect(page.locator('section[aria-label="Atlas observation notebook introduction"]')).toBeVisible();
});
