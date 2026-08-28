import Link from "next/link";

const learningModes = [
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
      "Use observation-first references for pests, diseases, systemic pathogens, scouting, sanitation, and differential diagnosis without relying on one-symptom shortcuts.",
    href: "/learn/plant-health",
    action: "Open the Plant Health Library",
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
        A connected cultivation education system built around plant function, direct observation, measurement, visual learning, and evidence-based diagnostics.
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
