import { DeterministicRng } from "../game/core/random/DeterministicRng.ts";

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function approx(actual, expected, epsilon = 1e-12) {
  return Math.abs(actual - expected) <= epsilon;
}

const expected = [
  0.1330479981843382,
  0.9552457584068179,
  0.6820800814311951,
  0.5836122329346836,
  0.3880935769993812,
];

const compatibility = new DeterministicRng("DTF-420");
for (const [index, expectedValue] of expected.entries()) {
  const actual = compatibility.next();
  assert(
    approx(actual, expectedValue),
    `compatibility sequence changed at index ${index}: expected ${expectedValue}, got ${actual}`,
  );
}

const first = new DeterministicRng("repeatable-seed");
const second = new DeterministicRng("repeatable-seed");
for (let index = 0; index < 100; index += 1) {
  assert(first.next() === second.next(), `same seed diverged at draw ${index}`);
}

const source = ["a", "b", "c", "d", "e", "f"];
const shuffleA = new DeterministicRng("shuffle").shuffle(source);
const shuffleB = new DeterministicRng("shuffle").shuffle(source);
assert(JSON.stringify(shuffleA) === JSON.stringify(shuffleB), "shuffle must be deterministic");
assert(JSON.stringify(source) === JSON.stringify(["a", "b", "c", "d", "e", "f"]), "shuffle must not mutate its input");

const forkParent = new DeterministicRng("parent");
const forkA = forkParent.fork("cosmetic");
const forkB = forkParent.fork("cosmetic");
assert(forkA.next() === forkB.next(), "same named fork must produce the same stream at the same parent state");

const beforeForkCheck = new DeterministicRng("parent");
const expectedParentNext = beforeForkCheck.next();
const afterForkCheck = new DeterministicRng("parent");
afterForkCheck.fork("cosmetic");
assert(afterForkCheck.next() === expectedParentNext, "fork must not consume the parent stream");

const empty = new DeterministicRng("empty");
assert(empty.pick([]) === undefined, "pick([]) must return undefined");

if (errors.length) {
  console.error("Game core verification failed:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log("Game core verified: deterministic RNG compatibility, repeatability, non-mutating shuffle, pick, and fork isolation passed.");
