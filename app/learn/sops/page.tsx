import type { Metadata } from "next";
import Link from "next/link";
import sops from "@/content/education-sops.json";
import { buildEducationMetadata } from "@/lib/education-seo";

export const metadata: Metadata = buildEducationMetadata({
  title: "Measurement & Observation SOPs — Teaching Healthy Cultivation",
  description: "Print-ready THC standard operating procedures for pH, EC, PPFD, DLI, temperature/RH, leaf temperature, VPD records, scouting, quarantine, and root-zone observations.",
  path: "/learn/sops",
});

export default function EducationSopsPage() {
  const categories = new Map<string, typeof sops>();
  for (const sop of sops) {
    const items = categories.get(sop.category) ?? [];
    categories.set(sop.category, [...items, sop]);
  }

  return (
    <section className="shell page-section">
      <nav aria-label="Breadcrumb" style={{ marginBottom: 28 }}>
        <Link href="/">Home</Link> / <Link href="/learn">Learn</Link> / <strong>SOPs</strong>
      </nav>

      <p className="eyebrow">Teaching Healthy Cultivation · Repeatable methods</p>
      <h1>Measurement & Observation SOPs</h1>
      <p className="lede">
        Repeatable procedures make measurements comparable. These SOPs preserve instrument checks, sample context, raw observations, verification criteria, and limitations so a number or symptom note can be traced back to how it was produced.
      </p>

      <div className="card-grid" style={{ marginTop: 30 }} aria-label="SOP summary">
        <article className="feature-card"><strong>{sops.length}</strong><p>published procedures</p></article>
        <article className="feature-card"><strong>{categories.size}</strong><p>measurement and biosecurity categories</p></article>
        <article className="feature-card"><strong>Print-ready</strong><p>steps, checks, records, and limitations on every SOP</p></article>
      </div>

      {[...categories.entries()].map(([category, items]) => (
        <section className="section" aria-labelledby={`sop-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={category}>
          <div className="section-heading">
            <p className="eyebrow">{category}</p>
            <h2 id={`sop-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{category}</h2>
          </div>
          <div className="card-grid">
            {items.map((sop) => (
              <Link className="feature-card" href={`/learn/sops/${sop.slug}`} key={sop.slug}>
                <h3>{sop.title}</h3>
                <p>{sop.purpose}</p>
                <span>Open SOP →</span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="section" aria-labelledby="sop-policy">
        <div className="section-heading">
          <p className="eyebrow">Method policy</p>
          <h2 id="sop-policy">Preserve the method with the result.</h2>
          <p className="lede">
            These procedures intentionally avoid universal targets where substrate, instrument, cultivar, environment, or measurement method changes interpretation. A repeatable method and complete record are more useful than a context-free number.
          </p>
        </div>
        <div className="hero__actions">
          <Link className="button button--primary" href="/learn/glossary">Open the glossary</Link>
          <Link className="button" href="/learn/sources">Evidence & Sources</Link>
        </div>
      </section>
    </section>
  );
}
