"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildHighIqDeck,
  highIqDifficulties,
  highIqQuestions,
  scoreHighIqAnswer,
  type HighIqDifficultyFilter,
  type HighIqQuestion,
} from "@/lib/games/high-iq";
import styles from "./page.module.css";

type Phase = "setup" | "playing" | "finished";

const TIMER_SECONDS = 30;
const BEST_SCORE_KEY = "dtf-high-iq-best-score-v1";
const GAME_ID = "high-iq-game";
const answerKeys = ["A", "B", "C", "D"] as const;

function focusGame() {
  window.requestAnimationFrame(() => {
    const target = document.getElementById(GAME_ID);
    if (!target) return;
    const header = document.querySelector<HTMLElement>("header");
    const offset = (header?.getBoundingClientRect().height ?? 0) + 12;
    window.scrollTo({
      top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset),
      behavior: "auto",
    });
  });
}

export default function HighIqGame() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [roundCount, setRoundCount] = useState(10);
  const [difficulty, setDifficulty] = useState<HighIqDifficultyFilter>("All");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [deck, setDeck] = useState<HighIqQuestion[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [bestScore, setBestScore] = useState(0);

  const currentQuestion = deck[roundIndex];

  useEffect(() => {
    let timer: number | undefined;
    try {
      const saved = Number(window.localStorage.getItem(BEST_SCORE_KEY) ?? 0);
      if (Number.isFinite(saved) && saved > 0) {
        timer = window.setTimeout(() => setBestScore(saved), 0);
      }
    } catch {
      // Local storage is optional and must never block play.
    }
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  const availableForDifficulty = useMemo(
    () => highIqQuestions.filter(
      (question) => difficulty === "All" || question.difficulty === difficulty,
    ).length,
    [difficulty],
  );

  const actualRoundCount = Math.min(roundCount, availableForDifficulty);

  const resolveAnswer = useCallback((answerIndex: number | null) => {
    if (phase !== "playing" || revealed || !currentQuestion) return;

    const correct = answerIndex === currentQuestion.correctIndex;
    const result = scoreHighIqAnswer(currentQuestion, correct, streak);
    const nextScore = score + result.points;

    setSelectedIndex(answerIndex);
    setWasCorrect(correct);
    setPointsAwarded(result.points);
    setRevealed(true);
    setScore(nextScore);
    setStreak(result.nextStreak);
    setBestStreak((value) => Math.max(value, result.nextStreak));
    if (correct) setCorrectCount((value) => value + 1);

    if (nextScore > bestScore) {
      setBestScore(nextScore);
      try {
        window.localStorage.setItem(BEST_SCORE_KEY, String(nextScore));
      } catch {
        // Local storage is optional and must never block play.
      }
    }
  }, [bestScore, currentQuestion, phase, revealed, score, streak]);

  const advanceRound = useCallback(() => {
    if (!revealed) return;
    if (roundIndex + 1 >= deck.length) {
      setPhase("finished");
      focusGame();
      return;
    }

    setRoundIndex((value) => value + 1);
    setSelectedIndex(null);
    setRevealed(false);
    setWasCorrect(null);
    setPointsAwarded(0);
    setTimeLeft(TIMER_SECONDS);
    focusGame();
  }, [deck.length, revealed, roundIndex]);

  useEffect(() => {
    if (phase !== "playing" || revealed || !timerEnabled || !currentQuestion) return;

    const timer = window.setTimeout(() => {
      if (timeLeft <= 1) resolveAnswer(null);
      else setTimeLeft((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [currentQuestion, phase, resolveAnswer, revealed, timeLeft, timerEnabled]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (phase !== "playing") return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;

      if (revealed && event.key === "Enter") {
        advanceRound();
        return;
      }

      if (revealed) return;
      const keyIndex = answerKeys.findIndex((key) => key.toLowerCase() === event.key.toLowerCase());
      if (keyIndex >= 0) resolveAnswer(keyIndex);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advanceRound, phase, resolveAnswer, revealed]);

  const startGame = () => {
    const nextDeck = buildHighIqDeck(
      highIqQuestions,
      actualRoundCount,
      difficulty,
      `${Date.now()}-${difficulty}-${actualRoundCount}`,
    );

    setDeck(nextDeck);
    setRoundIndex(0);
    setSelectedIndex(null);
    setRevealed(false);
    setWasCorrect(null);
    setPointsAwarded(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setTimeLeft(TIMER_SECONDS);
    setPhase("playing");
    focusGame();
  };

  const returnToSetup = () => {
    setPhase("setup");
    setDeck([]);
    setRoundIndex(0);
    setSelectedIndex(null);
    setRevealed(false);
    setWasCorrect(null);
    setPointsAwarded(0);
    focusGame();
  };

  if (phase === "setup") {
    return (
      <div id={GAME_ID} className={styles.gameFrame}>
        <div className={styles.setupGrid}>
          <section className={styles.panel}>
            <p className={styles.kicker}>Knowledge challenge</p>
            <h2>How high is your IQ?</h2>
            <p className={styles.lede}>
              Answer plant-science and cannabis-genetics questions. Harder questions are worth more, and correct-answer streaks add a bonus.
            </p>

            <label className={styles.field}>
              <span>Questions</span>
              <select value={roundCount} onChange={(event) => setRoundCount(Number(event.target.value))}>
                <option value={10}>10 questions</option>
                <option value={15}>15 questions</option>
                <option value={20}>20 questions</option>
                <option value={24}>Full starter bank</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Difficulty</span>
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as HighIqDifficultyFilter)}
              >
                <option value="All">Mixed difficulty</option>
                {highIqDifficulties.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>

            <label className={styles.toggleRow}>
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={(event) => setTimerEnabled(event.target.checked)}
              />
              <span>30-second question timer</span>
            </label>

            <button className={styles.primaryButton} type="button" onClick={startGame} disabled={!actualRoundCount}>
              Start challenge
            </button>
          </section>

          <aside className={styles.panel}>
            <p className={styles.kicker}>Starter release</p>
            <h2>{highIqQuestions.length} verified-format questions</h2>
            <div className={styles.statList}>
              <div><strong>{availableForDifficulty}</strong><span>available for this filter</span></div>
              <div><strong>{actualRoundCount}</strong><span>questions this run</span></div>
              <div><strong>{bestScore.toLocaleString()}</strong><span>best score on this device</span></div>
            </div>
            <p className={styles.note}>
              This first digital build uses a controlled question database instead of baking trivia into the interface, so new reviewed packs can be added without rewriting the game.
            </p>
          </aside>
        </div>

        <div className={styles.rulesStrip}>
          <div><strong>1</strong><span>Pick A, B, C, or D.</span></div>
          <div><strong>2</strong><span>Read the explanation after every answer.</span></div>
          <div><strong>3</strong><span>Build streaks for bonus points.</span></div>
        </div>
      </div>
    );
  }

  if (phase === "finished") {
    const accuracy = deck.length ? Math.round((correctCount / deck.length) * 100) : 0;
    const rank = accuracy >= 90 ? "Master Grower" : accuracy >= 75 ? "Sharp Cultivator" : accuracy >= 60 ? "Solid Student" : "Keep Studying";

    return (
      <div id={GAME_ID} className={styles.gameFrame}>
        <section className={styles.finishPanel}>
          <p className={styles.kicker}>Challenge complete</p>
          <h2>{rank}</h2>
          <div className={styles.finishScore}>{score.toLocaleString()} <span>points</span></div>
          <div className={styles.finishStats}>
            <div><strong>{correctCount}/{deck.length}</strong><span>correct</span></div>
            <div><strong>{accuracy}%</strong><span>accuracy</span></div>
            <div><strong>{bestStreak}</strong><span>best streak</span></div>
            <div><strong>{bestScore.toLocaleString()}</strong><span>device best</span></div>
          </div>
          <button className={styles.primaryButton} type="button" onClick={startGame}>Play again</button>
          <button className={styles.textButton} type="button" onClick={returnToSetup}>Change settings</button>
        </section>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const progress = ((roundIndex + (revealed ? 1 : 0)) / deck.length) * 100;

  return (
    <div id={GAME_ID} className={styles.gameFrame}>
      <div className={styles.topBar}>
        <div><span>Question</span><strong>{roundIndex + 1}/{deck.length}</strong></div>
        <div><span>Score</span><strong>{score.toLocaleString()}</strong></div>
        <div><span>Streak</span><strong>{streak}</strong></div>
        <div className={timerEnabled && timeLeft <= 8 && !revealed ? styles.timerDanger : undefined}>
          <span>Time</span><strong>{timerEnabled ? `${timeLeft}s` : "Off"}</strong>
        </div>
      </div>
      <div className={styles.progressTrack}><span style={{ width: `${progress}%` }} /></div>

      <main className={styles.playGrid}>
        <section className={styles.questionCard}>
          <div className={styles.questionMeta}>
            <span>{currentQuestion.category}</span>
            <span>{currentQuestion.difficulty}</span>
          </div>
          <h2>{currentQuestion.prompt}</h2>

          <div className={styles.answerGrid} aria-label="Answer choices">
            {currentQuestion.choices.map((choice, index) => {
              const isCorrect = revealed && index === currentQuestion.correctIndex;
              const isWrongSelection = revealed && selectedIndex === index && index !== currentQuestion.correctIndex;
              return (
                <button
                  key={choice}
                  type="button"
                  className={`${styles.answerButton} ${isCorrect ? styles.correctAnswer : ""} ${isWrongSelection ? styles.wrongAnswer : ""}`}
                  onClick={() => resolveAnswer(index)}
                  disabled={revealed}
                  aria-label={`${answerKeys[index]}: ${choice}`}
                >
                  <strong>{answerKeys[index]}</strong>
                  <span>{choice}</span>
                </button>
              );
            })}
          </div>

          {revealed ? (
            <div className={styles.explanation} aria-live="polite">
              <div className={wasCorrect ? styles.resultCorrect : styles.resultWrong}>
                {wasCorrect ? `Correct +${pointsAwarded}` : selectedIndex === null ? "Time expired" : "Not quite"}
              </div>
              <p>{currentQuestion.explanation}</p>
              <button className={styles.nextButton} type="button" onClick={advanceRound}>
                {roundIndex + 1 >= deck.length ? "See results" : "Next question"}
              </button>
            </div>
          ) : null}
        </section>

        <aside className={styles.sidePanel}>
          <p className={styles.kicker}>Scoring</p>
          <div className={styles.scoreTable}>
            <span>Easy</span><strong>100</strong>
            <span>Medium</span><strong>125</strong>
            <span>Hard</span><strong>175</strong>
            <span>Expert</span><strong>250</strong>
          </div>
          <p className={styles.note}>Every consecutive correct answer adds a growing streak bonus, capped at +160 points per question.</p>
          <p className={styles.keyboardHelp}>Keyboard: <kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> <kbd>D</kbd> · <kbd>Enter</kbd> next</p>
        </aside>
      </main>
    </div>
  );
}
