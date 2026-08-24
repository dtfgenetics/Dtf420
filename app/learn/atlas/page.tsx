import type { Metadata } from "next";
import { LivingPlantAtlas } from "@/components/atlas/LivingPlantAtlas";
import { AtlasGrowthStages } from "@/components/atlas/AtlasGrowthStages";
import { AtlasVisualOverlays } from "@/components/atlas/AtlasVisualOverlays";
import { AtlasLearningModules } from "@/components/atlas/AtlasLearningModules";

export const metadata: Metadata = {
  title: "THC Living Plant Atlas",
  description: "Interactive cannabis plant anatomy, physiology, development, environment, and observation-first diagnostic learning tool from Teaching Healthy Cultivation.",
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
