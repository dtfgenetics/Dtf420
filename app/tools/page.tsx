import type { Metadata } from "next";
import Link from "next/link";

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
  },
  {
    eyebrow: "Observation-first diagnostics",
    title: "Grow Doc",
    description:
      "Work from symptom location, progression, environment, root-zone context, and visible evidence toward a ranked differential instead of a one-photo certainty claim.",
    href: "/tools/grow-doc",
    action: "Open Grow Doc guide",
  },
];

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
      <section className="shell page-section">
        <p className="eyebrow">DTF Genetics · Field systems</p>
        <h1>Tools</h1>
        <p className="lede">
          Practical tools should help you collect better evidence, keep cleaner records, and make more defensible decisions. The DTF tool system connects grow records and diagnostics directly to Teaching Healthy Cultivation references instead of isolating them from the science.
        </p>

        <div className="card-grid" style={{ marginTop: 34 }}>
          {primaryTools.map((tool) => (
            <Link className="feature-card" href={tool.href} key={tool.href}>
              <p className="eyebrow">{tool.eyebrow}</p>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
              <span>{tool.action} →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell section" aria-labelledby="supporting-tools">
        <div className="section-heading">
          <p className="eyebrow">Connected references</p>
          <h2 id="supporting-tools">Use the right surface for the job.</h2>
          <p className="lede">
            Measurements and symptom observations become much more useful when they connect to reference material, source evidence, and repeatable field records.
          </p>
        </div>

        <div className="card-grid">
          {supportingTools.map((tool) => (
            <Link className="feature-card" href={tool.href} key={tool.href}>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
              <span>Open →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
