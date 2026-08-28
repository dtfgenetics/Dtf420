import type { Metadata } from "next";
import { EducationSearch } from "@/components/education/EducationSearch";
import { buildEducationMetadata } from "@/lib/education-seo";

export const metadata: Metadata = buildEducationMetadata({
  title: "Search Teaching Healthy Cultivation",
  description: "Search Living Plant Atlas lessons, plant-health references, symptom differentials, cultivation science, printable learning tools, and evidence sources from one place.",
  path: "/learn/search",
});

export default function EducationSearchPage() {
  return (
    <main className="shell page-section">
      <EducationSearch />
    </main>
  );
}
