import Phaser from "phaser";
import { RaceScene } from "./scenes/RaceScene";
import type { DuckRaceRoomConnection } from "./network";
import type { DuckRaceReplay } from "./replay";
import type { DuckRaceLaunchOptions, DuckRaceResult } from "./types";

const DEFAULT_OPTIONS: DuckRaceLaunchOptions = {
  mode: "rally",
  trackId: "kush-creek",
  racerCount: 24,
  seed: "DTF-420",
  playerName: "YOU",
  characterId: "mellow-mallard",
};

export function startStonerDuckRace(
  parent: string,
  options: Partial<DuckRaceLaunchOptions> = {},
  networkConnection?: DuckRaceRoomConnection,
  onRaceFinished?: (result: DuckRaceResult) => void,
  playbackReplay?: DuckRaceReplay,
  onReplayReady?: (replay: DuckRaceReplay) => void,
): Phaser.Game {
  const launchOptions: DuckRaceLaunchOptions = playbackReplay
    ? {
        mode: playbackReplay.mode,
        trackId: playbackReplay.trackId,
        racerCount: Math.max(1, Math.min(50, Math.floor(playbackReplay.racerCount))),
        seed: playbackReplay.seed.trim().slice(0, 64) || DEFAULT_OPTIONS.seed,
        playerName: playbackReplay.playerName.trim().slice(0, 24) || DEFAULT_OPTIONS.playerName,
        characterId: playbackReplay.characterId.trim() || DEFAULT_OPTIONS.characterId,
      }
    : {
        mode: options.mode ?? DEFAULT_OPTIONS.mode,
        trackId: options.trackId ?? DEFAULT_OPTIONS.trackId,
        racerCount: Math.max(1, Math.min(50, Math.floor(options.racerCount ?? DEFAULT_OPTIONS.racerCount))),
        seed: options.seed?.trim().slice(0, 64) || DEFAULT_OPTIONS.seed,
        playerName: options.playerName?.trim().slice(0, 24) || DEFAULT_OPTIONS.playerName,
        characterId: options.characterId?.trim() || DEFAULT_OPTIONS.characterId,
      };

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 1280,
    height: 720,
    backgroundColor: "#102a32",
    scene: [new RaceScene(
      launchOptions,
      networkConnection,
      onRaceFinished,
      playbackReplay,
      onReplayReady,
    )],
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
