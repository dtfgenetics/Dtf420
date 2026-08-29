import type { BudOrBluffCard, BudOrBluffDifficulty } from "./bud-or-bluff";

export type DifficultyFilter = "All" | BudOrBluffDifficulty;

function randomIndex(length: number, random: () => number) {
  return Math.min(length - 1, Math.floor(random() * length));
}

function takeRandom<T>(items: T[], random: () => number): T | undefined {
  if (!items.length) return undefined;
  const index = randomIndex(items.length, random);
  return items.splice(index, 1)[0];
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

  const budPool = [...buds];
  const bluffPool = [...bluffs];
  const deck: BudOrBluffCard[] = [];
  let remainingBud = budTarget;
  let remainingBluff = bluffTarget;

  while (deck.length < targetCount) {
    const lastTwo = deck.slice(-2).map((card) => card.answer);
    const blocksBud = lastTwo.length === 2 && lastTwo.every((answer) => answer === "BUD");
    const blocksBluff = lastTwo.length === 2 && lastTwo.every((answer) => answer === "BLUFF");

    const canBud = remainingBud > 0 && !blocksBud;
    const canBluff = remainingBluff > 0 && !blocksBluff;

    let answer: "BUD" | "BLUFF";
    if (canBud && canBluff) {
      const total = remainingBud + remainingBluff;
      answer = random() < remainingBud / total ? "BUD" : "BLUFF";
    } else if (canBud) {
      answer = "BUD";
    } else if (canBluff) {
      answer = "BLUFF";
    } else if (remainingBud > 0) {
      answer = "BUD";
    } else {
      answer = "BLUFF";
    }

    const next = answer === "BUD" ? takeRandom(budPool, random) : takeRandom(bluffPool, random);
    if (!next) break;

    deck.push(next);
    if (answer === "BUD") remainingBud -= 1;
    else remainingBluff -= 1;
  }

  return deck;
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
