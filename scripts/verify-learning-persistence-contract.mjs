import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "lib/learning/domain.ts",
  "lib/learning/persistence.ts",
  "lib/learning/attempt-state.ts",
];

const fail = (message) => {
  console.error(`learning persistence contract verification failed: ${message}`);
  process.exitCode = 1;
};

for (const rel of required) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) fail(`missing ${rel}`);
}

if (fs.existsSync(path.join(root, "lib/learning/persistence.ts"))) {
  const source = fs.readFileSync(path.join(root, "lib/learning/persistence.ts"), "utf8");
  for (const method of [
    "findLearnerByAuthUserId",
    "upsertCourseProgress",
    "startAssessmentAttempt",
    "saveAssessmentAnswer",
    "submitAssessmentAttempt",
    "createAssessmentResult",
    "issueCredential",
    "revokeCredential",
    "recordCredentialVerification",
  ]) {
    if (!source.includes(method)) fail(`persistence contract missing ${method}`);
  }
  if (/password|sessionToken|correctAnswer|answerKey/i.test(source)) {
    fail("persistence contract must not expose authentication secrets or answer keys");
  }
}

if (fs.existsSync(path.join(root, "lib/learning/attempt-state.ts"))) {
  const source = fs.readFileSync(path.join(root, "lib/learning/attempt-state.ts"), "utf8");
  for (const edge of [
    'created: new Set(["active", "abandoned", "invalidated"])',
    'active: new Set(["submitted", "expired", "abandoned", "invalidated"])',
    'submitted: new Set(["graded", "invalidated"])',
  ]) {
    if (!source.includes(edge)) fail(`missing required attempt transition: ${edge}`);
  }
  if (!source.includes("graded: new Set()")) fail("graded must remain terminal");
  if (!source.includes("expired: new Set()")) fail("expired must remain terminal");
}

if (!process.exitCode) {
  console.log("Learning persistence contract verified.");
}
