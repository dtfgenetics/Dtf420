import coreSources from "@/content/education-sources.json";
import abioticSources from "@/content/education-sources-abiotic.json";
import seedAnatomySources from "@/content/education-sources-seed-anatomy.json";
import plantHealthIpmSources from "@/content/education-sources-plant-health-ipm.json";
import atlasStemSources from "@/content/education-sources-atlas-stems.json";
import atlasNodeSources from "@/content/education-sources-atlas-nodes.json";
import sourceMap from "@/content/education-source-map.json";
import seedAnatomySourceMap from "@/content/education-source-map-seed-anatomy.json";
import atlasStemSourceMap from "@/content/education-source-map-atlas-stems.json";
import atlasNodeSourceMap from "@/content/education-source-map-atlas-nodes.json";
import atlasSourceDefaults from "@/content/atlas-source-defaults.json";

const sources = [...coreSources, ...abioticSources, ...seedAnatomySources, ...plantHealthIpmSources, ...atlasStemSources, ...atlasNodeSources];
type EducationSource = (typeof sources)[number];
type SourceMap = Record<string, string[]>;

const sourcesById = new Map(sources.map((source) => [source.id, source]));
const mappedSources = {
  ...(sourceMap as SourceMap),
  ...(seedAnatomySourceMap as SourceMap),
  ...(atlasStemSourceMap as SourceMap),
  ...(atlasNodeSourceMap as SourceMap),
} as SourceMap;
const atlasDefaults = atlasSourceDefaults as SourceMap;

function atlasSystemIdFromPath(path: string) {
  const match = path.match(/^\/learn\/atlas\/([^/]+)(?:\/|$)/);
  if (!match) return null;
  return match[1].replaceAll("-", "_");
}

export function getEducationSources(path: string): EducationSource[] {
  const directIds = mappedSources[path] ?? [];
  const atlasSystemId = atlasSystemIdFromPath(path);
  const defaultIds = atlasSystemId ? atlasDefaults[atlasSystemId] ?? [] : [];
  const ids = [...new Set([...directIds, ...defaultIds])];

  return ids.flatMap((id) => {
    const source = sourcesById.get(id);
    return source ? [source] : [];
  });
}
