import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "configuration", "certification-runtime.json");
const migrationPath = path.join(root, "db", "migrations", "0001_learning_certification_domain.sql");

const fail = (message) => {
  console.error(`certification persistence verification failed: ${message}`);
  process.exitCode = 1;
};

if (!fs.existsSync(configPath)) fail("configuration/certification-runtime.json is missing");
if (!fs.existsSync(migrationPath)) fail("initial certification migration is missing");

if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (config.schemaVersion !== 1) fail("unsupported certification runtime schemaVersion");
  if (config.database?.engine !== "mysql") fail("database engine must remain mysql");
  if (config.database?.orm !== "drizzle") fail("ORM contract must remain drizzle");
  if (config.auth?.provider !== "better-auth") fail("auth contract must remain better-auth");

  const requiredEnv = new Set([
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "CERTIFICATE_VERIFY_ORIGIN",
  ]);
  for (const name of requiredEnv) {
    if (!config.environment?.requiredForProtectedRuntime?.includes(name)) {
      fail(`missing required environment contract: ${name}`);
    }
  }

  if (config.environment?.canonicalValues?.BETTER_AUTH_URL !== "https://dtfseeds.com") {
    fail("BETTER_AUTH_URL canonical value drifted");
  }
  if (config.environment?.canonicalValues?.CERTIFICATE_VERIFY_ORIGIN !== "https://dtfseeds.com") {
    fail("certificate verification origin drifted");
  }
}

if (fs.existsSync(migrationPath)) {
  const sql = fs.readFileSync(migrationPath, "utf8");
  const requiredTables = [
    "learner_profiles",
    "course_progress",
    "assessment_versions",
    "assessment_attempts",
    "assessment_answers",
    "assessment_results",
    "credentials",
    "credential_verification_events",
  ];
  for (const table of requiredTables) {
    if (!new RegExp(`CREATE TABLE ${table}\\s*\\(`, "i").test(sql)) {
      fail(`missing table ${table}`);
    }
  }

  const forbidden = [
    /password\s+/i,
    /session_token\s+/i,
    /correct_answer/i,
    /answer_key/i,
  ];
  for (const pattern of forbidden) {
    if (pattern.test(sql)) fail(`forbidden auth/answer material present in domain schema: ${pattern}`);
  }

  for (const marker of [
    "started_at_server",
    "expires_at_server",
    "question_pool_hash",
    "grader_version",
    "result_hash",
    "public_credential_id",
    "revoked_at",
  ]) {
    if (!sql.includes(marker)) fail(`required immutable/audit field is missing: ${marker}`);
  }

  if (!sql.includes("UNIQUE KEY uq_assessment_answers_attempt_question")) {
    fail("attempt/question uniqueness is not enforced");
  }
  if (!sql.includes("UNIQUE KEY uq_assessment_results_attempt")) {
    fail("one-result-per-attempt uniqueness is not enforced");
  }
  if (!sql.includes("UNIQUE KEY uq_credentials_source_result")) {
    fail("credential issuance idempotency is not enforced at source-result level");
  }
}

if (!process.exitCode) {
  console.log("Certification persistence foundation verified.");
}
