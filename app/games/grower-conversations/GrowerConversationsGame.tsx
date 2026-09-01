"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildGrowerConversationDeck,
  filterGrowerConversationPrompts,
  growerConversationCategories,
  growerConversationDepths,
  growerConversationPrompts,
  type GrowerConversationDepth,
  type GrowerConversationPrompt,
} from "@/lib/games/grower-conversations";
import styles from "./page.module.css";

type Phase = "setup" | "playing" | "finished";

type TurnRecord = {
  promptId: string;
  player: string;
  category: string;
  depth: GrowerConversationDepth;
  skipped: boolean;
};

type PlayerSummary = {
  name: string;
  turns: number;
  discussed: number;
  skipped: number;
};

const TIMER_SECONDS = 60;
const GAME_SHELL_ID = "grower-conversations-game";

function focusGameShell() {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const game = document.getElementById(GAME_SHELL_ID);
      if (!game) return;
      const header = document.querySelector<HTMLElement>("header");
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      const target = game.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
      window.scrollTo({ top: Math.max(0, target), behavior: "auto" });
    });
  });
}

function createPlayerSummary(players: string[]): PlayerSummary[] {
  return players.map((name) => ({ name, turns: 0, discussed: 0, skipped: 0 }));
}

export default function GrowerConversationsGame() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [players, setPlayers] = useState(["Player 1", "Player 2"]);
  const [requestedTurns, setRequestedTurns] = useState(12);
  const [category, setCategory] = useState("All");
  const [depth, setDepth] = useState<GrowerConversationDepth | "All">("All");
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [deck, setDeck] = useState<GrowerConversationPrompt[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [turnReady, setTurnReady] = useState(true);
  const [followUpVisible, setFollowUpVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [timeExpired, setTimeExpired] = useState(false);
  const [records, setRecords] = useState<TurnRecord[]>([]);
  const [summary, setSummary] = useState<PlayerSummary[]>([]);
  const [quitArmed, setQuitArmed] = useState(false);

  const availablePrompts = useMemo(
    () => filterGrowerConversationPrompts(growerConversationPrompts, { category, depth }).length,
    [category, depth],
  );

  const fairTurnCount = useMemo(() => {
    const capped = Math.min(requestedTurns, availablePrompts);
    if (players.length <= 1 || capped < players.length) return capped;
    return Math.max(players.length, Math.floor(capped / players.length) * players.length);
  }, [availablePrompts, players.length, requestedTurns]);

  const currentPrompt = deck[turnIndex];
  const currentPlayerIndex = players.length ? turnIndex % players.length : 0;
  const currentPlayer = players[currentPlayerIndex] ?? "Player";
  const progress = deck.length ? (turnIndex / deck.length) * 100 : 0;

  const addPlayer = () => {
    if (players.length >= 8) return;
    setPlayers((previous) => [...previous, `Player ${previous.length + 1}`]);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 2) return;
    setPlayers((previous) => previous.filter((_, playerIndex) => playerIndex !== index));
  };

  const renamePlayer = (index: number, value: string) => {
    setPlayers((previous) => previous.map((name, playerIndex) => (playerIndex === index ? value : name)));
  };

  const startSession = () => {
    const normalizedPlayers = players.map((name, index) => name.trim() || `Player ${index + 1}`);
    const nextDeck = buildGrowerConversationDeck(
      growerConversationPrompts,
      fairTurnCount,
      { category, depth },
      `${Date.now()}-${normalizedPlayers.join("|")}-${category}-${depth}`,
    );

    if (!nextDeck.length) return;

    setPlayers(normalizedPlayers);
    setDeck(nextDeck);
    setTurnIndex(0);
    setTurnReady(true);
    setFollowUpVisible(false);
    setTimeLeft(TIMER_SECONDS);
    setTimeExpired(false);
    setRecords([]);
    setSummary(createPlayerSummary(normalizedPlayers));
    setQuitArmed(false);
    setPhase("playing");
    focusGameShell();
  };

  const finishSession = useCallback(() => {
    setPhase("finished");
    setTurnReady(true);
    setQuitArmed(false);
    focusGameShell();
  }, []);

  const resolveTurn = useCallback((skipped: boolean) => {
    if (phase !== "playing" || !turnReady || !currentPrompt) return;

    const record: TurnRecord = {
      promptId: currentPrompt.id,
      player: currentPlayer,
      category: currentPrompt.category,
      depth: currentPrompt.depth,
      skipped,
    };

    setRecords((previous) => [...previous, record]);
    setSummary((previous) => previous.map((entry, index) => {
      if (index !== currentPlayerIndex) return entry;
      return {
        ...entry,
        turns: entry.turns + 1,
        discussed: entry.discussed + (skipped ? 0 : 1),
        skipped: entry.skipped + (skipped ? 1 : 0),
      };
    }));

    if (turnIndex + 1 >= deck.length) {
      finishSession();
      return;
    }

    setTurnIndex((value) => value + 1);
    setTurnReady(players.length <= 1);
    setFollowUpVisible(false);
    setTimeLeft(TIMER_SECONDS);
    setTimeExpired(false);
    setQuitArmed(false);
    focusGameShell();
  }, [currentPlayer, currentPlayerIndex, currentPrompt, deck.length, finishSession, phase, players.length, turnIndex, turnReady]);

  useEffect(() => {
    if (phase !== "playing" || !turnReady || !timerEnabled || timeExpired || !currentPrompt) return;
    if (timeLeft <= 0) {
      const timer = window.setTimeout(() => setTimeExpired(true), 0);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => setTimeLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [currentPrompt, phase, timeExpired, timeLeft, timerEnabled, turnReady]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
      if (phase !== "playing") return;

      if (!turnReady && event.key === "Enter") {
        setTurnReady(true);
        setTimeLeft(TIMER_SECONDS);
        setTimeExpired(false);
        return;
      }

      if (!turnReady) return;
      if (event.key === "Enter") resolveTurn(false);
      if (event.key.toLowerCase() === "s") resolveTurn(true);
      if (event.key.toLowerCase() === "f") setFollowUpVisible((visible) => !visible);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, resolveTurn, turnReady]);

  const resetToSetup = () => {
    setPhase("setup");
    setDeck([]);
    setTurnIndex(0);
    setTurnReady(true);
    setFollowUpVisible(false);
    setTimeLeft(TIMER_SECONDS);
    setTimeExpired(false);
    setRecords([]);
    setSummary([]);
    setQuitArmed(false);
    focusGameShell();
  };

  if (phase === "setup") {
    return (
      <div id={GAME_SHELL_ID} className={styles.gameFrame}>
        <div className={styles.setupHero}>
          <div>
            <p className={styles.kicker}>PASS · TALK · LISTEN</p>
            <h2>Build a table worth talking around.</h2>
            <p>
              Grower Conversations is a no-score party deck for cultivators. Pick the people,
              choose the kind of conversation, then pass the device and let the cards do the prompting.
            </p>
          </div>
          <div className={styles.deckStat}>
            <strong>{growerConversationPrompts.length}</strong>
            <span>starter prompts</span>
          </div>
        </div>

        <div className={styles.setupGrid}>
          <section className={styles.panel} aria-labelledby="gc-players-heading">
            <div className={styles.panelHeading}>
              <div>
                <span>01</span>
                <h3 id="gc-players-heading">Players</h3>
              </div>
              <small>2–8 local players</small>
            </div>

            <div className={styles.playerList}>
              {players.map((player, index) => (
                <div className={styles.playerRow} key={`player-${index}`}>
                  <label className="sr-only" htmlFor={`gc-player-${index}`}>Player {index + 1} name</label>
                  <input
                    id={`gc-player-${index}`}
                    value={player}
                    maxLength={24}
                    onChange={(event) => renamePlayer(index, event.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.removeButton}
                    disabled={players.length <= 2}
                    onClick={() => removePlayer(index)}
                    aria-label={`Remove ${player || `Player ${index + 1}`}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className={styles.secondaryButton} onClick={addPlayer} disabled={players.length >= 8}>
              + Add player
            </button>
          </section>

          <section className={styles.panel} aria-labelledby="gc-deck-heading">
            <div className={styles.panelHeading}>
              <div>
                <span>02</span>
                <h3 id="gc-deck-heading">Deck</h3>
              </div>
              <small>{availablePrompts} prompts match</small>
            </div>

            <div className={styles.fieldGrid}>
              <label>
                Turns requested
                <select value={requestedTurns} onChange={(event) => setRequestedTurns(Number(event.target.value))}>
                  {[12, 24, 36, 48].map((count) => <option key={count} value={count}>{count}</option>)}
                </select>
              </label>
              <label>
                Category
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="All">All categories</option>
                  {growerConversationCategories.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </label>
              <label>
                Conversation depth
                <select value={depth} onChange={(event) => setDepth(event.target.value as GrowerConversationDepth | "All")}>
                  <option value="All">Mixed depth</option>
                  {growerConversationDepths.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </label>
              <label className={styles.toggleField}>
                <input type="checkbox" checked={timerEnabled} onChange={(event) => setTimerEnabled(event.target.checked)} />
                <span>
                  <strong>60-second conversation timer</strong>
                  <small>Timer signals time; it never cuts a speaker off.</small>
                </span>
              </label>
            </div>

            <div className={styles.fairnessNote}>
              <strong>{fairTurnCount || 0} turns will be dealt.</strong>
              <span>The deck is trimmed when needed so every player gets the same number of turns.</span>
            </div>
          </section>
        </div>

        <div className={styles.startBar}>
          <div>
            <strong>No right answers. No points.</strong>
            <span>Skip anything the table does not want to discuss.</span>
          </div>
          <button type="button" className={styles.primaryButton} onClick={startSession} disabled={fairTurnCount < players.length}>
            Start conversation
          </button>
        </div>
      </div>
    );
  }

  if (phase === "finished") {
    const discussed = records.filter((record) => !record.skipped).length;
    const skipped = records.length - discussed;
    const categoryCounts = records.reduce<Record<string, number>>((counts, record) => {
      counts[record.category] = (counts[record.category] ?? 0) + 1;
      return counts;
    }, {});
    const mostUsedCategory = Object.entries(categoryCounts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "—";

    return (
      <div id={GAME_SHELL_ID} className={styles.gameFrame}>
        <section className={styles.finishPanel}>
          <p className={styles.kicker}>SESSION COMPLETE</p>
          <h2>The deck did its job.</h2>
          <p>There is no winner here. The useful result is what the table learned, challenged, remembered, or decided to revisit.</p>

          <div className={styles.finishStats}>
            <div><strong>{discussed}</strong><span>discussed</span></div>
            <div><strong>{skipped}</strong><span>skipped</span></div>
            <div><strong>{mostUsedCategory}</strong><span>most-seen category</span></div>
          </div>

          <div className={styles.summaryGrid}>
            {summary.map((player) => (
              <article key={player.name}>
                <h3>{player.name}</h3>
                <p>{player.discussed} discussed · {player.skipped} skipped · {player.turns} total turns</p>
              </article>
            ))}
          </div>

          <div className={styles.finishActions}>
            <button type="button" className={styles.primaryButton} onClick={startSession}>Deal another session</button>
            <button type="button" className={styles.secondaryButton} onClick={resetToSetup}>Change setup</button>
          </div>
        </section>
      </div>
    );
  }

  if (!currentPrompt) return null;

  if (!turnReady) {
    return (
      <div id={GAME_SHELL_ID} className={styles.gameFrame}>
        <section className={styles.passPanel}>
          <p className={styles.kicker}>PASS THE DEVICE</p>
          <span className={styles.turnCounter}>Turn {turnIndex + 1} of {deck.length}</span>
          <h2>{currentPlayer}, you’re up.</h2>
          <p>The next card is hidden until you are ready. Pass the screen, then reveal your prompt.</p>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              setTurnReady(true);
              setTimeLeft(TIMER_SECONDS);
              setTimeExpired(false);
            }}
          >
            Reveal my card
          </button>
          <small>Keyboard: Enter</small>
        </section>
      </div>
    );
  }

  return (
    <div id={GAME_SHELL_ID} className={styles.gameFrame}>
      <div className={styles.progressTrack} aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>

      <header className={styles.playHeader}>
        <div>
          <p className={styles.kicker}>{currentPlayer.toUpperCase()}</p>
          <h2>Turn {turnIndex + 1} <span>/ {deck.length}</span></h2>
        </div>
        <div className={styles.playHeaderActions}>
          {timerEnabled && (
            <div className={`${styles.timer} ${timeExpired ? styles.timerExpired : ""}`} aria-live="polite">
              <strong>{timeExpired ? "TIME" : timeLeft}</strong>
              <span>{timeExpired ? "finish the thought" : "seconds"}</span>
            </div>
          )}
          <button
            type="button"
            className={styles.quitButton}
            onClick={() => {
              if (!quitArmed) setQuitArmed(true);
              else finishSession();
            }}
          >
            {quitArmed ? "End session?" : "End"}
          </button>
        </div>
      </header>

      <main className={styles.cardStage}>
        <article className={`${styles.promptCard} ${styles[`depth${currentPrompt.depth}`]}`}>
          <div className={styles.cardMeta}>
            <span>{currentPrompt.category}</span>
            <strong>{currentPrompt.depth}</strong>
          </div>
          <p className={styles.promptText}>{currentPrompt.prompt}</p>

          <div className={`${styles.followUp} ${followUpVisible ? styles.followUpVisible : ""}`}>
            <span>GO DEEPER</span>
            <p>{currentPrompt.followUp}</p>
          </div>

          <button
            type="button"
            className={styles.followButton}
            onClick={() => setFollowUpVisible((visible) => !visible)}
            aria-expanded={followUpVisible}
          >
            {followUpVisible ? "Hide follow-up" : "Show follow-up"}
          </button>
        </article>
      </main>

      <div className={styles.turnActions}>
        <button type="button" className={styles.skipButton} onClick={() => resolveTurn(true)}>Skip</button>
        <button type="button" className={styles.primaryButton} onClick={() => resolveTurn(false)}>Discussed · Next</button>
      </div>

      <footer className={styles.keyboardHint}>
        <span><kbd>F</kbd> follow-up</span>
        <span><kbd>S</kbd> skip</span>
        <span><kbd>Enter</kbd> next</span>
      </footer>
    </div>
  );
}
