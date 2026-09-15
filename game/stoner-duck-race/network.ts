import { Client } from "@colyseus/sdk";
import type { DuckInput, RaceModeId, TrackId } from "./types";

const ROOM_NAME = "stoner_duck_race";

export type DuckRaceRoomIntent = "create" | "join";

export interface DuckRaceRoomOptions {
  endpoint: string;
  intent: DuckRaceRoomIntent;
  roomId?: string;
  mode: RaceModeId;
  trackId: TrackId;
  racerCount: number;
  seed: string;
  playerName: string;
  spectator?: boolean;
}

export interface NetworkDuckSnapshot {
  id: string;
  ownerSessionId: string | null;
  name: string;
  characterId: string;
  progress: number;
  lateral: number;
  rank: number;
  boostCharge: number;
  heldPowerup: string | null;
  shieldCharges: number;
  finished: boolean;
}

export interface DuckRaceRoomSnapshot {
  phase: string;
  mode: RaceModeId;
  trackId: TrackId;
  seed: string;
  tick: number;
  tickRate: number;
  countdownTicks: number;
  winnerId: string | null;
  hostSessionId: string | null;
  racerCapacity: number;
  connectedRacers: number;
  spectatorCount: number;
  ducks: NetworkDuckSnapshot[];
}

export interface DuckRaceRoomConnection {
  roomId: string;
  sessionId: string;
  isHost(): boolean;
  getOwnedDuck(): NetworkDuckSnapshot | null;
  getSnapshot(): DuckRaceRoomSnapshot;
  subscribe(listener: (snapshot: DuckRaceRoomSnapshot) => void): () => void;
  sendInput(input: DuckInput): void;
  startRace(): void;
  leave(): Promise<void>;
}

function normalizeEndpoint(endpoint: string): string {
  const trimmed = endpoint.trim();
  if (!trimmed) throw new Error("Duck Race server endpoint is not configured.");
  return trimmed.replace(/\/$/, "");
}

function normalizeMode(value: unknown): RaceModeId {
  return value === "rally" || value === "chaos" ? value : "derby";
}

function normalizeTrack(value: unknown): TrackId {
  if (value === "munchie-marsh" || value === "cloud-9-canal" || value === "rosin-river") return value;
  return "kush-creek";
}

function snapshotFromState(state: any): DuckRaceRoomSnapshot {
  const ducks: NetworkDuckSnapshot[] = [];

  state?.ducks?.forEach?.((duck: any) => {
    ducks.push({
      id: String(duck.id ?? ""),
      ownerSessionId: duck.ownerSessionId ? String(duck.ownerSessionId) : null,
      name: String(duck.name ?? "Duck"),
      characterId: String(duck.characterId ?? "mellow-mallard"),
      progress: Number(duck.progress ?? 0),
      lateral: Number(duck.lateral ?? 0),
      rank: Number(duck.rank ?? 0),
      boostCharge: Number(duck.boostCharge ?? 0),
      heldPowerup: duck.heldPowerup ? String(duck.heldPowerup) : null,
      shieldCharges: Number(duck.shieldCharges ?? 0),
      finished: Boolean(duck.finished),
    });
  });

  ducks.sort((left, right) => left.rank - right.rank);

  return {
    phase: String(state?.phase ?? "lobby"),
    mode: normalizeMode(state?.mode),
    trackId: normalizeTrack(state?.trackId),
    seed: String(state?.seed ?? "DTF-420"),
    tick: Number(state?.tick ?? 0),
    tickRate: Math.max(1, Number(state?.tickRate ?? 20)),
    countdownTicks: Math.max(0, Number(state?.countdownTicks ?? 60)),
    winnerId: state?.winnerId ? String(state.winnerId) : null,
    hostSessionId: state?.hostSessionId ? String(state.hostSessionId) : null,
    racerCapacity: Math.max(1, Number(state?.racerCapacity ?? ducks.length || 1)),
    connectedRacers: Math.max(0, Number(state?.connectedRacers ?? 0)),
    spectatorCount: Math.max(0, Number(state?.spectatorCount ?? 0)),
    ducks,
  };
}

export async function connectDuckRaceRoom(options: DuckRaceRoomOptions): Promise<DuckRaceRoomConnection> {
  const endpoint = normalizeEndpoint(options.endpoint);
  const client = new Client(endpoint);
  const joinOptions = {
    mode: options.mode,
    trackId: options.trackId,
    racerCount: Math.max(1, Math.min(50, Math.floor(options.racerCount))),
    seed: options.seed.trim().slice(0, 64) || "DTF-420",
    name: options.playerName.trim().slice(0, 24) || "YOU",
    spectator: Boolean(options.spectator),
  };

  if (options.intent === "join" && !options.roomId?.trim()) {
    throw new Error("Enter a room ID to join an online race.");
  }

  const room = options.intent === "create"
    ? await client.create(ROOM_NAME, joinOptions)
    : await client.joinById(options.roomId!.trim(), joinOptions);

  let latest = snapshotFromState(room.state);
  const listeners = new Set<(snapshot: DuckRaceRoomSnapshot) => void>();

  const publish = (state: any) => {
    latest = snapshotFromState(state);
    for (const listener of listeners) listener(latest);
  };

  room.onStateChange(publish);
  publish(room.state);

  return {
    roomId: room.roomId,
    sessionId: room.sessionId,
    isHost: () => latest.hostSessionId === room.sessionId,
    getOwnedDuck: () => latest.ducks.find((duck) => duck.ownerSessionId === room.sessionId) ?? null,
    getSnapshot: () => latest,
    subscribe(listener) {
      listeners.add(listener);
      listener(latest);
      return () => listeners.delete(listener);
    },
    sendInput(input) {
      room.send("input", input);
    },
    startRace() {
      room.send("start-race");
    },
    async leave() {
      listeners.clear();
      await room.leave();
    },
  };
}
