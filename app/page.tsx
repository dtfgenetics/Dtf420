import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DTF Genetics — Dream the Future",
  description:
    "Explore DTF Genetics breeding projects, Teaching Healthy Cultivation education, grow tools, browser games, and community resources.",
};

const sections = [
  {
    eyebrow: "Original breeding work",
    title: "Genetics",
    description:
      "Explore DTF breeding projects, documented lineages, generation history, phenotype observations, and current or archived releases.",
    href: "/seeds",
    action: "Explore genetics",
  },
  {
    eyebrow: "Teaching Healthy Cultivation",
    title: "Learn",
    description:
      "Use structured courses, the Living Plant Atlas, plant-health references, symptom differentials, field tools, and evidence sources as one connected learning system.",
    href: "/learn",
    action: "Start learning",
  },
  {
    eyebrow: "Grow records and diagnostics",
    title: "Tools",
    description:
      "Work with GrowLens, Grow Doc, calculators, measurement references, and printable field records built to support repeatable observations instead of guesswork.",
    href: "/tools",
    action: "Open tools",
  },
  {
    eyebrow: "Playable projects",
    title: "Games",
    description:
      "Play DTF browser games, test new releases, learn the rules, and follow development updates from one consistent game hub.",
    href: "/games",
    action: "Browse games",
  },
  {
    eyebrow: "Grow-offs and participation",
    title: "Community",
    description:
      "Find grow-off information, community resources, testing programs, event records, and ways to participate beyond a disappearing chat thread.",
    href: "/community",
    action: "Open community",
  },
  {
    eyebrow: "Permanent updates",
    title: "DTF Journal",
    description:
      "Follow breeding notes, education releases, tool updates, game development, research summaries, and community results without generic filler content.",
    href: "/journal",
    action: "Read the journal",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero shell">
        <p className="eyebrow">DTF Genetics · Dream the Future</p>
        <h1>Genetics, plant science, tools, games, and community in one place.</h1>
        <p className="hero__copy">
          DTF Genetics is more than a seed catalog. The site documents our breeding work, builds evidence-based cultivation education through Teaching Healthy Cultivation, develops practical grow tools, and creates original browser games for the community.
        </p>
        <div className="hero__actions">
          <Link className="button button--primary" href="/learn">Explore THC education</Link>
          <Link className="button" href="/seeds">Explore genetics</Link>
        </div>
      </section>

      <section className="shell section" aria-labelledby="explore-dtf">
        <div className="section-heading">
          <p className="eyebrow">Explore DTF</p>
          <h2 id="explore-dtf">Every section should lead somewhere useful.</h2>
          <p className="lede">
            The rebuilt site separates permanent reference material from temporary updates while connecting related genetics, lessons, tools, games, and community work.
          </p>
        </div>

        <div className="card-grid">
          {sections.map((section) => (
            <Link className="feature-card" href={section.href} key={section.href}>
              <p className="eyebrow">{section.eyebrow}</p>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
              <span aria-hidden="true">{section.action} →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
