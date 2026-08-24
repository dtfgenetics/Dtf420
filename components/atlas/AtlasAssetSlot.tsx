import Image from "next/image";
import type { AtlasAssetRecord } from "@/lib/atlas-assets";
import styles from "./AtlasAssetSlot.module.css";

const statusLabels: Record<AtlasAssetRecord["status"], string> = {
  needed: "Visual needed",
  brief_ready: "Production brief ready",
  in_production: "In production",
  ready: "Production visual",
  review: "Visual under review",
};

export function AtlasAssetSlot({ asset }: { asset: AtlasAssetRecord }) {
  return (
    <section className={styles.assetSlot} aria-label="Atlas primary visual">
      <div className={styles.topline}>
        <span>{statusLabels[asset.status]}</span>
        <small>{asset.assetId} · v{asset.version}</small>
      </div>

      {asset.path ? (
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
