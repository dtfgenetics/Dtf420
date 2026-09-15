import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const fail = (message) => {
  console.error(`site-shell verification failed: ${message}`);
  process.exitCode = 1;
};

const shell = JSON.parse(read("configuration/site-shell.json"));
const siteHeader = read("components/SiteHeader.tsx");
const siteNavigation = read("components/SiteNavigation.tsx");
const siteFooter = read("components/SiteFooter.tsx");
const overlay = JSON.parse(read("deployment/static-overlay.json"));

const expectedPrimary = [
  ["/seeds", "Genetics"],
  ["/learn", "Learn"],
  ["/tools", "Tools"],
  ["/games", "Games"],
  ["/community", "Community"],
  ["/shop", "Shop"],
];

const actualPrimary = shell.primaryNavigation.map(({ href, label }) => [href, label]);
if (JSON.stringify(actualPrimary) !== JSON.stringify(expectedPrimary)) {
  fail(`primary navigation must remain ${expectedPrimary.map(([, label]) => label).join(" → ")}`);
}

if (!siteHeader.includes('import siteShell from "@/configuration/site-shell.json"')) {
  fail("SiteHeader must consume configuration/site-shell.json");
}
if (!siteHeader.includes("siteShell.brand") || !siteHeader.includes("siteShell.utilityNavigation")) {
  fail("SiteHeader must use canonical brand and utility navigation values");
}
if (!siteNavigation.includes('import siteShell from "@/configuration/site-shell.json"')) {
  fail("SiteNavigation must consume configuration/site-shell.json");
}
if (!siteNavigation.includes("siteShell.primaryNavigation")) {
  fail("SiteNavigation must render the canonical primaryNavigation array");
}
if (!siteFooter.includes('import siteShell from "@/configuration/site-shell.json"')) {
  fail("SiteFooter must consume configuration/site-shell.json");
}
if (!siteFooter.includes("siteShell.primaryNavigation")) {
  fail("SiteFooter Explore links must use the canonical primaryNavigation array");
}

const requiredWordPressRoutes = [
  "/",
  "/about/",
  "/cart/",
  "/checkout/",
  "/community/",
  "/contact/",
  "/gallery/",
  "/games/",
  "/growlens/",
  "/journal/",
  "/learn/",
  "/my-account/",
  "/seeds/",
  "/shop/",
  "/thc-grow-doc/",
  "/tools/",
  "/yellow-leaves/",
];
for (const route of requiredWordPressRoutes) {
  if (!overlay.wordpressOwnedRoutes.includes(route)) {
    fail(`static-overlay ownership contract is missing WordPress route ${route}`);
  }
}

const wordpressLabels = shell.wordpressContract?.requiredPrimaryLabels ?? [];
const expectedLabels = expectedPrimary.map(([, label]) => label);
if (JSON.stringify(wordpressLabels) !== JSON.stringify(expectedLabels)) {
  fail("WordPress navigation contract must match the canonical primary labels");
}

if (!process.exitCode) {
  console.log(`site-shell verification passed: ${expectedLabels.join(" → ")}`);
}
