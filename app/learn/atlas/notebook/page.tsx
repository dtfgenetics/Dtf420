import type { Metadata } from "next";
import { AtlasObservationNotebook } from "@/components/atlas/AtlasObservationNotebook";

export const metadata: Metadata = {
  title: "Atlas Observation Notebook",
  description: "A device-local observation notebook for recording cannabis plant location, pattern, progression, environment, root-zone context, differentials, and next measurements.",
};

export default function AtlasObservationNotebookPage() {
  return (
    <section className="shell page-section">
      <AtlasObservationNotebook />
    </section>
  );
}
