import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow was ${overflow}px`).toBeLessThanOrEqual(2);
}

async function expectCanonical(page, path) {
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://dtfseeds.com${path}`);
}

async function expectLearningResourceJsonLd(page) {
  const scripts = page.locator('script[type="application/ld+json"]');
  const count = await scripts.count();
  expect(count).toBeGreaterThan(0);
  const payloads = await scripts.allTextContents();
  expect(payloads.some((payload) => payload.includes('"@type":"LearningResource"'))).toBeTruthy();
}

test("Learn hub exposes search, evidence, Atlas, health, science, and tools", async ({ page }) => {
  await page.goto("/learn", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Learn", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Search Teaching Healthy Cultivation/i })).toHaveAttribute("href", "/learn/search");
  await expect(page.getByRole("link", { name: /THC Living Plant Atlas/i })).toHaveAttribute("href", "/learn/atlas");
  await expect(page.getByRole("link", { name: /Plant Health, IPM & Disease Library/i })).toHaveAttribute("href", "/learn/plant-health");
  await expect(page.getByRole("link", { name: /Cultivation Science References/i })).toHaveAttribute("href", "/learn/cultivation-science");
  await expect(page.getByRole("link", { name: /Evidence & Sources/i })).toHaveAttribute("href", "/learn/sources");
  await expect(page.getByRole("link", { name: /Printable Learning Tools/i })).toHaveAttribute("href", "/learn/tools");
  await expectCanonical(page, "/learn");
  await expectNoHorizontalOverflow(page);
});

test("Unified education search finds lessons, tools, and evidence sources", async ({ page }) => {
  await page.goto("/learn/search", { waitUntil: "networkidle" });
  const search = page.getByLabel("Search the education system");

  await search.fill("HLVd");
  await expect(page.getByText("Hop Latent Viroid (HLVd)", { exact: true }).first()).toBeVisible();

  await search.fill("water activity");
  await expect(page.getByText(/Water Activity/i).first()).toBeVisible();

  await search.fill("HLVd research");
  await page.getByLabel("Filter education search").selectOption("Evidence source");
  await expect(page.getByText(/Hop Latent Viroid/i).first()).toBeVisible();

  await expectNoHorizontalOverflow(page);
});

test("Evidence library is public and populated", async ({ page }) => {
  await page.goto("/learn/sources", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Evidence & Sources", exact: true })).toBeVisible();
  await expect(page.getByText("Peer-reviewed research", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Hop Latent Viroid: A Hidden Threat to the Cannabis Industry/i })).toBeVisible();
  await expectCanonical(page, "/learn/sources");
  await expectNoHorizontalOverflow(page);
});

test("Plant health lesson renders evidence, canonical metadata, and LearningResource schema", async ({ page }) => {
  const path = "/learn/plant-health/hop-latent-viroid";
  await page.goto(path, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Hop Latent Viroid (HLVd)", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sources connected to this lesson", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Transmission, Spread, Longevity and Management of Hop Latent Viroid/i })).toBeVisible();
  await expectCanonical(page, path);
  await expectLearningResourceJsonLd(page);
  await expectNoHorizontalOverflow(page);
});

test("Protected cultivation lesson renders as a first-class science reference", async ({ page }) => {
  const path = "/learn/cultivation-science/humidity-condensation-and-dew-point";
  await page.goto(path, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Humidity, Condensation & Dew-Point Risk", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Key concepts", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sources connected to this lesson", exact: true })).toBeVisible();
  await expectCanonical(page, path);
  await expectLearningResourceJsonLd(page);
  await expectNoHorizontalOverflow(page);
});

test("Printable tools are usable and print-ready", async ({ page }) => {
  await page.goto("/learn/tools", { waitUntil: "networkidle" });
  const firstTool = page.locator('a[href^="/learn/tools/"]').first();
  const href = await firstTool.getAttribute("href");
  expect(href).toBeTruthy();
  await firstTool.click();
  await expect(page.getByRole("button", { name: /Print/i })).toBeVisible();
  await expect(page.locator("h1")).toBeVisible();
  await expectCanonical(page, href);
  await expectLearningResourceJsonLd(page);
  await expectNoHorizontalOverflow(page);
});

test("robots and sitemap expose education discovery routes", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain("https://dtfseeds.com/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const xml = await sitemap.text();
  expect(xml).toContain("https://dtfseeds.com/learn/sources");
  expect(xml).toContain("https://dtfseeds.com/learn/plant-health/hop-latent-viroid");
  expect(xml).toContain("https://dtfseeds.com/learn/cultivation-science/humidity-condensation-and-dew-point");
});
