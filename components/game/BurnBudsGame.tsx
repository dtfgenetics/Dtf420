"use client";

import { useLayoutEffect, useRef } from "react";
import type { Game } from "phaser";
import { startBurnBuds } from "@/game/burn-buds/main";

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
    <div className="game-shell">
      <div id={GAME_PARENT_ID} className="game-canvas" aria-label="Burn Buds game canvas" />
      <p className="game-note">Engine check: responsive Phaser canvas · 15 × 15 board · client-only runtime</p>
    </div>
  );
}
