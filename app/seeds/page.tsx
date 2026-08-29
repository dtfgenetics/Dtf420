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
        Permanent breeding records for DTF genetics projects. Open a project to review its parentage, generation history, documented selection direction, related DTF families, and dated milestones where those records are established.
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
          <h2 id="genetics-record-standard">Lineage history stays separate from inventory.</h2>
          <p className="lede">
            A genetics page remains a permanent reference even when a seed release is not currently available. Planned generation directions are labeled separately from established project records, and observations are published only when they are documented rather than inferred from a parent name or cross.
          </p>
        </div>
      </section>
    </section>
  );
}
