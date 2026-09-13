export type RaceModeId = "derby" | "rally" | "chaos";
export type RacePhase = "lobby" | "countdown" | "racing" | "finished";

export interface DuckInput {
  steer: number;
  boost: boolean;
  dive: boolean;
  usePowerup: boolean;
  sequence: number;
}

export interface DuckPersonality {
  aggression: number;
  greed: number;
  riskTolerance: number;
  shortcutPreference: number;
  hazardAwareness: number;
  comebackAggression: number;
}

export interface DuckState {
  id: string;
  playerId: string | null;
  name: string;
  characterId: string;
  isBot: boolean;
  personality: DuckPersonality;
  progress: number;
  lateral: number;
  forwardSpeed: number;
  lateralSpeed: number;
  boostCharge: number;
  checkpoint: number;
  rank: number;
  finished: boolean;
  finishTick: number | null;
  statusEffects: string[];
  heldPowerup: string | null;
  lastInputSequence: number;
}

export interface RaceEvent {
  id: string;
  type: string;
  tick: number;
  payload?: Record<string, string | number | boolean>;
}

export interface RaceConfig {
  seed: string;
  mode: RaceModeId;
  trackId: string;
  trackLength: number;
  racerCount: number;
  tickRate: number;
  countdownTicks: number;
}

export interface RaceState {
  config: RaceConfig;
  tick: number;
  phase: RacePhase;
  ducks: DuckState[];
  events: RaceEvent[];
  winnerId: string | null;
}

export interface RaceModeProfile {
  id: RaceModeId;
  humanControl: boolean;
  aiForUnclaimedDucks: boolean;
  chaosEvents: boolean;
  softBodyPush: number;
  powerupFrequency: number;
  catchupStrength: number;
}
