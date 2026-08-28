import type { Metadata } from "next";
import Link from "next/link";
import { buildEducationMetadata } from "@/lib/education-seo";

export const metadata: Metadata = buildEducationMetadata({
  title: "Teaching Healthy Cultivation",
  description: "DTF's connected cultivation education system for guided courses, plant science, diagnostics, greenhouse and outdoor cultivation, post-harvest science, visual learning, field tools, and evidence sources.",
  path: "/learn",
});

const learningModes = [
  {
    eyebrow: "Guided curriculum",
    title: "THC Academy",
    description:
      "Follow 12 structured courses and 60 connected units through plant science, diagnostics, environment, health, breeding, outdoor cultivation, protected cultivation, and post-harvest learning.",
    href: "/learn/academy",
    action: "Open THC Academy",
  },
  {
    eyebrow: "Find anything",
    title: "Search Teaching Healthy Cultivation",
    description:
      "Search Atlas lessons, plant-health references, whole-plant physiology, symptom differentials, greenhouse and outdoor science, post-harvest topics, printable field tools, and evidence sources from one place.",
    href: "/learn/search",
    action: "Search all education",
  },
  {
    eyebrow: "Interactive visual learning",
    title: "THC Living Plant Atlas",
    description:
      "Explore seed, roots, stems, nodes, leaves, flowers, trichomes, sex, environment, and diagnostics through one connected whole-plant interface.",
    href: "/learn/atlas",
    action: "Open the Living Plant Atlas",
  },
  {
    eyebrow: "Plant health reference",
    title: "Plant Health, IPM & Disease Library",
    description:
      "Use observation-first references for pests, diseases, systemic pathogens, scouting, sanitation, biological control, and differential diagnosis without relying on one-symptom shortcuts.",
    href: "/learn/plant-health",
    action: "Open the Plant Health Library",
  },
  {
    eyebrow: "Visual diagnostics",
    title: "Symptom Differential Library",
    description:
      "Compare yellowing, spotting, curling, wilting, bleaching, pigmentation, root decline, stem lesions, and flower damage against multiple plausible causes and discriminating checks.",
    href: "/learn/symptoms",
    action: "Open symptom differentials",
  },
  {
    eyebrow: "Expanded subject library",
    title: "Cultivation Science References",
    description:
      "Go deeper into whole-plant physiology, outdoor cultivation, greenhouse and protected cultivation, harvest and post-harvest biology, training and plant architecture, flowering development, and measurement science.",
    href: "/learn/cultivation-science",
    action: "Open cultivation science",
  },
  {
    eyebrow: "Research foundation",
    title: "Evidence & Sources",
    description:
      "Browse peer-reviewed cannabis research, university extension material, and government technical guidance connected directly to THC lessons.",
    href: "/learn/sources",
    action: "Open evidence library",
  },
  {
    eyebrow: "Field practice",
    title: "Printable Learning Tools",
    description:
      "Use printable observation sheets, scouting maps, calibration logs, propagation records, environmental logs, outdoor surveys, and post-harvest worksheets.",
    href: "/learn/tools",
    action: "Open printable tools",
  },
  {
    eyebrow: "Applied diagnostics",
    title: "Diagnostic Case Lab",
    description:
      "Practice turning symptom location, progression, measurements, root-zone evidence, and pest or pathogen observations into a ranked differential.",
    href: "/learn/atlas/cases",
    action: "Work diagnostic cases",
  },
  {
    eyebrow: "Hands-on learning",
    title: "Practice Labs",
    description:
      "Use interactive exercises to apply plant science concepts instead of only reading about them.",
    href: "/learn/atlas/practice",
    action: "Open practice labs",
  },
  {
    eyebrow: "Retention and mastery",
    title: "Review & Mastery",
    description:
      "Revisit concepts, test understanding, and build toward a connected model of whole-plant function.",
    href: "/learn/atlas/review",
    action: "Start review",
  },
  {
    eyebrow: "Directed study",
    title: "Guided Learning Paths",
    description:
      "Follow structured routes through anatomy, physiology, environment, diagnostics, and related Atlas systems.",
    href: "/learn/atlas/paths",
    action: "Choose a learning path",
  },
];

export default function LearnPage() {
  return (
    <section className="shell page-section">
      <p className="eyebrow">Teaching Healthy Cultivation</p>
      <h1>Learn</h1>
      <p className="lede">
        A connected cultivation education system built around plant function, direct observation, measurement, visual learning, evidence-based diagnostics, transparent sourcing, and repeatable field records.
      </p>

      <div className="card-grid" style={{ marginTop: 34 }}>
        {learningModes.map((mode) => (
          <Link className="feature-card" href={mode.href} key={mode.href}>
            <p className="eyebrow">{mode.eyebrow}</p>
            <h3>{mode.title}</h3>
            <p>{mode.description}</p>
            <span>{mode.action} →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
