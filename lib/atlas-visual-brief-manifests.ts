import completion from "@/content/atlas-completion-visual-briefs.json";
import flowers from "@/content/atlas-flowers-visual-briefs.json";
import leaves from "@/content/atlas-leaves-visual-briefs.json";
import nodesBranching from "@/content/atlas-nodes-branching-visual-briefs.json";
import stemVascular from "@/content/atlas-stem-vascular-visual-briefs.json";
import trichomes from "@/content/atlas-trichomes-visual-briefs.json";

export type AtlasVisualBrief = {
  route: string;
  title: string;
  brief: string;
};

export const atlasVisualBriefs: AtlasVisualBrief[] = [
  ...completion,
  ...flowers,
  ...leaves,
  ...nodesBranching,
  ...stemVascular,
  ...trichomes,
] as AtlasVisualBrief[];
