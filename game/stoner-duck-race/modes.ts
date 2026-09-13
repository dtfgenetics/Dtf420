import type { RaceModeId, RaceModeProfile } from "./types";

export const RACE_MODE_PROFILES: Record<RaceModeId, RaceModeProfile> = {
  derby: {
    id: "derby",
    humanControl: false,
    aiForUnclaimedDucks: true,
    chaosEvents: false,
    softBodyPush: 0.08,
    powerupFrequency: 0.55,
    catchupStrength: 0.08,
  },
  rally: {
    id: "rally",
    humanControl: true,
    aiForUnclaimedDucks: true,
    chaosEvents: false,
    softBodyPush: 0.16,
    powerupFrequency: 0.75,
    catchupStrength: 0.04,
  },
  chaos: {
    id: "chaos",
    humanControl: true,
    aiForUnclaimedDucks: true,
    chaosEvents: true,
    softBodyPush: 0.2,
    powerupFrequency: 1,
    catchupStrength: 0.12,
  },
};

export function getRaceModeProfile(mode: RaceModeId): RaceModeProfile {
  return RACE_MODE_PROFILES[mode];
}
