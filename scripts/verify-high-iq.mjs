import fs from "node:fs/promises";

const allowedDifficulties = new Set(["Easy", "Medium", "Hard", "Expert"]);
const questions = JSON.parse(
  await fs.readFile(new URL("../data/games/high-iq/questions.json", import.meta.url), "utf8"),
);

const errors = [];
const ids = new Set();
const difficultyCounts = new Map();
const correctIndexCounts = new Map();

for (const [index, question] of questions.entries()) {
  const label = question.id || `question ${index + 1}`;

  if (typeof question.id !== "string" || !question.id.trim()) errors.push(`${label}: missing id`);
  if (ids.has(question.id)) errors.push(`${label}: duplicate id`);
  ids.add(question.id);

  if (typeof question.category !== "string" || !question.category.trim()) errors.push(`${label}: missing category`);
  if (!allowedDifficulties.has(question.difficulty)) errors.push(`${label}: invalid difficulty`);
  difficultyCounts.set(question.difficulty, (difficultyCounts.get(question.difficulty) ?? 0) + 1);

  if (typeof question.prompt !== "string" || question.prompt.trim().length < 12) errors.push(`${label}: prompt is too short`);
  if (!Array.isArray(question.choices) || question.choices.length !== 4) {
    errors.push(`${label}: must contain exactly four choices`);
  } else {
    const choices = question.choices.map((choice) => String(choice).trim().toLowerCase());
    if (choices.some((choice) => !choice)) errors.push(`${label}: blank answer choice`);
    if (new Set(choices).size !== 4) errors.push(`${label}: duplicate answer choices`);
  }

  if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex > 3) {
    errors.push(`${label}: correctIndex must be an integer from 0 through 3`);
  } else {
    correctIndexCounts.set(question.correctIndex, (correctIndexCounts.get(question.correctIndex) ?? 0) + 1);
  }

  if (typeof question.explanation !== "string" || question.explanation.trim().length < 24) {
    errors.push(`${label}: explanation is too short`);
  }
}

if (questions.length < 20) errors.push(`starter bank is too small: found ${questions.length}, expected at least 20`);

for (const difficulty of allowedDifficulties) {
  if ((difficultyCounts.get(difficulty) ?? 0) < 4) {
    errors.push(`${difficulty}: expected at least four questions`);
  }
}

for (let index = 0; index < 4; index += 1) {
  if ((correctIndexCounts.get(index) ?? 0) < 3) {
    errors.push(`answer position ${index}: insufficient distribution`);
  }
}

if (errors.length) {
  console.error("High IQ verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `High IQ verified: ${questions.length} questions, ` +
  [...difficultyCounts.entries()].map(([difficulty, count]) => `${difficulty}=${count}`).join(", "),
);
