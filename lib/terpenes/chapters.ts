import type { BuildChapterContext, TerpeneChapterSection, TerpeneCompoundChapter } from "./chapter-types";

const sectionWeights: Record<TerpeneChapterSection["status"], number> = {
  complete: 1,
  "reviewed-foundation": 0.75,
  "linked-evidence": 0.6,
  "needs-expansion": 0.25,
};

function buildSections({
  compound,
  mappedGeneCount,
  reviewedEvidenceCount,
  safetyEvidenceCount = 0,
  stabilityEvidenceCount = 0,
  generalPostharvestEvidenceCount = 0,
  hasAssessment = false,
}: BuildChapterContext): TerpeneChapterSection[] {
  const chemistrySources = compound.sourceIds.filter((id) => id === "PUBCHEM" || id === "THC-V13");
  const cannabisSources = compound.sourceIds.filter((id) => id !== "PUBCHEM");

  return [
    {
      id: "identity",
      label: "Chemical identity",
      summary: "Canonical identifiers, formula, molecular mass, synonyms, and exact molecule scope.",
      status:
        compound.pubchemCid && compound.casNumber && compound.molecularWeight
          ? "complete"
          : "reviewed-foundation",
      evidenceCount: Number(Boolean(compound.pubchemCid)) + Number(Boolean(compound.casNumber)),
      sourceIds: chemistrySources,
    },
    {
      id: "classification",
      label: "Family & structural classification",
      summary: "Terpene family, carbon class, structure family, functional chemistry, and precursor context.",
      status:
        compound.terpeneClass && compound.structureFamily && compound.functionalClass
          ? "complete"
          : "reviewed-foundation",
      evidenceCount: 0,
      sourceIds: compound.sourceIds,
    },
    {
      id: "sensory",
      label: "Sensory & aroma science",
      summary: "Aroma descriptors, mixture context, sensory limitations, and the distinction between odor language and effect claims.",
      status: compound.aromaDescriptors.length ? "reviewed-foundation" : "needs-expansion",
      evidenceCount: 0,
      sourceIds: compound.sourceIds,
    },
    {
      id: "natural-occurrence",
      label: "Natural occurrence",
      summary: "Occurrence in plants and other natural sources outside cannabis.",
      status: compound.naturalSources.length >= 3 ? "reviewed-foundation" : "needs-expansion",
      evidenceCount: compound.naturalSources.length,
      sourceIds: compound.sourceIds,
    },
    {
      id: "cannabis-occurrence",
      label: "Cannabis occurrence",
      summary: "What the reviewed dataset establishes about occurrence in Cannabis and what remains uncertain.",
      status:
        compound.cannabisOccurrence === "documented"
          ? "linked-evidence"
          : compound.cannabisOccurrence === "reported"
            ? "reviewed-foundation"
            : "needs-expansion",
      evidenceCount: reviewedEvidenceCount,
      sourceIds: cannabisSources,
    },
    {
      id: "biosynthesis",
      label: "Biosynthesis & plant biology",
      summary: "Precursor pathway, terpene-synthase context, trichome biology, and ecological interpretation.",
      status: compound.biosyntheticPrecursor ? "reviewed-foundation" : "needs-expansion",
      evidenceCount: reviewedEvidenceCount,
      sourceIds: compound.sourceIds,
    },
    {
      id: "genetics",
      label: "Genetics & terpene synthases",
      summary: "Functionally characterized synthases, enzyme product spectra, and genotype-to-chemistry limitations.",
      status: mappedGeneCount > 0 ? "linked-evidence" : "needs-expansion",
      evidenceCount: mappedGeneCount,
      sourceIds: cannabisSources,
    },
    {
      id: "cultivar-chemistry",
      label: "Cultivar chemistry",
      summary: "Repeated-sample distributions, cultivar-name limitations, and measured chemistry interpretation.",
      status:
        compound.cannabisOccurrence === "documented"
          ? "reviewed-foundation"
          : "needs-expansion",
      evidenceCount: reviewedEvidenceCount,
      sourceIds: cannabisSources,
    },
    {
      id: "cultivation-postharvest",
      label: "Cultivation & post-harvest",
      summary: "How genetics, development, environment, harvest timing, drying, curing, oxidation, and storage can shape measured chemistry.",
      status:
        generalPostharvestEvidenceCount > 0
          ? "reviewed-foundation"
          : /storage|handling|drying|oxidation|environment|maturity/i.test(
              [compound.cannabisContext, compound.geneticsContext, compound.cultivarContext].join(" "),
            )
            ? "reviewed-foundation"
            : "needs-expansion",
      evidenceCount: generalPostharvestEvidenceCount,
      sourceIds: compound.sourceIds,
    },
    {
      id: "research",
      label: "Research & biological evidence",
      summary: "Human, animal, in-vitro, mechanistic, analytical, and sensory evidence kept separate by study type.",
      status: reviewedEvidenceCount > 0 ? "linked-evidence" : "needs-expansion",
      evidenceCount: reviewedEvidenceCount,
      sourceIds: compound.sourceIds,
    },
    {
      id: "safety",
      label: "Safety, stability & exposure",
      summary: "Oxidation, irritation/sensitization, exposure context, degradation products, and evidence limitations.",
      status: safetyEvidenceCount + stabilityEvidenceCount > 0 ? "linked-evidence" : "needs-expansion",
      evidenceCount: safetyEvidenceCount + stabilityEvidenceCount,
      sourceIds: compound.sourceIds,
    },
    {
      id: "assessment",
      label: "Knowledge check & applied interpretation",
      summary: "Compound identification, evidence literacy, chemistry interpretation, and cultivation/cultivar application questions.",
      status: hasAssessment ? "complete" : "needs-expansion",
      evidenceCount: hasAssessment ? 1 : 0,
      sourceIds: [],
    },
  ];
}

export function buildTerpeneCompoundChapter(context: BuildChapterContext): TerpeneCompoundChapter {
  const { compound, chapterNumber, relatedCompounds } = context;
  const sections = buildSections(context);
  const weighted = sections.reduce((sum, section) => sum + sectionWeights[section.status], 0);
  const total = sections.length;

  return {
    compoundSlug: compound.slug,
    title: `${compound.name}: Chemistry, Plant Biology & Cannabis Context`,
    chapterNumber,
    introduction:
      `${compound.name} is treated here as a chemical identity first. This chapter connects its ${compound.terpeneClass.replaceAll("-", " ")} classification, ${compound.structureFamily} structure, ${compound.functionalClass} chemistry, sensory language, plant biology, Cannabis evidence, genetics, cultivar interpretation, and research limitations without turning one molecule into a shortcut for aroma or human effects.`,
    learningObjectives: [
      `Identify ${compound.name} by family, structural class, formula, and exact chemical identifiers.`,
      `Explain how ${compound.biosyntheticPrecursor} connects ${compound.name} to terpene biosynthesis.`,
      "Separate sensory descriptors from analytical identification and biological-effect claims.",
      "Interpret Cannabis occurrence and cultivar measurements as evidence with scope and limitations.",
      "Distinguish enzyme capability, plant abundance, and inherited chemistry when reading terpene genetics.",
    ],
    sections,
    completeness: {
      score: Math.round((weighted / total) * 100),
      completeSections: sections.filter((section) => section.status === "complete").length,
      foundationSections: sections.filter((section) => section.status === "reviewed-foundation").length,
      linkedEvidenceSections: sections.filter((section) => section.status === "linked-evidence").length,
      needsExpansionSections: sections.filter((section) => section.status === "needs-expansion").length,
      totalSections: total,
    },
    relatedCompounds: relatedCompounds.map((item) => item.slug),
  };
}
