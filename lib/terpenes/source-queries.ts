import sourceRegistry from "@/data/terpenes/source-registry.json";

export type TerpeneSourceRegistryRecord = {
  id: string;
  name: string;
  role?: string;
  sourceUrl?: string;
  doi?: string;
  pmid?: string;
  pmcid?: string;
  license?: string;
  notes?: string;
};

const sources = sourceRegistry.sources as TerpeneSourceRegistryRecord[];
const byId = new Map(sources.map((source) => [source.id, source]));

export function getTerpeneSourceById(sourceId: string) {
  return byId.get(sourceId) ?? null;
}
