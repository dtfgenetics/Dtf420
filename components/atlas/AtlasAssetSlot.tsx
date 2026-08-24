import Image from "next/image";
import type { AtlasAssetRecord } from "@/lib/atlas-assets";
import { AtlasPriorityVisual } from "./AtlasPriorityVisual";
import { AtlasProcessVisual } from "./AtlasProcessVisual";
import { AtlasConceptVisual } from "./AtlasConceptVisual";
import { AtlasCrossSystemVisual } from "./AtlasCrossSystemVisual";
import styles from "./AtlasAssetSlot.module.css";

const statusLabels: Record<AtlasAssetRecord["status"], string> = {
  needed: "Visual needed",
  brief_ready: "Production brief ready",
  in_production: "In production",
  ready: "Production visual",
  review: "Visual under review",
};

const priorityInteractiveAssetIds = new Set([
  "atlas-seed-anatomy-v1",
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

export function AtlasAssetSlot({ asset }: { asset: AtlasAssetRecord }) {
  const priorityInteractive = priorityInteractiveAssetIds.has(asset.assetId);
  const processInteractive = processInteractiveAssetIds.has(asset.assetId);
  const conceptInteractive = conceptInteractiveAssetIds.has(asset.assetId);
  const crossSystemInteractive = crossSystemInteractiveAssetIds.has(asset.assetId);

  return (
    <section className={styles.assetSlot} aria-label="Atlas primary visual">
      <div className={styles.topline}>
        <span>{statusLabels[asset.status]}</span>
        <small>{asset.assetId} · v{asset.version}</small>
      </div>

      {priorityInteractive ? (
        <AtlasPriorityVisual assetId={asset.assetId} />
      ) : processInteractive ? (
        <AtlasProcessVisual assetId={asset.assetId} />
      ) : conceptInteractive ? (
        <AtlasConceptVisual assetId={asset.assetId} />
      ) : crossSystemInteractive ? (
        <AtlasCrossSystemVisual assetId={asset.assetId} />
      ) : asset.path ? (
        <div className={styles.imageFrame}>
          <Image src={asset.path} alt={asset.altText} fill sizes="(max-width: 900px) 100vw, 65vw" priority />
        </div>
      ) : (
        <div className={styles.briefFrame}>
          <div>
            <p>Primary visual specification</p>
            <h2>{asset.visualSpec}</h2>
          </div>
          <p>{asset.productionBrief}</p>
          <dl>
            <div><dt>Asset type</dt><dd>{asset.assetType.replaceAll("-", " ")}</dd></div>
            <div><dt>System</dt><dd>{asset.systemLabel}</dd></div>
            <div><dt>Alt text prepared</dt><dd>Yes</dd></div>
          </dl>
        </div>
      )}
    </section>
  );
}
