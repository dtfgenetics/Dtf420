import type { Metadata } from "next";
import { AtlasObservationCompare } from "@/components/atlas/AtlasObservationCompare";

export const metadata: Metadata = {
  title: "Compare Field Observations",
  description: "Compare two device-local Atlas Observation Notebook entries to see how recorded evidence, measurements, context, differentials, and next checks changed over time.",
};

export default function AtlasObservationComparePage() {
  return (
    <section className="shell page-section">
      <AtlasObservationCompare />
    </section>
  );
}
