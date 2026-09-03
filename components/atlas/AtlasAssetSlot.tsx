import Image from "next/image";
import type { AtlasAssetRecord } from "@/lib/atlas-assets";
import { AtlasAcheneVisual } from "./AtlasAcheneVisual";
import { AtlasPriorityVisual } from "./AtlasPriorityVisual";
import { AtlasProcessVisual } from "./AtlasProcessVisual";
import { AtlasConceptVisual } from "./AtlasConceptVisual";
import { AtlasCrossSystemVisual } from "./AtlasCrossSystemVisual";
import { AtlasCoreStructureVisual } from "./AtlasCoreStructureVisual";
import { AtlasGrowthDiagnosticVisual } from "./AtlasGrowthDiagnosticVisual";
import { AtlasFinalVisualA } from "./AtlasFinalVisualA";
import { AtlasFinalVisualB } from "./AtlasFinalVisualB";
import { AtlasAdvancedConceptVisual } from "./AtlasAdvancedConceptVisual";
import { AtlasSystemGraphic } from "./AtlasSystemGraphic";
import styles from "./AtlasAssetSlot.module.css";

const priorityInteractiveAssetIds = new Set([
  "atlas-root-architecture-v1",
  "atlas-healthy-leaf-baseline-v1",
  "atlas-female-flower-anatomy-v1",
  "atlas-trichome-types-v1",
]);

const processInteractiveAssetIds = new Set([
  "atlas-root-absorption-v1",
  "atlas-xylem-transport-v1",
  "atlas-stomata-transpiration-v1",
  "atlas-flower-development-v1",
  "atlas-trichome-gland-v1",
]);

const conceptInteractiveAssetIds = new Set([
  "atlas-imbibition-v1",
  "atlas-apical-dominance-v1",
  "atlas-photosynthesis-v1",
  "atlas-symptom-pattern-v1",
  "atlas-seed-formation-v1",
  "atlas-vpd-flow-v1",
]);

const crossSystemInteractiveAssetIds = new Set([
  "atlas-rhizosphere-v1",
  "atlas-phloem-v1",
  "atlas-pollen-pathway-v1",
  "atlas-ppfd-overlay-v1",
  "atlas-trichome-sampling-v1",
  "atlas-differential-v1",
]);

const coreStructureInteractiveAssetIds = new Set([
  "atlas-radicle-v1",
  "atlas-root-uptake-v1",
  "atlas-stem-cross-section-v1",
  "atlas-node-anatomy-v1",
  "atlas-pollination-response-v1",
  "atlas-rootzone-interaction-v1",
  "atlas-measurement-context-v1",
]);

const growthDiagnosticInteractiveAssetIds = new Set([
  "atlas-cotyledon-transition-v1",
  "atlas-root-stress-v1",
  "atlas-internode-v1",
  "atlas-topping-fim-v1",
  "atlas-lst-v1",
  "atlas-symptom-location-v1",
  "atlas-progression-v1",
]);

const finalAInteractiveAssetIds = new Set([
  "atlas-germination-failure-v1",
  "atlas-stem-damage-v1",
  "atlas-mainline-scrog-v1",
  "atlas-leaf-inspection-v1",
  "atlas-flower-initiation-v1",
  "atlas-maturity-risk-v1",
  "atlas-trichome-appearance-v1",
]);

const finalBInteractiveAssetIds = new Set([
  "atlas-microscope-workflow-v1",
  "atlas-preflowers-v1",
  "atlas-mixed-sex-v1",
  "atlas-controlled-pollination-v1",
  "atlas-temp-rh-v1",
  "atlas-boundary-layer-v1",
  "atlas-pattern-description-v1",
]);

const advancedInteractiveAssetIds = new Set([
  "atlas-seed-germination-reserve-mobilization-v0",
  "atlas-root-system-root-zone-oxygen-diffusion-v0",
  "atlas-stem-vascular-source-sink-integration-v0",
  "atlas-nodes-branching-branch-angle-and-mechanical-support-v0",
  "atlas-leaves-leaf-temperature-and-energy-balance-v0",
  "atlas-flowers-photoperiod-sensing-and-floral-transition-v0",
  "atlas-trichomes-resin-secretory-disk-and-storage-cavity-v0",
  "atlas-sex-pollen-seed-fertilization-and-seed-filling-v0",
  "atlas-environment-overlay-leaf-temperature-vs-air-temperature-v0",
  "atlas-diagnostic-overlay-genotype-environment-context-v0",
]);

function AtlasSystemStudyVisual({ asset }: { asset: AtlasAssetRecord }) {
  return (
    <div className={styles.studyFrame} data-atlas-visual="system-study-map">
      <div className={styles.studyGraphic}>
        <AtlasSystemGraphic systemId={asset.systemId} />
      </div>
      <div className={styles.studyCopy}>
        <p>Interactive system study map</p>
        <h2>{asset.lessonTitle}</h2>
        <strong>{asset.visualSpec}</strong>
        <span>
          Use the highlighted system as the anatomical context for this lesson, then connect it with the observation prompts,
          evidence sources, and knowledge check below. The production media slot can be upgraded later without leaving the
          lesson visually empty today.
        </span>
        <dl>
          <div><dt>System</dt><dd>{asset.systemLabel}</dd></div>
          <div><dt>Study lens</dt><dd>{asset.assetType.replaceAll("-", " ")}</dd></div>
          <div><dt>Visual state</dt><dd>Teaching fallback active</dd></div>
        </dl>
      </div>
    </div>
  );
}

export function AtlasAssetSlot({ asset }: { asset: AtlasAssetRecord }) {
  const acheneInteractive = asset.assetId === "atlas-seed-anatomy-v1";
  const priorityInteractive = priorityInteractiveAssetIds.has(asset.assetId);
  const processInteractive = processInteractiveAssetIds.has(asset.assetId);
  const conceptInteractive = conceptInteractiveAssetIds.has(asset.assetId);
  const crossSystemInteractive = crossSystemInteractiveAssetIds.has(asset.assetId);
  const coreStructureInteractive = coreStructureInteractiveAssetIds.has(asset.assetId);
  const growthDiagnosticInteractive = growthDiagnosticInteractiveAssetIds.has(asset.assetId);
  const finalAInteractive = finalAInteractiveAssetIds.has(asset.assetId);
  const finalBInteractive = finalBInteractiveAssetIds.has(asset.assetId);
  const advancedInteractive = advancedInteractiveAssetIds.has(asset.assetId);

  return (
    <section className={styles.assetSlot} aria-label="Atlas primary visual">
      {acheneInteractive ? (
        <AtlasAcheneVisual />
      ) : priorityInteractive ? (
        <AtlasPriorityVisual assetId={asset.assetId} />
      ) : processInteractive ? (
        <AtlasProcessVisual assetId={asset.assetId} />
      ) : conceptInteractive ? (
        <AtlasConceptVisual assetId={asset.assetId} />
      ) : crossSystemInteractive ? (
        <AtlasCrossSystemVisual assetId={asset.assetId} />
      ) : coreStructureInteractive ? (
        <AtlasCoreStructureVisual assetId={asset.assetId} />
      ) : growthDiagnosticInteractive ? (
        <AtlasGrowthDiagnosticVisual assetId={asset.assetId} />
      ) : finalAInteractive ? (
        <AtlasFinalVisualA assetId={asset.assetId} />
      ) : finalBInteractive ? (
        <AtlasFinalVisualB assetId={asset.assetId} />
      ) : advancedInteractive ? (
        <AtlasAdvancedConceptVisual assetId={asset.assetId} />
      ) : asset.path ? (
        <div className={styles.imageFrame}>
          <Image src={asset.path} alt={asset.altText} fill sizes="(max-width: 900px) 100vw, 65vw" priority />
        </div>
      ) : (
        <AtlasSystemStudyVisual asset={asset} />
      )}
    </section>
  );
}
