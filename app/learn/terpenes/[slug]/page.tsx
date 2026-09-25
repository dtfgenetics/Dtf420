import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { terpeneSeedCompounds } from "@/lib/terpenes/data";
import { getFamilyLabel, getTerpeneBySlug } from "@/lib/terpenes/queries";
import { getGenesForCompound, getGeneProductContext } from "@/lib/terpenes/genetics";
import { getReviewedAggregateIdentityEvidenceForCompound, getReviewedEvidenceForCompound, getReviewedEvidenceClaimCountsForCompound, getReviewedGeneralEvidence } from "@/lib/terpenes/evidence-queries";
import { evidenceScope, humanizeEvidenceTerm } from "@/lib/terpenes/research";
import { buildTerpeneCompoundChapter } from "@/lib/terpenes/chapters";
import { buildTerpeneQuiz } from "@/lib/terpenes/assessments";
import { TerpeneChapterQuiz } from "@/components/terpenes/TerpeneChapterQuiz";
import { getReviewedPubChemPropertyRecord, summarizeStereochemistry } from "@/lib/terpenes/properties";
import { countExperimentalPropertyEvidence, getReviewedExperimentalPropertyRecord } from "@/lib/terpenes/experimental-properties";
import { countSensoryEvidence, getReviewedSensoryEvidenceRecord } from "@/lib/terpenes/sensory-evidence";
import { countNaturalOccurrenceEvidence, getReviewedNaturalOccurrenceRecord } from "@/lib/terpenes/natural-occurrence";
import { getTerpeneStereoRegistryEntry } from "@/lib/terpenes/stereoisomers";
import { getReviewedCultivarDistribution } from "@/lib/terpenes/cultivar-distributions";
import { buildEducationMetadata } from "@/lib/education-seo";
import styles from "./page.module.css";

export function generateStaticParams() {
  return terpeneSeedCompounds.map((compound) => ({ slug: compound.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const compound = getTerpeneBySlug(slug);
  if (!compound) return {};

  return buildEducationMetadata({
    title: `${compound.name} Terpene Chapter`,
    description: `Explore ${compound.name}: classification, chemistry, aroma language, biosynthetic context, cannabis occurrence, genetics, cultivar interpretation, and evidence guardrails.`,
    path: `/learn/terpenes/${compound.slug}`,
  });
}

export default async function TerpeneRecordPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const compound = getTerpeneBySlug(slug);
  if (!compound) notFound();

  const family = getFamilyLabel(compound.terpeneClass);
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
  const mappedGenes = getGenesForCompound(compound.slug);
  const reviewedEvidence = getReviewedEvidenceForCompound(compound.slug);
  const evidenceClaimCounts = getReviewedEvidenceClaimCountsForCompound(compound.slug);
  const generalPostharvestEvidence = getReviewedGeneralEvidence(["postharvest-change"]);
  const safetyEvidence = reviewedEvidence.filter(({ record }) => record.claimType === "safety-exposure" || record.claimType === "chemical-stability");
  const aggregateIdentityEvidence = getReviewedAggregateIdentityEvidenceForCompound(compound.slug);
  const cultivationEvidence = reviewedEvidence.filter(({ record }) => record.claimType === "cultivation-factor" || record.claimType === "postharvest-change");
  const biologicalEvidence = reviewedEvidence.filter(({ record }) => record.claimType === "biological-effect");
  const researchEvidence = biologicalEvidence;
  const chapterNumber = terpeneSeedCompounds.findIndex((item) => item.slug === compound.slug) + 1;
  const relatedCompounds = terpeneSeedCompounds
    .filter((item) => item.slug !== compound.slug)
    .sort((a, b) => {
      const aScore = Number(a.terpeneClass === compound.terpeneClass) + Number(a.structureFamily === compound.structureFamily);
      const bScore = Number(b.terpeneClass === compound.terpeneClass) + Number(b.structureFamily === compound.structureFamily);
      return bScore - aScore || a.name.localeCompare(b.name);
    })
    .slice(0, 4);
  const quiz = buildTerpeneQuiz(compound);
  const chapter = buildTerpeneCompoundChapter({
    compound,
    chapterNumber,
    mappedGeneCount: mappedGenes.length,
    reviewedEvidenceCount: reviewedEvidence.length,
    biologicalEvidenceCount: evidenceClaimCounts["biological-effect"] ?? 0,
    safetyEvidenceCount: evidenceClaimCounts["safety-exposure"] ?? 0,
    stabilityEvidenceCount: evidenceClaimCounts["chemical-stability"] ?? 0,
    generalPostharvestEvidenceCount: generalPostharvestEvidence.length,
    cultivationEvidenceCount: evidenceClaimCounts["cultivation-factor"] ?? 0,
    postharvestEvidenceCount: evidenceClaimCounts["postharvest-change"] ?? 0,
    hasAssessment: quiz.questions.length > 0,
    hasPhysicalPropertyRecord: Boolean(propertyRecord),
    experimentalPropertyEvidenceCount,
    sensoryEvidenceCount,
    naturalOccurrenceEvidenceCount,
    cultivarDistributionEvidenceCount: cultivarDistribution ? 1 : 0,
    stereoEvidenceCount: stereoRegistryEntry?.isomers.length ?? (stereo ? stereo.definedAtomStereoCount + stereo.definedBondStereoCount : 0),
    relatedCompounds,
  });

  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <div>
          <Link href="/learn/terpenes">← THC Terpene Atlas</Link>
          <p className="eyebrow">{family} · {compound.formula}</p>
          <h1>{compound.name}</h1>
          <p>
            {compound.structureFamily} · {compound.functionalClass} · {compound.biosyntheticPrecursor}
          </p>
        </div>
        <div className={styles.status}>
          <span>Occurrence</span>
          <strong>{compound.cannabisOccurrence.replace("-", " ")}</strong>
          <small>
            “Not mapped” means this curated dataset has not established a cannabis occurrence record;
            it does not mean universal absence.
          </small>
        </div>
      </header>

      <div className={styles.grid}>
        <main className={styles.main}>
          <section className={styles.chapterOverview}>
            <div className={styles.chapterHeading}>
              <div>
                <p className="eyebrow">Chapter {String(chapter.chapterNumber).padStart(2, "0")}</p>
                <h2>{chapter.title}</h2>
                <p>{chapter.introduction}</p>
              </div>
              <div className={styles.completeness}>
                <span>Chapter readiness</span>
                <strong>{chapter.completeness.score}%</strong>
                <small>{chapter.completeness.needsExpansionSections} of {chapter.completeness.totalSections} sections still need expansion</small>
              </div>
            </div>

            <div className={styles.objectives}>
              <span>Learning objectives</span>
              <ol>
                {chapter.learningObjectives.map((objective) => <li key={objective}>{objective}</li>)}
              </ol>
            </div>

            <div className={styles.chapterMap}>
              {chapter.sections.map((section, index) => (
                <article key={section.id} data-status={section.status}>
                  <div>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{section.label}</strong>
                  </div>
                  <p>{section.summary}</p>
                  <footer>
                    <b>{section.status.replaceAll("-", " ")}</b>
                    <small>{section.evidenceCount} linked evidence/source signal{section.evidenceCount === 1 ? "" : "s"}</small>
                  </footer>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.identity} id="identity">
            <div className="section-heading">
              <p className="eyebrow">Chemical identity</p>
              <h2>Know exactly which molecule the record describes.</h2>
            </div>
            <dl>
              <div><dt>Formula</dt><dd>{compound.formula}</dd></div>
              <div><dt>Molecular weight</dt><dd>{compound.molecularWeight ? `${compound.molecularWeight} g/mol` : "Pending source import"}</dd></div>
              <div><dt>CAS number</dt><dd>{compound.casNumber ?? "Pending source import"}</dd></div>
              <div><dt>PubChem CID</dt><dd>{compound.pubchemCid ?? "Pending source import"}</dd></div>
              <div><dt>Terpene family</dt><dd>{family}</dd></div>
              <div><dt>Structure family</dt><dd>{compound.structureFamily}</dd></div>
              <div><dt>Functional chemistry</dt><dd>{compound.functionalClass}</dd></div>
              <div><dt>Primary precursor context</dt><dd>{compound.biosyntheticPrecursor}</dd></div>
            </dl>
          </section>

          <section className={styles.propertySection} id="physical-properties">
            <div className="section-heading">
              <p className="eyebrow">Physical &amp; molecular properties</p>
              <h2>Use structure-derived properties as chemistry context, not effect shortcuts.</h2>
            </div>

            {propertyRecord ? (
              <>
                <dl>
                  <div><dt>IUPAC name</dt><dd>{propertyRecord.properties.IUPACName ?? "Not returned"}</dd></div>
                  <div><dt>Exact mass</dt><dd>{propertyRecord.properties.ExactMass ?? "Not returned"}</dd></div>
                  <div><dt>Monoisotopic mass</dt><dd>{propertyRecord.properties.MonoisotopicMass ?? "Not returned"}</dd></div>
                  <div><dt>XLogP</dt><dd>{propertyRecord.properties.XLogP ?? "Not returned"}</dd></div>
                  <div><dt>Topological polar surface area</dt><dd>{propertyRecord.properties.TPSA ?? "Not returned"} Å²</dd></div>
                  <div><dt>Molecular complexity</dt><dd>{propertyRecord.properties.Complexity ?? "Not returned"}</dd></div>
                  <div><dt>H-bond donors / acceptors</dt><dd>{propertyRecord.properties.HBondDonorCount ?? "—"} / {propertyRecord.properties.HBondAcceptorCount ?? "—"}</dd></div>
                  <div><dt>Rotatable bonds</dt><dd>{propertyRecord.properties.RotatableBondCount ?? "Not returned"}</dd></div>
                  <div><dt>Heavy atoms</dt><dd>{propertyRecord.properties.HeavyAtomCount ?? "Not returned"}</dd></div>
                </dl>

                <div className={styles.structureCodes}>
                  <div><span>SMILES</span><code>{propertyRecord.properties.SMILES ?? "Not returned"}</code></div>
                  <div><span>Connectivity SMILES</span><code>{propertyRecord.properties.ConnectivitySMILES ?? "Not returned"}</code></div>
                  <div><span>InChI</span><code>{propertyRecord.properties.InChI ?? "Not returned"}</code></div>
                  <div><span>InChIKey</span><code>{propertyRecord.properties.InChIKey ?? "Not returned"}</code></div>
                </div>
              </>
            ) : (
              <p className={styles.expansionNote}>
                The reviewed PubChem property cache has not been generated for this deployment yet.
              </p>
            )}
          </section>

          <section className={styles.experimentalPropertySection} id="experimental-properties">
            <div className="section-heading">
              <p className="eyebrow">Reported experimental properties</p>
              <h2>Keep reported values attached to their source and conditions.</h2>
            </div>

            {experimentalPropertyRecord && experimentalPropertyEvidenceCount > 0 ? (
              <>
                <p className={styles.propertyGuardrail}>
                  PubChem aggregates reported experimental values from multiple references. Different methods,
                  pressures, temperatures, purities, stereochemical forms, and source materials can yield different
                  values, so this Atlas preserves the reports instead of choosing one universal number.
                </p>
                <div className={styles.experimentalPropertyGrid}>
                  {Object.entries(experimentalPropertyRecord.properties)
                    .filter(([, entries]) => entries.length > 0)
                    .map(([heading, entries]) => (
                      <article key={heading}>
                        <div className={styles.experimentalPropertyHeading}>
                          <span>{heading}</span>
                          <strong>{entries.length} report{entries.length === 1 ? "" : "s"}</strong>
                        </div>
                        <div className={styles.experimentalPropertyEntries}>
                          {entries.slice(0, 8).map((entry, index) => (
                            <div key={heading + "-" + entry.reportedValue + "-" + index}>
                              <strong>{entry.reportedValue}</strong>
                              {entry.name ? <span>{entry.name}</span> : null}
                              {entry.references.length ? (
                                <div className={styles.propertyReferences}>
                                  {entry.references.slice(0, 3).map((reference) =>
                                    reference.url ? (
                                      <a
                                        key={String(reference.referenceNumber)}
                                        href={reference.url}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        {reference.sourceName ?? reference.name ?? "Source"} ↗
                                      </a>
                                    ) : (
                                      <span key={String(reference.referenceNumber)}>
                                        {reference.sourceName ?? reference.name ?? "Source reference"}
                                      </span>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <small>PubChem report has no resolved external reference in this cache.</small>
                              )}
                            </div>
                          ))}
                        </div>
                      </article>
                    ))}
                </div>
                <p className={styles.expansionNote}>
                  These are reported experimental-property records, not recommended processing temperatures.
                  A reported boiling point must not be presented as an “ideal vaping temperature.”
                </p>
              </>
            ) : (
              <p className={styles.expansionNote}>
                The reviewed PubChem experimental-property cache has not been generated for this deployment yet.
              </p>
            )}
          </section>

          <section className={styles.stereoSection} id="stereochemistry">
            <div className="section-heading">
              <p className="eyebrow">Stereochemistry &amp; isomer handling</p>
              <h2>Distinguish connectivity from stereochemical identity.</h2>
            </div>

            {propertyRecord && stereo ? (
              <>
                <dl>
                  <div><dt>Atom stereocenters</dt><dd>{stereo.atomStereoCount}</dd></div>
                  <div><dt>Defined atom stereocenters</dt><dd>{stereo.definedAtomStereoCount}</dd></div>
                  <div><dt>Undefined atom stereocenters</dt><dd>{stereo.undefinedAtomStereoCount}</dd></div>
                  <div><dt>Bond stereochemistry sites</dt><dd>{stereo.bondStereoCount}</dd></div>
                  <div><dt>Defined bond stereochemistry</dt><dd>{stereo.definedBondStereoCount}</dd></div>
                  <div><dt>Undefined bond stereochemistry</dt><dd>{stereo.undefinedBondStereoCount}</dd></div>
                </dl>
                <p className={styles.expansionNote}>
                  PubChem stereochemistry counts describe the deposited compound record. Routine cannabis laboratory
                  methods may not resolve every enantiomer or geometric isomer, so analytical method details still matter.
                </p>

                {stereoRegistryEntry ? (
                  <div className={styles.isomerRegistry}>
                    <div className={styles.isomerSummary}>
                      <span>Parent identity scope</span>
                      <strong>{stereoRegistryEntry.parentIdentityScope.replaceAll("-", " ")}</strong>
                      <p>{stereoRegistryEntry.summary}</p>
                    </div>
                    <div className={styles.isomerGrid}>
                      {stereoRegistryEntry.isomers.map((isomer) => (
                        <a
                          key={isomer.pubchemCid}
                          href={"https://pubchem.ncbi.nlm.nih.gov/compound/" + isomer.pubchemCid}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div>
                            <strong>{isomer.label}</strong>
                            {isomer.chapterIdentity ? <span>Chapter identity</span> : null}
                          </div>
                          <dl>
                            <div><dt>Configuration</dt><dd>{isomer.configuration}</dd></div>
                            <div><dt>Optical rotation label</dt><dd>{isomer.rotation}</dd></div>
                            <div><dt>PubChem CID</dt><dd>{isomer.pubchemCid}</dd></div>
                            <div><dt>CAS</dt><dd>{isomer.casNumber ?? "Not assigned"}</dd></div>
                          </dl>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className={styles.expansionNote}>
                    No curated enantiomer pair is registered for this chapter. That does not prove stereoisomers do not exist;
                    it means the reviewed stereoisomer registry has not mapped a pair here yet.
                  </p>
                )}
              </>
            ) : (
              <p className={styles.expansionNote}>
                Stereochemical coverage is pending the reviewed PubChem property cache.
              </p>
            )}
          </section>

          <section id="sensory" className={styles.sensorySection}>
            <div className="section-heading">
              <p className="eyebrow">Aroma and sensory language</p>
              <h2>Descriptors are observations, not one-compound diagnoses.</h2>
            </div>
            {compound.aromaDescriptors.length ? (
              <div className={styles.chips}>
                {compound.aromaDescriptors.map((descriptor) => <span key={descriptor}>{descriptor}</span>)}
              </div>
            ) : (
              <p className={styles.body}>No aroma descriptors are assigned in this seed record.</p>
            )}
            <p className={styles.body}>{compound.viewNotes.aroma}</p>

            {sensoryEvidenceRecord && sensoryEvidenceCount > 0 ? (
              <>
                <p className={styles.sensoryGuardrail}>
                  These are source-preserved sensory reports. Odor thresholds depend on medium, method, purity,
                  stereochemical identity, temperature, and the population tested. A lower threshold does not mean
                  a compound is universally “stronger,” more important in cannabis, or more psychoactive.
                </p>
                <div className={styles.sensoryEvidenceGrid}>
                  {Object.entries(sensoryEvidenceRecord.sensory)
                    .filter(([, entries]) => entries.length > 0)
                    .map(([heading, entries]) => (
                      <article key={heading}>
                        <div className={styles.sensoryEvidenceHeading}>
                          <span>{heading}</span>
                          <strong>{entries.length} report{entries.length === 1 ? "" : "s"}</strong>
                        </div>
                        <div className={styles.sensoryEvidenceEntries}>
                          {entries.slice(0, 10).map((entry, index) => (
                            <div key={heading + "-" + entry.reportedValue + "-" + index}>
                              <strong>{entry.reportedValue}</strong>
                              {entry.name ? <span>{entry.name}</span> : null}
                              {entry.references.length ? (
                                <div className={styles.propertyReferences}>
                                  {entry.references.slice(0, 3).map((reference) =>
                                    reference.url ? (
                                      <a
                                        key={String(reference.referenceNumber)}
                                        href={reference.url}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        {reference.sourceName ?? reference.name ?? "Source"} ↗
                                      </a>
                                    ) : (
                                      <span key={String(reference.referenceNumber)}>
                                        {reference.sourceName ?? reference.name ?? "Source reference"}
                                      </span>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <small>PubChem report has no resolved external reference in this cache.</small>
                              )}
                            </div>
                          ))}
                        </div>
                      </article>
                    ))}
                </div>
              </>
            ) : (
              <p className={styles.expansionNote}>
                Source-preserved PubChem odor, odor-threshold, and taste evidence has not been generated for this deployment yet.
              </p>
            )}
          </section>

          <section className={styles.split} id="cannabis-occurrence">
            <div>
              <p className="eyebrow">Cannabis occurrence</p>
              <h2>Chemistry before strain-name assumptions.</h2>
              <p>{compound.cannabisContext}</p>
            </div>
            <div>
              <p className="eyebrow">Cultivar interpretation</p>
              <h2>Use distributions, not fixed strain numbers.</h2>
              <p>{compound.cultivarContext}</p>

              {cultivarDistribution ? (
                <article className={styles.distributionPanel}>
                  <div className={styles.distributionHeading}>
                    <div>
                      <span>Measured cultivar-group distribution</span>
                      <strong>{cultivarDistribution.cultivarCount.toLocaleString()} groups</strong>
                    </div>
                    <b>{Math.round(cultivarDistribution.positiveMedianShare * 100)}% positive median</b>
                  </div>

                  <div className={styles.distributionStats}>
                    <div>
                      <span>Measured samples</span>
                      <strong>{cultivarDistribution.measuredSamples.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span>Multi-lab cultivar groups</span>
                      <strong>{cultivarDistribution.multiLabCultivars.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span>Corpus coverage</span>
                      <strong>{Math.round(cultivarDistribution.cultivarShare * 100)}%</strong>
                    </div>
                    <div>
                      <span>Measurement</span>
                      <strong>{humanizeEvidenceTerm(cultivarDistribution.measurementKind)}</strong>
                    </div>
                  </div>

                  {cultivarDistribution.cultivarMedianDistribution ? (
                    <div className={styles.quartilePanel}>
                      <div className={styles.quartileHeading}>
                        <span>Distribution of cultivar medians</span>
                        <small>source dataset concentration units</small>
                      </div>
                      <div className={styles.quartileGrid}>
                        <div><span>Q1</span><strong>{cultivarDistribution.cultivarMedianDistribution.q1.toFixed(3)}</strong></div>
                        <div><span>Median</span><strong>{cultivarDistribution.cultivarMedianDistribution.median.toFixed(3)}</strong></div>
                        <div><span>Q3</span><strong>{cultivarDistribution.cultivarMedianDistribution.q3.toFixed(3)}</strong></div>
                        <div><span>Max</span><strong>{cultivarDistribution.cultivarMedianDistribution.max.toFixed(3)}</strong></div>
                      </div>
                    </div>
                  ) : null}

                  <p>
                    These are distributions across compiled cultivar groups, not a fixed value for every sample carrying
                    a cultivar name. Lab, producer, region, phenotype, maturity, and handling can all shift measured chemistry.
                  </p>
                  <Link href="/learn/terpenes/cultivars">Open full cultivar chemistry explorer →</Link>
                </article>
              ) : (
                <p className={styles.expansionNote}>
                  No exact reviewed cultivar-distribution analyte is linked for this compound in the current corpus.
                </p>
              )}
            </div>
          </section>

          <section className={styles.split} id="biosynthesis">
            <div>
              <p className="eyebrow">Biosynthesis</p>
              <h2>Place the molecule in its pathway.</h2>
              <p>{compound.viewNotes.biosynthesis}</p>
            </div>
            <div>
              <p className="eyebrow">Genetics</p>
              <h2>Genes contribute; they do not act alone.</h2>
              <p>{compound.geneticsContext}</p>
            </div>
          </section>

          {mappedGenes.length ? (
            <section className={styles.evidenceSection} id="genetics">
              <div className="section-heading">
                <p className="eyebrow">Source-verified genetics</p>
                <h2>Functionally characterized Cannabis terpene synthases mapped to this compound.</h2>
              </div>
              <div className={styles.geneGrid}>
                {mappedGenes.map((gene) => {
                  const context = getGeneProductContext(gene, compound.slug);
                  return (
                    <article className={styles.geneCard} key={gene.id}>
                      <div className={styles.cardTopline}>
                        <span>{context?.role === "major" ? "Major functional product" : "Additional reported product"}</span>
                        <strong>{gene.id}</strong>
                      </div>
                      <dl>
                        <div><dt>Origin</dt><dd>{gene.strainOrigin}</dd></div>
                        <div><dt>Primary substrate</dt><dd>{gene.primarySubstrate}</dd></div>
                        <div><dt>TPS group</dt><dd>{gene.subfamily ?? "Not assigned in current source record"}</dd></div>
                        <div><dt>Source location</dt><dd>{gene.sourceLocator}</dd></div>
                      </dl>
                    </article>
                  );
                })}
              </div>
              <p className={styles.evidenceNote}>
                A functional enzyme assay establishes biochemical capability under the tested conditions.
                It does not guarantee a fixed flower concentration or inheritance outcome.
              </p>
              <Link className={styles.inlineLink} href="/learn/terpenes/genetics">
                Open the full TPS genetics map →
              </Link>
            </section>
          ) : null}

          <section className={styles.evidenceSection} id="research">
            <div className="section-heading">
              <p className="eyebrow">Biological research evidence</p>
              <h2>Separate human, animal, mechanistic, and in-vitro findings by what was actually tested.</h2>
            </div>
            {researchEvidence.length ? (
              <div className={styles.evidenceGrid}>
                {researchEvidence.map(({ record, source }) => (
                  <article className={styles.evidenceCard} key={record.id}>
                    <div className={styles.cardTopline}>
                      <span>{humanizeEvidenceTerm(record.claimType)}</span>
                      <strong>{humanizeEvidenceTerm(record.reviewStatus)}</strong>
                    </div>
                    <h3>{record.statement}</h3>
                    <p>{evidenceScope(record)}</p>
                    <dl>
                      <div><dt>Study type</dt><dd>{humanizeEvidenceTerm(record.studyType)}</dd></div>
                      <div><dt>Method</dt><dd>{record.analyticalMethod ?? "Not specified in this ledger entry"}</dd></div>
                      <div><dt>Source locator</dt><dd>{record.sourceLocator}</dd></div>
                    </dl>
                    {source?.sourceUrl ? (
                      <a href={source.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.body}>
                No reviewed compound-specific evidence records are linked yet. The chemistry record remains available,
                but unsupported evidence categories are not invented.
              </p>
            )}
            <Link className={styles.inlineLink} href="/learn/terpenes/research">
              Open the research ledger →
            </Link>
          </section>

          <section id="natural-occurrence" className={styles.occurrenceSection}>
            <div className="section-heading">
              <p className="eyebrow">Natural occurrence</p>
              <h2>Terpenes are plant chemistry, not cannabis-only chemistry.</h2>
            </div>
            <div className={styles.chips}>
              {compound.naturalSources.map((source) => <span key={source}>{source}</span>)}
            </div>
            <p className={styles.occurrenceGuardrail}>
              The chips above are curated teaching summaries. The records below preserve how source databases
              reported natural occurrence. A reported organism or material is not automatically a quantified
              concentration, a Cannabis occurrence claim, or proof that every sample of that organism contains the compound.
            </p>

            {naturalOccurrenceRecord && naturalOccurrenceEvidenceCount > 0 ? (
              <div className={styles.occurrenceEvidenceGrid}>
                {naturalOccurrenceRecord.occurrence["Natural Occurrence"].slice(0, 20).map((entry, index) => (
                  <article key={entry.reportedValue + "-" + index}>
                    <strong>{entry.reportedValue}</strong>
                    {entry.name ? <span>{entry.name}</span> : null}
                    {entry.references.length ? (
                      <div className={styles.propertyReferences}>
                        {entry.references.slice(0, 4).map((reference) =>
                          reference.url ? (
                            <a
                              key={String(reference.referenceNumber)}
                              href={reference.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {reference.sourceName ?? reference.name ?? "Source"} ↗
                            </a>
                          ) : (
                            <span key={String(reference.referenceNumber)}>
                              {reference.sourceName ?? reference.name ?? "Source reference"}
                            </span>
                          ),
                        )}
                      </div>
                    ) : (
                      <small>PubChem report has no resolved external reference in this cache.</small>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.expansionNote}>
                Source-preserved natural-occurrence reports have not been generated for this deployment yet.
              </p>
            )}

            <p className={styles.expansionNote}>
              Structured organism normalization and occurrence cross-checking will be layered on top of these source
              reports with LOTUS and other qualified natural-product occurrence sources rather than inferred from names alone.
            </p>
          </section>

          <section className={styles.expansionSection} id="cultivation-postharvest">
            <div className="section-heading">
              <p className="eyebrow">Cultivation &amp; post-harvest</p>
              <h2>Connect plant conditions to measured chemistry without inventing deterministic rules.</h2>
            </div>
            <p>{compound.geneticsContext}</p>
            <p>{compound.cultivarContext}</p>

            {cultivationEvidence.length ? (
              <div className={styles.evidenceGrid}>
                {cultivationEvidence.map(({ record, source }) => (
                  <article className={styles.evidenceCard} key={record.id}>
                    <div className={styles.cardTopline}>
                      <span>{humanizeEvidenceTerm(record.claimType)}</span>
                      <strong>{humanizeEvidenceTerm(record.reviewStatus)}</strong>
                    </div>
                    <h3>{record.statement}</h3>
                    <p>{evidenceScope(record)}</p>
                    <dl>
                      <div><dt>Study type</dt><dd>{humanizeEvidenceTerm(record.studyType)}</dd></div>
                      <div><dt>Material / population</dt><dd>{record.populationOrMaterial}</dd></div>
                      <div><dt>Method</dt><dd>{record.analyticalMethod ?? "Not specified in this ledger entry"}</dd></div>
                      <div><dt>Source locator</dt><dd>{record.sourceLocator}</dd></div>
                    </dl>
                    {source?.sourceUrl ? (
                      <a href={source.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : null}

            {generalPostharvestEvidence.length ? (
              <>
                <div className={styles.evidenceGrid}>
                  {generalPostharvestEvidence.map(({ record, source }) => (
                    <article className={styles.evidenceCard} key={record.id}>
                      <div className={styles.cardTopline}>
                        <span>General cannabis post-harvest evidence</span>
                        <strong>{humanizeEvidenceTerm(record.reviewStatus)}</strong>
                      </div>
                      <h3>{record.statement}</h3>
                      <p>{evidenceScope(record)}</p>
                      <dl>
                        <div><dt>Study type</dt><dd>{humanizeEvidenceTerm(record.studyType)}</dd></div>
                        <div><dt>Method</dt><dd>{record.analyticalMethod ?? "Not specified in this ledger entry"}</dd></div>
                        <div><dt>Source locator</dt><dd>{record.sourceLocator}</dd></div>
                      </dl>
                      {source?.sourceUrl ? (
                        <a href={source.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a>
                      ) : null}
                    </article>
                  ))}
                </div>
                <p className={styles.expansionNote}>
                  These records support system-level cannabis post-harvest interpretation. They do not establish
                  the same loss rate or stability behavior for {compound.name} in every cultivar, package, or environment.
                </p>
              </>
            ) : (
              <p className={styles.expansionNote}>
                Compound-specific cultivation, harvest, drying, curing, storage, oxidation, and analytical-method
                evidence still needs to be linked for this chapter.
              </p>
            )}
          </section>

          <section className={styles.expansionSection} id="safety">
            <div className="section-heading">
              <p className="eyebrow">Safety, stability &amp; exposure</p>
              <h2>Keep safety claims evidence-specific.</h2>
            </div>

            {safetyEvidence.length ? (
              <div className={styles.evidenceGrid}>
                {safetyEvidence.map(({ record, source }) => (
                  <article className={styles.evidenceCard} key={record.id}>
                    <div className={styles.cardTopline}>
                      <span>{humanizeEvidenceTerm(record.claimType)}</span>
                      <strong>{humanizeEvidenceTerm(record.reviewStatus)}</strong>
                    </div>
                    <h3>{record.statement}</h3>
                    <p>{evidenceScope(record)}</p>
                    <dl>
                      <div><dt>Study type</dt><dd>{humanizeEvidenceTerm(record.studyType)}</dd></div>
                      <div><dt>Material / population</dt><dd>{record.populationOrMaterial}</dd></div>
                      <div><dt>Source locator</dt><dd>{record.sourceLocator}</dd></div>
                    </dl>
                    {source?.sourceUrl ? (
                      <a href={source.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.expansionNote}>
                Compound-specific safety, oxidation, sensitization, irritation, exposure-route, dose, and degradation
                evidence has not yet been linked for this reviewed chapter.
              </p>
            )}

            {aggregateIdentityEvidence.length ? (
              <div className={styles.aggregateEvidence}>
                <div className={styles.aggregateEvidenceHeading}>
                  <span>Identity-unresolved related evidence</span>
                  <strong>Not counted as isomer-specific readiness</strong>
                </div>
                {aggregateIdentityEvidence.map(({ record, source }) => (
                  <article key={record.id}>
                    <h3>{record.statement}</h3>
                    <p>
                      This source is linked to a broader or unresolved chemical identity. It is shown for context,
                      but it does not prove that the same endpoint applies equally to this exact chapter identity.
                    </p>
                    <dl>
                      <div><dt>Study type</dt><dd>{humanizeEvidenceTerm(record.studyType)}</dd></div>
                      <div><dt>Evidence identity</dt><dd>{record.compoundSlug}</dd></div>
                      <div><dt>Source locator</dt><dd>{record.sourceLocator}</dd></div>
                    </dl>
                    {source?.sourceUrl ? (
                      <a href={source.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : null}
          </section>

          <TerpeneChapterQuiz quiz={quiz} />

          <section className={styles.relatedSection}>
            <div className="section-heading">
              <p className="eyebrow">Related compounds</p>
              <h2>Continue through structurally or chemically related reviewed chapters.</h2>
            </div>
            <div className={styles.relatedGrid}>
              {relatedCompounds.map((item) => (
                <Link href={"/learn/terpenes/" + item.slug} key={item.slug}>
                  <strong>{item.name}</strong>
                  <span>{getFamilyLabel(item.terpeneClass)} · {item.structureFamily} · {item.formula}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.guardrail}>
            <p className="eyebrow">Research guardrail</p>
            <h2>Separate measured chemistry from effect claims.</h2>
            <p>{compound.researchGuardrail}</p>
          </section>
        </main>

        <aside className={styles.aside}>
          <section>
            <span>Aliases</span>
            <div className={styles.aliases}>
              {compound.aliases.map((alias) => <code key={alias}>{alias}</code>)}
            </div>
          </section>

          <section>
            <span>Source IDs in this seed record</span>
            <div className={styles.aliases}>
              {compound.sourceIds.map((sourceId) => <code key={sourceId}>{sourceId}</code>)}
            </div>
          </section>

          {compound.pubchemCid ? (
            <a
              href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compound.pubchemCid}`}
              target="_blank"
              rel="noreferrer"
            >
              Open PubChem record ↗
            </a>
          ) : null}

          <Link href="/learn/terpenes/genetics">Open TPS genetics →</Link>
          <Link href="/learn/terpenes/research">Open terpene research ledger →</Link>
          <Link href="/learn/sources">Open THC evidence sources →</Link>
        </aside>
      </div>
    </article>
  );
}
