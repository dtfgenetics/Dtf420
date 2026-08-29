"use client";

import Link from "next/link";
import { useState } from "react";
import coreCases from "@/content/atlas-diagnostic-cases.json";
import expandedCases from "@/content/atlas-diagnostic-cases-expanded.json";
import styles from "./AtlasDiagnosticCaseLab.module.css";

type Result = "correct" | "incorrect" | null;
type DiagnosticCase = (typeof coreCases)[number];

function balanceAnswerPosition(item: DiagnosticCase, index: number): DiagnosticCase {
  const targetIndex = index % item.options.length;
  const correctOption = item.options[item.correctIndex];
  const distractors = item.options.filter((_, optionIndex) => optionIndex !== item.correctIndex);
  const options = [...distractors];
  options.splice(targetIndex, 0, correctOption);

  return {
    ...item,
    options,
    correctIndex: targetIndex,
  };
}

const cases = [...coreCases, ...expandedCases].map(balanceAnswerPosition);

export function AtlasDiagnosticCaseLab() {
  const [selectedId, setSelectedId] = useState(cases[0].id);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<Result>(null);
  const activeCase = cases.find((item) => item.id === selectedId) ?? cases[0];

  const chooseCase = (id: string) => {
    setSelectedId(id);
    setSelectedOption(null);
    setResult(null);
  };

  const submit = () => {
    if (selectedOption === null) return;
    setResult(selectedOption === activeCase.correctIndex ? "correct" : "incorrect");
  };

  const retry = () => {
    setSelectedOption(null);
    setResult(null);
  };

  return (
    <div className={styles.shell}>
      <section className={styles.hero} aria-label="Diagnostic case lab introduction">
        <div>
          <small>Atlas Diagnostic Case Lab</small>
          <h1>Reason from evidence before naming a cause.</h1>
          <p>Each case gives you location, pattern, progression, and context. Your job is to choose the observation or measurement that best separates competing explanations.</p>
        </div>
        <div className={styles.scope}>
          <strong>Practice rule</strong>
          <span>A visual pattern can narrow a differential, but it does not prove a diagnosis by itself.</span>
        </div>
      </section>

      <nav className={styles.caseRail} aria-label="Atlas diagnostic cases">
        {cases.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === activeCase.id}
            className={item.id === activeCase.id ? styles.activeCase : undefined}
            onClick={() => chooseCase(item.id)}
          >
            <small>Case {index + 1}</small>
            <span>{item.title}</span>
          </button>
        ))}
      </nav>

      <section className={styles.case} aria-label={`${activeCase.title} diagnostic case`}>
        <header className={styles.caseHeader}>
          <div>
            <small>{activeCase.focus}</small>
            <h2>{activeCase.title}</h2>
            <p>{activeCase.scenario}</p>
          </div>
          <span>Case {cases.findIndex((item) => item.id === activeCase.id) + 1} of {cases.length}</span>
        </header>

        <section className={styles.observations} aria-label="Case observations">
          {activeCase.observations.map((observation) => (
            <article key={observation.label}>
              <small>{observation.label}</small>
              <p>{observation.value}</p>
            </article>
          ))}
        </section>

        <section className={styles.question} aria-label="Diagnostic reasoning question">
          <small>Choose the strongest next step</small>
          <h3>{activeCase.question}</h3>
          <div className={styles.options} role="radiogroup" aria-label="Diagnostic case answer choices">
            {activeCase.options.map((option, index) => {
              const chosen = selectedOption === index;
              const showCorrect = result === "correct" && index === activeCase.correctIndex;
              const showIncorrect = result === "incorrect" && chosen;
              const className = showCorrect ? styles.correct : showIncorrect ? styles.incorrect : chosen ? styles.selected : undefined;
              return (
                <button
                  key={option.label}
                  type="button"
                  role="radio"
                  aria-checked={chosen}
                  className={className}
                  disabled={result !== null}
                  onClick={() => result === null && setSelectedOption(index)}
                >
                  <b>{String.fromCharCode(65 + index)}</b>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          {result === null ? (
            <button className={styles.submit} type="button" disabled={selectedOption === null} onClick={submit}>Check reasoning</button>
          ) : result === "incorrect" ? (
            <div className={styles.feedbackIncorrect} role="status">
              <strong>That step does not separate the strongest competing explanations.</strong>
              <p>{activeCase.options[selectedOption ?? 0].rationale}</p>
              <button type="button" onClick={retry}>Try another next step</button>
            </div>
          ) : (
            <div className={styles.feedbackCorrect} role="status">
              <strong>Strong next step.</strong>
              <p>{activeCase.options[activeCase.correctIndex].rationale}</p>
            </div>
          )}
        </section>

        {result === "correct" ? (
          <section className={styles.reasoning} aria-label="Case differential reasoning">
            <div>
              <small>Working differential</small>
              <h3>What is still plausible?</h3>
              <ul>
                {activeCase.differential.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className={styles.takeaway}>
              <small>Reasoning takeaway</small>
              <p>{activeCase.takeaway}</p>
            </div>
          </section>
        ) : null}

        <footer className={styles.links}>
          <div>
            <small>Study the underlying Atlas concepts</small>
            <span>Use the linked lessons to understand why these observations change the differential.</span>
          </div>
          <div>
            {activeCase.links.map((link) => <Link key={link.route} href={link.route}>{link.label}</Link>)}
          </div>
        </footer>
      </section>

      <footer className={styles.footer}>
        <Link href="/learn/atlas/dashboard">Back to Study Dashboard</Link>
        <Link href="/learn/atlas/notebook">Record field observation</Link>
        <Link href="/learn/atlas/review">Practice knowledge checks</Link>
      </footer>
    </div>
  );
}
