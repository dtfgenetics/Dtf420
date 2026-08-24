import { AUTO, Game, Scale } from "phaser";
import { BootScene } from "@/game/burn-buds/scenes/BootScene";

export function startBurnBuds(parent: string) {
  return new Game({
    type: AUTO,
    parent,
    width: 900,
    height: 640,
    backgroundColor: "#07110b",
    scene: [BootScene],
    scale: {
      mode: Scale.FIT,
      autoCenter: Scale.CENTER_BOTH,
    },
  });
}
