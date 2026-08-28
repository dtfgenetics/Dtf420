import type { Metadata } from "next";
import { LivingPlantAtlas } from "@/components/atlas/LivingPlantAtlas";
import { AtlasGrowthStages } from "@/components/atlas/AtlasGrowthStages";
import { AtlasVisualOverlays } from "@/components/atlas/AtlasVisualOverlays";
import { AtlasLearningModules } from "@/components/atlas/AtlasLearningModules";
import { buildEducationMetadata } from "@/lib/education-seo";

export const metadata: Metadata = buildEducationMetadata({
  title: "Living Plant Atlas Explorer",
  description: "Explore cannabis plant anatomy, physiology, development, environment, and observation-first diagnostic relationships.",
  path: "/learn/atlas",
});

export default function AtlasPage() {
  return (
    <section className="shell page-section">
      <LivingPlantAtlas />
      <AtlasGrowthStages />
      <AtlasVisualOverlays />
      <AtlasLearningModules />
    </section>
  );
}
