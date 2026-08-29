import fs from "node:fs";

const sourcePath = new URL("../lib/games/bud-or-bluff.ts", import.meta.url);
const source = fs.readFileSync(sourcePath, "utf8");
const { buildBalancedDeck, scoreCorrectGuess } = await import("../lib/games/bud-or-bluff-engine.ts");

const cardPattern = /(realCard|bluffCard)\("([^"]+)",\s*"([^"]+)",\s*"(Easy|Medium|Hard)"/g;
const cards = [...source.matchAll(cardPattern)].map((match) => ({
  answer: match[1] === "realCard" ? "BUD" : "BLUFF",
  id: match[2],
  name: match[3],
  difficulty: match[4],
  category: "verification",
  explanation: "verification",
  sourceLabel: "verification",
}));

function fail(message) {
  console.error(`Bud or Bluff verification failed: ${message}`);
  process.exitCode = 1;
}

if (cards.length !== 50) {
  fail(`expected 50 curated web cards, found ${cards.length}`);
}

const ids = new Set();
const names = new Set();
for (const card of cards) {
  if (ids.has(card.id)) fail(`duplicate card id ${card.id}`);
  if (names.has(card.name.toLowerCase())) fail(`duplicate card name ${card.name}`);
  ids.add(card.id);
  names.add(card.name.toLowerCase());
}

const budCount = cards.filter((card) => card.answer === "BUD").length;
const bluffCount = cards.filter((card) => card.answer === "BLUFF").length;
if (budCount !== 25 || bluffCount !== 25) {
  fail(`expected a 25/25 BUD-BLUFF split, found ${budCount}/${bluffCount}`);
}

for (const difficulty of ["Easy", "Medium", "Hard"]) {
  const difficultyCards = cards.filter((card) => card.difficulty === difficulty);
  const bud = difficultyCards.filter((card) => card.answer === "BUD").length;
  const bluff = difficultyCards.filter((card) => card.answer === "BLUFF").length;
  if (bud < 4 || bluff < 4) {
    fail(`${difficulty} pool is not replayable enough: ${bud} BUD / ${bluff} BLUFF`);
  }
}

const dickPix = cards.find((card) => card.id === "BOB-121");
if (!dickPix || dickPix.name !== "Dick Pix" || dickPix.answer !== "BUD") {
  fail("BOB-121 Dick Pix is missing or not classified as BUD");
}
if (!source.includes('lineage: "Pixy Drip × Moby Dick"')) {
  fail("Dick Pix lineage does not match the supplied breeder pedigree");
}
if (!source.includes("User-supplied breeder genetic pedigree, verified 2026-08-29")) {
  fail("Dick Pix evidence label is missing");
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (1664525 * value + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

function verifyDeck(deck, label) {
  const answers = deck.map((card) => card.answer);
  for (let index = 2; index < answers.length; index += 1) {
    if (answers[index] === answers[index - 1] && answers[index] === answers[index - 2]) {
      fail(`${label} produced a three-answer run at positions ${index - 1}-${index + 1}`);
      return;
    }
  }

  const bud = answers.filter((answer) => answer === "BUD").length;
  const bluff = answers.length - bud;
  if (Math.abs(bud - bluff) > 1) {
    fail(`${label} is not balanced enough: ${bud} BUD / ${bluff} BLUFF`);
  }
}

for (const difficulty of ["All", "Easy", "Medium", "Hard"]) {
  for (const requestedCount of [10, 20, 30, 40]) {
    for (let seed = 1; seed <= 100; seed += 1) {
      const deck = buildBalancedDeck(cards, requestedCount, difficulty, seededRandom(seed));
      const eligibleCount = cards.filter((card) => difficulty === "All" || card.difficulty === difficulty).length;
      const expectedLength = Math.min(requestedCount, eligibleCount);
      if (deck.length !== expectedLength) {
        fail(`${difficulty}/${requestedCount}/seed-${seed} expected ${expectedLength} cards, found ${deck.length}`);
        break;
      }
      verifyDeck(deck, `${difficulty}/${requestedCount}/seed-${seed}`);
    }
  }
}

const nonAlternatingDeck = buildBalancedDeck(cards, 20, "All", () => 0.1);
const nonAlternatingAnswers = nonAlternatingDeck.map((card) => card.answer);
if (!nonAlternatingAnswers.some((answer, index) => index > 0 && answer === nonAlternatingAnswers[index - 1])) {
  fail("deck builder regressed to a predictable strict BUD/BLUFF alternation");
}

const scoringExpectations = [
  [0, { streakAfter: 1, points: 1, bonus: 0 }],
  [1, { streakAfter: 2, points: 1, bonus: 0 }],
  [2, { streakAfter: 3, points: 2, bonus: 1 }],
  [5, { streakAfter: 6, points: 2, bonus: 1 }],
];
for (const [streakBefore, expected] of scoringExpectations) {
  const actual = scoreCorrectGuess(streakBefore);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`streak scoring mismatch at ${streakBefore}: ${JSON.stringify(actual)}`);
  }
}

if (!process.exitCode) {
  const summary = ["Easy", "Medium", "Hard"].map((difficulty) => {
    const group = cards.filter((card) => card.difficulty === difficulty);
    const bud = group.filter((card) => card.answer === "BUD").length;
    const bluff = group.filter((card) => card.answer === "BLUFF").length;
    return `${difficulty}: ${bud} BUD / ${bluff} BLUFF`;
  });
  console.log(`Bud or Bluff verified: ${cards.length} cards, ${budCount}/${bluffCount} split, 1,600 seeded deck checks, streak scoring verified. ${summary.join("; ")}`);
}
