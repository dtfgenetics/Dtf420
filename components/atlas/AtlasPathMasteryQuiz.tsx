"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import guidedPaths from "@/content/atlas-guided-paths.json";
import knowledgeChecks from "@/content/atlas-knowledge-checks.json";
import { useAtlasMastery } from "@/components/atlas/AtlasMastery";
import styles from "./AtlasPathMasteryQuiz.module.css";

const checkByRoute = new Map(knowledgeChecks.map((check) => [check.route, check] as const));

export function AtlasPathMasteryQuiz({ pathId }: { pathId: string }) {
  const path = guidedPaths.find((item) => item.id === pathId);
  const checks = useMemo(
    () => path?.lessons.map((route) => checkByRoute.get(route)).filter((check): check is (typeof knowledgeChecks)[number] => Boolean(check)) ?? [],
    [path],
  );
  const { mastery, update } = useAtlasMastery();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  if (!path) return null;

  const answeredCount = Object.keys(answers).length;
  const previous = mastery.paths[path.id];

  const submit = () => {
    if (answeredCount !== checks.length) return;
    let correctCount = 0;
    const nextLessons = { ...mastery.lessons };

    for (const check of checks) {
      const correct = answers[check.route] === check.correctIndex;
      if (correct) correctCount += 1;
      const current = nextLessons[check.route] ?? { attempts: 0, mastered: false, lastCorrect: false };
      nextLessons[check.route] = {
        attempts: current.attempts + 1,
        mastered: current.mastered || correct,
        lastCorrect: correct,
      };
    }

    const nextScore = Math.round((correctCount / checks.length) * 100);
    const currentPath = mastery.paths[path.id] ?? { attempts: 0, bestScore: 0, lastScore: 0 };
    update({
      lessons: nextLessons,
      paths: {
        ...mastery.paths,
        [path.id]: {
          attempts: currentPath.attempts + 1,
          bestScore: Math.max(currentPath.bestScore, nextScore),
          lastScore: nextScore,
        },
      },
    });
    setScore(nextScore);
    setSubmitted(true);
  };

  const reset = () => {
    setAnswers({});
    setScore(null);
    setSubmitted(false);
  };

  const passed = score !== null && score >= 80;

  return (
    <div className={styles.quizShell}>
      <section className={styles.quizIntro}>
        <div>
          <small>Path mastery quiz</small>
          <h1>{path.title}</h1>
          <p>{path.outcome}</p>
        </div>
        <div className={styles.quizStats}>
          <strong>{checks.length}</strong>
          <span>questions</span>
          <strong>{previous ? `${previous.bestScore}%` : "—"}</strong>
          <span>previous best</span>
        </div>
      </section>

      <div className={styles.quizNotice}>
        <strong>Mastery target: 80%</strong>
        <span>Questions reuse the same lesson checks. Correct answers here also count as mastered lesson checks.</span>
      </div>

      <ol className={styles.quizQuestions}>
        {checks.map((check, questionIndex) => {
          const selected = answers[check.route];
          const correct = selected === check.correctIndex;
          return (
            <li key={check.id}>
              <fieldset disabled={submitted}>
                <legend><span>{questionIndex + 1}</span>{check.prompt}</legend>
                <div className={styles.quizOptions}>
                  {check.options.map((option, optionIndex) => {
                    const chosen = selected === optionIndex;
                    const showCorrect = submitted && optionIndex === check.correctIndex;
                    const showWrong = submitted && chosen && optionIndex !== check.correctIndex;
                    const className = showCorrect ? styles.correctOption : showWrong ? styles.incorrectOption : chosen ? styles.selectedOption : undefined;
                    return (
                      <label key={option} className={className}>
                        <input
                          type="radio"
                          name={check.id}
                          value={optionIndex}
                          checked={chosen}
                          onChange={() => setAnswers((current) => ({ ...current, [check.route]: optionIndex }))}
                        />
                        <b>{String.fromCharCode(65 + optionIndex)}</b>
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              {submitted ? (
                <div className={correct ? styles.answerExplanationCorrect : styles.answerExplanationIncorrect}>
                  <strong>{correct ? "Correct" : "Review this concept"}</strong>
                  <p>{check.explanation}</p>
                  <Link href={check.route}>Open the lesson</Link>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {!submitted ? (
        <div className={styles.quizSubmitRow}>
          <span>{answeredCount} of {checks.length} answered</span>
          <button type="button" onClick={submit} disabled={answeredCount !== checks.length}>Submit mastery quiz</button>
        </div>
      ) : (
        <section className={passed ? styles.quizResultPass : styles.quizResultReview} aria-label="Path mastery result">
          <div>
            <small>{passed ? "Mastery achieved" : "Keep reviewing"}</small>
            <strong>{score}%</strong>
            <p>{passed ? "You met the 80% mastery target for this path." : "Review the explanations and linked lessons, then try again when you are ready."}</p>
          </div>
          <div className={styles.resultActions}>
            <button type="button" onClick={reset}>Retake quiz</button>
            <Link href="/learn/atlas/paths">Back to guided paths</Link>
          </div>
        </section>
      )}
    </div>
  );
}
