import { DUCK_RACE_LIMITS } from "./config";
import { getRaceModeProfile } from "./modes";
import { DeterministicRng } from "./rng";
import type {
  DuckInput,
  DuckPersonality,
  DuckState,
  RaceConfig,
  RaceEvent,
  RaceState,
} from "./types";

const EMPTY_INPUT: DuckInput = {
  steer: 0,
  boost: false,
  dive: false,
  usePowerup: false,
  sequence: 0,
};

const BASE_FORWARD_SPEED = 61;
const MAX_FORWARD_SPEED = 98;
const LATERAL_ACCELERATION = 2.4;
const LATERAL_DRAG = 0.82;
const MAX_LATERAL_SPEED = 0.075;
const BOOST_SPEED = 18;
const BOOST_DRAIN = 0.035;
const BOOST_REGEN = 0.009;
const FINISH_PROGRESS = 1;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function createPersonality(rng: DeterministicRng): DuckPersonality {
  return {
    aggression: rng.range(0.15, 0.95),
    greed: rng.range(0.1, 1),
    riskTolerance: rng.range(0.1, 1),
    shortcutPreference: rng.range(0.05, 0.95),
    hazardAwareness: rng.range(0.2, 1),
    comebackAggression: rng.range(0.2, 1),
  };
}

function createDuck(index: number, rng: DeterministicRng): DuckState {
  const row = Math.floor(index / 10);
  const column = index % 10;
  const lateral = -0.9 + (column / 9) * 1.8 + rng.range(-0.025, 0.025);

  return {
    id: `duck-${index + 1}`,
    playerId: null,
    name: `Duck ${String(index + 1).padStart(2, "0")}`,
    characterId: index % 2 === 0 ? "mellow-mallard" : "dab-duck",
    isBot: true,
    personality: createPersonality(rng),
    progress: Math.max(0, -row * 0.0025),
    lateral: clamp(lateral, -1, 1),
    forwardSpeed: 0,
    lateralSpeed: 0,
    boostCharge: rng.range(0.7, 1),
    checkpoint: 0,
    rank: index + 1,
    finished: false,
    finishTick: null,
    statusEffects: [],
    heldPowerup: null,
    lastInputSequence: 0,
  };
}

export class RaceSimulation {
  readonly state: RaceState;

  private readonly rng: DeterministicRng;
  private readonly inputs = new Map<string, DuckInput>();

  constructor(config: RaceConfig) {
    if (config.racerCount > DUCK_RACE_LIMITS.massRaceMax) {
      throw new Error(`Race supports at most ${DUCK_RACE_LIMITS.massRaceMax} racers.`);
    }

    this.rng = new DeterministicRng(config.seed);
    const ducks = Array.from({ length: config.racerCount }, (_, index) =>
      createDuck(index, this.rng),
    );

    this.state = {
      config,
      tick: 0,
      phase: "countdown",
      ducks,
      events: [],
      winnerId: null,
    };
  }

  claimDuck(duckId: string, playerId: string, name?: string): void {
    const duck = this.state.ducks.find((candidate) => candidate.id === duckId);
    if (!duck) return;

    duck.playerId = playerId;
    duck.isBot = false;
    if (name?.trim()) duck.name = name.trim().slice(0, 24);
  }

  releaseDuck(duckId: string): void {
    const duck = this.state.ducks.find((candidate) => candidate.id === duckId);
    if (!duck) return;

    duck.playerId = null;
    duck.isBot = true;
    this.inputs.delete(duckId);
  }

  setInput(duckId: string, input: DuckInput): void {
    const duck = this.state.ducks.find((candidate) => candidate.id === duckId);
    if (!duck || duck.finished) return;
    if (input.sequence < duck.lastInputSequence) return;

    const normalized: DuckInput = {
      steer: clamp(input.steer, -1, 1),
      boost: Boolean(input.boost),
      dive: Boolean(input.dive),
      usePowerup: Boolean(input.usePowerup),
      sequence: Math.max(0, Math.floor(input.sequence)),
    };

    duck.lastInputSequence = normalized.sequence;
    this.inputs.set(duckId, normalized);
  }

  step(): RaceState {
    this.state.tick += 1;

    if (this.state.phase === "countdown") {
      if (this.state.tick >= this.state.config.countdownTicks) {
        this.state.phase = "racing";
        this.emit("race-start");
      }
      return this.state;
    }

    if (this.state.phase !== "racing") return this.state;

    const mode = getRaceModeProfile(this.state.config.mode);
    const deltaSeconds = 1 / this.state.config.tickRate;

    for (const duck of this.state.ducks) {
      if (duck.finished) continue;

      const input = duck.isBot || !mode.humanControl
        ? this.createAiInput(duck)
        : this.inputs.get(duck.id) ?? EMPTY_INPUT;

      this.updateDuck(duck, input, deltaSeconds);
    }

    if (mode.chaosEvents && this.state.tick % (this.state.config.tickRate * 4) === 0) {
      this.maybeTriggerChaosEvent();
    }

    this.resolveSoftBodySpacing(mode.softBodyPush);
    this.updateRanks();

    if (this.state.ducks.every((duck) => duck.finished)) {
      this.state.phase = "finished";
      this.emit("race-finished", { winnerId: this.state.winnerId ?? "" });
    }

    return this.state;
  }

  private updateDuck(duck: DuckState, input: DuckInput, deltaSeconds: number): void {
    const leaderProgress = Math.max(...this.state.ducks.map((candidate) => candidate.progress));
    const mode = getRaceModeProfile(this.state.config.mode);
    const deficit = Math.max(0, leaderProgress - duck.progress);
    const catchup = deficit * mode.catchupStrength * 100;

    duck.lateralSpeed += input.steer * LATERAL_ACCELERATION * deltaSeconds;
    duck.lateralSpeed *= LATERAL_DRAG;
    duck.lateralSpeed = clamp(duck.lateralSpeed, -MAX_LATERAL_SPEED, MAX_LATERAL_SPEED);

    if (input.dive) {
      duck.lateralSpeed *= 0.55;
    }

    duck.lateral = clamp(duck.lateral + duck.lateralSpeed, -1, 1);

    const currentPulse = 4 + Math.sin((duck.progress * 32) + (this.state.tick * 0.05)) * 3;
    let targetSpeed = BASE_FORWARD_SPEED + currentPulse + catchup;

    if (input.boost && duck.boostCharge > 0.02) {
      targetSpeed += BOOST_SPEED;
      duck.boostCharge = clamp(duck.boostCharge - BOOST_DRAIN, 0, 1);
    } else {
      duck.boostCharge = clamp(duck.boostCharge + BOOST_REGEN, 0, 1);
    }

    duck.forwardSpeed += (targetSpeed - duck.forwardSpeed) * 0.12;
    duck.forwardSpeed = clamp(duck.forwardSpeed, 0, MAX_FORWARD_SPEED);

    const distanceThisTick = duck.forwardSpeed * deltaSeconds;
    duck.progress += distanceThisTick / this.state.config.trackLength;

    const newCheckpoint = Math.min(4, Math.floor(duck.progress * 5));
    if (newCheckpoint > duck.checkpoint && newCheckpoint < 5) {
      duck.checkpoint = newCheckpoint;
      this.emit("checkpoint", { duckId: duck.id, checkpoint: newCheckpoint });
    }

    if (duck.progress >= FINISH_PROGRESS) {
      duck.progress = FINISH_PROGRESS;
      duck.finished = true;
      duck.finishTick = this.state.tick;
      duck.forwardSpeed = 0;
      if (!this.state.winnerId) this.state.winnerId = duck.id;
      this.emit("finish", { duckId: duck.id, rank: this.finishedCount() });
    }
  }

  private createAiInput(duck: DuckState): DuckInput {
    const wave = Math.sin((this.state.tick * 0.035) + duck.rank) * 0.6;
    const noise = this.rng.range(-0.25, 0.25);
    const steer = clamp(wave + noise, -1, 1);
    const trailing = duck.rank > Math.max(3, Math.ceil(this.state.ducks.length * 0.5));
    const boostChance = 0.015 + duck.personality.aggression * 0.02 + (trailing ? 0.015 : 0);

    return {
      steer,
      boost: duck.boostCharge > 0.3 && this.rng.chance(boostChance),
      dive: this.rng.chance(0.002 + duck.personality.hazardAwareness * 0.002),
      usePowerup: this.rng.chance(0.001 + duck.personality.greed * 0.003),
      sequence: this.state.tick,
    };
  }

  private resolveSoftBodySpacing(strength: number): void {
    const active = this.state.ducks.filter((duck) => !duck.finished);

    for (let left = 0; left < active.length; left += 1) {
      for (let right = left + 1; right < active.length; right += 1) {
        const a = active[left];
        const b = active[right];
        if (Math.abs(a.progress - b.progress) > 0.006) continue;

        const lateralGap = a.lateral - b.lateral;
        if (Math.abs(lateralGap) > 0.08) continue;

        const push = (0.08 - Math.abs(lateralGap)) * strength;
        const direction = lateralGap >= 0 ? 1 : -1;
        a.lateral = clamp(a.lateral + push * direction, -1, 1);
        b.lateral = clamp(b.lateral - push * direction, -1, 1);
      }
    }
  }

  private maybeTriggerChaosEvent(): void {
    if (!this.rng.chance(0.6)) return;

    const chaosTypes = ["munchie-storm", "hotbox-fog", "mega-whirlpool", "dab-wave", "sticky-river"];
    const type = chaosTypes[this.rng.int(0, chaosTypes.length - 1)];
    this.emit(type);
  }

  private updateRanks(): void {
    const ordered = [...this.state.ducks].sort((a, b) => {
      if (a.finished && b.finished) return (a.finishTick ?? Infinity) - (b.finishTick ?? Infinity);
      if (a.finished) return -1;
      if (b.finished) return 1;
      return b.progress - a.progress;
    });

    ordered.forEach((duck, index) => {
      duck.rank = index + 1;
    });
  }

  private finishedCount(): number {
    return this.state.ducks.filter((duck) => duck.finished).length;
  }

  private emit(type: string, payload?: RaceEvent["payload"]): void {
    this.state.events.push({
      id: `${this.state.tick}-${type}-${this.state.events.length}`,
      type,
      tick: this.state.tick,
      payload,
    });

    if (this.state.events.length > 250) {
      this.state.events.splice(0, this.state.events.length - 250);
    }
  }
}
