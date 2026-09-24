import stereoRegistry from "@/data/terpenes/stereoisomer-registry.json";

export type TerpeneStereoIsomer = {
  label: string;
  configuration: string;
  rotation: "+" | "-";
  pubchemCid: number;
  casNumber: string | null;
  chapterIdentity?: boolean;
};

export type TerpeneStereoRegistryEntry = {
  slug: string;
  parentCid: number;
  parentIdentityScope: "stereo-unspecified" | "stereospecific";
  summary: string;
  isomers: TerpeneStereoIsomer[];
};

type RegistryShape = {
  schemaVersion: string;
  sourceId: string;
  compounds: TerpeneStereoRegistryEntry[];
};

const registry = stereoRegistry as RegistryShape;
const bySlug = new Map(registry.compounds.map((entry) => [entry.slug, entry]));

export function getTerpeneStereoRegistryEntry(slug: string) {
  return bySlug.get(slug) ?? null;
}

export function getTerpeneStereoRegistryCount() {
  return registry.compounds.length;
}
