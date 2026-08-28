import type { Metadata } from "next";
import { EducationSearch } from "@/components/education/EducationSearch";

export const metadata: Metadata = {
  title: "Search Teaching Healthy Cultivation",
  description: "Search Living Plant Atlas lessons, plant-health references, symptom differentials, cultivation science, and printable learning tools from one place.",
};

export default function EducationSearchPage() {
  return (
    <main className="shell page-section">
      <EducationSearch />
    </main>
  );
}
