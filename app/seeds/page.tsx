import type { Metadata } from "next";
import Link from "next/link";
import projects from "@/content/genetics-projects.json";

export const metadata: Metadata = {
  title: "Genetics",
  description:
    "Explore DTF Genetics breeding projects, lineages, generation history, selection goals, and documented project records.",
};

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
          <Link className="feature-card" href={`/seeds/${project.slug}`} key={project.slug}>
            <p className="eyebrow">{project.status}</p>
            <h3>{project.name}</h3>
            <p><strong>Lineage:</strong> {project.lineage}</p>
            <p>{project.summary}</p>
            <span>Open breeding record →</span>
          </Link>
        ))}
      </div>

      <section className="section" aria-labelledby="genetics-record-standard">
        <div className="section-heading">
          <p className="eyebrow">Record standard</p>
          <h2 id="genetics-record-standard">Every project needs a complete history.</h2>
          <p className="lede">
            These permanent project URLs are designed to expand with parent profiles, generation-by-generation notes, selection criteria, phenotype observations, flowering and structure notes, photo documentation, related offspring, packaging references, release history, and clear current status without losing the underlying lineage record.
          </p>
        </div>
      </section>
    </section>
  );
}
