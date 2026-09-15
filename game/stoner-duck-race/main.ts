import Phaser from "phaser";
import { RaceScene } from "./scenes/RaceScene";
import type { DuckRaceLaunchOptions } from "./types";

const DEFAULT_OPTIONS: DuckRaceLaunchOptions = {
  mode: "rally",
  racerCount: 24,
  seed: "DTF-420",
  playerName: "YOU",
};

export function startStonerDuckRace(
  parent: string,
  options: Partial<DuckRaceLaunchOptions> = {},
): Phaser.Game {
  const launchOptions: DuckRaceLaunchOptions = {
    mode: options.mode ?? DEFAULT_OPTIONS.mode,
    racerCount: Math.max(1, Math.min(50, Math.floor(options.racerCount ?? DEFAULT_OPTIONS.racerCount))),
    seed: options.seed?.trim().slice(0, 64) || DEFAULT_OPTIONS.seed,
    playerName: options.playerName?.trim().slice(0, 24) || DEFAULT_OPTIONS.playerName,
  };

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 1280,
    height: 720,
    backgroundColor: "#102a32",
    scene: [new RaceScene(launchOptions)],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
    },
  });
}
