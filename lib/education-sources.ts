import sources from "@/content/education-sources.json";
import sourceMap from "@/content/education-source-map.json";
import atlasSourceDefaults from "@/content/atlas-source-defaults.json";

type EducationSource = (typeof sources)[number];
type SourceMap = Record<string, string[]>;

const sourcesById = new Map(sources.map((source) => [source.id, source]));
const mappedSources = sourceMap as SourceMap;
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
