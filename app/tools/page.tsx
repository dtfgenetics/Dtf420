import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Grow Tools",
  description:
    "DTF Genetics grow tools for structured records, differential diagnosis, measurement, calculators, and printable field workflows.",
};

const primaryTools = [
  {
    eyebrow: "Grow records workspace",
    title: "GrowLens",
    description:
      "Organize plants, spaces, environmental readings, irrigation, feeding, canopy observations, photos, and harvest records around a repeatable grow log.",
    href: "/tools/growlens",
    action: "Open GrowLens guide",
    variant: "records",
  },
  {
    eyebrow: "Observation-first diagnostics",
    title: "Grow Doc",
    description:
      "Work from symptom location, progression, environment, root-zone context, and visible evidence toward a ranked differential instead of a one-photo certainty claim.",
    href: "/tools/grow-doc",
    action: "Open Grow Doc guide",
    variant: "diagnostic",
  },
] as const;

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
];

const toolSuite = [
  {
    group: "Explore",
    title: "Living Plant Atlas",
    description: "Explore cannabis anatomy, physiology, growth stages, environmental context, diagnostic patterns, and connected lessons.",
    href: "/learn/atlas",
  },
  {
    group: "Explore",
    title: "Terpene Atlas",
    description: "Explore terpene chemistry, cultivar profiles, evidence context, sensory relationships, and educational reference material.",
    href: "/learn/terpenes",
  },
  {
    group: "Measure",
    title: "PPFD canopy mapping",
    description: "Use the printable PPFD mapping workflow to record a canopy grid, summarize distribution, and document fixture adjustments.",
    href: "/learn/tools/ppfd-mapping-grid",
  },
  {
    group: "Measure",
    title: "Temperature, RH & VPD log",
    description: "Record atmospheric and leaf-temperature context instead of treating a single VPD value as a universal target.",
    href: "/learn/tools/vpd-environment-log",
  },
  {
    group: "Measure",
    title: "pH & EC calibration",
    description: "Keep meter identity, buffers, calibration checks, maintenance, and failures traceable before relying on measurements.",
    href: "/learn/tools/ph-ec-calibration-log",
  },
] as const;

const supportingTools = [
  {
    title: "Printable field tools",
    description: "Calibration logs, scouting maps, propagation records, environmental logs, observation sheets, and other downloadable records.",
    href: "/learn/tools",
  },
  {
    title: "Diagnostic case lab",
    description: "Practice combining measurements and observations into evidence for and against multiple plausible causes.",
    href: "/learn/atlas/cases",
  },
  {
    title: "Symptom differentials",
    description: "Compare yellowing, spotting, curling, wilting, bleaching, pigmentation, root decline, stem lesions, and flower damage.",
    href: "/learn/symptoms",
  },
  {
    title: "Evidence & sources",
    description: "Check the peer-reviewed research, extension material, and technical references connected to the education system.",
    href: "/learn/sources",
  },
  {
    title: "Living Plant Atlas",
    description: "Move from a measurement or symptom into the underlying anatomy, physiology, environment, and diagnostic context.",
    href: "/learn/atlas",
  },
  {
    title: "Search THC",
    description: "Search the connected education system when you know the question but not which library contains the answer.",
    href: "/learn/search",
  },
];

export default function ToolsPage() {
  return (
    <>
      <section className={`${styles.hero} shell page-section`}>
        <div className={styles.heroCopy}>
          <p className="eyebrow">DTF Genetics · Field systems</p>
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

      <section className="shell section" aria-labelledby="tool-suite">
        <div className="section-heading">
          <p className="eyebrow">THC tool suite</p>
          <h2 id="tool-suite">Explore, measure, diagnose, and record.</h2>
          <p className="lede">
            Use the interactive references and field tools as one connected system instead of hunting through separate education pages.
          </p>
        </div>

        <div className={styles.suiteGrid}>
          {toolSuite.map((tool) => (
            <Link className={styles.suiteCard} href={tool.href} key={tool.href}>
              <span>{tool.group}</span>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
              <strong>Open tool →</strong>
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
