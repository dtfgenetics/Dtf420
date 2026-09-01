import { AUTO, Game, Scale } from "phaser";
import { BootScene } from "@/game/burn-buds/scenes/BootScene";

export const BURN_BUDS_WIDTH = 600;
export const BURN_BUDS_HEIGHT = 840;

export function startBurnBuds(parent: string) {
  return new Game({
    type: AUTO,
    parent,
    width: BURN_BUDS_WIDTH,
    height: BURN_BUDS_HEIGHT,
    backgroundColor: "#06100a",
    scene: [BootScene],
    input: {
      activePointers: 3,
    },
    scale: {
      mode: Scale.FIT,
      autoCenter: Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: true,
    },
  });
}
