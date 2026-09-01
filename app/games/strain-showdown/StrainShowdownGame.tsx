"use client";

import { useMemo, useState } from "react";
import tierOne from "@/data/games/strain-showdown/tier-1.json";
import {
  STRAIN_SHOWDOWN_BATTLE_RULESET,
  createBattleUnit,
  resolveStrainBattle,
  type BattleResult,
} from "@/lib/games/strain-showdown-engine";
import styles from "./page.module.css";

const FAMILY_ORDER = ["Kush", "Haze", "Skunk", "Gas", "Cookies", "Fruit", "Purple", "Frost"] as const;
type Family = (typeof FAMILY_ORDER)[number];
type Card = (typeof tierOne.cards)[number];

const familyShort: Record<Family, string> = {
  Kush: "KSH",
  Haze: "HAZ",
  Skunk: "SKK",
  Gas: "GAS",
  Cookies: "CKS",
  Fruit: "FRT",
  Purple: "PUR",
  Frost: "FST",
};

function resultLabel(result: BattleResult | null) {
  if (!result) return "Awaiting matchup";
  if (result.winner === "attacker") return "Attacker wins";
  if (result.winner === "defender") return "Defender wins";
  if (result.winner === "double-ko") return "Double knockout";
  return "Both Strains survive";
}

function eventLabel(type: BattleResult["events"][number]["type"]) {
  return {
    "after-attack-cycle": "Draw 1, then discard 1",
    "survive-cycle": "Survival draw/discard trigger",
    "win-remove-boost": "Remove a Boost from the defeated Strain",
    "survive-restore": "Restore Vigor after surviving",
    "damage-prevented": "Prevent/reduce incoming damage",
    "power-modified": "Power modified for this battle",
    "vigor-buffered": "Temporary battle Vigor applied",
  }[type];
}

function StrainCard({ card, role, afterVigor }: { card: Card; role: string; afterVigor?: number }) {
  const current = afterVigor ?? card.vigor;
  const pct = Math.max(0, Math.min(100, (current / card.vigor) * 100));
  return (
    <article className={styles.strainCard} data-family={card.family.toLowerCase()}>
      <div className={styles.cardHeader}>
        <span className={styles.familyIcon}>{familyShort[card.family as Family]}</span>
        <div>
          <span>{role}</span>
          <strong>{card.family}</strong>
        </div>
        <span className={styles.tier}>Tier 1</span>
      </div>

      <div className={styles.cardNameWrap}>
        <p>{card.categories.join(" / ")}</p>
        <h3>{card.name}</h3>
      </div>

      <div className={styles.stats}>
        <div>
          <span>Vigor</span>
          <strong>{current}</strong>
          <small>/{card.vigor}</small>
        </div>
        <div>
          <span>Power</span>
          <strong>{card.power}</strong>
        </div>
      </div>

      <div className={styles.vigorTrack} aria-label={`${card.name} Vigor ${current} of ${card.vigor}`}>
        <span style={{ width: `${pct}%` }} />
      </div>

      <p className={styles.effect}>{card.effectText}</p>
      {card.sourceReview !== "normal" && <p className={styles.reviewFlag}>Lineage source review still open</p>}
    </article>
  );
}

export function StrainShowdownGame() {
  const cards = tierOne.cards;
  const [attackerFamily, setAttackerFamily] = useState<Family | "All">("Gas");
  const [defenderFamily, setDefenderFamily] = useState<Family | "All">("Kush");
  const [attackerId, setAttackerId] = useState("chemdawg");
  const [defenderId, setDefenderId] = useState("hindu-kush");
  const [result, setResult] = useState<BattleResult | null>(null);
  const [purpleLocation, setPurpleLocation] = useState(false);
  const [ogVigor, setOgVigor] = useState(true);

  const attackerPool = useMemo(
    () => cards.filter((card) => attackerFamily === "All" || card.family === attackerFamily),
    [cards, attackerFamily],
  );
  const defenderPool = useMemo(
    () => cards.filter((card) => defenderFamily === "All" || card.family === defenderFamily),
    [cards, defenderFamily],
  );

  const attacker = cards.find((card) => card.id === attackerId) ?? cards[0];
  const defender = cards.find((card) => card.id === defenderId) ?? cards[1];

  function chooseFamily(side: "attacker" | "defender", value: Family | "All") {
    const pool = cards.filter((card) => value === "All" || card.family === value);
    if (side === "attacker") {
      setAttackerFamily(value);
      if (!pool.some((card) => card.id === attackerId)) setAttackerId(pool[0]?.id ?? cards[0].id);
    } else {
      setDefenderFamily(value);
      if (!pool.some((card) => card.id === defenderId)) setDefenderId(pool[0]?.id ?? cards[1].id);
    }
    setResult(null);
  }

  function resolve() {
    setResult(
      resolveStrainBattle(createBattleUnit(attacker), createBattleUnit(defender), {
        defenderControlsPurpleLocation: purpleLocation,
        attackerUsesOptionalVigor: ogVigor,
        defenderUsesOptionalVigor: ogVigor,
      }),
    );
  }

  function reset() {
    setResult(null);
  }

  return (
    <div className={styles.gameShell}>
      <section className={styles.controlDeck} aria-label="Strain Showdown matchup controls">
        <div className={styles.controlHeading}>
          <div>
            <p>Tier 1 battle lab</p>
            <h2>Build a matchup</h2>
          </div>
          <span className={styles.ruleset}>{STRAIN_SHOWDOWN_BATTLE_RULESET.status} ruleset</span>
        </div>

        <div className={styles.pickerGrid}>
          <fieldset>
            <legend>Attacker</legend>
            <label>
              Family
              <select value={attackerFamily} onChange={(event) => chooseFamily("attacker", event.target.value as Family | "All")}>
                <option>All</option>
                {FAMILY_ORDER.map((family) => <option key={family}>{family}</option>)}
              </select>
            </label>
            <label>
              Strain
              <select value={attacker.id} onChange={(event) => { setAttackerId(event.target.value); setResult(null); }}>
                {attackerPool.map((card) => <option value={card.id} key={card.id}>{card.name} · {card.vigor}/{card.power}</option>)}
              </select>
            </label>
          </fieldset>

          <fieldset>
            <legend>Defender</legend>
            <label>
              Family
              <select value={defenderFamily} onChange={(event) => chooseFamily("defender", event.target.value as Family | "All")}>
                <option>All</option>
                {FAMILY_ORDER.map((family) => <option key={family}>{family}</option>)}
              </select>
            </label>
            <label>
              Strain
              <select value={defender.id} onChange={(event) => { setDefenderId(event.target.value); setResult(null); }}>
                {defenderPool.map((card) => <option value={card.id} key={card.id}>{card.name} · {card.vigor}/{card.power}</option>)}
              </select>
            </label>
          </fieldset>
        </div>

        <div className={styles.ruleToggles}>
          <label><input type="checkbox" checked={purpleLocation} onChange={(event) => { setPurpleLocation(event.target.checked); setResult(null); }} /> Defender controls a Purple Location</label>
          <label><input type="checkbox" checked={ogVigor} onChange={(event) => { setOgVigor(event.target.checked); setResult(null); }} /> Use optional OG Kush battle Vigor</label>
        </div>
      </section>

      <section className={styles.arena} aria-label="Strain Showdown battle arena">
        <StrainCard card={attacker} role="Attacking Strain" afterVigor={result?.attackerVigorAfter} />

        <div className={styles.centerConsole}>
          <span className={styles.vs}>VS</span>
          <strong>{resultLabel(result)}</strong>
          {result ? (
            <div className={styles.damageReadout}>
              <span>{result.attackerPower} Power → {result.defenderDamageTaken} damage</span>
              <span>{result.defenderPower} counter → {result.attackerDamageTaken} damage</span>
            </div>
          ) : (
            <p>Both Strains exchange Power damage simultaneously in this experimental Tier 1 rules layer.</p>
          )}
          <div className={styles.battleActions}>
            <button type="button" onClick={resolve}>Resolve showdown</button>
            <button type="button" className={styles.secondaryButton} onClick={reset} disabled={!result}>Reset</button>
          </div>
        </div>

        <StrainCard card={defender} role="Defending Strain" afterVigor={result?.defenderVigorAfter} />
      </section>

      <section className={styles.eventPanel} aria-live="polite">
        <div>
          <p>Battle log</p>
          <h2>{result ? `${attacker.name} vs ${defender.name}` : "Resolve a matchup to inspect effects"}</h2>
        </div>
        {result ? (
          <ol>
            <li><strong>Exchange:</strong> {attacker.name} attacks at {result.attackerPower} Power; {defender.name} counters at {result.defenderPower} Power.</li>
            {result.events.map((event, index) => (
              <li key={`${event.type}-${event.source}-${index}`}><strong>{event.source}:</strong> {eventLabel(event.type)}{event.amount === undefined ? "" : ` (${event.amount > 0 ? "+" : ""}${event.amount})`}.</li>
            ))}
            <li><strong>Result:</strong> {resultLabel(result)}. Final Vigor {result.attackerVigorAfter}–{result.defenderVigorAfter}.</li>
          </ol>
        ) : (
          <p className={styles.emptyLog}>Select any of the 48 Tier 1 cards, then resolve the battle. Source-review flags stay visible instead of being hidden from the player/developer workflow.</p>
        )}
      </section>
    </div>
  );
}
