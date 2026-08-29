import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import projects from "@/content/genetics-projects.json";

function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

function formatRecordDate(date: string | null) {
  if (!date) return "Project record";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
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
          <p>Parentage is preserved as part of the permanent breeding record rather than being tied only to a current product listing.</p>
        </article>

        <article className="feature-card">
          <p className="eyebrow">Project status</p>
          <h3>{project.status}</h3>
          <p>Project history and current availability are kept separate so the genetic record remains useful across releases.</p>
        </article>

        <article className="feature-card">
          <p className="eyebrow">Known cultivation notes</p>
          <h3>{project.floweringWindow ?? "No flowering window published"}</h3>
          <p>{project.aromaticDirection ? `Aromatic direction: ${project.aromaticDirection}.` : "No aroma direction is published here until a project observation is established in the breeding record."}</p>
        </article>
      </div>

      <section className="section" aria-labelledby="parent-records">
        <div className="section-heading">
          <p className="eyebrow">Parent records</p>
          <h2 id="parent-records">How the documented parents enter this project</h2>
        </div>
        <div className="card-grid">
          {project.parentRoles.map((parent) => (
            <article className="feature-card" key={`${project.slug}-${parent.name}`}>
              <p className="eyebrow">{parent.role}</p>
              <h3>{parent.name}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="generation-history">
        <div className="section-heading">
          <p className="eyebrow">Generation history</p>
          <h2 id="generation-history">Recorded breeding progression</h2>
          <p className="lede">Statuses distinguish established project records from later-generation directions so a planned step is not presented as a completed release.</p>
        </div>
        <div className="card-grid">
          {project.generationHistory.map((generation) => (
            <article className="feature-card" key={`${project.slug}-${generation.label}`}>
              <p className="eyebrow">{generation.status}</p>
              <h3>{generation.label}</h3>
              <p>{generation.notes}</p>
            </article>
          ))}
        </div>
      </section>

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

      {project.selectionFocus.length > 0 ? (
        <section className="section" aria-labelledby="selection-focus">
          <div className="section-heading">
            <p className="eyebrow">Selection focus</p>
            <h2 id="selection-focus">Traits being preserved or selected toward</h2>
          </div>
          <div className="card-grid">
            {project.selectionFocus.map((focus) => (
              <article className="feature-card" key={focus}>
                <p>{focus}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {project.milestones.length > 0 ? (
        <section className="section" aria-labelledby="record-milestones">
          <div className="section-heading">
            <p className="eyebrow">Record chronology</p>
            <h2 id="record-milestones">Project milestones</h2>
          </div>
          <div className="card-grid">
            {project.milestones.map((milestone) => (
              <article className="feature-card" key={`${project.slug}-${milestone.label}`}>
                <p className="eyebrow">{formatRecordDate(milestone.date)}</p>
                <h3>{milestone.label}</h3>
                <p>{milestone.detail}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section" aria-labelledby="related-projects">
        <div className="section-heading">
          <p className="eyebrow">Connected genetics</p>
          <h2 id="related-projects">Related DTF projects</h2>
        </div>
        <div className="card-grid">
          {project.relatedProjects.map((related) => (
            <article className="feature-card" key={`${project.slug}-${related.slug}`}>
              <h3><Link href={`/seeds/${related.slug}`}>{related.name}</Link></h3>
              <p>{related.relationship}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="breeding-notes">
        <div className="section-heading">
          <p className="eyebrow">Breeding notes</p>
          <h2 id="breeding-notes">Preserved project notes</h2>
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

      <section className="section" aria-labelledby="record-policy">
        <div className="section-heading">
          <p className="eyebrow">Permanent record policy</p>
          <h2 id="record-policy">Document what is known without filling gaps by assumption.</h2>
          <p className="lede">
            These pages preserve lineage and breeding history independently from inventory. Cultivation traits, generation status, photographs, release history, and phenotype observations are added only when they are established in the project record.
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
