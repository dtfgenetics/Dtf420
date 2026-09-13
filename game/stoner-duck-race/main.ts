import Phaser from "phaser";
import { RaceScene } from "./scenes/RaceScene";

export function startStonerDuckRace(parent: string): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 1280,
    height: 720,
    backgroundColor: "#102a32",
    scene: [RaceScene],
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
