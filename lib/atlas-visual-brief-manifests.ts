import nodeBriefs from "@/content/atlas-nodes-branching-visual-briefs.json";
import leafBriefs from "@/content/atlas-leaves-visual-briefs.json";
import flowerBriefs from "@/content/atlas-flowers-visual-briefs.json";
import trichomeBriefs from "@/content/atlas-trichomes-visual-briefs.json";
import completionBriefs from "@/content/atlas-completion-visual-briefs.json";
import stemBriefs from "@/content/atlas-stem-vascular-visual-briefs.json";

export type AtlasVisualBrief = {
  route: string;
  title: string;
  assetType: string;
  brief: string;
};

type RawVisualBrief = {
  route: string;
  lesson?: string;
  title?: string;
  assetType?: string;
  brief: string;
};

const rawBriefs: RawVisualBrief[] = [
  ...(nodeBriefs as RawVisualBrief[]),
  ...(leafBriefs as RawVisualBrief[]),
  ...(flowerBriefs as RawVisualBrief[]),
  ...(trichomeBriefs as RawVisualBrief[]),
  ...(completionBriefs as RawVisualBrief[]),
  ...(stemBriefs as RawVisualBrief[]),
];

export const atlasVisualBriefs: AtlasVisualBrief[] = rawBriefs.map((item) => ({
  route: item.route,
  title: item.title ?? item.lesson ?? "Untitled Atlas lesson",
  assetType: item.assetType ?? "lesson-specific-production-brief",
  brief: item.brief,
}));
