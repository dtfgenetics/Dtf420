import { getTrackDefinition } from "./tracks.js";
import type { RaceConfig, RaceModeId, TrackId } from "./types.js";

export const DUCK_RACE_LIMITS = {
  minRacers: 1,
  normalRaceMax: 12,
  partyRaceMax: 24,
  massRaceMax: 50,
  spectatorTarget: 100,
} as const;

export const DEFAULT_TICK_RATE = 20;
export const DEFAULT_TRACK_ID: TrackId = "kush-creek";

export function createRaceConfig(
  mode: RaceModeId = "derby",
  racerCount = 12,
  seed = "DTF-420",
  trackId: TrackId = DEFAULT_TRACK_ID,
): RaceConfig {
  const track = getTrackDefinition(trackId);

  return {
    seed,
    mode,
    trackId: track.id,
    trackLength: track.length,
    racerCount: Math.max(
      DUCK_RACE_LIMITS.minRacers,
      Math.min(DUCK_RACE_LIMITS.massRaceMax, Math.floor(racerCount)),
    ),
    tickRate: DEFAULT_TICK_RATE,
    countdownTicks: DEFAULT_TICK_RATE * 3,
  };
}
