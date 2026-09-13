"use client";

import dynamic from "next/dynamic";
import styles from "./StonerDuckRaceGame.module.css";

const StonerDuckRaceGame = dynamic(
  () => import("@/components/game/StonerDuckRaceGame").then((module) => module.StonerDuckRaceGame),
  {
    ssr: false,
    loading: () => (
      <div className={`${styles.shell} ${styles.loading}`} role="status">
        <span className={styles.loadingInner}>Launching the duck derby…</span>
      </div>
    ),
  },
);

export function StonerDuckRaceLoader() {
  return <StonerDuckRaceGame />;
}
