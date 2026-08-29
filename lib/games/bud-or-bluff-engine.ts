import type { BudOrBluffCard, BudOrBluffDifficulty } from "./bud-or-bluff";

export type DifficultyFilter = "All" | BudOrBluffDifficulty;
type Answer = "BUD" | "BLUFF";

function randomIndex(length: number, random: () => number) {
  return Math.min(length - 1, Math.max(0, Math.floor(random() * length)));
}

function takeRandom<T>(items: T[], random: () => number): T | undefined {
  if (!items.length) return undefined;
  const index = randomIndex(items.length, random);
  return items.splice(index, 1)[0];
}

function sequenceIsFeasible(bud: number, bluff: number) {
  return bud <= 2 * (bluff + 1) && bluff <= 2 * (bud + 1);
}

function buildAnswerSequence(budTarget: number, bluffTarget: number, random: () => number) {
  const sequence: Answer[] = [];

  function search(remainingBud: number, remainingBluff: number): boolean {
    if (remainingBud === 0 && remainingBluff === 0) return true;

    const lastTwo = sequence.slice(-2);
    const candidates: Answer[] = [];
    if (remainingBud > 0 && !(lastTwo.length === 2 && lastTwo.every((answer) => answer === "BUD"))) candidates.push("BUD");
    if (remainingBluff > 0 && !(lastTwo.length === 2 && lastTwo.every((answer) => answer === "BLUFF"))) candidates.push("BLUFF");

    if (candidates.length === 2) {
      const total = remainingBud + remainingBluff;
      const preferBud = random() < remainingBud / total;
      if (!preferBud) candidates.reverse();
    }

    for (const answer of candidates) {
      const nextBud = remainingBud - (answer === "BUD" ? 1 : 0);
      const nextBluff = remainingBluff - (answer === "BLUFF" ? 1 : 0);
      if (!sequenceIsFeasible(nextBud, nextBluff)) continue;

      sequence.push(answer);
      if (search(nextBud, nextBluff)) return true;
      sequence.pop();
    }

    return false;
  }

  if (!search(budTarget, bluffTarget)) {
    throw new Error("Unable to build a balanced Bud or Bluff deck without a three-answer run.");
  }

  return sequence;
}

export function buildBalancedDeck(
  cards: readonly BudOrBluffCard[],
  count: number,
  difficulty: DifficultyFilter,
  random: () => number = Math.random,
): BudOrBluffCard[] {
  const eligible = cards.filter((card) => difficulty === "All" || card.difficulty === difficulty);
  const buds = eligible.filter((card) => card.answer === "BUD");
  const bluffs = eligible.filter((card) => card.answer === "BLUFF");
  const targetCount = Math.min(Math.max(0, count), eligible.length);

  let budTarget = Math.ceil(targetCount / 2);
  let bluffTarget = Math.floor(targetCount / 2);

  if (buds.length < budTarget) {
    bluffTarget += budTarget - buds.length;
    budTarget = buds.length;
  }
  if (bluffs.length < bluffTarget) {
    budTarget += bluffTarget - bluffs.length;
    bluffTarget = bluffs.length;
  }

  const answerSequence = buildAnswerSequence(budTarget, bluffTarget, random);
  const budPool = [...buds];
  const bluffPool = [...bluffs];

  return answerSequence.map((answer) => {
    const card = answer === "BUD" ? takeRandom(budPool, random) : takeRandom(bluffPool, random);
    if (!card) throw new Error(`Bud or Bluff ${answer} pool ran out while building the deck.`);
    return card;
  });
}

export function scoreCorrectGuess(streakBefore: number) {
  const streakAfter = streakBefore + 1;
  const bonus = streakAfter % 3 === 0 ? 1 : 0;
  return {
    streakAfter,
    points: 1 + bonus,
    bonus,
  };
}
