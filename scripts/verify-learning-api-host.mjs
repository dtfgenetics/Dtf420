import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const serverPath = path.join(root, "server", "learning-api", "server.ts");
const guardPath = path.join(root, "lib", "learning", "server-runtime-only.ts");

const fail = (message) => {
  console.error(`learning API host verification failed: ${message}`);
  process.exitCode = 1;
};

for (const file of [serverPath, guardPath]) {
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
    fail(`missing ${path.relative(root, file)}`);
  }
}

if (fs.existsSync(serverPath)) {
  const source = fs.readFileSync(serverPath, "utf8");
  for (const marker of [
    'toNodeHandler',
    'requireLearningRuntime()',
    'CERTIFICATE_VERIFY_ORIGIN',
    'BETTER_AUTH_URL',
    'Access-Control-Allow-Credentials',
    'origin !== publicOrigin && origin !== authOrigin',
    'req.url?.startsWith("/api/auth")',
    'req.url === "/healthz"',
    'closeLearningDbPool',
    '"0.0.0.0"',
  ]) {
    if (!source.includes(marker)) fail(`missing API host contract: ${marker}`);
  }

  if (/Access-Control-Allow-Origin[^\n]*\*/.test(source)) {
    fail("credentialed learning API must never use wildcard CORS");
  }
  if (/console\.log\s*\(.*process\.env/i.test(source)) {
    fail("learning API must never log environment secrets");
  }
}

if (fs.existsSync(guardPath)) {
  const source = fs.readFileSync(guardPath, "utf8");
  if (!source.includes('typeof window !== "undefined"')) {
    fail("server runtime guard must reject browser execution");
  }
}

const sourceRoots = ["app", "components"];
for (const sourceRoot of sourceRoots) {
  const absolute = path.join(root, sourceRoot);
  if (!fs.existsSync(absolute)) continue;

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.isFile() || !/\.(?:ts|tsx)$/.test(entry.name)) continue;
      const source = fs.readFileSync(full, "utf8");
      if (!/^\s*["']use client["'];?/m.test(source)) continue;
      if (/from\s+["'][^"']*lib\/learning\/(?:db|auth)(?:\/|["'])/.test(source)) {
        fail(`client module imports learning server layer: ${path.relative(root, full)}`);
      }
    }
  };

  walk(absolute);
}

for (const rel of [
  "lib/learning/db/client.ts",
  "lib/learning/db/learner-progress.ts",
  "lib/learning/auth/server.ts",
  "lib/learning/auth/session.ts",
]) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, "utf8");
  if (source.includes('import "server-only"')) {
    fail(`${rel} still imports Next-only server-only marker`);
  }
  if (!source.includes("server-runtime-only")) {
    fail(`${rel} must import the standalone-safe server guard`);
  }
}

if (!process.exitCode) {
  console.log("Learning API host and server boundary verified.");
}
