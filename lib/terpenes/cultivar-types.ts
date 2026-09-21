export type CultivarTerpeneMeasurement = {
  sourceAnalyte: string;
  normalizedKey: string;
  canonicalSlug: string | null;
  measurementKind:
    | "compound"
    | "compound-stereochemistry-unspecified"
    | "compound-isomer-unspecified"
    | "aggregate-isomers";
  value: number;
  unit: "percent-w-w";
};

export type CultivarTerpeneSample = {
  sampleId: string;
  sourceId: string;
  sourceRecordId: string;
  labId: string | null;
  cultivarOriginal: string | null;
  cultivarSlug: string;
  cultivarLabelSource: "dataset-normalized-strain-slug" | "source-original" | "dtf-reviewed-alias";
  producerId: string | null;
  region: string | null;
  productCategory: string | null;
  chemotype: string | null;
  totalTerpenes: number | null;
  topTerpeneSourceField: string | null;
  measurements: CultivarTerpeneMeasurement[];
};

export type CultivarDistributionStatistics = {
  n: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
};

export type CultivarCategoryStatistics = {
  value: string;
  n: number;
  share: number;
};

export type CultivarConcentrationStatistics = {
  knownCount: number;
  distinctCount: number;
  largestShare: number | null;
  concentrationIndex: number | null;
  effectiveCount: number | null;
};

export type CultivarDataQuality = {
  labs: CultivarConcentrationStatistics;
  producers: CultivarConcentrationStatistics;
  totalTerpeneCoverage: number;
  regionCoverage: number;
  productCategoryCoverage: number;
  chemotypeCoverage: number;
  largestRegionShare: number | null;
  largestProductCategoryShare: number | null;
  largestChemotypeShare: number | null;
};

export type CultivarAnalyteStatistics = CultivarDistributionStatistics & {
  normalizedKey: string;
  canonicalSlug: string | null;
  measurementKind: CultivarTerpeneMeasurement["measurementKind"];
  labCount: number;
  sampleCoverage: number;
  relativeIqr: number | null;
  labMedianDistribution: CultivarDistributionStatistics | null;
};

export type CultivarRegionStratum = {
  region: string;
  sampleCount: number;
  labCount: number;
  producerCount: number;
  sampleDepthTier: CultivarProfileSummary["sampleDepthTier"];
  totalTerpenes: CultivarDistributionStatistics | null;
  analytes: Array<
    CultivarDistributionStatistics & {
      normalizedKey: string;
      canonicalSlug: string | null;
      measurementKind: CultivarTerpeneMeasurement["measurementKind"];
    }
  >;
};

export type CultivarProfileSummary = {
  cultivarSlug: string;
  sampleCount: number;
  labCount: number;
  producerCount: number;
  sampleDepthTier:
    | "insufficient"
    | "limited-multi-lab"
    | "limited-single-lab"
    | "moderate-multi-lab"
    | "moderate-single-lab"
    | "high-depth-multi-lab"
    | "high-depth-single-lab";
  minimumSamples: number;
  totalTerpenes: CultivarDistributionStatistics | null;
  regions: CultivarCategoryStatistics[];
  productCategories: CultivarCategoryStatistics[];
  chemotypes: CultivarCategoryStatistics[];
  topTerpenes: CultivarCategoryStatistics[];
  regionStrata: CultivarRegionStratum[];
  dataQuality: CultivarDataQuality;
  analytes: CultivarAnalyteStatistics[];
  publishable: boolean;
};
