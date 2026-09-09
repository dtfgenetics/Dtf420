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
type RunMode = "daily" | "custom" | "missed";
type AnswerRecord = { id: string; category: string; correct: boolean };

type StoredRun = {
  date: string;
  mode: RunMode;
  score: number;
  correct: number;
  total: number;
};

const TIMER_SECONDS = 30;
const DAILY_COUNT = 10;
const BEST_SCORE_KEY = "dtf-high-iq-best-score-v2";
const LEGACY_BEST_SCORE_KEY = "dtf-high-iq-best-score-v1";
const MISSED_KEY = "dtf-high-iq-missed-v2";
const HISTORY_KEY = "dtf-high-iq-history-v2";
const DAILY_DATES_KEY = "dtf-high-iq-daily-dates-v2";
const GAME_ID = "high-iq-game";
const answerKeys = ["A", "B", "C", "D"] as const;

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calculateDailyStreak(dates: string[], referenceDate = new Date()) {
  const unique = [...new Set(dates)].sort().reverse();
  if (!unique.length) return 0;

  const today = localDateKey(referenceDate);
  const yesterdayDate = new Date(referenceDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = localDateKey(yesterdayDate);
  if (unique[0] !== today && unique[0] !== yesterday) return 0;

  let cursor = new Date(`${unique[0]}T12:00:00`);
  let streak = 1;

  for (let index = 1; index < unique.length; index += 1) {
    const previous = new Date(cursor);
    previous.setDate(previous.getDate() - 1);
    if (localDateKey(previous) !== unique[index]) break;
    streak += 1;
    cursor = previous;
  }

  return streak;
}

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
  const [runMode, setRunMode] = useState<RunMode>("daily");
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
  const [missedIds, setMissedIds] = useState<string[]>([]);
  const [dailyDates, setDailyDates] = useState<string[]>([]);
  const [answerRecords, setAnswerRecords] = useState<AnswerRecord[]>([]);
  const [resultSaved, setResultSaved] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  const currentQuestion = deck[roundIndex];
  const today = localDateKey();
  const dailyStreak = useMemo(() => calculateDailyStreak(dailyDates), [dailyDates]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedBest = Number(
          window.localStorage.getItem(BEST_SCORE_KEY)
          ?? window.localStorage.getItem(LEGACY_BEST_SCORE_KEY)
          ?? 0,
        );
        if (Number.isFinite(savedBest) && savedBest > 0) setBestScore(savedBest);

        const storedMissed = JSON.parse(window.localStorage.getItem(MISSED_KEY) ?? "[]") as string[];
        if (Array.isArray(storedMissed)) {
          setMissedIds(storedMissed.filter((value) => typeof value === "string"));
        }

        const storedDates = JSON.parse(window.localStorage.getItem(DAILY_DATES_KEY) ?? "[]") as string[];
        if (Array.isArray(storedDates)) {
          setDailyDates(storedDates.filter((value) => typeof value === "string"));
        }
      } catch {
        // Persistence is optional and must never block play.
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const availableForDifficulty = useMemo(
    () => highIqQuestions.filter(
      (question) => difficulty === "All" || question.difficulty === difficulty,
    ).length,
    [difficulty],
  );

  const actualRoundCount = Math.min(roundCount, availableForDifficulty);

  const resetRun = useCallback(() => {
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
    setAnswerRecords([]);
    setResultSaved(false);
    setShareStatus("");
  }, []);

  const launchDeck = useCallback((nextDeck: HighIqQuestion[], mode: RunMode, useTimer: boolean) => {
    if (!nextDeck.length) return;
    resetRun();
    setDeck(nextDeck);
    setRunMode(mode);
    setTimerEnabled(useTimer);
    setPhase("playing");
    focusGame();
  }, [resetRun]);

  const startDaily = useCallback(() => {
    const nextDeck = buildHighIqDeck(
      highIqQuestions,
      Math.min(DAILY_COUNT, highIqQuestions.length),
      "All",
      `daily-${today}`,
    );
    launchDeck(nextDeck, "daily", true);
  }, [launchDeck, today]);

  const startCustom = useCallback(() => {
    const nextDeck = buildHighIqDeck(
      highIqQuestions,
      actualRoundCount,
      difficulty,
      `${Date.now()}-${difficulty}-${actualRoundCount}`,
    );
    launchDeck(nextDeck, "custom", timerEnabled);
  }, [actualRoundCount, difficulty, launchDeck, timerEnabled]);

  const startMissed = useCallback(() => {
    const pool = highIqQuestions.filter((question) => missedIds.includes(question.id));
    const nextDeck = buildHighIqDeck(pool, pool.length, "All", `missed-${Date.now()}`);
    launchDeck(nextDeck, "missed", false);
  }, [launchDeck, missedIds]);

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
    setAnswerRecords((records) => [
      ...records,
      { id: currentQuestion.id, category: currentQuestion.category, correct },
    ]);
    if (correct) setCorrectCount((value) => value + 1);

    if (nextScore > bestScore) {
      setBestScore(nextScore);
      try {
        window.localStorage.setItem(BEST_SCORE_KEY, String(nextScore));
      } catch {
        // Persistence is optional and must never block play.
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

  useEffect(() => {
    if (phase !== "finished" || resultSaved || !deck.length) return;

    const timer = window.setTimeout(() => {
      const correctIds = new Set(
        answerRecords.filter((record) => record.correct).map((record) => record.id),
      );
      const missedThisRun = answerRecords
        .filter((record) => !record.correct)
        .map((record) => record.id);
      const retainedMisses = missedIds.filter((id) => !correctIds.has(id));
      const nextMissed = [...new Set([...retainedMisses, ...missedThisRun])];

      const run: StoredRun = {
        date: today,
        mode: runMode,
        score,
        correct: correctCount,
        total: deck.length,
      };

      setMissedIds(nextMissed);

      try {
        window.localStorage.setItem(MISSED_KEY, JSON.stringify(nextMissed));

        const history = JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? "[]") as StoredRun[];
        const nextHistory = [run, ...(Array.isArray(history) ? history : [])].slice(0, 20);
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));

        if (runMode === "daily") {
          const nextDates = [...new Set([today, ...dailyDates])].sort().reverse();
          setDailyDates(nextDates);
          window.localStorage.setItem(DAILY_DATES_KEY, JSON.stringify(nextDates));
        }
      } catch {
        // Persistence is optional and must never block results.
      }

      setResultSaved(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [answerRecords, correctCount, dailyDates, deck.length, missedIds, phase, resultSaved, runMode, score, today]);

  const categorySummary = useMemo(() => {
    const summary = new Map<string, { correct: number; total: number }>();
    answerRecords.forEach((record) => {
      const current = summary.get(record.category) ?? { correct: 0, total: 0 };
      current.total += 1;
      if (record.correct) current.correct += 1;
      summary.set(record.category, current);
    });
    return [...summary.entries()]
      .map(([category, value]) => ({ category, ...value }))
      .sort((a, b) => b.total - a.total || a.category.localeCompare(b.category));
  }, [answerRecords]);

  const returnToSetup = useCallback(() => {
    setPhase("setup");
    setDeck([]);
    setRoundIndex(0);
    setSelectedIndex(null);
    setRevealed(false);
    setWasCorrect(null);
    setPointsAwarded(0);
    setShareStatus("");
    focusGame();
  }, []);

  const replayRun = useCallback(() => {
    if (runMode === "daily") startDaily();
    else if (runMode === "missed") startMissed();
    else startCustom();
  }, [runMode, startCustom, startDaily, startMissed]);

  const shareResult = useCallback(async () => {
    if (!deck.length) return;
    const accuracy = Math.round((correctCount / deck.length) * 100);
    const blocks = answerRecords.map((record) => (record.correct ? "🟩" : "🟥")).join("");
    const text = `HIGH IQ ${today}\n${blocks}\n${correctCount}/${deck.length} · ${accuracy}% · ${score.toLocaleString()} pts\ndtfseeds.com/games/high-iq/`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "High IQ result", text });
        setShareStatus("Result shared.");
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareStatus("Result copied.");
    } catch {
      setShareStatus("Share canceled.");
    }
  }, [answerRecords, correctCount, deck.length, score, today]);

  if (phase === "setup") {
    return (
      <div id={GAME_ID} className={styles.gameFrame}>
        <section className={styles.setupStage}>
          <div className={styles.brandMark} aria-hidden="true">HIQ</div>
          <p className={styles.kicker}>DTF Games · Plant science challenge</p>
          <h2>Test Higher Cognition.</h2>
          <p className={styles.setupLead}>
            Fast cannabis plant-science trivia with explanations after every answer. The question stays center stage; the database and scoring stay out of your way until you need them.
          </p>

          <div className={styles.primaryActions}>
            <button className={styles.dailyButton} type="button" onClick={startDaily}>
              <span>Play Daily 10</span>
              <small>Same challenge for the whole day</small>
            </button>
            <button className={styles.missedButton} type="button" onClick={startMissed} disabled={!missedIds.length}>
              Practice missed {missedIds.length ? `(${missedIds.length})` : ""}
            </button>
          </div>

          <div className={styles.quickStats} aria-label="High IQ local stats">
            <div><strong>{highIqQuestions.length}</strong><span>starter questions</span></div>
            <div><strong>{dailyStreak}</strong><span>daily streak</span></div>
            <div><strong>{bestScore.toLocaleString()}</strong><span>device best</span></div>
          </div>

          <details className={styles.customPanel}>
            <summary>Build a custom challenge</summary>
            <div className={styles.customGrid}>
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
                <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as HighIqDifficultyFilter)}>
                  <option value="All">Mixed difficulty</option>
                  {highIqDifficulties.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>

              <label className={styles.toggleRow}>
                <input type="checkbox" checked={timerEnabled} onChange={(event) => setTimerEnabled(event.target.checked)} />
                <span>30-second timer</span>
              </label>

              <button className={styles.customStart} type="button" onClick={startCustom} disabled={!actualRoundCount}>
                Start custom run
              </button>
            </div>
          </details>

          <p className={styles.previewNote}>
            Development preview: this React branch currently contains the 24-question starter bank. The larger production dataset must be reconciled before this route replaces the live version.
          </p>
        </section>
      </div>
    );
  }

  if (phase === "finished") {
    const accuracy = deck.length ? Math.round((correctCount / deck.length) * 100) : 0;
    const rank = accuracy >= 90 ? "Master Grower" : accuracy >= 75 ? "Sharp Cultivator" : accuracy >= 60 ? "Solid Student" : "Keep Studying";

    return (
      <div id={GAME_ID} className={styles.gameFrame}>
        <section className={styles.resultsStage}>
          <p className={styles.kicker}>{runMode === "daily" ? "Daily 10 complete" : "Challenge complete"}</p>
          <h2>{rank}</h2>
          <div className={styles.resultScore}>{score.toLocaleString()} <span>pts</span></div>
          <div className={styles.resultSummary}>
            <div><strong>{correctCount}/{deck.length}</strong><span>correct</span></div>
            <div><strong>{accuracy}%</strong><span>accuracy</span></div>
            <div><strong>{bestStreak}</strong><span>best streak</span></div>
            <div><strong>{runMode === "daily" ? dailyStreak : bestScore.toLocaleString()}</strong><span>{runMode === "daily" ? "daily streak" : "device best"}</span></div>
          </div>

          {categorySummary.length ? (
            <div className={styles.masteryPanel}>
              <div className={styles.sectionHeading}>
                <span>Run mastery</span>
                <small>Accuracy by topic in this challenge</small>
              </div>
              <div className={styles.masteryList}>
                {categorySummary.map((row) => {
                  const percent = Math.round((row.correct / row.total) * 100);
                  return (
                    <div className={styles.masteryRow} key={row.category}>
                      <div><strong>{row.category}</strong><span>{row.correct}/{row.total}</span></div>
                      <div className={styles.masteryTrack}><span style={{ width: `${percent}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className={styles.resultActions}>
            <button className={styles.dailyButton} type="button" onClick={replayRun}>
              Play again
            </button>
            {missedIds.length ? (
              <button className={styles.missedButton} type="button" onClick={startMissed}>Practice missed ({missedIds.length})</button>
            ) : null}
            {runMode === "daily" ? (
              <button className={styles.shareButton} type="button" onClick={() => void shareResult()}>Share result</button>
            ) : null}
            <button className={styles.textButton} type="button" onClick={returnToSetup}>Change mode</button>
          </div>
          {shareStatus ? <p className={styles.shareStatus} role="status">{shareStatus}</p> : null}
        </section>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const progress = ((roundIndex + (revealed ? 1 : 0)) / deck.length) * 100;
  const timerProgress = timerEnabled ? Math.max(0, Math.min(1, timeLeft / TIMER_SECONDS)) : 1;

  return (
    <div id={GAME_ID} className={styles.gameFrame}>
      <section className={styles.playStage}>
        <header className={styles.hud}>
          <div className={styles.hudBrand}>HIGH IQ</div>
          <div className={styles.hudItem}><span>Question</span><strong>{roundIndex + 1}/{deck.length}</strong></div>
          <div className={styles.hudItem}><span>Score</span><strong>{score.toLocaleString()}</strong></div>
          <div className={styles.hudItem}><span>Streak</span><strong>{streak}</strong></div>
        </header>
        <div className={styles.progressTrack}><span style={{ width: `${progress}%` }} /></div>

        <div className={styles.questionStage}>
          <div className={styles.questionTopline}>
            <div className={styles.questionMeta}>
              <span>{currentQuestion.category}</span>
              <span>{currentQuestion.difficulty}</span>
            </div>
            <div
              className={`${styles.timerRing} ${timerEnabled && timeLeft <= 8 && !revealed ? styles.timerDanger : ""}`}
              style={{ background: `conic-gradient(var(--accent) ${timerProgress * 360}deg, rgba(255,255,255,.08) 0deg)` }}
              aria-label={timerEnabled ? `${timeLeft} seconds remaining` : "Timer off"}
            >
              <div><strong>{timerEnabled ? timeLeft : "∞"}</strong><span>{timerEnabled ? "sec" : "off"}</span></div>
            </div>
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
          ) : (
            <p className={styles.keyboardHint}>Keyboard: A · B · C · D</p>
          )}
        </div>
      </section>
    </div>
  );
}
