import type { Metadata } from "next";
import Link from "next/link";
import evidenceLedger from "@/data/terpenes/evidence-ledger.json";
import sourceRegistry from "@/data/terpenes/source-registry.json";
import { TerpeneResearchLedger } from "@/components/terpenes/TerpeneResearchLedger";
import type { ResearchEvidenceRecord, ResearchSource } from "@/lib/terpenes/research";
import { buildEducationMetadata } from "@/lib/education-seo";
import styles from "./page.module.css";

export const metadata: Metadata = buildEducationMetadata({
  title: "Terpene Research & Evidence Ledger",
  description:
    "Search the THC Terpene Atlas evidence ledger by compound, claim type, study type, source, method, review status, and genetics context.",
  path: "/learn/terpenes/research",
});

export default function TerpeneResearchPage() {
  const records = evidenceLedger.records as ResearchEvidenceRecord[];
  const usedSourceIds = new Set(records.map((record) => record.sourceId));
  const sources = sourceRegistry.sources.filter((source) => usedSourceIds.has(source.id)) as ResearchSource[];
  const compoundCount = new Set(records.map((record) => record.compoundSlug)).size;
  const studyTypeCount = new Set(records.map((record) => record.studyType)).size;
  const verifiedCount = records.filter((record) => ["source-verified", "editorial-reviewed"].includes(record.reviewStatus)).length;

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div>
          <Link className={styles.back} href="/learn/terpenes">← THC Terpene Atlas</Link>
          <p className="eyebrow">Research transparency · evidence ledger</p>
          <h1>Terpene Research Ledger</h1>
          <p>
            Inspect what each source actually supports. Every record keeps the claim type, study type,
            material or population, analytical method, exact source location, and review state visible
            so chemical occurrence, enzyme function, genetics, sensory observations, and biological effects
            do not get blended into one unsupported conclusion.
          </p>
        </div>
      </header>

      <section className={styles.stats} aria-label="Research ledger summary">
        <div><strong>{records.length}</strong><span>evidence records</span></div>
        <div><strong>{compoundCount}</strong><span>compounds represented</span></div>
        <div><strong>{studyTypeCount}</strong><span>study types represented</span></div>
        <div><strong>{verifiedCount}</strong><span>source/editorial reviewed</span></div>
      </section>

      <section className={styles.interpretation}>
        <div>
          <p className="eyebrow">Read evidence by what it tested</p>
          <h2>Different study types answer different questions.</h2>
        </div>
        <div className={styles.interpretationGrid}>
          <article><strong>Chemical analysis</strong><p>Can establish what was detected or measured in the analyzed material. It does not establish a human effect.</p></article>
          <article><strong>Functional enzyme assay</strong><p>Can establish biochemical product capability of a tested enzyme. It does not establish a fixed terpene percentage in flower.</p></article>
          <article><strong>Genomics / expression</strong><p>Can support gene presence, sequence relationships, or expression associations. Association is not automatically functional proof.</p></article>
          <article><strong>Controlled human experiments</strong><p>Can measure short-term responses under a defined exposure protocol. They do not automatically establish therapeutic efficacy or long-term benefit.</p></article>
          <article><strong>Biological studies</strong><p>Interpret animal, in-vitro, observational, mechanistic, and clinical findings at the population, dose, preparation, route, and endpoint actually tested.</p></article>
        </div>
      </section>

      <TerpeneResearchLedger records={records} sources={sources} />
    </main>
  );
}
