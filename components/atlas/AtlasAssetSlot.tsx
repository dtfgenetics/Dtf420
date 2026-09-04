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

function AtlasSystemStudyVisual({ asset }: { asset: AtlasAssetRecord }) {
  return (
    <div className={styles.studyFrame} data-atlas-visual="system-study-map">
      <div className={styles.studyGraphic}>
        <AtlasSystemGraphic systemId={asset.systemId} />
      </div>
      <div className={styles.studyCopy}>
        <p>System study map</p>
        <h2>{asset.lessonTitle}</h2>
        <strong>{asset.visualSpec}</strong>
        <span>
          Start with the highlighted plant system as the anatomical context. Then compare the lesson observations with the
          evidence sources and knowledge check below so structure, process, and whole-plant consequences stay connected.
        </span>
        <dl>
          <div><dt>Plant system</dt><dd>{asset.systemLabel}</dd></div>
          <div><dt>Lesson focus</dt><dd>{asset.visualSpec}</dd></div>
          <div><dt>Study mode</dt><dd>Whole-plant context</dd></div>
        </dl>
      </div>
    </div>
  );
}

function AtlasCodeNativeVisual({ asset }: { asset: AtlasAssetRecord }) {
  switch (asset.renderer) {
    case "achene":
      return <AtlasAcheneVisual />;
    case "priority":
      return <AtlasPriorityVisual assetId={asset.assetId} />;
    case "process":
      return <AtlasProcessVisual assetId={asset.assetId} />;
    case "concept":
      return <AtlasConceptVisual assetId={asset.assetId} />;
    case "cross-system":
      return <AtlasCrossSystemVisual assetId={asset.assetId} />;
    case "core-structure":
      return <AtlasCoreStructureVisual assetId={asset.assetId} />;
    case "growth-diagnostic":
      return <AtlasGrowthDiagnosticVisual assetId={asset.assetId} />;
    case "final-a":
      return <AtlasFinalVisualA assetId={asset.assetId} />;
    case "final-b":
      return <AtlasFinalVisualB assetId={asset.assetId} />;
    case "advanced":
      return <AtlasAdvancedConceptVisual assetId={asset.assetId} />;
    default:
      return null;
  }
}

export function AtlasAssetSlot({ asset }: { asset: AtlasAssetRecord }) {
  return (
    <section
      className={styles.assetSlot}
      aria-label="Atlas primary visual"
      data-atlas-learner-surface={asset.learnerSurface}
      data-atlas-renderer={asset.renderer ?? undefined}
    >
      {asset.learnerSurface === "code-native" ? (
        <AtlasCodeNativeVisual asset={asset} />
      ) : asset.learnerSurface === "production-media" && asset.path ? (
        <div className={styles.imageFrame}>
          <Image src={asset.path} alt={asset.altText} fill sizes="(max-width: 900px) 100vw, 65vw" priority />
        </div>
      ) : (
        <AtlasSystemStudyVisual asset={asset} />
      )}
    </section>
  );
}
