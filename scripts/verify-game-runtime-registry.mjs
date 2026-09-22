import fs from "node:fs";
import path from "node:path";
import { gameCatalog } from "../lib/game-catalog.ts";
import { gameRuntimeRegistry } from "../lib/game-runtime-registry.ts";

const root = process.cwd();
const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function routePath(route) {
  const relative = route.replace(/^\//, "").replace(/\/$/, "");
  return path.join(root, "app", relative, "page.tsx");
}

function publicPath(entrypoint) {
  return path.join(root, "public", entrypoint.replace(/^\//, ""));
}

function duplicates(values) {
  const seen = new Set();
  const duplicate = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicate.add(value);
    seen.add(value);
  }
  return [...duplicate];
}

for (const field of ["id", "slug", "route"]) {
  const dupes = duplicates(gameRuntimeRegistry.map((entry) => entry[field]));
  if (dupes.length) fail(`duplicate runtime ${field}: ${dupes.join(", ")}`);
}

const catalogBySlug = new Map(gameCatalog.map((entry) => [entry.slug, entry]));
const runtimeBySlug = new Map(gameRuntimeRegistry.map((entry) => [entry.slug, entry]));

for (const catalogEntry of gameCatalog) {
  const runtime = runtimeBySlug.get(catalogEntry.slug);
  if (!runtime) {
    fail(`catalog game "${catalogEntry.slug}" has no runtime definition`);
    continue;
  }

  if (runtime.status !== catalogEntry.status) {
    fail(
      `status mismatch for "${catalogEntry.slug}": catalog=${catalogEntry.status}, runtime=${runtime.status}`,
    );
  }
}

for (const runtime of gameRuntimeRegistry) {
  if (!catalogBySlug.has(runtime.slug)) {
    fail(`runtime "${runtime.slug}" is missing from the public game catalog`);
  }

  const page = routePath(runtime.route);
  if (!fs.existsSync(page)) {
    fail(`runtime route "${runtime.route}" has no page at ${path.relative(root, page)}`);
  }

  if (runtime.host === "iframe") {
    if (!runtime.entrypoint) {
      fail(`iframe runtime "${runtime.slug}" must declare an entrypoint`);
    } else if (runtime.entrypointProvision !== "build") {
      const entrypoint = publicPath(runtime.entrypoint);
      if (!fs.existsSync(entrypoint)) {
        fail(
          `iframe runtime "${runtime.slug}" entrypoint is missing: ${path.relative(root, entrypoint)}`,
        );
      }
    }
  } else if (runtime.entrypoint) {
    fail(`non-iframe runtime "${runtime.slug}" must not declare an iframe entrypoint`);
  }

  if (runtime.capabilities.save && !runtime.persistence) {
    warn(`"${runtime.slug}" advertises save support without a persistence contract`);
  }

  if (runtime.persistence && runtime.persistence.saveVersion < 1) {
    fail(`"${runtime.slug}" persistence saveVersion must be >= 1`);
  }

  if (runtime.capabilities.multiplayer && !runtime.network) {
    warn(`"${runtime.slug}" advertises multiplayer without a network contract`);
  }

  if (runtime.network && !runtime.network.authoritative) {
    warn(`"${runtime.slug}" multiplayer network is not marked server-authoritative`);
  }

  if (runtime.canonicalTarget) {
    const target = routePath(runtime.canonicalTarget);
    if (!fs.existsSync(target)) {
      warn(
        `alias "${runtime.slug}" points to missing canonical route ${runtime.canonicalTarget}`,
      );
    }
  }

  if (runtime.capabilities.inputs.length === 0) {
    fail(`"${runtime.slug}" must declare at least one input method`);
  }
}

if (warnings.length) {
  console.warn("Game runtime registry warnings:");
  for (const warning of warnings) console.warn(` - ${warning}`);
}

if (errors.length) {
  console.error("Game runtime registry verification failed:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log(
  `Game runtime registry verified: ${gameRuntimeRegistry.length} runtimes match the public catalog and route/entrypoint contracts.`,
);
