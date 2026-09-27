import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const schemaPath = path.join(root, "lib", "learning", "db", "schema.ts");
const clientPath = path.join(root, "lib", "learning", "db", "client.ts");

const fail = (message) => {
  console.error(`Drizzle learning schema verification failed: ${message}`);
  process.exitCode = 1;
};

for (const file of [schemaPath, clientPath]) {
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
    fail(`missing ${path.relative(root, file)}`);
  }
}

if (fs.existsSync(schemaPath)) {
  const source = fs.readFileSync(schemaPath, "utf8");
  for (const table of [
    "learner_profiles",
    "course_progress",
    "assessment_versions",
    "assessment_attempts",
    "assessment_answers",
    "assessment_results",
    "credentials",
    "credential_verification_events",
  ]) {
    if (!source.includes(`"${table}"`)) fail(`schema missing table ${table}`);
  }

  for (const constraint of [
    "uq_course_progress_learner_course_version",
    "uq_assessment_attempts_public_reference",
    "uq_assessment_answers_attempt_question",
    "uq_assessment_results_attempt",
    "uq_credentials_public_id",
    "uq_credentials_source_result",
  ]) {
    if (!source.includes(constraint)) fail(`schema missing uniqueness/index contract ${constraint}`);
  }

  if (/password|sessionToken|correctAnswer|answerKey/i.test(source)) {
    fail("Drizzle domain schema must not contain auth secrets or answer keys");
  }
}

if (fs.existsSync(clientPath)) {
  const source = fs.readFileSync(clientPath, "utf8");
  if (!source.includes('import "server-only"')) fail("database client must be server-only");
  if (!source.includes("requireLearningRuntime()")) fail("database pool must fail closed through runtime guard");
  if (!source.includes("mysql.createPool")) fail("query client must use a mysql2 pool");
  if (!source.includes("drizzle(getPool(), {")) fail("Stable Drizzle mysql2 client initialization is missing");
  if (!source.includes('mode: "default"')) fail("Drizzle schema mode must be explicit default MySQL mode");
  if (/console\.(log|debug|info)\s*\(/.test(source)) fail("database client must not log secrets or connection strings");
}

if (!process.exitCode) {
  console.log("Drizzle learning schema and client contract verified.");
}
