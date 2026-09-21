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

export type CultivarAnalyteStatistics = {
  normalizedKey: string;
  canonicalSlug: string | null;
  measurementKind: CultivarTerpeneMeasurement["measurementKind"];
  n: number;
  labCount: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
};

export type CultivarProfileSummary = {
  cultivarSlug: string;
  sampleCount: number;
  labCount: number;
  sampleDepthTier:
    | "insufficient"
    | "limited-multi-lab"
    | "limited-single-lab"
    | "moderate-multi-lab"
    | "moderate-single-lab"
    | "high-depth-multi-lab"
    | "high-depth-single-lab";
  minimumSamples: number;
  analytes: CultivarAnalyteStatistics[];
  publishable: boolean;
};
