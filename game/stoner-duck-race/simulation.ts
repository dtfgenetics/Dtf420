import { getDuckCharacter, DUCK_CHARACTERS } from "./characters.js";
import { DUCK_RACE_LIMITS } from "./config.js";
import { getRaceModeProfile } from "./modes.js";
import { DeterministicRng } from "./rng.js";
import {
  currentZoneAt,
  getTrackDefinition,
  type HazardDefinition,
  type PowerupId,
} from "./tracks.js";
import type {
  DuckInput,
  DuckPersonality,
  DuckState,
  RaceConfig,
  RaceEvent,
  RaceState,
} from "./types.js";

const EMPTY_INPUT: DuckInput = {
  steer: 0,
  boost: false,
  dive: false,
  usePowerup: false,
  sequence: 0,
};

const BASE_FORWARD_SPEED = 61;
const MAX_FORWARD_SPEED = 118;
const LATERAL_ACCELERATION = 2.4;
const LATERAL_DRAG = 0.82;
const MAX_LATERAL_SPEED = 0.075;
const BOOST_SPEED = 18;
const BOOST_DRAIN = 0.035;
const BOOST_REGEN = 0.009;
const FINISH_PROGRESS = 1;
const HAZARD_COOLDOWN_TICKS = 16;

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
  const character = DUCK_CHARACTERS[index % DUCK_CHARACTERS.length];

  return {
    id: `duck-${index + 1}`,
    playerId: null,
    name: `${character.name} ${Math.floor(index / DUCK_CHARACTERS.length) + 1}`,
    characterId: character.id,
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
    shieldCharges: 0,
    lastInputSequence: 0,
  };
}

export class RaceSimulation {
  readonly state: RaceState;

  private readonly rng: DeterministicRng;
  private readonly track;
  private readonly inputs = new Map<string, DuckInput>();
  private readonly hazardCooldowns = new Map<string, number>();
  private readonly collectedPickups = new Map<string, Set<string>>();

  constructor(config: RaceConfig) {
    if (config.racerCount > DUCK_RACE_LIMITS.massRaceMax) {
      throw new Error(`Race supports at most ${DUCK_RACE_LIMITS.massRaceMax} racers.`);
    }

    this.rng = new DeterministicRng(config.seed);
    this.track = getTrackDefinition(config.trackId);
    const ducks = Array.from({ length: config.racerCount }, (_, index) => createDuck(index, this.rng));

    this.state = {
      config: { ...config, trackId: this.track.id, trackLength: this.track.length },
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
    const current = currentZoneAt(this.track, duck.progress);
    const deficit = Math.max(0, leaderProgress - duck.progress);
    const catchup = deficit * mode.catchupStrength * 100;

    duck.lateralSpeed += input.steer * LATERAL_ACCELERATION * deltaSeconds;
    duck.lateralSpeed += current.lateralForce;
    duck.lateralSpeed += Math.sin((this.state.tick * 0.17) + (duck.rank * 0.9)) * current.turbulence * 0.0013;
    duck.lateralSpeed *= LATERAL_DRAG;
    duck.lateralSpeed = clamp(duck.lateralSpeed, -MAX_LATERAL_SPEED, MAX_LATERAL_SPEED);

    if (input.dive) duck.lateralSpeed *= 0.55;
    duck.lateral = clamp(duck.lateral + duck.lateralSpeed, -1, 1);

    const currentPulse = 4 + Math.sin((duck.progress * 32) + (this.state.tick * 0.05)) * 3;
    let targetSpeed = (BASE_FORWARD_SPEED + currentPulse + catchup) * current.speedMultiplier;

    if (input.boost && duck.boostCharge > 0.02) {
      targetSpeed += BOOST_SPEED;
      duck.boostCharge = clamp(duck.boostCharge - BOOST_DRAIN, 0, 1);
    } else {
      duck.boostCharge = clamp(duck.boostCharge + BOOST_REGEN, 0, 1);
    }

    duck.forwardSpeed += (targetSpeed - duck.forwardSpeed) * 0.12;
    duck.forwardSpeed = clamp(duck.forwardSpeed, 0, MAX_FORWARD_SPEED);
    duck.progress += (duck.forwardSpeed * deltaSeconds) / this.state.config.trackLength;

    this.resolveTrackInteractions(duck);
    if (input.usePowerup && duck.heldPowerup) this.activatePowerup(duck, duck.heldPowerup as PowerupId);

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

  private resolveTrackInteractions(duck: DuckState): void {
    for (const hazard of this.track.hazards) {
      const inProgress = Math.abs(duck.progress - hazard.progress) <= hazard.progressRadius;
      const inLane = Math.abs(duck.lateral - hazard.lateral) <= hazard.lateralRadius;
      if (!inProgress || !inLane) continue;

      const key = `${duck.id}:${hazard.id}`;
      const lastHit = this.hazardCooldowns.get(key) ?? -Infinity;
      if (this.state.tick - lastHit < HAZARD_COOLDOWN_TICKS) continue;
      this.hazardCooldowns.set(key, this.state.tick);

      if (duck.shieldCharges > 0) {
        duck.shieldCharges -= 1;
        this.emit("shield-block", { duckId: duck.id, hazardId: hazard.id });
        continue;
      }

      this.applyHazard(duck, hazard);
      this.emit("hazard-hit", { duckId: duck.id, hazardId: hazard.id, hazardType: hazard.type });
    }

    if (duck.heldPowerup) return;
    const collected = this.collectedPickups.get(duck.id) ?? new Set<string>();

    for (const pickup of this.track.pickups) {
      if (collected.has(pickup.id)) continue;
      const inProgress = Math.abs(duck.progress - pickup.progress) <= pickup.progressRadius;
      const inLane = Math.abs(duck.lateral - pickup.lateral) <= pickup.lateralRadius;
      if (!inProgress || !inLane) continue;
      this.collectPickup(duck, pickup.id, pickup.powerup, collected);
      break;
    }
  }

  private collectPickup(duck: DuckState, pickupId: string, powerup: PowerupId, collected?: Set<string>): void {
    const collection = collected ?? this.collectedPickups.get(duck.id) ?? new Set<string>();
    collection.add(pickupId);
    this.collectedPickups.set(duck.id, collection);
    duck.heldPowerup = powerup;
    this.emit("powerup-collected", { duckId: duck.id, powerup });
  }

  private applyHazard(duck: DuckState, hazard: HazardDefinition): void {
    if (hazard.type === "mud" || hazard.type === "reeds") {
      duck.forwardSpeed *= hazard.type === "mud" ? 0.66 : 0.76;
      duck.lateralSpeed *= 0.45;
      return;
    }

    if (hazard.type === "log" || hazard.type === "barrel") {
      duck.forwardSpeed *= hazard.type === "log" ? 0.52 : 0.58;
      const direction = duck.lateral >= hazard.lateral ? 1 : -1;
      duck.lateralSpeed = clamp(duck.lateralSpeed + direction * 0.04, -MAX_LATERAL_SPEED, MAX_LATERAL_SPEED);
      return;
    }

    if (hazard.type === "sprinkler" || hazard.type === "fan") {
      const direction = hazard.lateral >= 0 ? -1 : 1;
      duck.lateralSpeed = clamp(duck.lateralSpeed + direction * 0.05, -MAX_LATERAL_SPEED, MAX_LATERAL_SPEED);
      duck.forwardSpeed *= 0.86;
      return;
    }

    if (hazard.type === "waterfall") {
      duck.forwardSpeed *= 0.7;
      duck.lateralSpeed = clamp(duck.lateralSpeed + this.rng.range(-0.055, 0.055), -MAX_LATERAL_SPEED, MAX_LATERAL_SPEED);
      return;
    }

    const pull = hazard.lateral - duck.lateral;
    duck.lateralSpeed = clamp(duck.lateralSpeed + pull * 0.08, -MAX_LATERAL_SPEED, MAX_LATERAL_SPEED);
    duck.forwardSpeed *= 0.8;
  }

  private activatePowerup(duck: DuckState, powerup: PowerupId): void {
    duck.heldPowerup = null;

    if (powerup === "munchie-rush") {
      duck.boostCharge = clamp(duck.boostCharge + 0.5, 0, 1);
      duck.forwardSpeed = clamp(duck.forwardSpeed + 24, 0, MAX_FORWARD_SPEED);
    } else if (powerup === "feather-boost") {
      duck.boostCharge = clamp(duck.boostCharge + 0.25, 0, 1);
      duck.forwardSpeed = clamp(duck.forwardSpeed + 32, 0, MAX_FORWARD_SPEED);
    } else if (powerup === "bubble-shield") {
      duck.shieldCharges = Math.min(2, duck.shieldCharges + 1);
    } else if (powerup === "super-duck") {
      duck.boostCharge = 1;
      duck.forwardSpeed = MAX_FORWARD_SPEED;
    } else if (powerup === "snack-magnet") {
      const collected = this.collectedPickups.get(duck.id) ?? new Set<string>();
      const target = this.track.pickups
        .filter((candidate) => !collected.has(candidate.id) && candidate.progress > duck.progress)
        .sort((a, b) => a.progress - b.progress)[0];
      if (target && target.progress - duck.progress <= 0.16) {
        this.collectPickup(duck, target.id, target.powerup, collected);
      } else {
        duck.boostCharge = clamp(duck.boostCharge + 0.3, 0, 1);
      }
    } else {
      const radius = powerup === "mega-quack" ? 0.085 : powerup === "cloud-screen" ? 0.065 : 0.04;
      const lateralRadius = powerup === "mega-quack" ? 0.65 : 0.38;
      const speedMultiplier = powerup === "cloud-screen" ? 0.62 : powerup === "mega-quack" ? 0.68 : 0.72;
      let affected = 0;

      for (const rival of this.state.ducks) {
        if (rival.id === duck.id || rival.finished) continue;
        if (Math.abs(rival.progress - duck.progress) > radius) continue;
        if (Math.abs(rival.lateral - duck.lateral) > lateralRadius) continue;
        if (rival.shieldCharges > 0) {
          rival.shieldCharges -= 1;
          continue;
        }
        rival.forwardSpeed *= speedMultiplier;
        const direction = rival.lateral >= duck.lateral ? 1 : -1;
        rival.lateralSpeed = clamp(
          rival.lateralSpeed + direction * (powerup === "mega-quack" ? 0.05 : 0.025),
          -MAX_LATERAL_SPEED,
          MAX_LATERAL_SPEED,
        );
        affected += 1;
      }
      this.emit("powerup-impact", { duckId: duck.id, powerup, affected });
    }

    this.emit("powerup-used", { duckId: duck.id, powerup });
  }

  private createAiInput(duck: DuckState): DuckInput {
    let steer = Math.sin((this.state.tick * 0.035) + duck.rank) * 0.45 + this.rng.range(-0.18, 0.18);
    const upcomingHazard = this.track.hazards
      .filter((hazard) => hazard.progress > duck.progress && hazard.progress - duck.progress < 0.045)
      .sort((a, b) => a.progress - b.progress)[0];

    if (upcomingHazard && Math.abs(duck.lateral - upcomingHazard.lateral) < upcomingHazard.lateralRadius + 0.14) {
      const direction = duck.lateral >= upcomingHazard.lateral ? 1 : -1;
      steer += direction * duck.personality.hazardAwareness * 1.15;
    } else if (!duck.heldPowerup) {
      const pickup = this.track.pickups
        .filter((candidate) => candidate.progress > duck.progress && candidate.progress - duck.progress < 0.055)
        .sort((a, b) => a.progress - b.progress)[0];
      if (pickup && duck.personality.greed > 0.45) {
        steer += clamp((pickup.lateral - duck.lateral) * 1.35, -0.8, 0.8);
      }
    }

    steer = clamp(steer, -1, 1);
    const trailing = duck.rank > Math.max(3, Math.ceil(this.state.ducks.length * 0.5));
    const boostChance = 0.015 + duck.personality.aggression * 0.02 + (trailing ? 0.015 : 0);

    return {
      steer,
      boost: duck.boostCharge > 0.3 && this.rng.chance(boostChance),
      dive: Boolean(upcomingHazard) && this.rng.chance(0.01 + duck.personality.riskTolerance * 0.012),
      usePowerup: Boolean(duck.heldPowerup) && this.rng.chance(0.012 + duck.personality.greed * 0.03),
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
    const chaosTypes = ["munchie-storm", "hotbox-fog", "mega-whirlpool", "dab-wave", "sticky-river"] as const;
    const type = chaosTypes[this.rng.int(0, chaosTypes.length - 1)];

    for (const duck of this.state.ducks) {
      if (duck.finished) continue;
      if (type === "munchie-storm") duck.boostCharge = clamp(duck.boostCharge + 0.18, 0, 1);
      if (type === "hotbox-fog") duck.lateralSpeed = clamp(duck.lateralSpeed + this.rng.range(-0.025, 0.025), -MAX_LATERAL_SPEED, MAX_LATERAL_SPEED);
      if (type === "mega-whirlpool") {
        duck.lateralSpeed = clamp(duck.lateralSpeed + (0 - duck.lateral) * 0.045, -MAX_LATERAL_SPEED, MAX_LATERAL_SPEED);
        duck.forwardSpeed *= 0.86;
      }
      if (type === "dab-wave") duck.lateralSpeed = clamp(duck.lateralSpeed + this.rng.range(-0.04, 0.04), -MAX_LATERAL_SPEED, MAX_LATERAL_SPEED);
      if (type === "sticky-river") duck.forwardSpeed *= 0.9;
    }

    this.emit(type);
  }

  private updateRanks(): void {
    const ordered = [...this.state.ducks].sort((a, b) => {
      if (a.finished && b.finished) return (a.finishTick ?? Infinity) - (b.finishTick ?? Infinity);
      if (a.finished) return -1;
      if (b.finished) return 1;
      return b.progress - a.progress;
    });
    ordered.forEach((duck, index) => { duck.rank = index + 1; });
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

export function getDuckDisplayName(characterId: string): string {
  return getDuckCharacter(characterId).name;
}
