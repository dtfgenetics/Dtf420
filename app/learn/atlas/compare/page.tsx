import type { Metadata } from "next";
import { AtlasCompareLab } from "@/components/atlas/AtlasCompareLab";

export const metadata: Metadata = {
  title: "Compare Plant Systems — THC Living Plant Atlas",
  description: "Side-by-side cannabis plant science comparisons for roots, vascular transport, reproductive structures, symptom location, airflow, and trichome observation.",
};

export default function AtlasComparePage() {
  return (
    <section className="shell page-section">
      <AtlasCompareLab />
    </section>
  );
}
