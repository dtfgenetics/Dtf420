import tpsData from "@/data/terpenes/tps-genes.json";
import evidenceLedger from "@/data/terpenes/evidence-ledger.json";

export type TpsProduct = {
  slug: string;
  label: string;
  evidenceId?: string;
  status?: "identified" | "tentative";
};

export type TpsGeneRecord = {
  id: string;
  strainOrigin: string;
  subfamily: string | null;
  primarySubstrate: string;
  testedSubstrates: string[];
  majorProducts: TpsProduct[];
  minorProducts: TpsProduct[];
  sourceLocator: string;
};

export const tpsGenes = tpsData.genes as TpsGeneRecord[];

const evidenceById = new Map(evidenceLedger.records.map((record) => [record.id, record]));

export function getTpsEvidence(evidenceId: string) {
  return evidenceById.get(evidenceId) ?? null;
}

export function getGenesForCompound(compoundSlug: string) {
  return tpsGenes.filter((gene) =>
    [...gene.majorProducts, ...gene.minorProducts].some((product) => product.slug === compoundSlug),
  );
}
