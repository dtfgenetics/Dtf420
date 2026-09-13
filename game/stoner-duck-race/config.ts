import type { RaceConfig, RaceModeId } from "./types";

export const DUCK_RACE_LIMITS = {
  minRacers: 1,
  normalRaceMax: 12,
  partyRaceMax: 24,
  massRaceMax: 50,
  spectatorTarget: 100,
} as const;

export const DEFAULT_TICK_RATE = 20;
export const DEFAULT_TRACK_LENGTH = 5_200;

export function createRaceConfig(
  mode: RaceModeId = "derby",
  racerCount = 12,
  seed = "DTF-420",
): RaceConfig {
  return {
    seed,
    mode,
    trackId: "kush-creek",
    trackLength: DEFAULT_TRACK_LENGTH,
    racerCount: Math.max(
      DUCK_RACE_LIMITS.minRacers,
      Math.min(DUCK_RACE_LIMITS.massRaceMax, Math.floor(racerCount)),
    ),
    tickRate: DEFAULT_TICK_RATE,
    countdownTicks: DEFAULT_TICK_RATE * 3,
  };
}
