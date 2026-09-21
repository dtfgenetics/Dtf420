export type TerpeneClassId =
  | "hemiterpene"
  | "monoterpene"
  | "sesquiterpene"
  | "diterpene"
  | "sesterterpene"
  | "triterpene"
  | "tetraterpene"
  | "polyterpene";

export type TerpeneView =
  | "aroma"
  | "chemistry"
  | "biosynthesis"
  | "genetics"
  | "cultivars";

export type CannabisOccurrence = "documented" | "reported" | "not-mapped";

export type TerpeneFamily = {
  id: TerpeneClassId;
  label: string;
  carbonCount: string;
  isopreneUnits: string;
  summary: string;
};

export type TerpeneCompound = {
  slug: string;
  name: string;
  aliases: string[];
  terpeneClass: TerpeneClassId;
  structureFamily: string;
  functionalClass: string;
  formula: string;
  molecularWeight: number | null;
  pubchemCid: number | null;
  casNumber: string | null;
  biosyntheticPrecursor: string;
  aromaDescriptors: string[];
  naturalSources: string[];
  cannabisOccurrence: CannabisOccurrence;
  cannabisContext: string;
  geneticsContext: string;
  cultivarContext: string;
  researchGuardrail: string;
  viewNotes: Record<TerpeneView, string>;
  sourceIds: string[];
};
