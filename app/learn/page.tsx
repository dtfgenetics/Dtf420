import Link from "next/link";

export default function LearnPage() {
  return (
    <section className="shell page-section">
      <p className="eyebrow">Teaching Healthy Cultivation</p>
      <h1>Learn</h1>
      <p className="lede">
        Interactive plant science, cultivation references, and diagnostic learning tools built around how the plant actually functions.
      </p>

      <div className="feature-grid">
        <article className="feature-card">
          <p className="eyebrow">Interactive visual learning</p>
          <h2>THC Living Plant Atlas</h2>
          <p>
            Explore seed, roots, stems, nodes, leaves, flowers, trichomes, sex, environment, and diagnostics through one connected whole-plant interface.
          </p>
          <Link className="button-link" href="/learn/atlas">Open the Living Plant Atlas</Link>
        </article>
      </div>
    </section>
  );
}
