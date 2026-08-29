import fs from "node:fs";

const sourcePath = new URL("../lib/games/bud-or-bluff.ts", import.meta.url);
const source = fs.readFileSync(sourcePath, "utf8");

const cardPattern = /(realCard|bluffCard)\("([^"]+)",\s*"([^"]+)",\s*"(Easy|Medium|Hard)"/g;
const cards = [...source.matchAll(cardPattern)].map((match) => ({
  kind: match[1] === "realCard" ? "BUD" : "BLUFF",
  id: match[2],
  name: match[3],
  difficulty: match[4],
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

const budCount = cards.filter((card) => card.kind === "BUD").length;
const bluffCount = cards.filter((card) => card.kind === "BLUFF").length;
if (budCount !== 25 || bluffCount !== 25) {
  fail(`expected a 25/25 BUD-BLUFF split, found ${budCount}/${bluffCount}`);
}

for (const difficulty of ["Easy", "Medium", "Hard"]) {
  const difficultyCards = cards.filter((card) => card.difficulty === difficulty);
  const bud = difficultyCards.filter((card) => card.kind === "BUD").length;
  const bluff = difficultyCards.filter((card) => card.kind === "BLUFF").length;
  if (bud < 4 || bluff < 4) {
    fail(`${difficulty} pool is not replayable enough: ${bud} BUD / ${bluff} BLUFF`);
  }
}

const dickPix = cards.find((card) => card.id === "BOB-121");
if (!dickPix || dickPix.name !== "Dick Pix" || dickPix.kind !== "BUD") {
  fail("BOB-121 Dick Pix is missing or not classified as BUD");
}
if (!source.includes('lineage: "Pixy Drip × Moby Dick"')) {
  fail("Dick Pix lineage does not match the supplied breeder pedigree");
}
if (!source.includes("User-supplied breeder genetic pedigree, verified 2026-08-29")) {
  fail("Dick Pix evidence label is missing");
}

if (!process.exitCode) {
  const summary = ["Easy", "Medium", "Hard"].map((difficulty) => {
    const group = cards.filter((card) => card.difficulty === difficulty);
    const bud = group.filter((card) => card.kind === "BUD").length;
    const bluff = group.filter((card) => card.kind === "BLUFF").length;
    return `${difficulty}: ${bud} BUD / ${bluff} BLUFF`;
  });
  console.log(`Bud or Bluff verified: ${cards.length} cards, ${budCount}/${bluffCount} split. ${summary.join("; ")}`);
}
