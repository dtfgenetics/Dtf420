import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const file = path.join(root, "lib", "learning", "runtime-config.ts");

const fail = (message) => {
  console.error(`learning runtime guard verification failed: ${message}`);
  process.exitCode = 1;
};

if (!fs.existsSync(file)) {
  fail("lib/learning/runtime-config.ts is missing");
} else {
  const source = fs.readFileSync(file, "utf8");

  for (const marker of [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "CERTIFICATE_VERIFY_ORIGIN",
    "LEARNING_RUNTIME_UNAVAILABLE",
    "https://dtfseeds.com",
  ]) {
    if (!source.includes(marker)) fail(`required runtime marker missing: ${marker}`);
  }

  if (/console\.log\s*\(\s*process\.env/i.test(source)) {
    fail("runtime guard must never log process.env");
  }
  if (/BETTER_AUTH_SECRET[^\n]*console/i.test(source)) {
    fail("auth secret must never be logged");
  }
  if (/DATABASE_URL[^\n]*console/i.test(source)) {
    fail("database URL must never be logged");
  }

  if (!source.includes("requireLearningRuntime")) {
    fail("protected runtime must provide a fail-closed guard");
  }
  if (!source.includes("getLearningRuntimeStatus")) {
    fail("runtime must expose a non-secret readiness status");
  }
}

if (!process.exitCode) {
  console.log("Learning runtime configuration guard verified.");
}
