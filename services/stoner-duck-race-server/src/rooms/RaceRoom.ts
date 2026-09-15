import { Room, type Client } from "colyseus";
import { schema, t, type SchemaType } from "@colyseus/schema";
import { DUCK_CHARACTERS } from "../../../../game/stoner-duck-race/characters.js";
import { createRaceConfig, DUCK_RACE_LIMITS } from "../../../../game/stoner-duck-race/config.js";
import { RaceSimulation } from "../../../../game/stoner-duck-race/simulation.js";
import type { DuckInput, RaceModeId, TrackId } from "../../../../game/stoner-duck-race/types.js";

const TRACK_IDS: readonly TrackId[] = [
  "kush-creek",
  "munchie-marsh",
  "cloud-9-canal",
  "dab-rapids",
  "trichome-trail",
  "greenhouse-run",
  "rosin-river",
  "final-smokeout",
];
const RECONNECT_GRACE_SECONDS = 20;

const NetworkDuck = schema({
  id: t.string(),
  ownerSessionId: t.string(),
  name: t.string(),
  characterId: t.string(),
  progress: t.number(),
  lateral: t.number(),
  rank: t.number(),
  boostCharge: t.number(),
  heldPowerup: t.string(),
  shieldCharges: t.number(),
  finished: t.boolean(),
});

type NetworkDuck = SchemaType<typeof NetworkDuck>;

export const DuckRaceRoomState = schema({
  phase: t.string(),
  mode: t.string(),
  trackId: t.string(),
  seed: t.string(),
  tick: t.number(),
  tickRate: t.number(),
  countdownTicks: t.number(),
  winnerId: t.string(),
  hostSessionId: t.string(),
  racerCapacity: t.number(),
  connectedRacers: t.number(),
  reconnectingRacers: t.number(),
  spectatorCount: t.number(),
  ducks: t.map(NetworkDuck),
});

export type DuckRaceRoomState = SchemaType<typeof DuckRaceRoomState>;

type RaceRoomOptions = {
  mode?: RaceModeId;
  trackId?: TrackId;
  seed?: string;
  racerCount?: number;
};

type JoinOptions = {
  name?: string;
  characterId?: string;
  spectator?: boolean;
};

function normalizeMode(value: unknown): RaceModeId {
  return value === "rally" || value === "chaos" ? value : "derby";
}

function normalizeTrack(value: unknown): TrackId {
  return typeof value === "string" && TRACK_IDS.includes(value as TrackId)
    ? value as TrackId
    : "kush-creek";
}

function normalizeCharacter(value: unknown): string {
  if (typeof value !== "string") return "mellow-mallard";
  return DUCK_CHARACTERS.some((character) => character.id === value) ? value : "mellow-mallard";
}

function normalizeInput(value: unknown): DuckInput | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<DuckInput>;
  return {
    steer: typeof candidate.steer === "number" ? candidate.steer : 0,
    boost: Boolean(candidate.boost),
    dive: Boolean(candidate.dive),
    usePowerup: Boolean(candidate.usePowerup),
    sequence: typeof candidate.sequence === "number" ? candidate.sequence : 0,
  };
}

export class RaceRoom extends Room<{ state: DuckRaceRoomState }> {
  state = new DuckRaceRoomState();
  maxClients = DUCK_RACE_LIMITS.massRaceMax + DUCK_RACE_LIMITS.spectatorTarget;

  private simulation!: RaceSimulation;
  private started = false;
  private readonly duckBySession = new Map<string, string>();
  private readonly spectatorSessions = new Set<string>();
  private readonly droppedSessions = new Set<string>();

  onCreate(options: RaceRoomOptions): void {
    const mode = normalizeMode(options.mode);
    const trackId = normalizeTrack(options.trackId);
    const racerCount = Math.max(
      DUCK_RACE_LIMITS.minRacers,
      Math.min(DUCK_RACE_LIMITS.massRaceMax, Math.floor(options.racerCount ?? DUCK_RACE_LIMITS.massRaceMax)),
    );
    const seed = typeof options.seed === "string" && options.seed.trim()
      ? options.seed.trim().slice(0, 64)
      : `DTF-${mode}-420`;

    this.simulation = new RaceSimulation(createRaceConfig(mode, racerCount, seed, trackId));
    this.state.mode = mode;
    this.state.trackId = trackId;
    this.state.seed = seed;
    this.state.phase = "lobby";
    this.state.hostSessionId = "";
    this.syncState();

    this.onMessage("input", (client, rawInput) => {
      if (!this.started || this.droppedSessions.has(client.sessionId)) return;
      const duckId = this.duckBySession.get(client.sessionId);
      const input = normalizeInput(rawInput);
      if (!duckId || !input) return;
      this.simulation.setInput(duckId, input);
    });

    this.onMessage("start-race", (client) => {
      if (this.started || client.sessionId !== this.state.hostSessionId || this.droppedSessions.has(client.sessionId)) return;
      this.started = true;
      this.syncState();
    });

    this.setSimulationInterval(() => {
      if (this.started) this.simulation.step();
      this.syncState();
    }, 1000 / this.simulation.state.config.tickRate);
  }

  onJoin(client: Client, options: JoinOptions): void {
    if (Boolean(options.spectator)) {
      this.spectatorSessions.add(client.sessionId);
      this.syncState();
      return;
    }

    const available = this.simulation.state.ducks.find((duck) => duck.playerId === null && !duck.finished);
    if (!available) {
      this.spectatorSessions.add(client.sessionId);
      this.syncState();
      return;
    }

    this.simulation.claimDuck(available.id, client.sessionId, options.name);
    available.characterId = normalizeCharacter(options.characterId);
    this.duckBySession.set(client.sessionId, available.id);
    if (!this.state.hostSessionId) this.state.hostSessionId = client.sessionId;
    this.syncState();
  }

  onDrop(client: Client): void {
    const knownRacer = this.duckBySession.has(client.sessionId);
    const knownSpectator = this.spectatorSessions.has(client.sessionId);
    if (!knownRacer && !knownSpectator) return;

    this.droppedSessions.add(client.sessionId);
    const duckId = this.duckBySession.get(client.sessionId);
    const duck = duckId ? this.simulation.state.ducks.find((candidate) => candidate.id === duckId) : undefined;
    if (duck) duck.isBot = true;
    this.allowReconnection(client, RECONNECT_GRACE_SECONDS);
    this.syncState();
  }

  onReconnect(client: Client): void {
    this.droppedSessions.delete(client.sessionId);
    const duckId = this.duckBySession.get(client.sessionId);
    const duck = duckId ? this.simulation.state.ducks.find((candidate) => candidate.id === duckId) : undefined;
    if (duck) {
      duck.playerId = client.sessionId;
      duck.isBot = false;
    }
    this.syncState();
  }

  onLeave(client: Client): void {
    this.droppedSessions.delete(client.sessionId);
    this.spectatorSessions.delete(client.sessionId);
    const duckId = this.duckBySession.get(client.sessionId);
    if (duckId) {
      this.simulation.releaseDuck(duckId);
      this.duckBySession.delete(client.sessionId);
    }
    if (client.sessionId === this.state.hostSessionId) {
      this.state.hostSessionId = this.duckBySession.keys().next().value ?? "";
    }
    this.syncState();
  }

  private syncState(): void {
    const source = this.simulation.state;
    this.state.phase = this.started ? source.phase : "lobby";
    this.state.mode = source.config.mode;
    this.state.trackId = source.config.trackId;
    this.state.seed = source.config.seed;
    this.state.tick = source.tick;
    this.state.tickRate = source.config.tickRate;
    this.state.countdownTicks = source.config.countdownTicks;
    this.state.winnerId = source.winnerId ?? "";
    this.state.racerCapacity = source.config.racerCount;
    const reconnectingRacers = [...this.droppedSessions].filter((sessionId) => this.duckBySession.has(sessionId)).length;
    const reconnectingSpectators = [...this.droppedSessions].filter((sessionId) => this.spectatorSessions.has(sessionId)).length;
    this.state.reconnectingRacers = reconnectingRacers;
    this.state.connectedRacers = Math.max(0, this.duckBySession.size - reconnectingRacers);
    this.state.spectatorCount = Math.max(0, this.spectatorSessions.size - reconnectingSpectators);

    const liveIds = new Set<string>();
    for (const duck of source.ducks) {
      liveIds.add(duck.id);
      let networkDuck = this.state.ducks.get(duck.id) as NetworkDuck | undefined;
      if (!networkDuck) {
        networkDuck = new NetworkDuck();
        networkDuck.id = duck.id;
        this.state.ducks.set(duck.id, networkDuck);
      }
      networkDuck.ownerSessionId = duck.playerId ?? "";
      networkDuck.name = duck.name;
      networkDuck.characterId = duck.characterId;
      networkDuck.progress = duck.progress;
      networkDuck.lateral = duck.lateral;
      networkDuck.rank = duck.rank;
      networkDuck.boostCharge = duck.boostCharge;
      networkDuck.heldPowerup = duck.heldPowerup ?? "";
      networkDuck.shieldCharges = duck.shieldCharges;
      networkDuck.finished = duck.finished;
    }

    for (const duckId of this.state.ducks.keys()) {
      if (!liveIds.has(duckId)) this.state.ducks.delete(duckId);
    }
  }
}
