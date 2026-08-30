import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DTF Genetics — Dream the Future",
  description:
    "Explore DTF Genetics breeding projects, Teaching Healthy Cultivation education, grow tools, browser games, and community resources.",
};

const discovery = [
  {
    index: "01",
    title: "Genetics",
    description: "Permanent breeding records, lineage, generations, and project history.",
    href: "/seeds",
  },
  {
    index: "02",
    title: "Learn",
    description: "Academy courses, Living Plant Atlas, diagnostics, and evidence sources.",
    href: "/learn",
  },
  {
    index: "03",
    title: "Tools",
    description: "Grow records, observation-first diagnostics, and practical field workflows.",
    href: "/tools",
  },
  {
    index: "04",
    title: "Search THC",
    description: "Find the right lesson, symptom reference, source, or plant-science topic.",
    href: "/learn/search",
  },
];

const practical = [
  {
    eyebrow: "Plant health",
    title: "Diagnose with evidence",
    description:
      "Move from visible symptoms toward ranked possibilities using plant location, progression, environment, root-zone context, and supporting observations.",
    href: "/learn/plant-health",
    action: "Open plant health",
  },
  {
    eyebrow: "Field systems",
    title: "Use better grow tools",
    description:
      "Connect GrowLens, Grow Doc, measurements, field records, and repeatable observations instead of relying on memory or one-photo certainty.",
    href: "/tools",
    action: "Open tools",
  },
  {
    eyebrow: "Interactive practice",
    title: "Work the problem",
    description:
      "Use diagnostic cases and Atlas practice to test plant-science reasoning instead of only reading about it.",
    href: "/learn/atlas/practice",
    action: "Open practice",
  },
];

const secondary = [
  {
    title: "Games",
    description: "Original browser games and playable DTF projects.",
    href: "/games",
    action: "Play",
  },
  {
    title: "Community",
    description: "Grow-offs, participation records, community resources, and event information.",
    href: "/community",
    action: "Explore",
  },
  {
    title: "Journal",
    description: "Permanent updates covering breeding, education, tools, games, research, and community work.",
    href: "/journal",
    action: "Read",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="home-hero shell">
        <div className="home-hero__copy">
          <p className="eyebrow">DTF Genetics · Dream the Future</p>
          <h1>Better science. Better genetics. Better gardens.</h1>
          <p>
            DTF brings original breeding work, Teaching Healthy Cultivation plant science, practical grow tools, browser games, and community resources into one connected system built to help growers understand the plant more clearly.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" href="/learn">Explore THC education</Link>
            <Link className="button" href="/seeds">Discover genetics</Link>
          </div>
        </div>

        <nav className="home-discovery" aria-label="Explore DTF">
          {discovery.map((item) => (
            <Link className="home-discovery__item" href={item.href} key={item.href}>
              <span className="home-discovery__index">{item.index}</span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
            </Link>
          ))}
        </nav>
      </section>

      <section className="home-band home-band--paper" aria-labelledby="dtf-core">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">The core of DTF</p>
            <h2 id="dtf-core">Document the genetics. Understand the plant.</h2>
            <p className="lede">
              Genetics and plant science are treated as permanent reference systems, not disposable product copy or disconnected blog posts.
            </p>
          </div>

          <div className="home-feature-pair">
            <Link className="home-feature" href="/seeds">
              <p className="home-feature__label">DTF Genetics</p>
              <h3>Follow a breeding project beyond the seed pack.</h3>
              <p>
                Review documented parentage, generation history, selection direction, project milestones, and connected DTF families in permanent breeding records.
              </p>
              <span>Explore genetics →</span>
            </Link>

            <Link className="home-feature home-feature--science" href="/learn/atlas">
              <p className="home-feature__label">Living Plant Atlas</p>
              <h3>Learn the plant as a connected living system.</h3>
              <p>
                Move through anatomy, physiology, environment, reproduction, diagnostics, and whole-plant relationships with connected visual lessons and practice.
              </p>
              <span>Open the Atlas →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="shell section" aria-labelledby="practical-dtf">
        <div className="section-heading">
          <p className="eyebrow">From knowledge to action</p>
          <h2 id="practical-dtf">Observe first. Measure what matters. Make better decisions.</h2>
        </div>

        <div className="home-action-grid">
          {practical.map((item) => (
            <Link className="home-action" href={item.href} key={item.href}>
              <p className="eyebrow">{item.eyebrow}</p>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span>{item.action} →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell section" aria-labelledby="more-dtf">
        <div className="section-heading">
          <p className="eyebrow">More from DTF</p>
          <h2 id="more-dtf">Play, participate, and follow the work.</h2>
        </div>

        <div className="home-secondary-list">
          {secondary.map((item) => (
            <Link className="home-secondary-link" href={item.href} key={item.href}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              <span>{item.action} →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
