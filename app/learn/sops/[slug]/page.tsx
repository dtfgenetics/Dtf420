import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import sops from "@/content/education-sops.json";
import { LearningResourceJsonLd } from "@/components/education/LearningResourceJsonLd";
import { buildEducationMetadata, buildLearningResourceJsonLd } from "@/lib/education-seo";
import { PrintButton } from "../PrintButton";

function getSop(slug: string) {
  return sops.find((sop) => sop.slug === slug);
}

function routeLabel(route: string) {
  return route
    .split("/")
    .filter(Boolean)
    .slice(-1)[0]
    ?.replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? "Related learning";
}

export function generateStaticParams() {
  return sops.map((sop) => ({ slug: sop.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const sop = getSop(slug);
  if (!sop) return { title: "Teaching Healthy Cultivation SOP" };

  return buildEducationMetadata({
    title: `${sop.title} — THC SOP`,
    description: sop.purpose,
    path: `/learn/sops/${slug}`,
  });
}

export default async function SopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sop = getSop(slug);
  if (!sop) notFound();
  const path = `/learn/sops/${slug}`;
  const structuredData = buildLearningResourceJsonLd({
    name: sop.title,
    description: sop.purpose,
    path,
    learningResourceType: "Standard operating procedure",
    about: sop.category,
  });

  return (
    <section className="shell page-section">
      <LearningResourceJsonLd data={structuredData} />
      <nav aria-label="Breadcrumb" style={{ marginBottom: 28 }}>
        <Link href="/learn">Learn</Link> / <Link href="/learn/sops">SOPs</Link> / <strong>{sop.title}</strong>
      </nav>

      <header style={{ display: "flex", gap: 24, justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ maxWidth: 820 }}>
          <p className="eyebrow">{sop.category} · THC SOP</p>
          <h1>{sop.title}</h1>
          <p className="lede">{sop.purpose}</p>
        </div>
        <PrintButton />
      </header>

      <div className="card-grid" style={{ marginTop: 30 }}>
        <article className="feature-card">
          <p className="eyebrow">Scope</p>
          <h2>Where this method applies</h2>
          <p>{sop.scope}</p>
        </article>
        <article className="feature-card">
          <p className="eyebrow">Frequency</p>
          <h2>When to run it</h2>
          <p>{sop.frequency}</p>
        </article>
      </div>

      <section className="section" aria-labelledby="sop-tools">
        <div className="section-heading"><p className="eyebrow">Preparation</p><h2 id="sop-tools">Tools and preconditions</h2></div>
        <div className="card-grid">
          <article className="feature-card">
            <h3>Required tools</h3>
            <ul>{sop.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
          </article>
          <article className="feature-card">
            <h3>Before starting</h3>
            <ul>{sop.preconditions.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="sop-procedure">
        <div className="section-heading"><p className="eyebrow">Procedure</p><h2 id="sop-procedure">Run the method in order</h2></div>
        <div className="card-grid">
          {sop.steps.map((step, index) => (
            <article className="feature-card" key={step.title}>
              <p className="eyebrow">Step {index + 1}</p>
              <h3>{step.title}</h3>
              <p>{step.action}</p>
              <p><strong>Record:</strong> {step.record}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="sop-verification">
        <div className="section-heading"><p className="eyebrow">Quality control</p><h2 id="sop-verification">Verification checks</h2></div>
        <div className="card-grid">
          {sop.verification.map((check) => <article className="feature-card" key={check}><p>{check}</p></article>)}
        </div>
      </section>

      <section className="section" aria-labelledby="sop-records">
        <div className="section-heading"><p className="eyebrow">Evidence record</p><h2 id="sop-records">Fields to preserve</h2></div>
        <article className="feature-card">
          <ul>{sop.records.map((record) => <li key={record}>{record}</li>)}</ul>
        </article>
      </section>

      <section className="section" aria-labelledby="sop-limitations">
        <div className="section-heading"><p className="eyebrow">Interpretation boundary</p><h2 id="sop-limitations">Limitations</h2></div>
        <div className="card-grid">
          {sop.limitations.map((item) => <article className="feature-card" key={item}><p>{item}</p></article>)}
        </div>
      </section>

      <section className="section" aria-labelledby="sop-related">
        <div className="section-heading"><p className="eyebrow">Connected learning</p><h2 id="sop-related">Related references and worksheets</h2></div>
        <div className="hero__actions">
          {sop.relatedRoutes.map((route) => <Link className="button" href={route} key={route}>{routeLabel(route)}</Link>)}
        </div>
      </section>
    </section>
  );
}
