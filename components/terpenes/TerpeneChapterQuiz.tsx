"use client";

import { useState } from "react";
import type { TerpeneQuiz } from "@/lib/terpenes/assessments";
import styles from "./TerpeneChapterQuiz.module.css";

export function TerpeneChapterQuiz({ quiz }: { quiz: TerpeneQuiz }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const answered = Object.keys(answers).length;
  const correct = quiz.questions.reduce(
    (total, question) => total + (answers[question.id] === question.correctIndex ? 1 : 0),
    0,
  );
  const score = Math.round((correct / quiz.questions.length) * 100);

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <section className={styles.quiz} id="assessment">
      <div className={styles.heading}>
        <div>
          <p className="eyebrow">Knowledge check</p>
          <h2>{quiz.title}</h2>
          <p>
            Answer every question before submitting. Grading and explanations appear only after submission.
          </p>
        </div>
        <div className={styles.score}>
          <span>{submitted ? "Score" : "Progress"}</span>
          <strong>{submitted ? `${score}%` : `${answered}/${quiz.questions.length}`}</strong>
          <small>{submitted ? `${correct} of ${quiz.questions.length} correct` : "Responses are not graded yet"}</small>
        </div>
      </div>

      <div className={styles.questions}>
        {quiz.questions.map((question, questionIndex) => {
          const selected = answers[question.id];
          const answeredQuestion = selected !== undefined;

          return (
            <article key={question.id}>
              <div className={styles.questionNumber}>{String(questionIndex + 1).padStart(2, "0")}</div>
              <div className={styles.questionBody}>
                <h3>{question.prompt}</h3>
                <div className={styles.options} role="group" aria-label={`Question ${questionIndex + 1} answers`}>
                  {question.options.map((option, optionIndex) => {
                    const isSelected = selected === optionIndex;
                    const isCorrect = submitted && optionIndex === question.correctIndex;
                    const isWrongSelected =
                      submitted &&
                      optionIndex === selected &&
                      selected !== question.correctIndex;

                    return (
                      <button
                        type="button"
                        key={`${question.id}-${optionIndex}`}
                        data-selected={isSelected && !submitted ? "" : undefined}
                        data-correct={isCorrect ? "" : undefined}
                        data-wrong={isWrongSelected ? "" : undefined}
                        aria-pressed={isSelected}
                        disabled={submitted}
                        onClick={() =>
                          setAnswers((current) => ({ ...current, [question.id]: optionIndex }))
                        }
                      >
                        <span>{String.fromCharCode(65 + optionIndex)}</span>
                        <strong>{option}</strong>
                      </button>
                    );
                  })}
                </div>
                {submitted && answeredQuestion ? (
                  <p className={styles.explanation}>{question.explanation}</p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.submitRow}>
        {!submitted ? (
          <>
            <span>{answered} of {quiz.questions.length} answered</span>
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              disabled={answered !== quiz.questions.length}
            >
              Submit knowledge check
            </button>
          </>
        ) : (
          <>
            <span>Review the explanations above, then retake when ready.</span>
            <button type="button" onClick={reset}>Retake knowledge check</button>
          </>
        )}
      </div>
    </section>
  );
}
