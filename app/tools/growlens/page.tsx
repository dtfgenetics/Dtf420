import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GrowLens",
  description:
    "GrowLens is the DTF Genetics grow-record framework for plants, spaces, measurements, irrigation, feeding, observations, photos, and harvest records.",
};

const workflows = [
  ["Plants and spaces", "Keep plant identity, room or grow-space context, stage, and dated observations together."],
  ["Environment", "Record temperature, relative humidity, VPD context, light measurements, and meaningful changes over time."],
  ["Water and feeding", "Log irrigation volume, source-water context, pH, EC, inputs, runoff observations, and corrective actions when measured."],
  ["Canopy observations", "Document training, structure, stretch, stress patterns, and canopy changes with dated notes and photos."],
  ["Plant-health records", "Capture symptom location, progression, pest or pathogen observations, measurements, and actions before reaching a diagnosis."],
  ["Harvest records", "Preserve harvest timing, plant observations, drying context, post-harvest notes, and outcome comparisons."],
];

export default function GrowLensPage() {
  return (
    <section className="shell page-section">
      <p className="eyebrow">DTF Genetics · Grow records</p>
      <h1>GrowLens</h1>
      <p className="lede">
        GrowLens is the recordkeeping side of the DTF tool system. Its job is to turn scattered grow notes into a structured history that can be compared against plant-science references and diagnostic evidence.
      </p>

      <div className="hero__actions">
        <Link className="button button--primary" href="/learn/tools">Open printable records</Link>
        <Link className="button" href="/tools/grow-doc">Open Grow Doc guide</Link>
      </div>

      <section className="section" aria-labelledby="growlens-workflows">
        <div className="section-heading">
          <p className="eyebrow">Core workflow</p>
          <h2 id="growlens-workflows">What the record system should capture</h2>
        </div>
        <div className="card-grid">
          {workflows.map(([title, description]) => (
            <div className="feature-card" key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="growlens-method">
        <div className="section-heading">
          <p className="eyebrow">Method</p>
          <h2 id="growlens-method">Records are evidence, not decoration.</h2>
          <p className="lede">
            Useful grow records are dated, measured when possible, tied to a specific plant or space, and clear about what changed. A photo without context is weak evidence; a photo connected to stage, environment, irrigation, root-zone measurements, recent actions, and symptom progression is much more useful.
          </p>
        </div>
      </section>
    </section>
  );
}
