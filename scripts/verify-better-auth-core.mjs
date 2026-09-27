import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const schemaPath = path.join(root, "lib", "learning", "auth", "schema.ts");
const serverPath = path.join(root, "lib", "learning", "auth", "server.ts");
const migrationPath = path.join(root, "db", "migrations", "0002_better_auth_core.sql");
const sessionPath = path.join(root, "lib", "learning", "auth", "session.ts");

const fail = (message) => {
  console.error(`Better Auth core verification failed: ${message}`);
  process.exitCode = 1;
};

for (const file of [schemaPath, serverPath, sessionPath, migrationPath]) {
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
    fail(`missing ${path.relative(root, file)}`);
  }
}

if (fs.existsSync(schemaPath)) {
  const source = fs.readFileSync(schemaPath, "utf8");
  for (const table of ['"user"', '"session"', '"account"', '"verification"']) {
    if (!source.includes(table)) fail(`auth schema missing ${table}`);
  }
  for (const field of [
    "emailVerified",
    "expiresAt",
    "token",
    "accountId",
    "providerId",
    "identifier",
  ]) {
    if (!source.includes(field)) fail(`auth schema missing required core field ${field}`);
  }
  if (/twoFactor|username|organization|passkey/i.test(source)) {
    fail("core auth schema must not silently enable optional plugin tables");
  }
}

if (fs.existsSync(serverPath)) {
  const source = fs.readFileSync(serverPath, "utf8");
  if (!source.includes('import "server-only"')) fail("auth server must be server-only");
  if (!source.includes('better-auth/minimal')) fail("auth server should use Better Auth minimal build");
  if (!source.includes('better-auth/adapters/drizzle')) fail("official Better Auth Drizzle adapter import missing");
  if (!source.includes('provider: "mysql"')) fail("auth adapter must remain MySQL");
  if (!source.includes("requireLearningRuntime()")) fail("auth construction must fail closed");
  if (!source.includes("enabled: false")) fail("email/password must remain disabled until explicitly enabled");
  if (/toNextJsHandler|app\/api\/auth/.test(source)) {
    fail("auth API route must not be exposed in the core-schema change");
  }
}

if (fs.existsSync(sessionPath)) {
  const source = fs.readFileSync(sessionPath, "utf8");
  if (!source.includes('import "server-only"')) fail("session helper must be server-only");
  if (!source.includes("getLearningAuth().api.getSession")) fail("session helper must use Better Auth server API");
  if (!source.includes("headers: requestHeaders")) fail("session helper must forward request headers");
  if (!source.includes("LEARNING_AUTHENTICATION_REQUIRED")) fail("protected session helper needs a stable auth-required error code");
  if (/cookie\.split|document\.cookie/i.test(source)) fail("session helper must not parse cookies manually");
}

if (fs.existsSync(migrationPath)) {
  const sql = fs.readFileSync(migrationPath, "utf8");
  for (const table of ["user", "session", "account", "verification"]) {
    if (!new RegExp(`CREATE TABLE ${table}\\s*\\(`, "i").test(sql)) {
      fail(`auth migration missing table ${table}`);
    }
  }
  for (const marker of ["uq_auth_user_email", "uq_auth_session_token", "session_userId_idx", "account_userId_idx", "verification_identifier_idx"]) {
    if (!sql.includes(marker)) fail(`auth migration missing index/constraint ${marker}`);
  }
}

if (!process.exitCode) {
  console.log("Better Auth core schema/server contract verified.");
}
