import type { Metadata } from "next";
import Link from "next/link";
import { terpeneSeedCompounds } from "@/lib/terpenes/data";
import { buildTerpeneCompoundChapter } from "@/lib/terpenes/chapters";
import { getGenesForCompound } from "@/lib/terpenes/genetics";
import { getReviewedEvidenceCountForCompound, getReviewedEvidenceClaimCountsForCompound, getReviewedGeneralEvidence } from "@/lib/terpenes/evidence-queries";
import { buildEducationMetadata } from "@/lib/education-seo";
import { getReviewedPubChemPropertyRecord, summarizeStereochemistry } from "@/lib/terpenes/properties";
import { countExperimentalPropertyEvidence, getReviewedExperimentalPropertyRecord } from "@/lib/terpenes/experimental-properties";
import { countSensoryEvidence, getReviewedSensoryEvidenceRecord } from "@/lib/terpenes/sensory-evidence";
import { countNaturalOccurrenceEvidence, getReviewedNaturalOccurrenceRecord } from "@/lib/terpenes/natural-occurrence";
import { getTerpeneStereoRegistryEntry } from "@/lib/terpenes/stereoisomers";
import { getReviewedCultivarDistribution } from "@/lib/terpenes/cultivar-distributions";
import styles from "./page.module.css";

export const metadata: Metadata = buildEducationMetadata({
  title: "Terpene Chapter Readiness",
  description:
    "Review completion status, evidence coverage, genetics coverage, and expansion needs across the curated THC terpene compound chapters.",
  path: "/learn/terpenes/chapters",
});

export default function TerpeneChapterIndexPage() {
  const generalPostharvestEvidenceCount = getReviewedGeneralEvidence(["postharvest-change"]).length;
  const chapters = terpeneSeedCompounds.map((compound, index) => {
    const mappedGeneCount = getGenesForCompound(compound.slug).length;
    const propertyRecord = getReviewedPubChemPropertyRecord(compound.slug);
    const experimentalPropertyRecord = getReviewedExperimentalPropertyRecord(compound.slug);
    const experimentalPropertyEvidenceCount = countExperimentalPropertyEvidence(experimentalPropertyRecord);
    const sensoryEvidenceRecord = getReviewedSensoryEvidenceRecord(compound.slug);
    const sensoryEvidenceCount = countSensoryEvidence(sensoryEvidenceRecord);
    const naturalOccurrenceRecord = getReviewedNaturalOccurrenceRecord(compound.slug);
    const naturalOccurrenceEvidenceCount = countNaturalOccurrenceEvidence(naturalOccurrenceRecord);
    const cultivarDistribution = getReviewedCultivarDistribution(compound.slug);
    const stereo = propertyRecord ? summarizeStereochemistry(propertyRecord.properties) : null;
    const stereoRegistryEntry = getTerpeneStereoRegistryEntry(compound.slug);
    const reviewedEvidenceCount = getReviewedEvidenceCountForCompound(compound.slug);
    const claimCounts = getReviewedEvidenceClaimCountsForCompound(compound.slug);
    const relatedCompounds = terpeneSeedCompounds
      .filter((item) => item.slug !== compound.slug)
      .filter((item) => item.terpeneClass === compound.terpeneClass)
      .slice(0, 4);

    return buildTerpeneCompoundChapter({
      compound,
      chapterNumber: index + 1,
      mappedGeneCount,
      reviewedEvidenceCount,
      biologicalEvidenceCount: claimCounts["biological-effect"] ?? 0,
      safetyEvidenceCount: claimCounts["safety-exposure"] ?? 0,
      stabilityEvidenceCount: claimCounts["chemical-stability"] ?? 0,
      generalPostharvestEvidenceCount,
      cultivationEvidenceCount: claimCounts["cultivation-factor"] ?? 0,
      postharvestEvidenceCount: claimCounts["postharvest-change"] ?? 0,
      hasAssessment: true,
      hasPhysicalPropertyRecord: Boolean(propertyRecord),
      experimentalPropertyEvidenceCount,
      sensoryEvidenceCount,
      naturalOccurrenceEvidenceCount,
      cultivarDistributionEvidenceCount: cultivarDistribution ? 1 : 0,
      stereoEvidenceCount: stereoRegistryEntry?.isomers.length ?? (stereo ? stereo.definedAtomStereoCount + stereo.definedBondStereoCount : 0),
      relatedCompounds,
    });
  });

  const averageScore = chapters.length
    ? Math.round(chapters.reduce((sum, chapter) => sum + chapter.completeness.score, 0) / chapters.length)
    : 0;
  const expansionCount = chapters.reduce(
    (sum, chapter) => sum + chapter.completeness.needsExpansionSections,
    0,
  );

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div>
          <Link href="/learn/terpenes">← THC Terpene Atlas</Link>
          <p className="eyebrow">Editorial readiness · reviewed compound chapters</p>
          <h1>Terpene Chapter Readiness</h1>
          <p>
            This dashboard measures how far each reviewed compound chapter has progressed toward a full
            chemistry, plant biology, Cannabis, evidence, safety, and assessment reference.
          </p>
        </div>
        <div className={styles.heroStats}>
          <article><span>Reviewed chapters</span><strong>{chapters.length}</strong></article>
          <article><span>Average readiness</span><strong>{averageScore}%</strong></article>
          <article><span>Sections needing expansion</span><strong>{expansionCount}</strong></article>
        </div>
      </header>

      <section className={styles.legend}>
        <span data-status="complete">Complete</span>
        <span data-status="reviewed-foundation">Reviewed foundation</span>
        <span data-status="linked-evidence">Linked evidence</span>
        <span data-status="needs-expansion">Needs expansion</span>
      </section>

      <section className={styles.grid}>
        {chapters.map((chapter) => {
          const compound = terpeneSeedCompounds.find((item) => item.slug === chapter.compoundSlug);
          if (!compound) return null;

          return (
            <article key={chapter.compoundSlug}>
              <div className={styles.cardTop}>
                <div>
                  <span>Chapter {String(chapter.chapterNumber).padStart(2, "0")}</span>
                  <h2>{compound.name}</h2>
                  <p>{compound.formula} · {compound.terpeneClass.replaceAll("-", " ")}</p>
                </div>
                <strong>{chapter.completeness.score}%</strong>
              </div>

              <div className={styles.statusBar}>
                <i style={{ width: String(chapter.completeness.score) + "%" }} />
              </div>

              <div className={styles.sectionList}>
                {chapter.sections.map((section) => (
                  <div key={section.id}>
                    <span>{section.label}</span>
                    <b data-status={section.status}>{section.status.replaceAll("-", " ")}</b>
                  </div>
                ))}
              </div>

              <footer>
                <span>{chapter.completeness.needsExpansionSections} sections still need expansion</span>
                <Link href={"/learn/terpenes/" + chapter.compoundSlug}>Open chapter →</Link>
              </footer>
            </article>
          );
        })}
      </section>
    </main>
  );
}
