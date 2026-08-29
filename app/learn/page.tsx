import type { Metadata } from "next";
import Link from "next/link";
import { buildEducationMetadata } from "@/lib/education-seo";

export const metadata: Metadata = buildEducationMetadata({
  title: "Teaching Healthy Cultivation",
  description:
    "DTF's connected cultivation education system for guided courses, plant science, diagnostics, greenhouse and outdoor cultivation, post-harvest science, visual learning, field tools, and evidence sources.",
  path: "/learn",
});

const startHere = [
  {
    eyebrow: "Guided curriculum",
    title: "THC Academy",
    description:
      "Follow 12 structured courses and 60 connected units when you want a learning sequence instead of searching one topic at a time.",
    href: "/learn/academy",
    action: "Start the Academy",
  },
  {
    eyebrow: "Interactive plant science",
    title: "Living Plant Atlas",
    description:
      "Explore anatomy, physiology, environment, reproductive biology, trichomes, diagnostics, and whole-plant relationships through connected visual lessons.",
    href: "/learn/atlas",
    action: "Open the Atlas",
  },
  {
    eyebrow: "Find a specific answer",
    title: "Search THC",
    description:
      "Search lessons, symptom references, plant-health material, cultivation science, field tools, and evidence sources from one education index.",
    href: "/learn/search",
    action: "Search education",
  },
];

const diagnose = [
  {
    eyebrow: "Plant-health reference",
    title: "Plant Health, IPM & Disease Library",
    description:
      "Use observation-first references for pests, diseases, systemic pathogens, scouting, sanitation, biological control, and differential diagnosis.",
    href: "/learn/plant-health",
    action: "Open plant health",
  },
  {
    eyebrow: "Symptom-first investigation",
    title: "Symptom Differential Library",
    description:
      "Compare yellowing, spotting, curling, wilting, bleaching, pigmentation, root decline, stem lesions, and flower damage against multiple plausible causes.",
    href: "/learn/symptoms",
    action: "Compare symptoms",
  },
  {
    eyebrow: "Applied practice",
    title: "Diagnostic Case Lab",
    description:
      "Practice combining symptom location, progression, measurements, root-zone evidence, and pest or pathogen observations into ranked differentials.",
    href: "/learn/atlas/cases",
    action: "Work diagnostic cases",
  },
];

const references = [
  {
    title: "Cultivation Science References",
    description:
      "Whole-plant physiology, outdoor and protected cultivation, harvest and post-harvest biology, plant architecture, flowering development, and measurement science.",
    href: "/learn/cultivation-science",
  },
  {
    title: "Evidence & Sources",
    description:
      "Peer-reviewed cannabis research, university extension material, and government technical guidance connected directly to THC lessons.",
    href: "/learn/sources",
  },
  {
    title: "Printable Learning Tools",
    description:
      "Observation sheets, scouting maps, calibration logs, propagation records, environmental logs, outdoor surveys, and post-harvest worksheets.",
    href: "/learn/tools",
  },
  {
    title: "Practice Labs",
    description:
      "Interactive exercises that apply plant-science concepts instead of relying only on passive reading.",
    href: "/learn/atlas/practice",
  },
  {
    title: "Review & Mastery",
    description:
      "Revisit concepts, test understanding, and build a connected model of whole-plant function.",
    href: "/learn/atlas/review",
  },
  {
    title: "Guided Learning Paths",
    description:
      "Follow directed routes through anatomy, physiology, environment, diagnostics, and related Atlas systems.",
    href: "/learn/atlas/paths",
  },
];

function LearningCards({ items }: { items: Array<{ eyebrow?: string; title: string; description: string; href: string; action?: string }> }) {
  return (
    <div className="card-grid">
      {items.map((item) => (
        <Link className="feature-card" href={item.href} key={item.href}>
          {item.eyebrow ? <p className="eyebrow">{item.eyebrow}</p> : null}
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <span>{item.action ?? "Open reference"} →</span>
        </Link>
      ))}
    </div>
  );
}

export default function LearnPage() {
  return (
    <>
      <section className="shell page-section">
        <p className="eyebrow">Teaching Healthy Cultivation</p>
        <h1>Learn</h1>
        <p className="lede">
          A connected cultivation education system built around plant function, direct observation, measurement, visual learning, evidence-based diagnostics, transparent sourcing, and repeatable field records.
        </p>
      </section>

      <section className="shell section" aria-labelledby="learn-start">
        <div className="section-heading">
          <p className="eyebrow">Start here</p>
          <h2 id="learn-start">Choose how you want to learn.</h2>
          <p className="lede">
            Follow a curriculum, explore the plant visually, or search directly. These are the three main entry points; everything else is a connected reference or practice surface.
          </p>
        </div>
        <LearningCards items={startHere} />
      </section>

      <section className="shell section" aria-labelledby="learn-diagnose">
        <div className="section-heading">
          <p className="eyebrow">Diagnose and investigate</p>
          <h2 id="learn-diagnose">Move from symptoms to evidence.</h2>
          <p className="lede">
            Plant-health material is organized to prevent the common mistake of treating one visible symptom as proof of one cause.
          </p>
        </div>
        <LearningCards items={diagnose} />
      </section>

      <section className="shell section" aria-labelledby="learn-reference">
        <div className="section-heading">
          <p className="eyebrow">Reference and practice</p>
          <h2 id="learn-reference">Go deeper when the basics are not enough.</h2>
        </div>
        <LearningCards items={references} />
      </section>
    </>
  );
}
