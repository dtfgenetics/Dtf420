import type { DuckRaceResult, TrackId } from "./types";

const STORAGE_KEY = "dtf.stoner-duck-race.profile.v1";

export interface DuckRaceProfile {
  version: 1;
  races: number;
  wins: number;
  podiums: number;
  coins: number;
  bestRankByTrack: Partial<Record<TrackId, number>>;
  bestTimeByTrack: Partial<Record<TrackId, number>>;
}

export const EMPTY_DUCK_RACE_PROFILE: DuckRaceProfile = {
  version: 1,
  races: 0,
  wins: 0,
  podiums: 0,
  coins: 0,
  bestRankByTrack: {},
  bestTimeByTrack: {},
};

export function loadDuckRaceProfile(): DuckRaceProfile {
  if (typeof window === "undefined") return EMPTY_DUCK_RACE_PROFILE;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<DuckRaceProfile> | null;
    if (!parsed || parsed.version !== 1) return EMPTY_DUCK_RACE_PROFILE;
    return {
      version: 1,
      races: Math.max(0, Math.floor(parsed.races ?? 0)),
      wins: Math.max(0, Math.floor(parsed.wins ?? 0)),
      podiums: Math.max(0, Math.floor(parsed.podiums ?? 0)),
      coins: Math.max(0, Math.floor(parsed.coins ?? 0)),
      bestRankByTrack: parsed.bestRankByTrack ?? {},
      bestTimeByTrack: parsed.bestTimeByTrack ?? {},
    };
  } catch {
    return EMPTY_DUCK_RACE_PROFILE;
  }
}

export function resultDurationSeconds(result: DuckRaceResult): number {
  if (typeof result.durationSeconds === "number" && Number.isFinite(result.durationSeconds)) {
    return Math.max(0, result.durationSeconds);
  }
  return Math.max(0, (result.tick - 60) / 20);
}

export function recordDuckRaceResult(profile: DuckRaceProfile, result: DuckRaceResult): DuckRaceProfile {
  if (result.rank === null) return profile;
  const positionReward = Math.max(4, Math.round((result.racerCount - result.rank + 1) * 1.5));
  const podiumReward = result.rank === 1 ? 40 : result.rank <= 3 ? 20 : 0;
  const previousBest = profile.bestRankByTrack[result.trackId];
  const durationSeconds = resultDurationSeconds(result);
  const previousTime = profile.bestTimeByTrack[result.trackId];
  const bestTimeByTrack = { ...profile.bestTimeByTrack };
  if (result.racerCount === 1) {
    bestTimeByTrack[result.trackId] = previousTime ? Math.min(previousTime, durationSeconds) : durationSeconds;
  }

  const next: DuckRaceProfile = {
    version: 1,
    races: profile.races + 1,
    wins: profile.wins + (result.rank === 1 ? 1 : 0),
    podiums: profile.podiums + (result.rank <= 3 ? 1 : 0),
    coins: profile.coins + positionReward + podiumReward,
    bestRankByTrack: {
      ...profile.bestRankByTrack,
      [result.trackId]: previousBest ? Math.min(previousBest, result.rank) : result.rank,
    },
    bestTimeByTrack,
  };
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* storage is optional */ }
  }
  return next;
}

export function profileLevel(profile: DuckRaceProfile): number {
  return 1 + Math.floor((profile.races + profile.wins * 2 + profile.podiums) / 5);
}
