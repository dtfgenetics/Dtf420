"use client";

import { useState } from "react";
import type { TerpeneQuiz } from "@/lib/terpenes/assessments";
import styles from "./TerpeneChapterQuiz.module.css";

export function TerpeneChapterQuiz({ quiz }: { quiz: TerpeneQuiz }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const answered = Object.keys(answers).length;
  const correct = quiz.questions.reduce(
    (total, question) => total + (answers[question.id] === question.correctIndex ? 1 : 0),
    0,
  );

  return (
    <section className={styles.quiz} id="assessment">
      <div className={styles.heading}>
        <div>
          <p className="eyebrow">Knowledge check</p>
          <h2>{quiz.title}</h2>
          <p>
            These questions test reviewed chapter facts and evidence interpretation. They do not test unsupported effect claims.
          </p>
        </div>
        <div className={styles.score}>
          <span>Answered</span>
          <strong>{answered}/{quiz.questions.length}</strong>
          <small>{answered ? `${correct} correct so far` : "Begin when ready"}</small>
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
                <div className={styles.options}>
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = answeredQuestion && optionIndex === question.correctIndex;
                    const isWrongSelected =
                      answeredQuestion &&
                      optionIndex === selected &&
                      selected !== question.correctIndex;

                    return (
                      <button
                        type="button"
                        key={`${question.id}-${optionIndex}`}
                        data-correct={isCorrect ? "" : undefined}
                        data-wrong={isWrongSelected ? "" : undefined}
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
                {answeredQuestion ? (
                  <p className={styles.explanation}>{question.explanation}</p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
