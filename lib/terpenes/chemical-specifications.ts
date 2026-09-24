import specificationCache from "@/data/terpenes/chemical-specifications.json";

export type TerpeneChemicalSpecification = {
  slug: string;
  pubchemCid: number;
  status: "enriched" | "not-found";
  sourceId: "PUBCHEM";
  title?: string | null;
  iupacName?: string | null;
  molecularFormula?: string | null;
  molecularWeight?: number | string | null;
  exactMass?: number | string | null;
  monoisotopicMass?: number | string | null;
  canonicalSmiles?: string | null;
  isomericSmiles?: string | null;
  inchi?: string | null;
  inchiKey?: string | null;
  xlogP?: number | string | null;
  topologicalPolarSurfaceArea?: number | string | null;
  complexity?: number | string | null;
  hydrogenBondDonorCount?: number | null;
  hydrogenBondAcceptorCount?: number | null;
  rotatableBondCount?: number | null;
};

type SpecificationCache = {
  schemaVersion: string;
  sourceId: string;
  generatedAt: string | null;
  status: string;
  records: TerpeneChemicalSpecification[];
};

const cache = specificationCache as SpecificationCache;
const bySlug = new Map(cache.records.map((record) => [record.slug, record]));

export function getTerpeneChemicalSpecification(slug: string) {
  return bySlug.get(slug) ?? null;
}

export function getTerpeneChemicalSpecificationCacheStatus() {
  return {
    status: cache.status,
    generatedAt: cache.generatedAt,
    recordCount: cache.records.length,
  };
}
