import sources from "@/content/education-sources.json";
import sourceMap from "@/content/education-source-map.json";

type EducationSource = (typeof sources)[number];
type SourceMap = Record<string, string[]>;

const sourcesById = new Map(sources.map((source) => [source.id, source]));
const mappedSources = sourceMap as SourceMap;

export function getEducationSources(path: string): EducationSource[] {
  const ids = mappedSources[path] ?? [];
  return ids.flatMap((id) => {
    const source = sourcesById.get(id);
    return source ? [source] : [];
  });
}
