"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  budOrBluffCards,
  budOrBluffPoolStats,
  type BudOrBluffAnswer,
} from "@/lib/games/bud-or-bluff";
import {
  buildBalancedDeck,
  scoreCorrectGuess,
  type DifficultyFilter,
} from "@/lib/games/bud-or-bluff-engine";
import styles from "./page.module.css";

type Phase = "setup" | "playing" | "finished";

type LifetimeStats = {
  correct: number;
  answered: number;
};

type PlayerStats = {
  name: string;
  score: number;
  correct: number;
  answered: number;
  streak: number;
  bestStreak: number;
};

const TIMER_SECONDS = 20;
const STATS_KEY = "dtf-bud-or-bluff-stats-v1";
const GAME_SHELL_ID = "bud-or-bluff-game";

function playerAccuracy(player?: PlayerStats) {
  if (!player?.answered) return 0;
  return Math.round((player.correct / player.answered) * 100);
}

function focusGameShell() {
  window.requestAnimationFrame(() => {
    const game = document.getElementById(GAME_SHELL_ID);
    if (!game) return;

    const header = document.querySelector<HTMLElement>("header");
    const headerHeight = header?.getBoundingClientRect().height ?? 0;
    const target = game.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    window.scrollTo({ top: Math.max(0, target), behavior: "auto" });
  });
}

export default function BudOrBluffGame() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [players, setPlayers] = useState(["Player 1", "Player 2"]);
  const [roundCount, setRoundCount] = useState(20);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [deck, setDeck] = useState(() => buildBalancedDeck(budOrBluffCards, 20, "All"));
  const [roundIndex, setRoundIndex] = useState(0);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<BudOrBluffAnswer | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [turnReady, setTurnReady] = useState(true);
  const [quitArmed, setQuitArmed] = useState(false);
  const [lifetime, setLifetime] = useState<LifetimeStats>({ correct: 0, answered: 0 });

  const currentCard = deck[roundIndex];
  const currentPlayerIndex = playerStats.length ? roundIndex % playerStats.length : 0;
  const currentPlayer = playerStats[currentPlayerIndex];

  useEffect(() => {
    let timer: number | undefined;
    try {
      const saved = window.localStorage.getItem(STATS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as LifetimeStats;
        timer = window.setTimeout(() => setLifetime(parsed), 0);
      }
    } catch {
      // Local storage is optional.
    }
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  const persistLifetime = useCallback((next: LifetimeStats) => {
    setLifetime(next);
    try {
      window.localStorage.setItem(STATS_KEY, JSON.stringify(next));
    } catch {
      // Storage failures must never block play.
    }
  }, []);

  const resolveGuess = useCallback((answer: BudOrBluffAnswer | null) => {
    if (phase !== "playing" || !turnReady || revealed || !currentCard || !currentPlayer) return;

    const correct = answer === currentCard.answer;
    const scoring = correct ? scoreCorrectGuess(currentPlayer.streak) : null;
    const awarded = scoring?.points ?? 0;

    setSelectedAnswer(answer);
    setWasCorrect(correct);
    setPointsAwarded(awarded);
    setRevealed(true);

    setPlayerStats((previous) => previous.map((player, index) => {
      if (index !== currentPlayerIndex) return player;
      if (!correct || !scoring) {
        return { ...player, answered: player.answered + 1, streak: 0 };
      }

      return {
        ...player,
        score: player.score + scoring.points,
        correct: player.correct + 1,
        answered: player.answered + 1,
        streak: scoring.streakAfter,
        bestStreak: Math.max(player.bestStreak, scoring.streakAfter),
      };
    }));

    setLifetime((previous) => {
      const next = {
        correct: previous.correct + (correct ? 1 : 0),
        answered: previous.answered + 1,
      };
      try {
        window.localStorage.setItem(STATS_KEY, JSON.stringify(next));
      } catch {
        // Non-critical.
      }
      return next;
    });
  }, [currentCard, currentPlayer, currentPlayerIndex, phase, revealed, turnReady]);

  const advanceRound = useCallback(() => {
    if (!revealed) return;
    if (roundIndex + 1 >= deck.length) {
      setPhase("finished");
      focusGameShell();
      return;
    }

    setRoundIndex((value) => value + 1);
    setSelectedAnswer(null);
    setWasCorrect(null);
    setPointsAwarded(0);
    setRevealed(false);
    setTimeLeft(TIMER_SECONDS);
    setQuitArmed(false);
    setTurnReady(playerStats.length <= 1);
    focusGameShell();
  }, [deck.length, playerStats.length, revealed, roundIndex]);

  useEffect(() => {
    if (phase !== "playing" || !turnReady || revealed || !timerEnabled || !currentCard) return;

    const timer = window.setTimeout(() => {
      if (timeLeft <= 1) resolveGuess(null);
      else setTimeLeft((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [currentCard, phase, resolveGuess, revealed, timeLeft, timerEnabled, turnReady]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
      if (phase !== "playing") return;

      if (!turnReady && event.key === "Enter") {
        setTurnReady(true);
        return;
      }
      if (!revealed && event.key.toLowerCase() === "b") resolveGuess("BUD");
      if (!revealed && event.key.toLowerCase() === "f") resolveGuess("BLUFF");
      if (revealed && event.key === "Enter") advanceRound();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advanceRound, phase, resolveGuess, revealed, turnReady]);

  const availableForFilter = useMemo(
    () => budOrBluffCards.filter((card) => difficulty === "All" || card.difficulty === difficulty).length,
    [difficulty],
  );

  const cappedRoundCount = Math.min(roundCount, availableForFilter);
  const fairRoundCount = useMemo(() => {
    if (players.length <= 1 || availableForFilter < players.length) return cappedRoundCount;
    return Math.max(players.length, Math.floor(cappedRoundCount / players.length) * players.length);
  }, [availableForFilter, cappedRoundCount, players.length]);

  const startGame = () => {
    const normalizedPlayers = players.map((name, index) => name.trim() || `Player ${index + 1}`);
    const nextDeck = buildBalancedDeck(budOrBluffCards, fairRoundCount, difficulty);

    setPlayers(normalizedPlayers);
    setDeck(nextDeck);
    setPlayerStats(normalizedPlayers.map((name) => ({
      name,
      score: 0,
      correct: 0,
      answered: 0,
      streak: 0,
      bestStreak: 0,
    })));
    setRoundIndex(0);
    setSelectedAnswer(null);
    setWasCorrect(null);
    setPointsAwarded(0);
    setRevealed(false);
    setTimeLeft(TIMER_SECONDS);
    setTurnReady(true);
    setQuitArmed(false);
    setPhase("playing");
    focusGameShell();
  };

  const resetToSetup = () => {
    setPhase("setup");
    setRoundIndex(0);
    setSelectedAnswer(null);
    setWasCorrect(null);
    setPointsAwarded(0);
    setRevealed(false);
    setQuitArmed(false);
    focusGameShell();
  };

  const addPlayer = () => {
    if (players.length >= 6) return;
    setPlayers((previous) => [...previous, `Player ${previous.length + 1}`]);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 1) return;
    setPlayers((previous) => previous.filter((_, playerIndex) => playerIndex !== index));
  };

  const sessionAnswered = playerStats.reduce((total, player) => total + player.answered, 0);
  const sessionCorrect = playerStats.reduce((total, player) => total + player.correct, 0);
  const sessionAccuracy = sessionAnswered ? Math.round((sessionCorrect / sessionAnswered) * 100) : 0;
  const lifetimeAccuracy = lifetime.answered ? Math.round((lifetime.correct / lifetime.answered) * 100) : 0;
  const progress = deck.length ? ((roundIndex + (revealed ? 1 : 0)) / deck.length) * 100 : 0;
  const topScore = playerStats.length ? Math.max(...playerStats.map((player) => player.score)) : 0;
  const winners = playerStats.filter((player) => player.score === topScore);

  if (phase === "setup") {
    return (
      <div id={GAME_SHELL_ID} className={styles.gameFrame}>
        <div className={styles.setupGrid}>
          <section className={styles.panel}>
            <p className={styles.kicker}>Players</p>
            <h2>Who is calling the bluff?</h2>
            <div className={styles.playerList}>
              {players.map((player, index) => (
                <div className={styles.playerRow} key={`player-${index}`}>
                  <label htmlFor={`player-${index}`}>P{index + 1}</label>
                  <input
                    id={`player-${index}`}
                    value={player}
                    maxLength={24}
                    onChange={(event) => setPlayers((previous) => previous.map((name, playerIndex) => playerIndex === index ? event.target.value : name))}
                  />
                  {players.length > 1 ? (
                    <button className={styles.iconButton} type="button" onClick={() => removePlayer(index)} aria-label={`Remove player ${index + 1}`}>×</button>
                  ) : <span />}
                </div>
              ))}
            </div>
            <button className={styles.secondaryButton} type="button" onClick={addPlayer} disabled={players.length >= 6}>+ Add player</button>
          </section>

          <section className={styles.panel}>
            <p className={styles.kicker}>Session</p>
            <h2>Set the round.</h2>
            <label className={styles.field}>
              <span>Number of cards</span>
              <select value={roundCount} onChange={(event) => setRoundCount(Number(event.target.value))}>
                <option value={10}>10 · Quick smoke</option>
                <option value={20}>20 · Standard game</option>
                <option value={30}>30 · Full session</option>
                <option value={40}>40 · Party marathon</option>
              </select>
            </label>
            <label className={styles.field}>
              <span>Difficulty</span>
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as DifficultyFilter)}>
                <option value="All">Mixed</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </label>
            <label className={styles.toggleRow}>
              <input type="checkbox" checked={timerEnabled} onChange={(event) => setTimerEnabled(event.target.checked)} />
              <span>20-second turn timer</span>
            </label>
            <div className={styles.poolReadout}>
              <strong>{budOrBluffPoolStats.total}</strong> curated cards · <strong>{budOrBluffPoolStats.bud}</strong> real · <strong>{budOrBluffPoolStats.bluff}</strong> bluff
              <small>
                {availableForFilter} cards match this difficulty.
                {fairRoundCount < cappedRoundCount
                  ? ` This setup will use ${fairRoundCount} cards so every player gets the same number of turns.`
                  : roundCount > availableForFilter
                    ? ` The session will use all ${availableForFilter}.`
                    : ""}
              </small>
            </div>
            <button className={styles.primaryButton} type="button" onClick={startGame}>Start game</button>
          </section>
        </div>

        <div className={styles.rulesStrip}>
          <div><strong>1</strong><span>Read the name.</span></div>
          <div><strong>2</strong><span>Choose BUD for real or BLUFF for fake.</span></div>
          <div><strong>3</strong><span>Every third correct answer in a streak scores 2 points.</span></div>
        </div>
        <p className={styles.instructions}>Keyboard: <kbd>B</kbd> BUD · <kbd>F</kbd> BLUFF · <kbd>Enter</kbd> continue. The deck is balanced but randomized, so answer order is not predictable.</p>
      </div>
    );
  }

  if (phase === "finished") {
    return (
      <div id={GAME_SHELL_ID} className={styles.gameFrame}>
        <section className={`${styles.panel} ${styles.finishPanel}`}>
          <p className={styles.kicker}>Session complete</p>
          <h2>{winners.length === 1 ? `${winners[0].name} wins` : `${winners.map((player) => player.name).join(" & ")} tie`}</h2>
          <p className={styles.finishCopy}>{sessionCorrect}/{sessionAnswered} correct overall · {sessionAccuracy}% accuracy</p>

          <div className={styles.finalScores}>
            {[...playerStats].sort((a, b) => b.score - a.score).map((player, index) => (
              <div className={styles.finalScore} key={`${player.name}-${index}`}>
                <div><strong>{player.name}</strong><small>{player.correct}/{player.answered} correct · best streak {player.bestStreak}</small></div>
                <span>{player.score} pts</span>
              </div>
            ))}
          </div>

          <div className={styles.finishActions}>
            <button className={styles.primaryButton} type="button" onClick={startGame}>Play same setup</button>
            <button className={styles.secondaryButton} type="button" onClick={resetToSetup}>Change setup</button>
          </div>

          <p className={styles.lifetimeNote}>Lifetime on this device: {lifetime.correct}/{lifetime.answered} correct · {lifetimeAccuracy}%</p>
          {lifetime.answered > 0 && <button className={styles.textButton} type="button" onClick={() => persistLifetime({ correct: 0, answered: 0 })}>Reset lifetime stats</button>}
        </section>
      </div>
    );
  }

  if (!currentCard || !currentPlayer) return null;

  if (!turnReady) {
    return (
      <div id={GAME_SHELL_ID} className={styles.gameFrame}>
        <section className={styles.handoffPanel}>
          <p className={styles.kicker}>Pass the device</p>
          <h2>{currentPlayer.name}, you’re up.</h2>
          <p>The next strain name is hidden until you are ready.</p>
          <button className={styles.primaryButton} type="button" onClick={() => setTurnReady(true)} autoFocus>Ready · show card</button>
          <small>Press Enter to continue</small>
        </section>
      </div>
    );
  }

  return (
    <div id={GAME_SHELL_ID} className={styles.gameFrame}>
      <div className={styles.topBar}>
        <div><span>Round</span><strong>{roundIndex + 1}/{deck.length}</strong></div>
        <div><span>Up now</span><strong>{currentPlayer.name}</strong></div>
        <div><span>Player accuracy</span><strong>{currentPlayer.answered ? `${playerAccuracy(currentPlayer)}%` : "—"}</strong></div>
        {timerEnabled && <div className={timeLeft <= 5 && !revealed ? styles.timerDanger : undefined}><span>Timer</span><strong>{revealed ? "—" : `${timeLeft}s`}</strong></div>}
      </div>

      <div className={styles.progressTrack} aria-label={`Round progress ${Math.round(progress)} percent`}><span style={{ width: `${progress}%` }} /></div>

      <div className={styles.playGrid}>
        <main className={styles.cardStage}>
          <article className={`${styles.strainCard} ${revealed ? styles.strainCardRevealed : ""}`}>
            <div className={styles.cardMeta}><span>{currentCard.difficulty}</span><span>{currentCard.category}</span></div>
            <p className={styles.cardPrompt}>REAL STRAIN OR FAKE NAME?</p>
            <h2>{currentCard.name}</h2>

            {!revealed ? (
              <p className={styles.cardHint}>No clues. Commit to the call.</p>
            ) : (
              <div className={styles.reveal} aria-live="polite">
                <p className={wasCorrect ? styles.correct : styles.incorrect}>
                  {wasCorrect ? "Correct." : selectedAnswer ? "Wrong call." : "Time’s up."} <strong>{currentCard.answer}</strong>
                </p>
                {wasCorrect && <p className={styles.pointsAwarded}>+{pointsAwarded} {pointsAwarded === 1 ? "point" : "points"}{pointsAwarded > 1 ? " · streak bonus" : ""}</p>}
                <p>{currentCard.explanation}</p>
                {currentCard.lineage && <p className={styles.lineage}><span>Lineage</span>{currentCard.lineage}</p>}
                <small>{currentCard.sourceLabel}</small>
              </div>
            )}
          </article>

          <div className={styles.answerGrid}>
            <button className={`${styles.answerButton} ${styles.budButton} ${revealed && currentCard.answer === "BUD" ? styles.answerCorrect : ""}`} type="button" disabled={revealed} onClick={() => resolveGuess("BUD")}>
              <span>B</span><strong>BUD</strong><small>That strain is real</small>
            </button>
            <button className={`${styles.answerButton} ${styles.bluffButton} ${revealed && currentCard.answer === "BLUFF" ? styles.answerCorrect : ""}`} type="button" disabled={revealed} onClick={() => resolveGuess("BLUFF")}>
              <span>F</span><strong>BLUFF</strong><small>That name is fake</small>
            </button>
          </div>

          {revealed && <button className={styles.nextButton} type="button" onClick={advanceRound} autoFocus>{roundIndex + 1 >= deck.length ? "See final scores" : "Next turn"} <span>↵</span></button>}
        </main>

        <aside className={styles.scoreboard} aria-label="Scoreboard">
          <div className={styles.scoreHeading}><p className={styles.kicker}>Scoreboard</p><span>{sessionCorrect}/{sessionAnswered} correct</span></div>
          {playerStats.map((player, index) => (
            <div className={`${styles.scoreRow} ${index === currentPlayerIndex ? styles.activePlayer : ""}`} key={`${player.name}-${index}`}>
              <div><strong>{player.name}</strong><small>{player.streak >= 2 ? `${player.streak} correct in a row` : index === currentPlayerIndex ? "Current turn" : `${player.correct}/${player.answered} correct`}</small></div>
              <span>{player.score}</span>
            </div>
          ))}

          {!quitArmed ? (
            <button className={styles.quitButton} type="button" onClick={() => setQuitArmed(true)}>End session</button>
          ) : (
            <div className={styles.quitConfirm}>
              <p>End this session?</p>
              <button type="button" onClick={resetToSetup}>End game</button>
              <button type="button" onClick={() => setQuitArmed(false)}>Keep playing</button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
