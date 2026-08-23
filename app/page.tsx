import Link from "next/link";

const sections = [
  {
    title: "Games",
    description: "Browser games built on the shared DTF game foundation, beginning with Burn Buds.",
    href: "/games",
  },
  {
    title: "Learn",
    description: "Cultivation education, plant science, guides, and the Teaching Healthy Cultivation library.",
    href: "/learn",
  },
  {
    title: "Tools",
    description: "Diagnostics, calculators, grow utilities, and future Seed Man integrations.",
    href: "/tools",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero shell">
        <p className="eyebrow">DTF ecosystem</p>
        <h1>One platform for games, learning, tools, and community.</h1>
        <p className="hero__copy">
          This is the clean replacement architecture for DTF420. The first engineering milestone is proving that the website shell and Phaser game runtime build together reliably before larger features are added.
        </p>
        <div className="hero__actions">
          <Link className="button button--primary" href="/games/burn-buds">Test Burn Buds engine</Link>
          <Link className="button" href="/games">Browse games</Link>
        </div>
      </section>

      <section className="shell section">
        <div className="section-heading">
          <p className="eyebrow">Foundation</p>
          <h2>Built as an application, not a page-builder project.</h2>
        </div>

        <div className="card-grid">
          {sections.map((section) => (
            <Link className="feature-card" href={section.href} key={section.href}>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
              <span aria-hidden="true">Open →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
