import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const file = path.join(root, "lib", "learning", "db", "learner-progress.ts");

const fail = (message) => {
  console.error(`learner progress store verification failed: ${message}`);
  process.exitCode = 1;
};

if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
  fail("learner-progress.ts is missing");
} else {
  const source = fs.readFileSync(file, "utf8");

  for (const marker of [
    'import "server-only"',
    "findLearnerByAuthUserId",
    "createLearnerProfile",
    "getCourseProgress",
    "upsertCourseProgress",
    ".onDuplicateKeyUpdate",
    "percentComplete.toFixed(2)",
    "Number(row.percentComplete)",
  ]) {
    if (!source.includes(marker)) fail(`missing learner progress contract: ${marker}`);
  }

  if (!source.includes("record.percentComplete < 0") || !source.includes("record.percentComplete > 100")) {
    fail("course progress must enforce the 0-100 range before persistence");
  }

  if (/password|sessionToken|correctAnswer|answerKey/i.test(source)) {
    fail("learner progress store must not contain auth secrets or assessment answer keys");
  }
}

if (!process.exitCode) {
  console.log("Learner profile and course progress store verified.");
}
