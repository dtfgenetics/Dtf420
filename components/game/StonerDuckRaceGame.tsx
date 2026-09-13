"use client";

import { useLayoutEffect, useRef } from "react";
import type { Game } from "phaser";
import { startStonerDuckRace } from "@/game/stoner-duck-race/main";
import styles from "./StonerDuckRaceGame.module.css";

const GAME_PARENT_ID = "stoner-duck-race-game";

export function StonerDuckRaceGame() {
  const gameRef = useRef<Game | null>(null);

  useLayoutEffect(() => {
    if (gameRef.current === null) {
      gameRef.current = startStonerDuckRace(GAME_PARENT_ID);
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
        aria-label="Stoner Duck Race 50-racer prototype"
      />
    </div>
  );
}
