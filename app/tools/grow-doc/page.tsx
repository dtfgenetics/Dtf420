import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Grow Doc",
  description:
    "Grow Doc is the DTF Genetics observation-first diagnostic framework for ranking plausible plant-health causes using context, measurements, and visible evidence.",
};

const evidenceSteps = [
  ["1. Locate the symptom", "Newest growth, upper canopy, middle canopy, lower or older leaves, roots, stems, flowers, or the whole plant can point toward different mechanisms."],
  ["2. Describe the pattern", "Record whether the symptom is uniform, interveinal, marginal, spotted, tip-focused, twisted, wilted, bleached, asymmetric, or localized."],
  ["3. Establish progression", "Note whether it appeared suddenly or gradually, whether it is spreading, and what changed before the symptom appeared."],
  ["4. Add measurements", "Use relevant pH, EC, moisture, temperature, RH, VPD, PPFD, irrigation, and root-zone evidence instead of relying on appearance alone."],
  ["5. Rank differentials", "Compare environmental, root-zone, nutritional, pest, pathogen, and physical explanations against the evidence for and against each one."],
  ["6. Verify before correcting", "Choose discriminating checks and reversible observations before making a large intervention that could create a second problem."],
];

export default function GrowDocPage() {
  return (
    <section className="shell page-section">
      <p className="eyebrow">DTF Genetics · Plant diagnostics</p>
      <h1>Grow Doc</h1>
      <p className="lede">
        Grow Doc is built around differential diagnosis. It should never pretend that one photograph, one color change, or one damaged leaf proves a single cause. The goal is to organize observations and measurements into a ranked set of plausible explanations, then identify the checks that separate them.
      </p>

      <div className="hero__actions">
        <Link className="button button--primary" href="/learn/symptoms">Open symptom differentials</Link>
        <Link className="button" href="/learn/atlas/cases">Practice diagnostic cases</Link>
      </div>

      <section className="section" aria-labelledby="grow-doc-method">
        <div className="section-heading">
          <p className="eyebrow">Diagnostic workflow</p>
          <h2 id="grow-doc-method">From symptom to ranked differential</h2>
        </div>
        <div className="card-grid">
          {evidenceSteps.map(([title, description]) => (
            <div className="feature-card" key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="grow-doc-limits">
        <div className="section-heading">
          <p className="eyebrow">Important limitation</p>
          <h2 id="grow-doc-limits">A diagnostic tool supports judgment; it does not replace evidence.</h2>
          <p className="lede">
            Similar-looking symptoms can result from different causes, and multiple stresses can occur at the same time. Grow Doc should make uncertainty visible, identify missing information, and connect users to the underlying plant-science and plant-health references needed to investigate further.
          </p>
        </div>
        <div className="hero__actions">
          <Link className="button" href="/learn/plant-health">Plant Health Library</Link>
          <Link className="button" href="/learn/sources">Evidence &amp; Sources</Link>
          <Link className="button" href="/tools/growlens">GrowLens records</Link>
        </div>
      </section>
    </section>
  );
}
