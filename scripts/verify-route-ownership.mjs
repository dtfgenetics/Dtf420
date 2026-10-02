import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const fail = (message) => {
  console.error(`route-ownership verification failed: ${message}`);
  process.exitCode = 1;
};

const ownership = readJson("configuration/route-ownership.json");
const overlay = readJson("deployment/static-overlay.json");

if (ownership.schemaVersion !== 1) fail("unsupported schemaVersion");
if (ownership.canonicalOrigin !== overlay.canonicalOrigin) {
  fail("canonical origin must match deployment/static-overlay.json");
}

const allowedOwners = new Set(["Dtf420", "wordpress"]);
const allowedDeployments = new Set(["static-overlay", "wordpress", "node"]);
const seen = new Set();

for (const route of ownership.routes ?? []) {
  if (!route.pattern?.startsWith("/")) fail(`invalid route pattern: ${route.pattern}`);
  if (seen.has(route.pattern)) fail(`duplicate route pattern: ${route.pattern}`);
  seen.add(route.pattern);

  if (!allowedOwners.has(route.currentOwner)) {
    fail(`unknown current owner ${route.currentOwner} for ${route.pattern}`);
  }
  if (!allowedOwners.has(route.targetOwner)) {
    fail(`unknown target owner ${route.targetOwner} for ${route.pattern}`);
  }
  if (!allowedDeployments.has(route.deployment)) {
    fail(`unknown deployment mode ${route.deployment} for ${route.pattern}`);
  }
  if (!route.family || !route.status) {
    fail(`route ${route.pattern} must include family and status`);
  }
}

const normalizePrefix = (prefix) => `/${prefix.replace(/^\/+|\/+$/g, "")}/**`;
for (const prefix of overlay.routePrefixes) {
  const pattern = normalizePrefix(prefix);
  const record = ownership.routes.find((route) => route.pattern === pattern);
  if (!record) {
    fail(`static overlay prefix ${prefix} is missing from route ownership`);
    continue;
  }
  if (record.currentOwner !== "Dtf420" || record.deployment !== "static-overlay") {
    fail(`static overlay prefix ${prefix} must be Dtf420/static-overlay owned`);
  }
  if (record.status !== "overlay-live") {
    fail(`active static overlay prefix ${prefix} must have route status overlay-live`);
  }
}

const activePrefixes = new Set(overlay.routePrefixes ?? []);
for (const deferred of overlay.deferredRoutes ?? []) {
  const prefix = deferred?.prefix;
  if (!prefix) {
    fail("deferred route must declare a prefix");
    continue;
  }
  if (activePrefixes.has(prefix)) {
    fail(`deferred route ${prefix} must not also appear in active routePrefixes`);
  }
  if (!deferred.reason || !deferred.releaseCondition) {
    fail(`deferred route ${prefix} must record both reason and releaseCondition`);
  }

  const pattern = normalizePrefix(prefix);
  const record = ownership.routes.find((route) => route.pattern === pattern);
  if (!record) {
    fail(`deferred route ${prefix} is missing from route ownership`);
    continue;
  }
  if (record.status === "overlay-live") {
    fail(`deferred route ${prefix} cannot claim overlay-live status`);
  }
  if (!record.status.includes("deferred")) {
    fail(`deferred route ${prefix} must use an explicit deferred route status`);
  }
}

for (const wpRoute of overlay.wordpressOwnedRoutes) {
  const normalized = wpRoute === "/" ? "/" : wpRoute.replace(/\/$/, "") + "/**";
  const exact = ownership.routes.find((route) => route.pattern === wpRoute || route.pattern === normalized);
  if (!exact) continue;
  if (exact.currentOwner !== "wordpress") {
    fail(`WordPress-owned route ${wpRoute} conflicts with ${exact.pattern}`);
  }
}

if (!process.exitCode) {
  console.log(`Route ownership verification passed (${ownership.routes.length} route families checked).`);
}
