import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Genetics",
  description:
    "Explore DTF Genetics breeding projects, lineages, generation history, selection goals, and documented project records.",
};

const projects = [
  {
    name: "Blue Mango",
    lineage: "Somango XXL × Blueberry Butcher",
    summary: "Flagship DTF breeding line selected around vigorous growth, branching, resin production, and a blueberry-to-ripe-mango aromatic direction.",
  },
  {
    name: "Mango Bubbles",
    lineage: "Blue Mango × Blue Bubblegum",
    summary: "A DTF project combining the Blue Mango line with Blue Bubblegum to preserve documented parentage and build a distinct next-generation family.",
  },
  {
    name: "Blue Bubblegum",
    lineage: "Bubblegum Kush × Blueberry Butcher",
    summary: "A documented DTF cross connecting Bubblegum Kush with the Blueberry Butcher breeding parent.",
  },
  {
    name: "Blueberry Butcher",
    lineage: "Blueberry Muffin × Jack Herer",
    summary: "A foundational DTF parent used across multiple breeding projects and preserved as a permanent lineage record.",
  },
];

export default function GeneticsPage() {
  return (
    <section className="shell page-section">
      <p className="eyebrow">DTF Genetics · Breeding library</p>
      <h1>Genetics</h1>
      <p className="lede">
        This library is for permanent breeding records, not only products that happen to be available today. Each DTF project should preserve parentage, generation history, selection goals, phenotype observations, photographs, related projects, and release status in one traceable record.
      </p>

      <div className="card-grid" style={{ marginTop: 34 }}>
        {projects.map((project) => (
          <article className="feature-card" key={project.name}>
            <p className="eyebrow">Documented breeding line</p>
            <h3>{project.name}</h3>
            <p><strong>Lineage:</strong> {project.lineage}</p>
            <p>{project.summary}</p>
          </article>
        ))}
      </div>

      <section className="section" aria-labelledby="genetics-record-standard">
        <div className="section-heading">
          <p className="eyebrow">Record standard</p>
          <h2 id="genetics-record-standard">Every project needs a complete history.</h2>
          <p className="lede">
            The next expansion will turn each project into its own record with parent profiles, generation-by-generation notes, selection criteria, phenotype observations, flowering and structure notes, photo documentation, related offspring, packaging references, release history, and clear current status.
          </p>
        </div>
      </section>
    </section>
  );
}
