import type { Metadata } from "next";
import Link from "next/link";
import { connectedReferenceCount, liveToolCount, primaryTools, supportingTools } from "@/lib/tool-catalog";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Grow Tools",
  description:
    "DTF Genetics grow tools for structured records, differential diagnosis, measurement, calculators, and printable field workflows.",
};

const workflow = [
  {
    number: "01",
    title: "Observe",
    description: "Record what changed, where it appears, how it is progressing, and the context around the plant.",
  },
  {
    number: "02",
    title: "Measure",
    description: "Add environmental and root-zone data that can support or weaken competing explanations.",
  },
  {
    number: "03",
    title: "Compare",
    description: "Use THC references and diagnostics to rank possibilities and choose the next useful check.",
  },
] as const;

export default function ToolsPage() {
  return (
    <>
      <section className={`${styles.hero} shell page-section`}>
        <div className={styles.heroCopy}>
          <p className="eyebrow">DTF Genetics · {liveToolCount} live workspaces · {connectedReferenceCount} connected references</p>
          <h1>Better evidence makes better grow decisions.</h1>
          <p className="lede">
            DTF tools connect structured grow records, observation-first diagnostics, measurements, and Teaching Healthy Cultivation references so useful evidence stays attached to the decisions it supports.
          </p>
        </div>

        <div className={styles.primaryGrid}>
          {primaryTools.map((tool) => (
            <Link
              className={`${styles.toolCard} ${tool.variant === "diagnostic" ? styles.toolCardDiagnostic : ""}`}
              href={tool.href}
              key={tool.href}
            >
              <span className={styles.toolLabel}>{tool.eyebrow}</span>
              <div className={styles.toolBody}>
                <h2>{tool.title}</h2>
                <p>{tool.description}</p>
                <strong>{tool.action} →</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.workflowBand} aria-labelledby="tools-workflow">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">DTF field workflow</p>
            <h2 id="tools-workflow">Observe. Measure. Compare.</h2>
            <p className="lede">
              The tools are designed around a simple rule: do not jump from one visible symptom to one certain answer.
            </p>
          </div>

          <div className={styles.workflow}>
            {workflow.map((step) => (
              <article className={styles.workflowStep} key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="shell section" aria-labelledby="supporting-tools">
        <div className="section-heading">
          <p className="eyebrow">Connected references</p>
          <h2 id="supporting-tools">Use the right surface for the next question.</h2>
          <p className="lede">
            Move from records or measurements into the specific reference, case, symptom library, or evidence source that helps discriminate between possibilities.
          </p>
        </div>

        <div className={styles.referenceList}>
          {supportingTools.map((tool) => (
            <Link className={styles.referenceRow} href={tool.href} key={tool.href}>
              <strong>{tool.title}</strong>
              <p>{tool.description}</p>
              <span aria-hidden="true">Open →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
