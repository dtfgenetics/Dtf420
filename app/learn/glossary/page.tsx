import type { Metadata } from "next";
import Link from "next/link";
import glossary from "@/content/education-glossary.json";
import { buildEducationMetadata } from "@/lib/education-seo";
import { GlossaryExplorer } from "./GlossaryExplorer";

export const metadata: Metadata = buildEducationMetadata({
  title: "Plant Science Glossary — Teaching Healthy Cultivation",
  description: "Searchable THC glossary for plant anatomy, physiology, root-zone science, diagnostics, lighting, water relations, genetics, plant health, and postharvest terminology.",
  path: "/learn/glossary",
});

export default function EducationGlossaryPage() {
  const categoryCount = new Set(glossary.map((entry) => entry.category)).size;
  const aliasCount = glossary.reduce((sum, entry) => sum + entry.aliases.length, 0);

  return (
    <section className="shell page-section">
      <nav aria-label="Breadcrumb" style={{ marginBottom: 28 }}>
        <Link href="/">Home</Link> / <Link href="/learn">Learn</Link> / <strong>Glossary</strong>
      </nav>

      <p className="eyebrow">Teaching Healthy Cultivation · Reference</p>
      <h1>Plant Science Glossary</h1>
      <p className="lede">
        Use the same vocabulary across lessons, diagnostic cases, plant-health references, and field observations. Definitions describe the term itself; visible symptoms such as chlorosis or necrosis are not treated as diagnoses.
      </p>

      <div className="card-grid" style={{ marginTop: 28 }} aria-label="Glossary summary">
        <article className="feature-card"><strong>{glossary.length}</strong><p>indexed terms</p></article>
        <article className="feature-card"><strong>{categoryCount}</strong><p>subject categories</p></article>
        <article className="feature-card"><strong>{aliasCount}</strong><p>aliases and abbreviations</p></article>
      </div>

      <GlossaryExplorer />

      <section className="section" aria-labelledby="glossary-scope">
        <div className="section-heading">
          <p className="eyebrow">Reference policy</p>
          <h2 id="glossary-scope">Definitions support reasoning; they do not replace diagnosis.</h2>
          <p className="lede">
            Terms are written to preserve distinctions that matter in plant science—for example, EC is not a direct nutrient assay, pollen contact is not fertilization, relative humidity is temperature-dependent, and a symptom name does not identify a cause.
          </p>
        </div>
        <div className="hero__actions">
          <Link className="button button--primary" href="/learn/search">Search all education</Link>
          <Link className="button" href="/learn/atlas">Explore the Living Plant Atlas</Link>
        </div>
      </section>
    </section>
  );
}
