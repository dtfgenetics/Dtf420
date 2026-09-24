import propertyCache from "@/data/terpenes/reviewed-pubchem-properties.json";

export type ReviewedPubChemProperties = {
  CID?: number;
  Title?: string;
  MolecularFormula?: string;
  MolecularWeight?: string | number;
  SMILES?: string;
  ConnectivitySMILES?: string;
  InChI?: string;
  InChIKey?: string;
  IUPACName?: string;
  XLogP?: number;
  ExactMass?: string | number;
  MonoisotopicMass?: string | number;
  TPSA?: number;
  Complexity?: number;
  HBondDonorCount?: number;
  HBondAcceptorCount?: number;
  RotatableBondCount?: number;
  HeavyAtomCount?: number;
  IsotopeAtomCount?: number;
  AtomStereoCount?: number;
  DefinedAtomStereoCount?: number;
  UndefinedAtomStereoCount?: number;
  BondStereoCount?: number;
  DefinedBondStereoCount?: number;
  UndefinedBondStereoCount?: number;
};

export type ReviewedPubChemRecord = {
  slug: string;
  pubchemCid: number;
  sourceId: "PUBCHEM";
  fetchedAt: string;
  properties: ReviewedPubChemProperties;
};

type CacheShape = {
  schemaVersion: string;
  status: string;
  sourceId: string;
  generatedAt: string | null;
  compounds: ReviewedPubChemRecord[];
};

const cache = propertyCache as CacheShape;
const bySlug = new Map(cache.compounds.map((record) => [record.slug, record]));

export function getReviewedPubChemPropertyRecord(slug: string) {
  return bySlug.get(slug) ?? null;
}

export function getReviewedPubChemPropertyCacheStatus() {
  return {
    status: cache.status,
    generatedAt: cache.generatedAt,
    compoundCount: cache.compounds.length,
  };
}

export function summarizeStereochemistry(properties: ReviewedPubChemProperties) {
  return {
    atomStereoCount: properties.AtomStereoCount ?? 0,
    definedAtomStereoCount: properties.DefinedAtomStereoCount ?? 0,
    undefinedAtomStereoCount: properties.UndefinedAtomStereoCount ?? 0,
    bondStereoCount: properties.BondStereoCount ?? 0,
    definedBondStereoCount: properties.DefinedBondStereoCount ?? 0,
    undefinedBondStereoCount: properties.UndefinedBondStereoCount ?? 0,
    hasExplicitStereo:
      (properties.DefinedAtomStereoCount ?? 0) > 0 ||
      (properties.DefinedBondStereoCount ?? 0) > 0,
  };
}
