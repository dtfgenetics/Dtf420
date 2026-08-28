"use client";

import styles from "./page.module.css";

export function PrintButton() {
  return (
    <button className={styles.printButton} type="button" onClick={() => window.print()}>
      Print this worksheet
    </button>
  );
}
