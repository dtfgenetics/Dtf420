import type { Metadata } from "next";
import Link from "next/link";
import { buildEducationMetadata } from "@/lib/education-seo";

export const metadata: Metadata = buildEducationMetadata({
  title: "Teaching Healthy Cultivation",
  description:
    "DTF's connected cultivation education system for guided courses, plant science, diagnostics, greenhouse and outdoor cultivation, post-harvest science, visual learning, field tools, and evidence sources.",
  path: "/learn",
});

const primaryLearning = [
  {
    number: "01",
    title: "THC Academy",
    description:
      "Follow 12 structured courses and 60 connected units when you want a learning sequence instead of searching one topic at a time.",
    href: "/learn/academy",
    action: "Start the Academy",
    variant: "academy",
  },
  {
    number: "02",
    title: "Living Plant Atlas",
    description:
      "Explore anatomy, physiology, environment, reproductive biology, trichomes, diagnostics, and whole-plant relationships through connected visual lessons.",
    href: "/learn/atlas",
    action: "Explore the plant",
    variant: "atlas",
  },
];

const diagnosticPaths = [
  {
    title: "Plant Health, IPM & Disease",
    description:
      "Investigate pests, diseases, systemic pathogens, sanitation, scouting, biological control, and abiotic stress with observation-first references.",
    href: "/learn/plant-health",
    action: "Open plant health",
  },
  {
    title: "Symptom Differentials",
    description:
      "Start with what you can actually see—yellowing, spotting, curling, wilting, bleaching, root decline, stem lesions, and flower damage—then compare plausible causes.",
    href: "/learn/symptoms",
    action: "Compare symptoms",
  },
  {
    title: "Diagnostic Case Lab",
    description:
      "Practice choosing the next useful observation or measurement before settling on a cause.",
    href: "/learn/atlas/cases",
    action: "Work a case",
  },
];

const referencePaths = [
  {
    title: "Cultivation Science",
    description: "Plant physiology, protected and outdoor cultivation, harvest biology, plant architecture, flowering, and measurement science.",
    href: "/learn/cultivation-science",
  },
  {
    title: "Evidence & Sources",
    description: "Peer-reviewed research, university extension material, and government technical guidance connected to THC lessons.",
    href: "/learn/sources",
  },
  {
    title: "Printable Field Tools",
    description: "Observation sheets, scouting maps, calibration records, propagation logs, environmental records, and post-harvest worksheets.",
    href: "/learn/tools",
  },
  {
    title: "Practice Labs",
    description: "Interactive exercises that apply plant-science concepts instead of relying only on passive reading.",
    href: "/learn/atlas/practice",
  },
  {
    title: "Review & Mastery",
    description: "Revisit connected concepts, check understanding, and build a stronger whole-plant mental model.",
    href: "/learn/atlas/review",
  },
  {
    title: "Guided Learning Paths",
    description: "Follow directed routes through anatomy, physiology, environment, diagnostics, and related Atlas systems.",
    href: "/learn/atlas/paths",
  },
];

export default function LearnPage() {
  return (
    <>
      <section className="learn-hero shell page-section">
        <div className="learn-hero__copy">
          <p className="eyebrow">Teaching Healthy Cultivation</p>
          <h1>Understand the plant, not just the recipe.</h1>
          <p className="lede">
            Learn cannabis cultivation through plant function, direct observation, measurement, visual study, evidence-based diagnostics, transparent sourcing, and repeatable field records.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" href="/learn/academy">Start learning</Link>
            <Link className="button" href="/learn/search">Search THC</Link>
          </div>
        </div>
      </section>

      <section className="shell section" aria-labelledby="learn-start">
        <div className="section-heading">
          <p className="eyebrow">Start here</p>
          <h2 id="learn-start">Two ways to build real plant knowledge.</h2>
          <p className="lede">
            Use the Academy when you want sequence and structure. Use the Living Plant Atlas when you want to explore systems, relationships, and visual plant science.
          </p>
        </div>

        <div className="learn-primary-grid">
          {primaryLearning.map((item) => (
            <Link className={`learn-primary-card learn-primary-card--${item.variant}`} href={item.href} key={item.href}>
              <span className="learn-primary-card__number">{item.number}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <strong>{item.action} →</strong>
              </div>
            </Link>
          ))}
        </div>

        <Link className="learn-search-strip" href="/learn/search">
          <span>
            <small>Know the question, not the library?</small>
            <strong>Search lessons, symptoms, plant health, field tools, and evidence.</strong>
          </span>
          <span aria-hidden="true">Search THC →</span>
        </Link>
      </section>

      <section className="learn-diagnostic-band" aria-labelledby="learn-diagnose">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Diagnose and investigate</p>
            <h2 id="learn-diagnose">Move from symptoms to evidence.</h2>
            <p className="lede">
              A visible symptom is a clue, not a diagnosis. Start with location, pattern, progression, environment, and measurements, then compare plausible causes.
            </p>
          </div>

          <div className="learn-diagnostic-grid">
            {diagnosticPaths.map((item, index) => (
              <Link className="learn-diagnostic-card" href={item.href} key={item.href}>
                <span className="learn-diagnostic-card__index">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <strong>{item.action} →</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="shell section" aria-labelledby="learn-reference">
        <div className="section-heading">
          <p className="eyebrow">Reference and practice</p>
          <h2 id="learn-reference">Go deeper without getting lost.</h2>
          <p className="lede">
            Use focused reference libraries and practice surfaces when you need more detail than a guided lesson provides.
          </p>
        </div>

        <div className="learn-reference-list">
          {referencePaths.map((item) => (
            <Link className="learn-reference-row" href={item.href} key={item.href}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              <span aria-hidden="true">Open →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
