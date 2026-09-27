import { spawn } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const port = 41999;
const tsxBin = path.join(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tsx.cmd" : "tsx",
);

const env = {
  ...process.env,
  PORT: String(port),
  DATABASE_URL: "mysql://dtf_test:dtf_test@127.0.0.1:65535/dtf_test",
  BETTER_AUTH_SECRET: "dtf-learning-api-smoke-test-secret-0123456789abcdef0123456789abcdef",
  BETTER_AUTH_URL: "https://learn-api.dtfseeds.com",
  CERTIFICATE_VERIFY_ORIGIN: "https://dtfseeds.com",
};

const child = spawn(tsxBin, ["server/learning-api/server.ts"], {
  cwd: root,
  env,
  stdio: ["ignore", "pipe", "pipe"],
});

let stdout = "";
let stderr = "";
child.stdout.on("data", (chunk) => {
  stdout += chunk.toString();
});
child.stderr.on("data", (chunk) => {
  stderr += chunk.toString();
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForReady() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (stdout.includes("DTF learning API listening")) return;
    if (child.exitCode !== null) {
      throw new Error(
        `Learning API exited before readiness. stdout=${stdout} stderr=${stderr}`,
      );
    }
    await sleep(100);
  }
  throw new Error(`Learning API did not become ready. stdout=${stdout} stderr=${stderr}`);
}

async function main() {
  try {
    await waitForReady();

    const health = await fetch(`http://127.0.0.1:${port}/healthz`, {
      headers: { Origin: "https://dtfseeds.com" },
    });
    if (health.status !== 200) {
      throw new Error(`Expected /healthz 200, got ${health.status}`);
    }
    if (health.headers.get("access-control-allow-origin") !== "https://dtfseeds.com") {
      throw new Error("Allowed public origin was not reflected in CORS response.");
    }
    const payload = await health.json();
    if (payload?.ok !== true || payload?.service !== "dtf-learning-api") {
      throw new Error("Unexpected health payload.");
    }

    const preflight = await fetch(`http://127.0.0.1:${port}/api/auth/get-session`, {
      method: "OPTIONS",
      headers: { Origin: "https://dtfseeds.com" },
    });
    if (preflight.status !== 204) {
      throw new Error(`Expected auth preflight 204, got ${preflight.status}`);
    }
    if (preflight.headers.get("access-control-allow-credentials") !== "true") {
      throw new Error("Credentialed CORS header is missing.");
    }

    const blocked = await fetch(`http://127.0.0.1:${port}/healthz`, {
      headers: { Origin: "https://example.invalid" },
    });
    if (blocked.status !== 403) {
      throw new Error(`Expected hostile origin 403, got ${blocked.status}`);
    }

    console.log("Learning API standalone smoke test passed.");
  } finally {
    if (child.exitCode === null) child.kill("SIGTERM");
  }
}

await main();
