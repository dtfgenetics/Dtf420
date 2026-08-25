import type { Metadata } from "next";
import { LivingPlantAtlas } from "@/components/atlas/LivingPlantAtlas";
import { AtlasGrowthStages } from "@/components/atlas/AtlasGrowthStages";
import { AtlasVisualOverlays } from "@/components/atlas/AtlasVisualOverlays";
import { AtlasLearningModules } from "@/components/atlas/AtlasLearningModules";

export const metadata: Metadata = {
  title: "Living Plant Atlas Explorer",
  description: "Explore cannabis plant anatomy, physiology, development, environment, and observation-first diagnostic relationships.",
};

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
