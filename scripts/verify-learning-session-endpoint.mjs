import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const serverPath = path.join(root, "server", "learning-api", "server.ts");
const storePath = path.join(root, "lib", "learning", "db", "learner-progress.ts");

const fail = (message) => {
  console.error(`learning session endpoint verification failed: ${message}`);
  process.exitCode = 1;
};

for (const file of [serverPath, storePath]) {
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
    fail(`missing ${path.relative(root, file)}`);
  }
}

if (fs.existsSync(storePath)) {
  const source = fs.readFileSync(storePath, "utf8");
  for (const marker of [
    "ensureLearnerProfile",
    'randomBytes(16).toString("hex")',
    ".onDuplicateKeyUpdate",
    "displayName: normalizedName",
    "findLearnerByAuthUserId",
  ]) {
    if (!source.includes(marker)) fail(`learner provisioning missing ${marker}`);
  }
  if (/password|sessionToken|correctAnswer|answerKey/i.test(source)) {
    fail("learner provisioning must not handle auth secrets or answer keys");
  }
}

if (fs.existsSync(serverPath)) {
  const source = fs.readFileSync(serverPath, "utf8");
  for (const marker of [
    'req.method === "GET" && req.url === "/api/learning/v1/session"',
    "getLearningSession(toFetchHeaders(req))",
    "ensureLearnerProfile(",
    "authenticated: false",
    "Learning session unavailable",
    "displayName: learner.displayName",
  ]) {
    if (!source.includes(marker)) fail(`session endpoint missing ${marker}`);
  }

  if (!source.includes("res.statusCode = 401")) {
    fail("unauthenticated session must return 401");
  }

  const routeStart = source.indexOf('req.method === "GET" && req.url === "/api/learning/v1/session"');
  const routeEnd = source.indexOf("res.statusCode = 404", routeStart);
  const routeSource = routeStart >= 0 && routeEnd > routeStart
    ? source.slice(routeStart, routeEnd)
    : "";

  if (/email\s*:|token\s*:|password\s*:|assessment|credential/i.test(routeSource)) {
    fail("session endpoint must return only minimal identity/profile data");
  }
}

if (!process.exitCode) {
  console.log("Learning session/profile endpoint verified.");
}
