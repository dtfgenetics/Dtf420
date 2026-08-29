"use client";

import dynamic from "next/dynamic";
import styles from "./BurnBudsGame.module.css";

const BurnBudsGame = dynamic(
  () => import("@/components/game/BurnBudsGame").then((module) => module.BurnBudsGame),
  {
    ssr: false,
    loading: () => (
      <div className={`${styles.shell} ${styles.loading}`} role="status">
        <span className={styles.loadingInner}>Preparing board preview…</span>
      </div>
    ),
  },
);

export function BurnBudsLoader() {
  return <BurnBudsGame />;
}
