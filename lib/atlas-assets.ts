import modules from "@/content/atlas-learning-modules.json";
import codeNativeVisuals from "@/content/atlas-code-native-visuals.json";
import { atlasAssetOverrides } from "@/lib/atlas-asset-manifests";

export type AtlasAssetStatus = "needed" | "brief_ready" | "in_production" | "ready" | "review";
export type AtlasLearnerSurface = "code-native" | "production-media" | "system-study-map";
export type AtlasCodeNativeRenderer =
  | "achene"
  | "priority"
  | "process"
  | "concept"
  | "cross-system"
  | "core-structure"
  | "growth-diagnostic"
  | "final-a"
  | "final-b"
  | "advanced";

export type AtlasAssetRecord = {
  key: string;
  assetId: string;
  systemId: string;
  systemLabel: string;
  lessonTitle: string;
  lessonSlug: string;
  visualSpec: string;
  status: AtlasAssetStatus;
  version: number;
  assetType: string;
  path: string | null;
  altText: string;
  productionBrief: string;
  learnerSurface: AtlasLearnerSurface;
  renderer: AtlasCodeNativeRenderer | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const overrideMap = new Map(atlasAssetOverrides.map((item) => [item.key, item]));
const rendererMap = new Map(
  codeNativeVisuals.renderers.map((item) => [item.assetId, item.renderer as AtlasCodeNativeRenderer]),
);

export const atlasAssetRegistry: AtlasAssetRecord[] = modules.flatMap((atlasModule) =>
  atlasModule.lessons.map((lesson) => {
    const systemSlug = slugify(atlasModule.id);
    const lessonSlug = slugify(lesson.title);
    const key = `${systemSlug}__${lessonSlug}`;
    const override = overrideMap.get(key);
    const assetId = override?.assetId ?? `atlas-${systemSlug}-${lessonSlug}-v0`;
    const status = (override?.status ?? "needed") as AtlasAssetStatus;
    const path = override?.path ?? null;
    const renderer = rendererMap.get(assetId) ?? null;
    const learnerSurface: AtlasLearnerSurface = renderer
      ? "code-native"
      : status === "ready" && path
        ? "production-media"
        : "system-study-map";

    return {
      key,
      assetId,
      systemId: atlasModule.id,
      systemLabel: atlasModule.label,
      lessonTitle: lesson.title,
      lessonSlug,
      visualSpec: lesson.visual,
      status,
      version: override?.version ?? 0,
      assetType: override?.assetType ?? "lesson-visual",
      path,
      altText: override?.altText ?? `${lesson.visual} for the ${lesson.title} lesson in the THC Living Plant Atlas.`,
      productionBrief:
        override?.productionBrief ??
        `Create an academically accurate ${lesson.visual.toLowerCase()} for the ${lesson.title} lesson. Use neutral studio lighting or clean academic illustration conventions, realistic botanical proportions, readable labels where needed, no yellow cast, and no decorative elements that compete with the teaching objective.`,
      learnerSurface,
      renderer,
    };
  }),
);

export function getAtlasAsset(systemId: string, lessonTitle: string) {
  const key = `${slugify(systemId)}__${slugify(lessonTitle)}`;
  return atlasAssetRegistry.find((asset) => asset.key === key);
}

export function getAtlasAssetCounts() {
  return atlasAssetRegistry.reduce(
    (counts, asset) => {
      counts.total += 1;
      counts[asset.status] += 1;
      return counts;
    },
    { total: 0, needed: 0, brief_ready: 0, in_production: 0, ready: 0, review: 0 } as Record<AtlasAssetStatus | "total", number>,
  );
}

export function getAtlasLearnerSurfaceCounts() {
  return atlasAssetRegistry.reduce(
    (counts, asset) => {
      counts.total += 1;
      counts[asset.learnerSurface] += 1;
      return counts;
    },
    { total: 0, "code-native": 0, "production-media": 0, "system-study-map": 0 } as Record<AtlasLearnerSurface | "total", number>,
  );
}
