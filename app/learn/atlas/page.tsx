import type { Metadata } from "next";
import { LivingPlantAtlas } from "@/components/atlas/LivingPlantAtlas";
import { AtlasSystemStatusGrid } from "@/components/atlas/AtlasSystemStatusGrid";
import { AtlasGrowthStages } from "@/components/atlas/AtlasGrowthStages";
import { AtlasVisualOverlays } from "@/components/atlas/AtlasVisualOverlays";
import { AtlasOverlayLearningBridge } from "@/components/atlas/AtlasOverlayLearningBridge";
import { AtlasLearningModules } from "@/components/atlas/AtlasLearningModules";
import { buildEducationMetadata } from "@/lib/education-seo";
import styles from "./AtlasPage.module.css";

export const metadata: Metadata = buildEducationMetadata({
  title: "Living Plant Atlas Explorer",
  description: "Explore cannabis plant anatomy, physiology, development, environment, and observation-first diagnostic relationships.",
  path: "/learn/atlas",
});

export default function AtlasPage() {
  return (
    <section className={`page-section ${styles.atlasPage}`}>
      <div className={styles.atlasWorkspace} data-atlas-workspace="immersive">
        <LivingPlantAtlas />
      </div>
      <div className={styles.atlasLearningContent}>
        <AtlasSystemStatusGrid />
        <AtlasGrowthStages />
        <AtlasVisualOverlays />
        <AtlasOverlayLearningBridge />
        <AtlasLearningModules />
      </div>
    </section>
  );
}
