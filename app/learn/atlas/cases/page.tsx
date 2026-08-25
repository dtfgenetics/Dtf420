import type { Metadata } from "next";
import { AtlasDiagnosticCaseLab } from "@/components/atlas/AtlasDiagnosticCaseLab";

export const metadata: Metadata = {
  title: "Atlas Diagnostic Case Lab",
  description: "Practice observation-first plant reasoning using location, pattern, progression, measurements, and differential diagnosis.",
};

export default function AtlasDiagnosticCasesPage() {
  return (
    <section className="shell page-section">
      <AtlasDiagnosticCaseLab />
    </section>
  );
}
