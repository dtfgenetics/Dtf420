"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  budOrBluffCards,
  budOrBluffPoolStats,
  type BudOrBluffAnswer,
  type BudOrBluffCard,
  type BudOrBluffDifficulty,
} from "@/lib/games/bud-or-bluff";
import styles from "./page.module.css";

type Phase = "setup" | "playing" | "finished";
type DifficultyFilter = "All" | BudOrBluffDifficulty;

type LifetimeStats = {
  correct: number;
  answered: number;
};

const TIMER_SECONDS = 20;
const STATS_KEY = "dtf-bud-or-bluff-stats-v1";

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function buildBalancedDeck(count: number, difficulty: DifficultyFilter): BudOrBluffCard[] {
  const eligible = budOrBluffCards.filter((card) => difficulty === "All" || card.difficulty === difficulty);
  const bud = shuffle(eligible.filter((card) => card.answer === "BUD"));
  const bluff = shuffle(eligible.filter((card) => card.answer === "BLUFF"));
  const deck: BudOrBluffCard[] = [];
  let takeBud = Math.random() > 0.5;

  while (deck.length < count && (bud.length > 0 || bluff.length > 0)) {
    const preferred = takeBud ? bud : bluff;
    const fallback = takeBud ? bluff : bud;
    const next = preferred.pop() ?? fallback.pop();
    if (next) deck.push(next);
    takeBud = !takeBud;
  }

  return deck;
}

export default function BudOrBluffGame() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [players, setPlayers] = useState(["Player 1", "Player 2"]);
  const [roundCount, setRoundCount] = useState(20);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [deck, setDeck] = useState<BudOrBluffCard[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([0, 0]);
  const [streaks, setStreaks] = useState<number[]>([0, 0]);
  const [selectedAnswer, setSelectedAnswer] = useState<BudOrBluffAnswer | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [lifetime, setLifetime] = useState<LifetimeStats>({ correct: 0, answered: 0 });

  const currentCard = deck[roundIndex];
  const currentPlayerIndex = players.length ? roundIndex % players.length : 0;
  const currentPlayer = players[currentPlayerIndex] || `Player ${currentPlayerIndex + 1}`;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STATS_KEY);
      if (saved) setLifetime(JSON.parse(saved) as LifetimeStats);
    } catch {
      // Local storage is optional; game play should never depend on it.
    }
  }, []);

  const persistLifetime = useCallback((next: LifetimeStats) => {
    setLifetime(next);
    try {
      window.localStorage.setItem(STATS_KEY, JSON.stringify(next));
    } catch {
      // Ignore private-browsing or storage quota failures.
    }
  }, []);

  const resolveGuess = useCallback((answer: BudOrBluffAnswer | null) => {
    if (phase !== "playing" || revealed || !currentCard) return;

    const correct = answer === currentCard.answer;
    setSelectedAnswer(answer);
    setWasCorrect(correct);
    setRevealed(true);
    setSessionAnswered((value) => value + 1);
    setLifetime((previous) => {
      const next = {
        correct: previous.correct + (correct ? 1 : 0),
        answered: previous.answered + 1,
      };
      try {
        window.localStorage.setItem(STATS_KEY, JSON.stringify(next));
      } catch {
        // Storage is non-critical.
      }
      return next;
    });

    if (correct) {
      setSessionCorrect((value) => value + 1);
      setScores((previous) => previous.map((score, index) => index === currentPlayerIndex ? score + 1 : score));
      setStreaks((previous) => previous.map((streak, index) => index === currentPlayerIndex ? streak + 1 : streak));
    } else {
      setStreaks((previous) => previous.map((streak, index) => index === currentPlayerIndex ? 0 : streak));
    }
  }, [currentCard, currentPlayerIndex, phase, revealed]);

  const nextCard = useCallback(() => {
    if (!revealed) return;
    if (roundIndex + 1 >= deck.length) {
      setPhase("finished");
      return;
    }

    setRoundIndex((value) => value + 1);
    setSelectedAnswer(null);
    setWasCorrect(null);
    setRevealed(false);
    setTimeLeft(TIMER_SECONDS);
  }, [deck.length, revealed, roundIndex]);

  useEffect(() => {
    if (phase !== "playing" || revealed || !timerEnabled || !currentCard) return;
    if (timeLeft <= 0) {
      resolveGuess(null);
      return;
    }

    const timer = window.setTimeout(() => setTimeLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [currentCard, phase, resolveGuess, revealed, timeLeft, timerEnabled]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
      if (phase !== "playing") return;

      if (!revealed && event.key.toLowerCase() === "b") resolveGuess("BUD");
      if (!revealed && event.key.toLowerCase() === "f") resolveGuess("BLUFF");
      if (revealed && event.key === "Enter") nextCard();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nextCard, phase, resolveGuess, revealed]);

  const startGame = () => {
    const normalizedPlayers = players.map((name, index) => name.trim() || `Player ${index + 1}`);
    const nextDeck = buildBalancedDeck(roundCount, difficulty);
    setPlayers(normalizedPlayers);
    setDeck(nextDeck);
    setScores(normalizedPlayers.map(() => 0));
    setStreaks(normalizedPlayers.map(() => 0));
    setRoundIndex(0);
    setSelectedAnswer(null);
    setWasCorrect(null);
    setRevealed(false);
    setTimeLeft(TIMER_SECONDS);
    setSessionCorrect(0);
    setSessionAnswered(0);
    setPhase("playing");
  };

  const resetToSetup = () => {
    setPhase("setup");
    setDeck([]);
    setRoundIndex(0);
    setSelectedAnswer(null);
    setWasCorrect(null);
    setRevealed(false);
  };

  const addPlayer = () => {
    if (players.length >= 6) return;
    setPlayers((previous) => [...previous, `Player ${previous.length + 1}`]);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 1) return;
    setPlayers((previous) => previous.filter((_, playerIndex) => playerIndex !== index));
  };

  const availableForFilter = useMemo(
    () => budOrBluffCards.filter((card) => difficulty === "All" || card.difficulty === difficulty).length,
    [difficulty],
  );

  const progress = deck.length ? ((roundIndex + (revealed ? 1 : 0)) / deck.length) * 100 : 0;
  const accuracy = sessionAnswered ? Math.round((sessionCorrect / sessionAnswered) * 100) : 0;
  const lifetimeAccuracy = lifetime.answered ? Math.round((lifetime.correct / lifetime.answered) * 100) : 0;
  const topScore = scores.length ? Math.max(...scores) : 0;
  const winners = players.filter((_, index) => scores[index] === topScore);

  if (phase === "setup") {
    return (
      <div className={styles.gameFrame}>
        <div className={styles.setupGrid}>
          <section className={styles.panel}>
            <p className={styles.kicker}>Game setup</p>
            <h2>Who is calling the bluff?</h2>

            <div className={styles.playerList}>
              {players.map((player, index) => (
                <div className={styles.playerRow} key={`player-${index}`}>
                  <label htmlFor={`player-${index}`}>Player {index + 1}</label>
                  <input
                    id={`player-${index}`}
                    value={player}
                    maxLength={24}
                    onChange={(event) => setPlayers((previous) => previous.map((name, playerIndex) => playerIndex === index ? event.target.value : name))}
                  />
                  {players.length > 1 && (
                    <button className={styles.iconButton} type="button" onClick={() => removePlayer(index)} aria-label={`Remove player ${index + 1}`}>
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button className={styles.secondaryButton} type="button" onClick={addPlayer} disabled={players.length >= 6}>
              + Add player
            </button>
          </section>

          <section className={styles.panel}>
            <p className={styles.kicker}>Round rules</p>
            <h2>Build the session</h2>

            <label className={styles.field}>
              <span>Number of cards</span>
              <select value={roundCount} onChange={(event) => setRoundCount(Number(event.target.value))}>
                <option value={10}>10 · Quick smoke</option>
                <option value={20}>20 · Standard game</option>
                <option value={30}>30 · Full session</option>
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
              <strong>{budOrBluffPoolStats.total}</strong> curated cards · <strong>{budOrBluffPoolStats.bud}</strong> BUD · <strong>{budOrBluffPoolStats.bluff}</strong> BLUFF
              <small>{availableForFilter} cards match the selected difficulty.</small>
            </div>

            <button className={styles.primaryButton} type="button" onClick={startGame}>
              Start game
            </button>
          </section>
        </div>

        <div className={styles.instructions}>
          <strong>How to play:</strong> each player gets one name. Pick BUD if you think it is a documented strain, or BLUFF if you think the name was fabricated. Correct guesses score one point. Keyboard: <kbd>B</kbd> = BUD, <kbd>F</kbd> = BLUFF, <kbd>Enter</kbd> = next card.
        </div>
      </div>
    );
  }

  if (phase === "finished") {
    return (
      <div className={styles.gameFrame}>
        <section className={`${styles.panel} ${styles.finishPanel}`}>
          <p className={styles.kicker}>Session complete</p>
          <h2>{winners.length === 1 ? `${winners[0]} wins` : `${winners.join(" & ")} tie`}</h2>
          <p className={styles.finishCopy}>You called {sessionCorrect} of {sessionAnswered} correctly for {accuracy}% accuracy.</p>

          <div className={styles.finalScores}>
            {players.map((player, index) => (
              <div className={styles.finalScore} key={player + index}>
                <span>{player}</span>
                <strong>{scores[index] ?? 0}</strong>
              </div>
            ))}
          </div>

          <div className={styles.finishActions}>
            <button className={styles.primaryButton} type="button" onClick={startGame}>Play same setup</button>
            <button className={styles.secondaryButton} type="button" onClick={resetToSetup}>Change setup</button>
          </div>

          <p className={styles.lifetimeNote}>Lifetime on this device: {lifetime.correct}/{lifetime.answered} correct · {lifetimeAccuracy}%</p>
          {lifetime.answered > 0 && (
            <button className={styles.textButton} type="button" onClick={() => persistLifetime({ correct: 0, answered: 0 })}>
              Reset lifetime stats
            </button>
          )}
        </section>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className={styles.gameFrame}>
      <div className={styles.topBar}>
        <div>
          <span>Round</span>
          <strong>{roundIndex + 1}/{deck.length}</strong>
        </div>
        <div>
          <span>Up now</span>
          <strong>{currentPlayer}</strong>
        </div>
        <div>
          <span>Accuracy</span>
          <strong>{sessionAnswered ? `${accuracy}%` : "—"}</strong>
        </div>
        {timerEnabled && (
          <div className={timeLeft <= 5 && !revealed ? styles.timerDanger : undefined}>
            <span>Timer</span>
            <strong>{revealed ? "—" : `${timeLeft}s`}</strong>
          </div>
        )}
      </div>

      <div className={styles.progressTrack} aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.playGrid}>
        <main className={styles.cardStage}>
          <article className={`${styles.strainCard} ${revealed ? styles.strainCardRevealed : ""}`}>
            <div className={styles.cardMeta}>
              <span>{currentCard.difficulty}</span>
              <span>{currentCard.category}</span>
            </div>
            <p className={styles.cardPrompt}>REAL STRAIN OR FAKE NAME?</p>
            <h2>{currentCard.name}</h2>

            {!revealed ? (
              <p className={styles.cardHint}>Commit to an answer before the timer runs out.</p>
            ) : (
              <div className={styles.reveal} aria-live="polite">
                <p className={wasCorrect ? styles.correct : styles.incorrect}>
                  {wasCorrect ? "Correct." : selectedAnswer ? "Wrong call." : "Time's up."}
                  <strong>{currentCard.answer}</strong>
                </p>
                <p>{currentCard.explanation}</p>
                {currentCard.lineage && <p className={styles.lineage}><span>Lineage</span>{currentCard.lineage}</p>}
                <small>{currentCard.sourceLabel}</small>
              </div>
            )}
          </article>

          <div className={styles.answerGrid}>
            <button
              className={`${styles.answerButton} ${styles.budButton} ${revealed && currentCard.answer === "BUD" ? styles.answerCorrect : ""}`}
              type="button"
              disabled={revealed}
              onClick={() => resolveGuess("BUD")}
            >
              <span>B</span>
              <strong>BUD</strong>
              <small>That strain is real</small>
            </button>
            <button
              className={`${styles.answerButton} ${styles.bluffButton} ${revealed && currentCard.answer === "BLUFF" ? styles.answerCorrect : ""}`}
              type="button"
              disabled={revealed}
              onClick={() => resolveGuess("BLUFF")}
            >
              <span>F</span>
              <strong>BLUFF</strong>
              <small>That name is fake</small>
            </button>
          </div>

          {revealed && (
            <button className={styles.nextButton} type="button" onClick={nextCard} autoFocus>
              {roundIndex + 1 >= deck.length ? "See final scores" : "Next card"} <span>↵</span>
            </button>
          )}
        </main>

        <aside className={styles.scoreboard}>
          <div className={styles.scoreHeading}>
            <p className={styles.kicker}>Scoreboard</p>
            <span>{sessionCorrect}/{sessionAnswered} correct</span>
          </div>
          {players.map((player, index) => (
            <div className={`${styles.scoreRow} ${index === currentPlayerIndex ? styles.activePlayer : ""}`} key={player + index}>
              <div>
                <strong>{player}</strong>
                <small>{streaks[index] > 1 ? `${streaks[index]}-answer streak` : index === currentPlayerIndex ? "Current turn" : "Waiting"}</small>
              </div>
              <span>{scores[index] ?? 0}</span>
            </div>
          ))}

          <button className={styles.quitButton} type="button" onClick={resetToSetup}>End session</button>
        </aside>
      </div>
    </div>
  );
}
