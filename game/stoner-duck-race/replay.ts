import type { DuckInput, DuckRaceLaunchOptions, RaceModeId, TrackId } from "./types";

export const DUCK_RACE_REPLAY_VERSION = 1 as const;
const LAST_REPLAY_STORAGE_KEY = "dtf.stoner-duck-race.last-replay.v1";
const MAX_REPLAY_FRAMES = 12_000;

export interface DuckRaceReplayFrame {
  tick: number;
  steer: number;
  boost: boolean;
  dive: boolean;
  usePowerup: boolean;
}

export interface DuckRaceReplay {
  version: typeof DUCK_RACE_REPLAY_VERSION;
  mode: RaceModeId;
  trackId: TrackId;
  racerCount: number;
  seed: string;
  playerName: string;
  characterId: string;
  frames: DuckRaceReplayFrame[];
}

export function createDuckRaceReplay(options: DuckRaceLaunchOptions): DuckRaceReplay {
  return {
    version: DUCK_RACE_REPLAY_VERSION,
    mode: options.mode,
    trackId: options.trackId,
    racerCount: Math.max(1, Math.min(50, Math.floor(options.racerCount))),
    seed: options.seed.trim().slice(0, 64) || "DTF-420",
    playerName: options.playerName.trim().slice(0, 24) || "YOU",
    characterId: options.characterId.trim() || "mellow-mallard",
    frames: [],
  };
}

export function replayLaunchOptions(replay: DuckRaceReplay): DuckRaceLaunchOptions {
  return {
    mode: replay.mode,
    trackId: replay.trackId,
    racerCount: replay.racerCount,
    seed: replay.seed,
    playerName: replay.playerName,
    characterId: replay.characterId,
  };
}

function sameInput(frame: DuckRaceReplayFrame | undefined, input: DuckInput): boolean {
  return Boolean(frame)
    && Math.abs(frame!.steer - input.steer) < 0.001
    && frame!.boost === input.boost
    && frame!.dive === input.dive
    && frame!.usePowerup === input.usePowerup;
}

export function recordReplayInput(replay: DuckRaceReplay, tick: number, input: DuckInput): void {
  if (replay.frames.length >= MAX_REPLAY_FRAMES) return;
  const last = replay.frames[replay.frames.length - 1];
  if (sameInput(last, input)) return;

  replay.frames.push({
    tick: Math.max(0, Math.floor(tick)),
    steer: Math.max(-1, Math.min(1, input.steer)),
    boost: Boolean(input.boost),
    dive: Boolean(input.dive),
    usePowerup: Boolean(input.usePowerup),
  });
}

export class ReplayInputCursor {
  private frameIndex = 0;
  private current: DuckInput = {
    steer: 0,
    boost: false,
    dive: false,
    usePowerup: false,
    sequence: 0,
  };

  constructor(private readonly replay: DuckRaceReplay) {}

  inputForTick(tick: number): DuckInput {
    while (
      this.frameIndex < this.replay.frames.length
      && this.replay.frames[this.frameIndex].tick <= tick
    ) {
      const frame = this.replay.frames[this.frameIndex];
      this.current = {
        steer: frame.steer,
        boost: frame.boost,
        dive: frame.dive,
        usePowerup: frame.usePowerup,
        sequence: tick,
      };
      this.frameIndex += 1;
    }

    return { ...this.current, sequence: tick };
  }
}

function isTrackId(value: unknown): value is TrackId {
  return value === "kush-creek"
    || value === "munchie-marsh"
    || value === "cloud-9-canal"
    || value === "dab-rapids"
    || value === "trichome-trail"
    || value === "greenhouse-run"
    || value === "rosin-river"
    || value === "final-smokeout";
}

function isMode(value: unknown): value is RaceModeId {
  return value === "derby" || value === "rally" || value === "chaos";
}

export function normalizeDuckRaceReplay(value: unknown): DuckRaceReplay | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<DuckRaceReplay>;
  if (candidate.version !== DUCK_RACE_REPLAY_VERSION || !isMode(candidate.mode) || !isTrackId(candidate.trackId)) return null;
  if (!Array.isArray(candidate.frames) || candidate.frames.length > MAX_REPLAY_FRAMES) return null;

  const frames: DuckRaceReplayFrame[] = [];
  let previousTick = -1;
  for (const rawFrame of candidate.frames) {
    if (!rawFrame || typeof rawFrame !== "object") return null;
    const frame = rawFrame as Partial<DuckRaceReplayFrame>;
    const tick = Math.max(0, Math.floor(Number(frame.tick ?? 0)));
    if (tick < previousTick) return null;
    previousTick = tick;
    frames.push({
      tick,
      steer: Math.max(-1, Math.min(1, Number(frame.steer ?? 0))),
      boost: Boolean(frame.boost),
      dive: Boolean(frame.dive),
      usePowerup: Boolean(frame.usePowerup),
    });
  }

  return {
    version: DUCK_RACE_REPLAY_VERSION,
    mode: candidate.mode,
    trackId: candidate.trackId,
    racerCount: Math.max(1, Math.min(50, Math.floor(Number(candidate.racerCount ?? 1)))),
    seed: String(candidate.seed ?? "DTF-420").trim().slice(0, 64) || "DTF-420",
    playerName: String(candidate.playerName ?? "YOU").trim().slice(0, 24) || "YOU",
    characterId: String(candidate.characterId ?? "mellow-mallard").trim() || "mellow-mallard",
    frames,
  };
}

export function saveLastDuckRaceReplay(replay: DuckRaceReplay): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_REPLAY_STORAGE_KEY, JSON.stringify(replay));
  } catch {
    // Replay storage is optional; the current in-memory replay remains usable.
  }
}

export function loadLastDuckRaceReplay(): DuckRaceReplay | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_REPLAY_STORAGE_KEY);
    return raw ? normalizeDuckRaceReplay(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}
