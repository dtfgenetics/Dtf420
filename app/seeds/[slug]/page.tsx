import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import projects from "@/content/genetics-projects.json";

function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) return { title: "DTF Genetics Project" };

  return {
    title: project.name,
    description: `${project.name}: ${project.lineage}. ${project.summary}`,
  };
}

export default async function GeneticsProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <section className="shell page-section">
      <nav aria-label="Breadcrumb" style={{ marginBottom: 28 }}>
        <Link href="/">Home</Link> / <Link href="/seeds">Genetics</Link> / <strong>{project.name}</strong>
      </nav>

      <p className="eyebrow">DTF Genetics · Breeding record</p>
      <h1>{project.name}</h1>
      <p className="lede">{project.summary}</p>

      <div className="card-grid" style={{ marginTop: 34 }}>
        <article className="feature-card">
          <p className="eyebrow">Lineage</p>
          <h3>{project.lineage}</h3>
          <p>Parentage is preserved here as part of the permanent breeding record rather than being tied only to a current product listing.</p>
        </article>

        <article className="feature-card">
          <p className="eyebrow">Project status</p>
          <h3>{project.status}</h3>
          <p>This page documents the breeding project. Availability should be handled separately from lineage history so the record remains useful even when a release is not currently offered.</p>
        </article>

        <article className="feature-card">
          <p className="eyebrow">Known cultivation notes</p>
          <h3>{project.floweringWindow ?? "Still being documented"}</h3>
          <p>{project.aromaticDirection ? `Aromatic direction: ${project.aromaticDirection}.` : "Additional verified flowering, aroma, structure, and phenotype observations will be added as project records are consolidated."}</p>
        </article>
      </div>

      {project.traits.length > 0 ? (
        <section className="section" aria-labelledby="project-traits">
          <div className="section-heading">
            <p className="eyebrow">Documented traits</p>
            <h2 id="project-traits">Observed project direction</h2>
          </div>
          <div className="card-grid">
            {project.traits.map((trait) => (
              <article className="feature-card" key={trait}>
                <h3>{trait}</h3>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section" aria-labelledby="breeding-notes">
        <div className="section-heading">
          <p className="eyebrow">Breeding notes</p>
          <h2 id="breeding-notes">What is currently preserved in the project record</h2>
        </div>
        <div className="card-grid">
          {project.breedingNotes.map((note, index) => (
            <article className="feature-card" key={`${project.slug}-${index}`}>
              <h3>Record {index + 1}</h3>
              <p>{note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="record-expansion">
        <div className="section-heading">
          <p className="eyebrow">Next documentation layer</p>
          <h2 id="record-expansion">Build toward a complete breeding history.</h2>
          <p className="lede">
            Each project record is designed to expand with generation-by-generation notes, parent profiles, selection criteria, phenotype observations, plant and flower photography, release history, related offspring, packaging references, and linked grow documentation without changing the permanent URL.
          </p>
        </div>
        <div className="hero__actions">
          <Link className="button button--primary" href="/seeds">Back to Genetics</Link>
          <Link className="button" href="/journal">Breeding updates</Link>
        </div>
      </section>
    </section>
  );
}
