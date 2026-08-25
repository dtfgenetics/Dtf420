import type { Metadata } from "next";
import Link from "next/link";
import { LivingPlantAtlas } from "@/components/atlas/LivingPlantAtlas";
import { AtlasGrowthStages } from "@/components/atlas/AtlasGrowthStages";
import { AtlasVisualOverlays } from "@/components/atlas/AtlasVisualOverlays";
import { AtlasLearningModules } from "@/components/atlas/AtlasLearningModules";
import { AtlasProgressOverview } from "@/components/atlas/AtlasLearningProgress";
import { AtlasMasteryOverview } from "@/components/atlas/AtlasMastery";

export const metadata: Metadata = {
  title: "THC Living Plant Atlas",
  description: "Interactive cannabis plant anatomy, physiology, development, environment, and observation-first diagnostic learning tool from Teaching Healthy Cultivation.",
};

export default function AtlasPage() {
  return (
    <section className="shell page-section">
      <LivingPlantAtlas />
      <div className="hero__actions">
        <Link className="button button--primary" href="/learn/atlas/dashboard">Open study dashboard</Link>
        <Link className="button" href="/learn/atlas/notebook">Open observation notebook</Link>
        <Link className="button" href="/learn/atlas/notebook/compare">Compare saved observations</Link>
        <Link className="button" href="/learn/atlas/cases">Practice diagnostic cases</Link>
        <Link className="button" href="/learn/atlas/paths">Follow guided learning paths</Link>
        <Link className="button" href="/learn/atlas/review">Open mastery review lab</Link>
        <Link className="button" href="/learn/atlas/compare">Compare plant systems side by side</Link>
        <Link className="button" href="/learn/atlas/mastery">View mastery passport</Link>
      </div>
      <AtlasProgressOverview />
      <AtlasMasteryOverview />
      <AtlasGrowthStages />
      <AtlasVisualOverlays />
      <AtlasLearningModules />
    </section>
  );
}
