"use client";

import { useLayoutEffect, useRef } from "react";
import type { Game } from "phaser";
import { startBurnBuds } from "@/game/burn-buds/main";
import styles from "./BurnBudsGame.module.css";

const GAME_PARENT_ID = "burn-buds-game";

export function BurnBudsGame() {
  const gameRef = useRef<Game | null>(null);

  useLayoutEffect(() => {
    if (gameRef.current === null) {
      gameRef.current = startBurnBuds(GAME_PARENT_ID);
    }

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className={styles.shell}>
      <div
        id={GAME_PARENT_ID}
        className={styles.canvas}
        aria-label="Burn Buds 15 by 15 tactical fleet battle"
      />
    </div>
  );
}
