import { expect, test } from "@playwright/test";
import { budOrBluffCards } from "../../lib/games/bud-or-bluff";
import { buildBalancedDeck, scoreCorrectGuess } from "../../lib/games/bud-or-bluff-engine";

test("balanced deck is not a predictable strict alternation and never runs three identical answers", () => {
  const deck = buildBalancedDeck(budOrBluffCards, 20, "All", () => 0.1);
  const answers = deck.map((card) => card.answer);

  expect(deck).toHaveLength(20);
  expect(answers.some((answer, index) => index > 0 && answer === answers[index - 1])).toBeTruthy();

  for (let index = 2; index < answers.length; index += 1) {
    expect(new Set(answers.slice(index - 2, index + 1)).size).toBeGreaterThan(1);
  }

  const budCount = answers.filter((answer) => answer === "BUD").length;
  const bluffCount = answers.length - budCount;
  expect(Math.abs(budCount - bluffCount)).toBeLessThanOrEqual(1);
});

test("every third correct answer in a streak awards a bonus point", () => {
  expect(scoreCorrectGuess(0)).toEqual({ streakAfter: 1, points: 1, bonus: 0 });
  expect(scoreCorrectGuess(1)).toEqual({ streakAfter: 2, points: 1, bonus: 0 });
  expect(scoreCorrectGuess(2)).toEqual({ streakAfter: 3, points: 2, bonus: 1 });
  expect(scoreCorrectGuess(5)).toEqual({ streakAfter: 6, points: 2, bonus: 1 });
});
