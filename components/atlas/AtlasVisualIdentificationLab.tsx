"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import exercises from "@/content/atlas-visual-identification.json";
import { AtlasSystemGraphic } from "@/components/atlas/AtlasSystemGraphic";
import styles from "./AtlasVisualIdentificationLab.module.css";

export function AtlasVisualIdentificationLab() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const exercise = exercises[exerciseIndex];
  const correct = submitted && selected === exercise.correctIndex;
  const percent = answered === 0 ? 0 : Math.round((score / answered) * 100);
  const canAdvance = submitted;

  const progressText = useMemo(
    () => `${exerciseIndex + 1} of ${exercises.length}`,
    [exerciseIndex],
  );

  function submit() {
    if (selected === null || submitted) return;
    setSubmitted(true);
    setAnswered((value) => value + 1);
    if (selected === exercise.correctIndex) setScore((value) => value + 1);
  }

  function advance() {
    if (!canAdvance) return;
    setExerciseIndex((value) => (value + 1) % exercises.length);
    setSelected(null);
    setSubmitted(false);
  }

  return (
    <section className={styles.lab} aria-labelledby="visual-identification-title">
      <header className={styles.header}>
        <div>
          <small>Visual identification lab</small>
          <h2 id="visual-identification-title">Read the structure before naming the explanation.</h2>
          <p>Use the diagram as evidence, answer the prompt, then open the connected lesson to inspect the biology in context.</p>
        </div>
        <div className={styles.score} aria-label="Visual practice score">
          <strong>{score}/{answered}</strong>
          <span>{answered === 0 ? "Start practice" : `${percent}% correct`}</span>
        </div>
      </header>

      <div className={styles.workspace}>
        <div className={styles.visual}>
          <div className={styles.visualTopline}>
            <span>{exercise.systemLabel}</span>
            <small>{progressText}</small>
          </div>
          <AtlasSystemGraphic systemId={exercise.systemId} />
          <p>Inspect the structure, relative position, and biological context shown in the diagram.</p>
        </div>

        <div className={styles.question}>
          <small>Identify from the visual</small>
          <h3>{exercise.prompt}</h3>
          <div className={styles.options} role="radiogroup" aria-label="Visual identification answer choices">
            {exercise.options.map((option, index) => {
              const isSelected = selected === index;
              const isCorrect = submitted && index === exercise.correctIndex;
              const isWrongSelection = submitted && isSelected && index !== exercise.correctIndex;
              const className = isCorrect
                ? styles.correct
                : isWrongSelection
                  ? styles.incorrect
                  : isSelected
                    ? styles.selected
                    : undefined;

              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={className}
                  disabled={submitted}
                  onClick={() => !submitted && setSelected(index)}
                >
                  <b>{String.fromCharCode(65 + index)}</b>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          {!submitted ? (
            <button className={styles.submit} type="button" disabled={selected === null} onClick={submit}>
              Check identification
            </button>
          ) : (
            <div className={correct ? styles.feedbackCorrect : styles.feedbackIncorrect} role="status">
              <strong>{correct ? "Correct." : "Use the visual again."}</strong>
              <p>{exercise.explanation}</p>
              <div className={styles.actions}>
                <Link href={exercise.href}>Open connected lesson</Link>
                <button type="button" onClick={advance}>Next visual</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
