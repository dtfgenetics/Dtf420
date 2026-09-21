export type ResearchSource = {
  id: string;
  name: string;
  role: string;
  reviewRequired: boolean;
  sourceUrl?: string;
  doi?: string;
  pmid?: string;
  pmcid?: string;
  license?: string;
  notes?: string;
};

export type ResearchEvidenceRecord = {
  id: string;
  compoundSlug: string;
  claimType: string;
  statement: string;
  sourceId: string;
  sourceLocator: string;
  studyType: string;
  populationOrMaterial: string;
  analyticalMethod: string | null;
  value: number | null;
  unit: string | null;
  reviewStatus: string;
  reviewedAt: string | null;
  notes: string | null;
  geneId?: string | null;
  productRole?: string | null;
  substrate?: string | null;
  cultivarOrStrain?: string | null;
};

export function evidenceScope(record: ResearchEvidenceRecord) {
  switch (record.claimType) {
    case "terpene-synthase-function":
      return "Supports biochemical capability of the tested enzyme under the reported assay conditions. It does not establish a fixed concentration in living flower or guaranteed inheritance.";
    case "cannabis-occurrence":
      return "Supports detection or measurement in the analyzed cannabis material under the reported method and sampling conditions. It does not establish universal occurrence or a human effect.";
    case "cultivar-sample":
      return "Supports the measured chemistry of the analyzed sample. It does not make one result a permanent property of every sample carrying the same cultivar name.";
    case "sensory-descriptor":
      return "Supports the reported sensory association in the study context. Aroma perception depends on mixtures, concentrations, thresholds, and other volatile compounds.";
    case "biosynthetic-pathway":
      return "Supports a biochemical or mechanistic pathway relationship at the level tested by the source.";
    case "biological-effect":
      if (record.studyType === "human-clinical") return "Supports the specific human outcome tested under the study conditions; generalization still depends on population, dose, formulation, and study design.";
      if (record.studyType === "human-observational") return "Supports an association observed in people, not proof of causation.";
      if (record.studyType === "animal") return "Supports an outcome in the tested animal model; it is not direct evidence of the same effect in humans.";
      if (record.studyType === "in-vitro" || record.studyType === "mechanistic") return "Supports a laboratory or mechanistic finding; it is not direct evidence of a clinical effect in humans.";
      return "Supports only the outcome and context directly tested by the source.";
    default:
      return "Supports only the specific claim and experimental context recorded in this evidence entry.";
  }
}

export function humanizeEvidenceTerm(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
