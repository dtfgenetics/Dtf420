import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About DTF Genetics",
  description:
    "About DTF Genetics, Dream the Future, and the connected genetics, Teaching Healthy Cultivation, tools, games, and community projects built at dtfseeds.com.",
};

const pillars = [
  {
    title: "Documented genetics",
    description:
      "Breeding projects should preserve parentage, generation history, selection goals, observations, and current status rather than existing only as a product listing.",
    href: "/seeds",
  },
  {
    title: "Teaching Healthy Cultivation",
    description:
      "Education is organized around plant function, direct observation, measurement, transparent sourcing, diagnostics, and repeatable field records.",
    href: "/learn",
  },
  {
    title: "Practical tools",
    description:
      "Grow records and diagnostic tools are designed to connect observations back to the underlying plant science instead of producing isolated answers.",
    href: "/tools",
  },
  {
    title: "Original games",
    description:
      "DTF games are developed as real browser experiences with public status, rules, testing, and migration standards instead of static concepts presented as finished products.",
    href: "/games",
  },
  {
    title: "Community record",
    description:
      "Discord supports active conversation while dtfseeds.com preserves official rules, schedules, results, references, and project history.",
    href: "/community",
  },
  {
    title: "Dream the Future",
    description:
      "The site is being built as one connected ecosystem so genetics, learning, tools, games, and community work reinforce each other instead of becoming unrelated microsites.",
    href: "/journal",
  },
];

export default function AboutPage() {
  return (
    <section className="shell page-section">
      <p className="eyebrow">DTF Genetics · Dream the Future</p>
      <h1>About DTF</h1>
      <p className="lede">
        DTF Genetics is building a connected home for original breeding work, Teaching Healthy Cultivation plant-science education, practical grow tools, original browser games, and the community around them. The goal is not to fill the site with disconnected pages; it is to make each part of the ecosystem strengthen the others.
      </p>

      <div className="card-grid" style={{ marginTop: 34 }}>
        {pillars.map((pillar) => (
          <Link className="feature-card" href={pillar.href} key={pillar.title}>
            <h3>{pillar.title}</h3>
            <p>{pillar.description}</p>
            <span>Explore →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
