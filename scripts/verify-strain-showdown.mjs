import fs from "node:fs";
import path from "node:path";
import {
  STRAIN_SHOWDOWN_BATTLE_RULESET,
  createBattleUnit,
  resolveStrainBattle,
} from "../lib/games/strain-showdown-engine.ts";

const root = process.cwd();
const data = JSON.parse(fs.readFileSync(path.join(root, "data/games/strain-showdown/tier-1.json"), "utf8"));

function assert(condition, message) {
  if (!condition) throw new Error(`Strain Showdown verification failed: ${message}`);
}

const expectedFamilies = ["Kush", "Haze", "Skunk", "Gas", "Cookies", "Fruit", "Purple", "Frost"];
const forbidden = new Set(["Diesel", "Sweet", "Resin", "Legendary", "Dessert"]);

assert(data.status === "approval-draft", "Tier 1 data must retain approval-draft status");
assert(JSON.stringify(data.families) === JSON.stringify(expectedFamilies), "family list/order must remain locked");
assert(data.cards.length === 48, "Tier 1 must contain exactly 48 cards");
assert(new Set(data.cards.map((card) => card.id)).size === 48, "card IDs must be unique");
assert(new Set(data.cards.map((card) => card.name)).size === 48, "card names must be unique");
assert(JSON.stringify(data.cards.map((card) => card.order)) === JSON.stringify(Array.from({ length: 48 }, (_, index) => index + 1)), "card order must remain 1-48");

for (const family of expectedFamilies) {
  const cards = data.cards.filter((card) => card.family === family);
  assert(cards.length === 6, `${family} must have exactly six Tier 1 cards`);
}

for (const card of data.cards) {
  assert(expectedFamilies.includes(card.family), `${card.name} has invalid primary family`);
  assert(Array.isArray(card.categories) && card.categories.length >= 1 && card.categories.length <= 2, `${card.name} must display one or two categories`);
  assert(card.categories[0] === card.family, `${card.name} primary displayed category must match family`);
  assert(card.categories.every((category) => expectedFamilies.includes(category)), `${card.name} contains an off-system category`);
  assert(card.categories.every((category) => !forbidden.has(category)), `${card.name} contains a forbidden category`);
  assert(Number.isInteger(card.vigor) && card.vigor >= 2 && card.vigor <= 5, `${card.name} Vigor must stay in Tier 1 range`);
  assert(Number.isInteger(card.power) && card.power >= 2 && card.power <= 5, `${card.name} Power must stay in Tier 1 range`);
  assert(typeof card.effectKey === "string" && card.effectKey.length >= 4, `${card.name} needs a structured effect key`);
  assert(typeof card.effectText === "string" && card.effectText.length >= 20, `${card.name} needs readable effect text`);
}

const anchors = new Map(data.cards.map((card) => [card.name, card]));
const card = (name) => {
  const found = anchors.get(name);
  assert(found, `missing test anchor card ${name}`);
  return found;
};

assert(card("Chemdawg").vigor === 3 && card("Chemdawg").power === 4, "Chemdawg must remain 3/4");
assert(card("Chemdawg").effectText === "When this attacks, it gets +1 Power this battle.", "Chemdawg effect changed");
assert(card("Sour Diesel").vigor === 2 && card("Sour Diesel").power === 5, "Sour Diesel must remain 2/5");
assert(card("Purple Kush").vigor === 5 && card("Purple Kush").power === 2, "Purple Kush must remain 5/2");
assert(card("White Fire OG").vigor === 3 && card("White Fire OG").power === 4, "White Fire OG must remain 3/4");

const sourceReview = data.cards.filter((entry) => entry.sourceReview !== "normal");
assert(sourceReview.length === 1, "exactly one Tier 1 card should remain flagged for lineage source review");
assert(sourceReview[0]?.name === "Mango Kush", "Mango Kush should be the only remaining lineage-review flag");
assert(card("Mango Haze").sourceReview === "normal", "Mango Haze should be cleared after primary-breeder source review");
assert(card("Mango Haze").lineageSource === "https://mrnice.com/product/mango-haze/", "Mango Haze must retain its primary-breeder source URL");
assert(card("Mango Haze").lineageNote?.includes("25% NL5"), "Mango Haze must retain the breeder-documented lineage note");
assert(card("Mango Kush").lineageNote?.includes("original breeder/origin remains poorly documented"), "Mango Kush uncertainty must remain explicit");

for (let page = 0; page < 6; page += 1) {
  const cycle = data.cards.slice(page * 8, page * 8 + 8).map((entry) => entry.family);
  assert(JSON.stringify(cycle) === JSON.stringify(expectedFamilies), `production page ${page + 1} must contain one card from each family`);
}

assert(STRAIN_SHOWDOWN_BATTLE_RULESET.status === "experimental", "battle resolver must remain explicitly experimental until the full ruleset is locked");

const chemIntoHindu = resolveStrainBattle(createBattleUnit(card("Chemdawg")), createBattleUnit(card("Hindu Kush")));
assert(chemIntoHindu.attackerPower === 5, "Chemdawg must gain +1 Power while attacking");
assert(chemIntoHindu.defenderPower === 2, "Hindu Kush counter-Power must remain 2");
assert(chemIntoHindu.attackerVigorAfter === 1, "Chemdawg should survive Hindu Kush counter-damage at 1 Vigor");
assert(chemIntoHindu.defenderVigorAfter === 0 && chemIntoHindu.winner === "attacker", "Chemdawg should defeat Hindu Kush in the alpha resolver");

const skunkIntoChem = resolveStrainBattle(createBattleUnit(card("Skunk #1")), createBattleUnit(card("Chemdawg")));
assert(skunkIntoChem.defenderPower === 3, "Skunk #1 must reduce the defender by 1 Power this battle");
assert(skunkIntoChem.attackerDefeated && skunkIntoChem.defenderDefeated && skunkIntoChem.winner === "double-ko", "Skunk #1 vs Chemdawg should resolve as a double KO after the debuff");

const hinduIntoUrkle = resolveStrainBattle(createBattleUnit(card("Hindu Kush")), createBattleUnit(card("Purple Urkle")));
assert(hinduIntoUrkle.defenderVigorAfter === 3, "Purple Urkle should restore 1 Vigor after surviving the attack");
assert(hinduIntoUrkle.events.filter((event) => event.type === "survive-restore" && event.source === "purple-urkle").length === 1, "Purple Urkle survival recovery must trigger exactly once");

const hinduIntoWidow = resolveStrainBattle(createBattleUnit(card("Hindu Kush")), createBattleUnit(card("White Widow")));
assert(hinduIntoWidow.defenderDamageTaken === 1, "White Widow must prevent 1 damage from the first attack");
assert(hinduIntoWidow.nextDefenderState.firstAttackProtectionUsed === true, "White Widow first-attack protection must be marked used");
assert(hinduIntoWidow.events.filter((event) => event.type === "damage-prevented" && event.source === "white-widow").length === 1, "White Widow damage prevention must emit one event");

const tangieAttack = resolveStrainBattle(createBattleUnit(card("Tangie")), createBattleUnit(card("Hindu Kush")));
assert(tangieAttack.events.filter((event) => event.type === "after-attack-cycle" && event.source === "tangie").length === 1, "Tangie draw/discard trigger must resolve exactly once after it attacks");

const hinduIntoRhino = resolveStrainBattle(createBattleUnit(card("Hindu Kush")), createBattleUnit(card("White Rhino")));
assert(hinduIntoRhino.defenderDamageTaken === 1, "White Rhino must reduce its first Vigor loss by 1");
assert(hinduIntoRhino.nextDefenderState.firstVigorLossReductionUsed === true, "White Rhino Vigor-loss reduction must be marked used");

const ogIntoChemDefault = resolveStrainBattle(createBattleUnit(card("OG Kush")), createBattleUnit(card("Chemdawg")));
assert(ogIntoChemDefault.attackerVigorAfter === 1, "OG Kush optional battle Vigor should default on in the alpha resolver");
assert(ogIntoChemDefault.events.some((event) => event.type === "vigor-buffered" && event.source === "og-kush"), "OG Kush battle Vigor must emit a buffer event");

const ogIntoChemOptOut = resolveStrainBattle(
  createBattleUnit(card("OG Kush")),
  createBattleUnit(card("Chemdawg")),
  { attackerUsesOptionalVigor: false },
);
assert(ogIntoChemOptOut.attackerVigorAfter === 0, "OG Kush optional battle Vigor must be possible to decline");
assert(ogIntoChemOptOut.winner === "double-ko", "declining OG Kush battle Vigor should change this matchup to a double KO");

console.log(
  "Strain Showdown verified: 48 Tier 1 cards, 6 per family, family-cycle production order, Mango Haze primary-source review resolved, Mango Kush uncertainty preserved, and representative simultaneous-battle alpha effects.",
);
