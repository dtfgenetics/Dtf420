"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type Mode = "solo" | "shared" | "duel";
type EntityTraits = Record<string, true>;

type Suspect = {
  id: string;
  coord: string;
  name: string;
  tags: string[];
  quote: string;
  traits: EntityTraits;
};

type Item = {
  id: string;
  name: string;
  tags: string[];
  flavor: string;
  traits: EntityTraits;
};

type Question = {
  id: string;
  text: string;
  target: "suspect" | "item" | "itemAny";
  trait?: string;
  traits?: string[];
  category: string;
};

type Mystery = { suspect: Suspect; item: Item };
type QuestionHistory = { question: Question; answer: boolean; answerLabel: "Yes" | "No"; player: string };
type Result = { win: boolean; suspectCorrect: boolean; itemCorrect: boolean } | null;

type RoundState = {
  mode: Mode;
  activePlayer: string;
  mysteries: Record<string, Mystery>;
  eliminatedByPlayer: Record<string, string[]>;
  eliminatedItemsByPlayer: Record<string, string[]>;
  historyByPlayer: Record<string, QuestionHistory[]>;
};

const STORAGE_KEY = "who-took-it:dtf420:v1";
const AGE_KEY = "who-took-it:dtf420:age-confirmed:v1";
const PLAYERS = ["Player 1", "Player 2"];
const MODES: { id: Mode; label: string; description: string }[] = [
  { id: "solo", label: "Solo", description: "The app hides one mystery for you to solve." },
  { id: "shared", label: "Group", description: "Everyone solves one shared app-run mystery." },
  { id: "duel", label: "Duel", description: "Pass the device. Each player solves the opponent case." },
];

const suspects: Suspect[] = [
  { id: "suspect_001", coord: "A1", name: "Pocket Benny", tags: ["Pocket", "Borrowing", "Hiding"], quote: "I was just holding it for somebody.", traits: { pocket: true, borrowing: true, hiding: true } },
  { id: "suspect_002", coord: "A2", name: "Sticky Dan", tags: ["Sticky", "Flame", "Tools"], quote: "It’s probably stuck to something.", traits: { sticky: true, flame: true, tools: true, heat: true } },
  { id: "suspect_003", coord: "A3", name: "Cocoa Charlie", tags: ["Sweet", "Crumbs", "Wrapper"], quote: "That wrapper was already there.", traits: { sweet: true, crumbs: true, wrapper: true } },
  { id: "suspect_004", coord: "A4", name: "Candy Mandy", tags: ["Bright", "Chaotic", "Flame"], quote: "I touched everything, but I took nothing.", traits: { bright: true, chaotic: true, flame: true } },
  { id: "suspect_005", coord: "A5", name: "Pouch Paul", tags: ["Pouch", "Tools", "Containers"], quote: "That’s not mine. That’s just my pouch.", traits: { pouch: true, tools: true, containers: true } },
  { id: "suspect_006", coord: "B1", name: "Borrowed Larry", tags: ["Borrowing", "Pocket", "Guilty"], quote: "I thought it was mine.", traits: { borrowing: true, pocket: true, guilty: true } },
  { id: "suspect_007", coord: "B2", name: "Rainbow Gina", tags: ["Colorful", "Sweet", "Sticky"], quote: "I only took the red ones.", traits: { colorful: true, sweet: true, sticky: true } },
  { id: "suspect_008", coord: "B3", name: "Ziplock Zara", tags: ["Organized", "Containers", "Sticky"], quote: "Everything has a label, so technically nothing is lost.", traits: { organized: true, containers: true, sticky: true } },
  { id: "suspect_009", coord: "B4", name: "Wrapper Wendy", tags: ["Wrapper", "Defensive", "Flame"], quote: "Wrappers don’t prove anything.", traits: { wrapper: true, defensive: true, flame: true } },
  { id: "suspect_010", coord: "B5", name: "Rig Rick", tags: ["Technical", "Glass", "Candy"], quote: "According to my setup, I couldn’t have taken it.", traits: { technical: true, glass: true, candy: true } },
  { id: "suspect_011", coord: "C1", name: "Stash Kelly", tags: ["Hiding", "Secretive", "Snack"], quote: "I put it somewhere safe.", traits: { hiding: true, secretive: true, snack: true } },
  { id: "suspect_012", coord: "C2", name: "Flick Nick", tags: ["Fidgety", "Flame", "Tools"], quote: "I click it when I’m nervous.", traits: { fidgety: true, flame: true, tools: true, heat: true } },
  { id: "suspect_013", coord: "C3", name: "Munchie Mike", tags: ["Food", "Couch", "Sweet"], quote: "I blacked out at snack time.", traits: { food: true, couch: true, sweet: true } },
  { id: "suspect_014", coord: "C4", name: "Wax Max", tags: ["Sticky", "Messy", "Pouch"], quote: "Nobody move. It might be on my sleeve.", traits: { sticky: true, messy: true, pouch: true } },
  { id: "suspect_015", coord: "C5", name: "Be-Right-Back Brenna", tags: ["Borrowing", "Forgetful", "Candy"], quote: "I was literally about to give it back.", traits: { borrowing: true, forgetful: true, candy: true } },
  { id: "suspect_016", coord: "D1", name: "Brownie Barry", tags: ["Dessert", "Sticky", "Sleepy"], quote: "I was just checking the texture.", traits: { dessert: true, sticky: true, sleepy: true } },
  { id: "suspect_017", coord: "D2", name: "Backpack Becky", tags: ["Carrying", "Forgetful", "Candy"], quote: "It might be in my bag, but I swear I didn’t take it.", traits: { carrying: true, forgetful: true, candy: true } },
  { id: "suspect_018", coord: "D3", name: "Torch Tina", tags: ["Flame", "Tools", "Confident"], quote: "I only borrowed the flame.", traits: { flame: true, tools: true, confident: true, heat: true } },
  { id: "suspect_019", coord: "D4", name: "Sugar Sarah", tags: ["Sweet", "Sneaky", "Wrapper"], quote: "I was just cleaning up the candy area.", traits: { sweet: true, sneaky: true, wrapper: true } },
  { id: "suspect_020", coord: "D5", name: "Blunt Bruce", tags: ["Smoke", "Pocket", "Flame"], quote: "Anybody got a light?", traits: { smoke: true, pocket: true, flame: true, heat: true } },
  { id: "suspect_021", coord: "E1", name: "Chewy Louie", tags: ["Chewing", "Pouch", "Relaxed"], quote: "I don’t know. I was chewing.", traits: { chewing: true, pouch: true, relaxed: true } },
  { id: "suspect_022", coord: "E2", name: "Glob Bob", tags: ["Sticky", "Snack", "Excessive"], quote: "I don’t remember, but it was probably fire.", traits: { sticky: true, snack: true, excessive: true } },
  { id: "suspect_023", coord: "E3", name: "Velvet Chloe", tags: ["Calm", "Fancy", "Hiding"], quote: "I would never take cheap chocolate.", traits: { calm: true, fancy: true, hiding: true } },
  { id: "suspect_024", coord: "E4", name: "Sparky Mark", tags: ["Flame", "Loud", "Snack"], quote: "Why would I take anything? Also, who has chocolate?", traits: { flame: true, loud: true, snack: true, heat: true } },
  { id: "suspect_025", coord: "E5", name: "Edible Eddie", tags: ["Confused", "Sleepy", "Sticky"], quote: "Wait, what are we looking for?", traits: { confused: true, sleepy: true, sticky: true } },
];

const items: Item[] = [
  { id: "item_bag", name: "Bag", tags: ["Carrying", "Hiding", "Pocket", "Stash", "Container"], flavor: "It was here a second ago.", traits: { carrying: true, hiding: true, pocket: true, containers: true, pouch: true } },
  { id: "item_dabs", name: "Dabs", tags: ["Sticky", "Glass", "Tool", "Heat", "Concentrate"], flavor: "Someone left a sticky trail.", traits: { sticky: true, glass: true, tools: true, heat: true } },
  { id: "item_lighter", name: "Lighter", tags: ["Flame", "Borrowing", "Pocket", "Smoke Tool", "Missing Again"], flavor: "Classic. It vanished again.", traits: { flame: true, heat: true, borrowing: true, pocket: true, smoke: true, tools: true } },
  { id: "item_chocolate", name: "Chocolate Bar", tags: ["Snack", "Wrapper", "Crumbs", "Sweet", "Munchies"], flavor: "Only the wrapper survived.", traits: { snack: true, sweet: true, chocolate: true, wrapper: true, crumbs: true, food: true, dessert: true, edible: true } },
  { id: "item_gummies", name: "Gummies", tags: ["Candy", "Sticky", "Colorful", "Edible", "Sugar"], flavor: "The bag is empty and nobody is talking.", traits: { candy: true, sticky: true, colorful: true, edible: true, sugar: true, sweet: true, snack: true } },
];

const questions: Question[] = [
  { id: "q_s_pocket", text: "Does your suspect have pocket evidence?", target: "suspect", trait: "pocket", category: "Carrying + Hiding" },
  { id: "q_s_carrying", text: "Does your suspect carry something?", target: "suspect", trait: "carrying", category: "Carrying + Hiding" },
  { id: "q_s_hiding", text: "Does your suspect hide or conceal things?", target: "suspect", trait: "hiding", category: "Carrying + Hiding" },
  { id: "q_s_pouch", text: "Does your suspect have pouch evidence?", target: "suspect", trait: "pouch", category: "Carrying + Hiding" },
  { id: "q_s_containers", text: "Does your suspect use containers?", target: "suspect", trait: "containers", category: "Carrying + Hiding" },
  { id: "q_s_sticky", text: "Does your suspect have sticky evidence?", target: "suspect", trait: "sticky", category: "Sticky + Tools" },
  { id: "q_s_messy", text: "Does your suspect look messy?", target: "suspect", trait: "messy", category: "Sticky + Tools" },
  { id: "q_s_tools", text: "Does your suspect have tool evidence?", target: "suspect", trait: "tools", category: "Sticky + Tools" },
  { id: "q_s_flame", text: "Does your suspect have flame evidence?", target: "suspect", trait: "flame", category: "Flame + Smoke" },
  { id: "q_s_smoke", text: "Is your suspect connected to smoke tools or smoke behavior?", target: "suspect", trait: "smoke", category: "Flame + Smoke" },
  { id: "q_s_snack", text: "Does your suspect have snack evidence?", target: "suspect", trait: "snack", category: "Snack + Sweet" },
  { id: "q_s_sweet", text: "Is your suspect connected to sweets?", target: "suspect", trait: "sweet", category: "Snack + Sweet" },
  { id: "q_s_candy", text: "Does your suspect have candy evidence?", target: "suspect", trait: "candy", category: "Snack + Sweet" },
  { id: "q_s_wrapper", text: "Does your suspect have wrapper evidence?", target: "suspect", trait: "wrapper", category: "Snack + Sweet" },
  { id: "q_s_borrowing", text: "Is your suspect known for borrowing?", target: "suspect", trait: "borrowing", category: "Behavior" },
  { id: "q_s_forgetful", text: "Is your suspect forgetful?", target: "suspect", trait: "forgetful", category: "Behavior" },
  { id: "q_s_sleepy", text: "Is your suspect sleepy?", target: "suspect", trait: "sleepy", category: "Behavior" },
  { id: "q_s_chaotic", text: "Is your suspect chaotic?", target: "suspect", trait: "chaotic", category: "Behavior" },
  { id: "q_s_sneaky", text: "Is your suspect sneaky?", target: "suspect", trait: "sneaky", category: "Behavior" },
  { id: "q_i_sticky", text: "Is the missing item sticky?", target: "item", trait: "sticky", category: "Item Clues" },
  { id: "q_i_heat", text: "Is the missing item connected to heat?", target: "item", trait: "heat", category: "Item Clues" },
  { id: "q_i_flame", text: "Is the missing item connected to flame?", target: "item", trait: "flame", category: "Item Clues" },
  { id: "q_i_snack", text: "Is the missing item snack-related?", target: "item", trait: "snack", category: "Item Clues" },
  { id: "q_i_sweet", text: "Is the missing item sweet?", target: "item", trait: "sweet", category: "Item Clues" },
  { id: "q_i_candy", text: "Is the missing item candy-related?", target: "item", trait: "candy", category: "Item Clues" },
  { id: "q_i_edible", text: "Is the missing item edible?", target: "item", trait: "edible", category: "Item Clues" },
  { id: "q_i_pocket", text: "Is the missing item pocket-related?", target: "item", trait: "pocket", category: "Item Clues" },
  { id: "q_i_carrying", text: "Is the missing item connected to carrying or holding?", target: "item", trait: "carrying", category: "Item Clues" },
  { id: "q_i_wrapper_or_crumbs", text: "Is the missing item connected to wrappers or crumbs?", target: "itemAny", traits: ["wrapper", "crumbs"], category: "Item Clues" },
];

const categories = Array.from(new Set(questions.map((question) => question.category)));

function randomFrom<T>(values: T[]) {
  return values[Math.floor(Math.random() * values.length)];
}

function createMystery(): Mystery {
  return { suspect: randomFrom(suspects), item: randomFrom(items) };
}

function createRoundState(mode: Mode): RoundState {
  if (mode === "duel") {
    return {
      mode,
      activePlayer: PLAYERS[0],
      mysteries: { [PLAYERS[0]]: createMystery(), [PLAYERS[1]]: createMystery() },
      eliminatedByPlayer: { [PLAYERS[0]]: [], [PLAYERS[1]]: [] },
      eliminatedItemsByPlayer: { [PLAYERS[0]]: [], [PLAYERS[1]]: [] },
      historyByPlayer: { [PLAYERS[0]]: [], [PLAYERS[1]]: [] },
    };
  }

  return {
    mode,
    activePlayer: mode === "shared" ? "Group" : "Solo Player",
    mysteries: { shared: createMystery() },
    eliminatedByPlayer: { shared: [] },
    eliminatedItemsByPlayer: { shared: [] },
    historyByPlayer: { shared: [] },
  };
}

function stateKey(round: RoundState) {
  return round.mode === "duel" ? round.activePlayer : "shared";
}

function targetMystery(round: RoundState) {
  if (round.mode !== "duel") return round.mysteries.shared;
  return round.activePlayer === PLAYERS[0] ? round.mysteries[PLAYERS[1]] : round.mysteries[PLAYERS[0]];
}

function answersYes(entity: { traits: EntityTraits }, question: Question) {
  if (question.target === "itemAny") return (question.traits ?? []).some((trait) => entity.traits[trait] === true);
  return question.trait ? entity.traits[question.trait] === true : false;
}

function answerQuestion(mystery: Mystery, question: Question) {
  return question.target === "suspect" ? answersYes(mystery.suspect, question) : answersYes(mystery.item, question);
}

function toggle(values: string[], id: string) {
  return values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
}

function bestLead(remainingSuspects: Suspect[], remainingItems: Item[], usedIds: Set<string>) {
  const ranked = questions
    .filter((question) => !usedIds.has(question.id))
    .map((question) => {
      const pool = question.target === "suspect" ? remainingSuspects : remainingItems;
      const yes = pool.filter((candidate) => answersYes(candidate, question)).length;
      const no = pool.length - yes;
      return { question, yes, no, expected: pool.length > 0 ? (2 * yes * no) / pool.length : 0 };
    })
    .filter((entry) => entry.expected > 0)
    .sort((a, b) => b.expected - a.expected || a.question.id.localeCompare(b.question.id));

  return ranked[0] ?? null;
}

function readSaved() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as { mode: Mode; round: RoundState; selectedSuspectId: string; selectedItemId: string; category: string; result: Result; latest: QuestionHistory | null } : null;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function initials(name: string) {
  return name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
}

export default function WhoTookItGame() {
  const saved = readSaved();
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [mode, setMode] = useState<Mode>(saved?.mode ?? "solo");
  const [round, setRound] = useState<RoundState>(() => saved?.round ?? createRoundState(saved?.mode ?? "solo"));
  const [selectedSuspectId, setSelectedSuspectId] = useState(saved?.selectedSuspectId ?? "");
  const [selectedItemId, setSelectedItemId] = useState(saved?.selectedItemId ?? "");
  const [category, setCategory] = useState(saved?.category ?? categories[0]);
  const [latest, setLatest] = useState<QuestionHistory | null>(saved?.latest ?? null);
  const [result, setResult] = useState<Result>(saved?.result ?? null);

  useEffect(() => {
    try { setAgeConfirmed(window.localStorage.getItem(AGE_KEY) === "confirmed"); } catch { setAgeConfirmed(false); }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, round, selectedSuspectId, selectedItemId, category, result, latest }));
    } catch {
      // storage can fail in private browsing; gameplay should continue.
    }
  }, [mode, round, selectedSuspectId, selectedItemId, category, result, latest]);

  const key = stateKey(round);
  const mystery = targetMystery(round);
  const eliminatedSuspects = round.eliminatedByPlayer[key] ?? [];
  const eliminatedItems = round.eliminatedItemsByPlayer[key] ?? [];
  const history = round.historyByPlayer[key] ?? [];
  const usedIds = useMemo(() => new Set(history.map((entry) => entry.question.id)), [history]);
  const remainingSuspects = useMemo(() => suspects.filter((suspect) => !eliminatedSuspects.includes(suspect.id)), [eliminatedSuspects]);
  const remainingItems = useMemo(() => items.filter((item) => !eliminatedItems.includes(item.id)), [eliminatedItems]);
  const recommended = bestLead(remainingSuspects, remainingItems, usedIds);
  const selectedSuspect = suspects.find((suspect) => suspect.id === selectedSuspectId);
  const selectedItem = items.find((item) => item.id === selectedItemId);

  function updateSlice(field: "eliminatedByPlayer" | "eliminatedItemsByPlayer" | "historyByPlayer", value: string[] | QuestionHistory[]) {
    setRound((current) => ({ ...current, [field]: { ...current[field], [stateKey(current)]: value } }));
  }

  function newCase(nextMode = mode) {
    setMode(nextMode);
    setRound(createRoundState(nextMode));
    setSelectedSuspectId("");
    setSelectedItemId("");
    setCategory(categories[0]);
    setLatest(null);
    setResult(null);
  }

  function ask(question: Question) {
    if (result || usedIds.has(question.id)) return;
    const answer = answerQuestion(mystery, question);
    const entry: QuestionHistory = { question, answer, answerLabel: answer ? "Yes" : "No", player: round.activePlayer };
    setLatest(entry);
    updateSlice("historyByPlayer", [...history, entry]);
  }

  function accuse() {
    if (!selectedSuspectId || !selectedItemId) return;
    setResult({
      suspectCorrect: mystery.suspect.id === selectedSuspectId,
      itemCorrect: mystery.item.id === selectedItemId,
      win: mystery.suspect.id === selectedSuspectId && mystery.item.id === selectedItemId,
    });
  }

  function confirmAge() {
    try { window.localStorage.setItem(AGE_KEY, "confirmed"); } catch {}
    setAgeConfirmed(true);
  }

  return (
    <div className={styles.gameShell}>
      {!ageConfirmed && (
        <section className={styles.ageGate} role="dialog" aria-modal="true" aria-labelledby="who-took-it-age-title">
          <div className={styles.ageCard}>
            <p className="eyebrow">THC · Teaching Healthy Cultivation</p>
            <h2 id="who-took-it-age-title">Adult party game. 21+ only.</h2>
            <p>Confirm you are 21 or older to open the case.</p>
            <button type="button" onClick={confirmAge}>Yes, I am 21+</button>
          </div>
        </section>
      )}

      <div className={styles.modeBar}>
        {MODES.map((entry) => (
          <button key={entry.id} type="button" className={mode === entry.id ? styles.activeMode : ""} onClick={() => newCase(entry.id)}>
            <strong>{entry.label}</strong><span>{entry.description}</span>
          </button>
        ))}
      </div>

      <section className={styles.hud} aria-live="polite">
        <div><span>Investigator</span><strong>{round.activePlayer}</strong></div>
        <div><span>Suspects left</span><strong>{remainingSuspects.length}/25</strong></div>
        <div><span>Items left</span><strong>{remainingItems.length}/5</strong></div>
        <div><span>Clues asked</span><strong>{history.length}</strong></div>
        {mode === "duel" && <button type="button" onClick={() => setRound((current) => ({ ...current, activePlayer: current.activePlayer === PLAYERS[0] ? PLAYERS[1] : PLAYERS[0] }))}>End turn / pass</button>}
      </section>

      <div className={styles.playArea}>
        <section className={styles.board} aria-labelledby="who-took-it-board">
          <div className={styles.sectionHead}>
            <p className="eyebrow">01 · Suspect board</p>
            <h2 id="who-took-it-board">Cross off bad leads.</h2>
          </div>
          <div className={styles.suspectGrid}>
            {suspects.map((suspect, index) => {
              const eliminated = eliminatedSuspects.includes(suspect.id);
              return (
                <article className={`${styles.suspectCard} ${eliminated ? styles.eliminated : ""}`} key={suspect.id}>
                  <button type="button" aria-pressed={eliminated} onClick={() => updateSlice("eliminatedByPlayer", toggle(eliminatedSuspects, suspect.id))}>
                    <span className={styles.coord}>{suspect.coord}</span>
                    <span className={styles.avatar} style={{ "--hue": `${(index * 37) % 360}` } as React.CSSProperties}>{initials(suspect.name)}</span>
                    <strong>{suspect.name}</strong>
                    <em>“{suspect.quote}”</em>
                    <span className={styles.tags}>{suspect.tags.join(" · ")}</span>
                  </button>
                  <button type="button" className={styles.accuseChip} onClick={() => setSelectedSuspectId(suspect.id)}>Accuse</button>
                </article>
              );
            })}
          </div>
        </section>

        <aside className={styles.rail}>
          <section className={`${styles.liveClue} ${latest ? (latest.answer ? styles.yes : styles.no) : ""}`}>
            <p className="eyebrow">Live clue</p>
            {latest ? <><strong>{latest.answerLabel.toUpperCase()}</strong><span>{latest.question.text}</span></> : <span>Ask one yes-or-no clue to begin.</span>}
          </section>

          {recommended && (
            <section className={styles.bestLead}>
              <p className="eyebrow">Detective assist · no spoilers</p>
              <strong>{recommended.question.text}</strong>
              <span>{recommended.yes} yes · {recommended.no} no · ~{recommended.expected.toFixed(1)} expected eliminations</span>
              <button type="button" onClick={() => ask(recommended.question)}>Ask best lead</button>
            </section>
          )}

          <section className={styles.questions}>
            <p className="eyebrow">02 · Clue deck</p>
            <div className={styles.tabs}>
              {categories.map((tab) => <button key={tab} type="button" className={category === tab ? styles.activeTab : ""} onClick={() => setCategory(tab)}>{tab}</button>)}
            </div>
            <div className={styles.questionList}>
              {questions.filter((question) => question.category === category).map((question) => {
                const used = usedIds.has(question.id);
                return <button key={question.id} type="button" disabled={used || Boolean(result)} onClick={() => ask(question)}><span>{question.target === "suspect" ? "Suspect" : "Item"}</span><strong>{question.text}</strong><b>{used ? "Asked" : "Ask"}</b></button>;
              })}
            </div>
          </section>

          <section className={styles.items}>
            <p className="eyebrow">03 · Evidence locker</p>
            {items.map((item) => {
              const eliminated = eliminatedItems.includes(item.id);
              return <button key={item.id} type="button" className={eliminated ? styles.eliminatedItem : ""} onClick={() => updateSlice("eliminatedItemsByPlayer", toggle(eliminatedItems, item.id))}><strong>{item.name}</strong><span>{item.tags.join(" · ")}</span></button>;
            })}
          </section>

          <section className={styles.accusation}>
            <p className="eyebrow">04 · Close the case</p>
            <label>Suspect<select value={selectedSuspectId} onChange={(event) => setSelectedSuspectId(event.target.value)}><option value="">Choose suspect…</option>{suspects.map((suspect) => <option key={suspect.id} value={suspect.id}>{suspect.coord} — {suspect.name}</option>)}</select></label>
            <label>Missing item<select value={selectedItemId} onChange={(event) => setSelectedItemId(event.target.value)}><option value="">Choose item…</option>{items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <button type="button" disabled={!selectedSuspectId || !selectedItemId || Boolean(result)} onClick={accuse}>Lock accusation</button>
            {selectedSuspect && selectedItem && <p>I think <strong>{selectedSuspect.name}</strong> took the <strong>{selectedItem.name}</strong>.</p>}
          </section>

          <section className={styles.history}>
            <p className="eyebrow">Case notes</p>
            {history.length === 0 ? <span>No clues asked yet.</span> : <ol>{[...history].reverse().slice(0, 8).map((entry, index) => <li key={`${entry.question.id}-${index}`}><strong>{entry.answerLabel}</strong> {entry.question.text}</li>)}</ol>}
          </section>
        </aside>
      </div>

      {result && (
        <section className={`${styles.result} ${result.win ? styles.win : styles.loss}`} role="dialog" aria-modal="true" aria-labelledby="who-took-it-result">
          <div>
            <p className="eyebrow">Case resolved</p>
            <h2 id="who-took-it-result">{result.win ? "You caught the culprit." : "The case went cold."}</h2>
            <p>The mystery was <strong>{mystery.suspect.name}</strong> took the <strong>{mystery.item.name}</strong>.</p>
            <p>Suspect: {result.suspectCorrect ? "correct" : "wrong"}. Item: {result.itemCorrect ? "correct" : "wrong"}.</p>
            <button type="button" onClick={() => newCase()}>Open another case</button>
          </div>
        </section>
      )}
    </div>
  );
}
