export const STRAIN_SHOWDOWN_BATTLE_RULESET = {
  id: "tier1-simultaneous-alpha-v1",
  status: "experimental" as const,
  description:
    "A deterministic Tier 1 combat layer: the attacking and defending Strains exchange Power damage simultaneously, then survival/battle effects resolve.",
} as const;

export interface StrainCardDefinition {
  id: string;
  name: string;
  family: string;
  categories: string[];
  vigor: number;
  power: number;
  effectKey: string;
  effectText: string;
}

export interface BattleUnitState {
  card: StrainCardDefinition;
  currentVigor: number;
  boosted?: boolean;
  firstAttackProtectionUsed?: boolean;
  firstVigorLossReductionUsed?: boolean;
}

export interface BattleContext {
  defenderControlsPurpleLocation?: boolean;
  attackerUsesOptionalVigor?: boolean;
  defenderUsesOptionalVigor?: boolean;
}

export type BattleEventType =
  | "after-attack-cycle"
  | "survive-cycle"
  | "win-remove-boost"
  | "survive-restore"
  | "damage-prevented"
  | "power-modified"
  | "vigor-buffered";

export interface BattleEvent {
  type: BattleEventType;
  side: "attacker" | "defender";
  amount?: number;
  source: string;
}

export interface BattleResult {
  ruleset: typeof STRAIN_SHOWDOWN_BATTLE_RULESET.id;
  attackerPower: number;
  defenderPower: number;
  attackerDamageTaken: number;
  defenderDamageTaken: number;
  attackerVigorBefore: number;
  defenderVigorBefore: number;
  attackerVigorAfter: number;
  defenderVigorAfter: number;
  attackerDefeated: boolean;
  defenderDefeated: boolean;
  winner: "attacker" | "defender" | "double-ko" | "none";
  events: BattleEvent[];
  nextAttackerState: BattleUnitState;
  nextDefenderState: BattleUnitState;
}

function clampVigor(value: number, card: StrainCardDefinition) {
  return Math.max(0, Math.min(card.vigor, Math.trunc(value)));
}

function addEvent(
  events: BattleEvent[],
  type: BattleEventType,
  side: "attacker" | "defender",
  source: string,
  amount?: number,
) {
  events.push({ type, side, source, ...(amount === undefined ? {} : { amount }) });
}

function attackPower(card: StrainCardDefinition, boosted: boolean, opposingVigor: number, events: BattleEvent[]) {
  let power = card.power;

  if (card.effectKey === "attack-power-up" || card.effectKey === "once-turn-attack-power-up") {
    power += 1;
    addEvent(events, "power-modified", "attacker", card.id, 1);
  }
  if (card.effectKey === "boosted-attacking-power-up" && boosted) {
    power += 1;
    addEvent(events, "power-modified", "attacker", card.id, 1);
  }
  if (card.effectKey === "attack-higher-vigor-power-up" && opposingVigor > card.vigor) {
    power += 1;
    addEvent(events, "power-modified", "attacker", card.id, 1);
  }

  return power;
}

function defendingPower(card: StrainCardDefinition, attackerCard: StrainCardDefinition, events: BattleEvent[]) {
  let power = card.power;
  if (attackerCard.effectKey === "attack-defender-power-down") {
    power = Math.max(0, power - 1);
    addEvent(events, "power-modified", "defender", attackerCard.id, -1);
  }
  return power;
}

function temporaryVigorBuffer(
  unit: BattleUnitState,
  side: "attacker" | "defender",
  context: BattleContext,
  events: BattleEvent[],
) {
  let buffer = 0;
  const key = unit.card.effectKey;

  if (side === "defender" && key === "defending-vigor-up") buffer += 1;
  if (side === "defender" && key === "purple-location-vigor-up" && context.defenderControlsPurpleLocation) buffer += 1;
  if (key === "battle-vigor-choice") {
    const useOptional = side === "attacker" ? context.attackerUsesOptionalVigor !== false : context.defenderUsesOptionalVigor !== false;
    if (useOptional) buffer += 1;
  }

  if (buffer > 0) addEvent(events, "vigor-buffered", side, unit.card.id, buffer);
  return buffer;
}

function reduceIncomingDamage(
  unit: BattleUnitState,
  side: "attacker" | "defender",
  incoming: number,
  events: BattleEvent[],
) {
  let damage = Math.max(0, incoming);
  let usedAttackProtection = Boolean(unit.firstAttackProtectionUsed);
  let usedVigorReduction = Boolean(unit.firstVigorLossReductionUsed);

  if (
    side === "defender" &&
    unit.card.effectKey === "first-attack-prevent-damage" &&
    !usedAttackProtection &&
    damage > 0
  ) {
    damage = Math.max(0, damage - 1);
    usedAttackProtection = true;
    addEvent(events, "damage-prevented", side, unit.card.id, 1);
  }

  if (unit.card.effectKey === "first-vigor-loss-reduce" && !usedVigorReduction && damage > 0) {
    damage = Math.max(0, damage - 1);
    usedVigorReduction = true;
    addEvent(events, "damage-prevented", side, unit.card.id, 1);
  }

  return { damage, usedAttackProtection, usedVigorReduction };
}

function applyDamage(currentVigor: number, buffer: number, damage: number) {
  const absorbedByBuffer = Math.min(buffer, damage);
  const persistentDamage = Math.max(0, damage - absorbedByBuffer);
  return Math.max(0, currentVigor - persistentDamage);
}

export function createBattleUnit(card: StrainCardDefinition): BattleUnitState {
  return {
    card,
    currentVigor: card.vigor,
    boosted: false,
    firstAttackProtectionUsed: false,
    firstVigorLossReductionUsed: false,
  };
}

export function resolveStrainBattle(
  attackerInput: BattleUnitState,
  defenderInput: BattleUnitState,
  context: BattleContext = {},
): BattleResult {
  const attacker: BattleUnitState = {
    ...attackerInput,
    currentVigor: clampVigor(attackerInput.currentVigor, attackerInput.card),
  };
  const defender: BattleUnitState = {
    ...defenderInput,
    currentVigor: clampVigor(defenderInput.currentVigor, defenderInput.card),
  };
  const events: BattleEvent[] = [];

  const attackerBuffer = temporaryVigorBuffer(attacker, "attacker", context, events);
  const defenderBuffer = temporaryVigorBuffer(defender, "defender", context, events);
  const attackerPowerValue = attackPower(attacker.card, Boolean(attacker.boosted), defender.currentVigor, events);
  const defenderPowerValue = defendingPower(defender.card, attacker.card, events);

  const attackerIncoming = reduceIncomingDamage(attacker, "attacker", defenderPowerValue, events);
  const defenderIncoming = reduceIncomingDamage(defender, "defender", attackerPowerValue, events);

  const attackerAfter = applyDamage(attacker.currentVigor, attackerBuffer, attackerIncoming.damage);
  let defenderAfter = applyDamage(defender.currentVigor, defenderBuffer, defenderIncoming.damage);

  const attackerDefeatedBeforeRecovery = attackerAfter <= 0;
  const defenderDefeatedBeforeRecovery = defenderAfter <= 0;

  if (!defenderDefeatedBeforeRecovery && defender.card.effectKey === "survive-restore-self") {
    const before = defenderAfter;
    defenderAfter = Math.min(defender.card.vigor, defenderAfter + 1);
    const restored = defenderAfter - before;
    if (restored > 0) addEvent(events, "survive-restore", "defender", defender.card.id, restored);
  }

  if (attacker.card.effectKey.startsWith("after-attack-cycle")) {
    addEvent(events, "after-attack-cycle", "attacker", attacker.card.id, 1);
  }
  if (!defenderDefeatedBeforeRecovery && defender.card.effectKey === "survive-cycle") {
    addEvent(events, "survive-cycle", "defender", defender.card.id, 1);
  }
  if (!attackerDefeatedBeforeRecovery && defenderDefeatedBeforeRecovery && attacker.card.effectKey === "win-remove-boost") {
    addEvent(events, "win-remove-boost", "attacker", attacker.card.id, 1);
  }

  const attackerDefeated = attackerAfter <= 0;
  const defenderDefeated = defenderAfter <= 0;
  const winner = attackerDefeated && defenderDefeated
    ? "double-ko"
    : defenderDefeated
      ? "attacker"
      : attackerDefeated
        ? "defender"
        : "none";

  return {
    ruleset: STRAIN_SHOWDOWN_BATTLE_RULESET.id,
    attackerPower: attackerPowerValue,
    defenderPower: defenderPowerValue,
    attackerDamageTaken: attackerIncoming.damage,
    defenderDamageTaken: defenderIncoming.damage,
    attackerVigorBefore: attacker.currentVigor,
    defenderVigorBefore: defender.currentVigor,
    attackerVigorAfter: attackerAfter,
    defenderVigorAfter: defenderAfter,
    attackerDefeated,
    defenderDefeated,
    winner,
    events,
    nextAttackerState: {
      ...attacker,
      currentVigor: attackerAfter,
      firstAttackProtectionUsed: attackerIncoming.usedAttackProtection,
      firstVigorLossReductionUsed: attackerIncoming.usedVigorReduction,
    },
    nextDefenderState: {
      ...defender,
      currentVigor: defenderAfter,
      firstAttackProtectionUsed: defenderIncoming.usedAttackProtection,
      firstVigorLossReductionUsed: defenderIncoming.usedVigorReduction,
    },
  };
}
