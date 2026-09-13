import { Room, type Client } from "colyseus";
import { schema, t, type SchemaType } from "@colyseus/schema";
import { createRaceConfig, DUCK_RACE_LIMITS } from "../../../../game/stoner-duck-race/config.js";
import { RaceSimulation } from "../../../../game/stoner-duck-race/simulation.js";
import type { DuckInput, RaceModeId } from "../../../../game/stoner-duck-race/types.js";

const NetworkDuck = schema({
  id: t.string(),
  name: t.string(),
  progress: t.number(),
  lateral: t.number(),
  rank: t.number(),
  boostCharge: t.number(),
  finished: t.boolean(),
});

type NetworkDuck = SchemaType<typeof NetworkDuck>;

export const DuckRaceRoomState = schema({
  phase: t.string(),
  mode: t.string(),
  tick: t.number(),
  winnerId: t.string(),
  ducks: t.map(NetworkDuck),
});

export type DuckRaceRoomState = SchemaType<typeof DuckRaceRoomState>;

type RaceRoomOptions = {
  mode?: RaceModeId;
  seed?: string;
  racerCount?: number;
};

type JoinOptions = {
  name?: string;
  spectator?: boolean;
};

function normalizeMode(value: unknown): RaceModeId {
  return value === "rally" || value === "chaos" ? value : "derby";
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
  private readonly duckBySession = new Map<string, string>();

  onCreate(options: RaceRoomOptions): void {
    const mode = normalizeMode(options.mode);
    const racerCount = Math.max(
      DUCK_RACE_LIMITS.minRacers,
      Math.min(DUCK_RACE_LIMITS.massRaceMax, Math.floor(options.racerCount ?? DUCK_RACE_LIMITS.massRaceMax)),
    );
    const seed = typeof options.seed === "string" && options.seed.trim()
      ? options.seed.trim().slice(0, 64)
      : `DTF-${mode}-420`;

    this.simulation = new RaceSimulation(createRaceConfig(mode, racerCount, seed));
    this.state.mode = mode;
    this.syncState();

    this.onMessage("input", (client, rawInput) => {
      const duckId = this.duckBySession.get(client.sessionId);
      const input = normalizeInput(rawInput);
      if (!duckId || !input) return;
      this.simulation.setInput(duckId, input);
    });

    this.setSimulationInterval(() => {
      this.simulation.step();
      this.syncState();
    }, 1000 / this.simulation.state.config.tickRate);
  }

  onJoin(client: Client, options: JoinOptions): void {
    const wantsSpectator = Boolean(options.spectator);
    if (wantsSpectator) return;

    const available = this.simulation.state.ducks.find((duck) => duck.playerId === null && !duck.finished);
    if (!available) return;

    this.simulation.claimDuck(available.id, client.sessionId, options.name);
    this.duckBySession.set(client.sessionId, available.id);
    this.syncState();
  }

  onLeave(client: Client): void {
    const duckId = this.duckBySession.get(client.sessionId);
    if (!duckId) return;

    this.simulation.releaseDuck(duckId);
    this.duckBySession.delete(client.sessionId);
    this.syncState();
  }

  private syncState(): void {
    const source = this.simulation.state;
    this.state.phase = source.phase;
    this.state.mode = source.config.mode;
    this.state.tick = source.tick;
    this.state.winnerId = source.winnerId ?? "";

    const liveIds = new Set<string>();
    for (const duck of source.ducks) {
      liveIds.add(duck.id);
      let networkDuck = this.state.ducks.get(duck.id) as NetworkDuck | undefined;
      if (!networkDuck) {
        networkDuck = new NetworkDuck();
        networkDuck.id = duck.id;
        this.state.ducks.set(duck.id, networkDuck);
      }

      networkDuck.name = duck.name;
      networkDuck.progress = duck.progress;
      networkDuck.lateral = duck.lateral;
      networkDuck.rank = duck.rank;
      networkDuck.boostCharge = duck.boostCharge;
      networkDuck.finished = duck.finished;
    }

    for (const duckId of this.state.ducks.keys()) {
      if (!liveIds.has(duckId)) this.state.ducks.delete(duckId);
    }
  }
}
