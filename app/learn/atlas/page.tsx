import type { Metadata } from "next";
import { LivingPlantAtlas } from "@/components/atlas/LivingPlantAtlas";
import { AtlasLearningModules } from "@/components/atlas/AtlasLearningModules";

export const metadata: Metadata = {
  title: "THC Living Plant Atlas",
  description: "Interactive cannabis plant anatomy, physiology, environment, and observation-first diagnostic learning tool from Teaching Healthy Cultivation.",
};

export default function AtlasPage() {
  return (
    <section className="shell page-section">
      <LivingPlantAtlas />
      <AtlasLearningModules />
    </section>
  );
}
