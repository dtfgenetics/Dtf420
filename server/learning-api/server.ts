import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { toNodeHandler } from "better-auth/node";
import { getLearningAuth } from "../../lib/learning/auth/server";
import { getLearningSession } from "../../lib/learning/auth/session";
import { ensureLearnerProfile } from "../../lib/learning/db/learner-progress";
import { closeLearningDbPool } from "../../lib/learning/db/client";
import { requireLearningRuntime } from "../../lib/learning/runtime-config";

requireLearningRuntime();

const publicOrigin = process.env.CERTIFICATE_VERIFY_ORIGIN!;
const authOrigin = process.env.BETTER_AUTH_URL!;
const port = Number.parseInt(process.env.PORT || "3000", 10);

if (!Number.isFinite(port) || port <= 0 || port > 65535) {
  throw new Error("PORT must be a valid TCP port.");
}

const authHandler = toNodeHandler(getLearningAuth());

function toFetchHeaders(req: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers.set(name, value);
    else if (Array.isArray(value)) headers.set(name, value.join(","));
  }
  return headers;
}

function setSecurityHeaders(res: ServerResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cache-Control", "no-store");
}

function applyCors(req: IncomingMessage, res: ServerResponse): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;

  if (origin !== publicOrigin && origin !== authOrigin) {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Origin not allowed" }));
    return false;
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");
  return true;
}

const server = createServer(async (req, res) => {
  setSecurityHeaders(res);

  if (!applyCors(req, res)) return;

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.url === "/healthz") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true, service: "dtf-learning-api" }));
    return;
  }

  if (req.url?.startsWith("/api/auth")) {
    await authHandler(req, res);
    return;
  }

  if (req.method === "GET" && req.url === "/api/learning/v1/session") {
    try {
      const session = await getLearningSession(toFetchHeaders(req));
      if (!session?.user) {
        res.statusCode = 401;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ authenticated: false }));
        return;
      }

      const learner = await ensureLearnerProfile(session.user.id, session.user.name || "Learner");
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({
        authenticated: true,
        user: { id: session.user.id, name: session.user.name },
        learner: { id: learner.id, displayName: learner.displayName },
      }));
    } catch {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Learning session unavailable" }));
    }
    return;
  }

  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: "Not found" }));
});

async function shutdown(signal: string) {
  server.close(async () => {
    await closeLearningDbPool();
    process.stderr.write(`Learning API stopped after ${signal}.\n`);
    process.exit(0);
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

server.listen(port, "0.0.0.0", () => {
  process.stdout.write(`DTF learning API listening on port ${port}.\n`);
});
