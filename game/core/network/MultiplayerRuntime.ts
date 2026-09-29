export const DEFAULT_RECONNECT_POLICY = {
  enabled: true,
  maxRetries: 12,
  maxDelayMs: 3_000,
  maxEnqueuedMessages: 20,
} as const;

export interface ReconnectPolicy {
  readonly enabled: boolean;
  readonly maxRetries: number;
  readonly maxDelayMs: number;
  readonly maxEnqueuedMessages: number;
}

export interface ColyseusReconnectTarget {
  reconnection: {
    enabled: boolean;
    maxRetries: number;
    maxDelay: number;
    maxEnqueuedMessages: number;
  };
}

export function normalizeGameServerEndpoint(endpoint: string, label = "Game server"): string {
  const trimmed = endpoint.trim();
  if (!trimmed) throw new Error(`${label} endpoint is not configured.`);
  return trimmed.replace(/\/+$/, "");
}

export function normalizeRoomCode(value: string | undefined, label = "room ID"): string {
  const normalized = value?.trim() ?? "";
  if (!normalized) throw new Error(`Enter a ${label} to join.`);
  return normalized;
}

export function applyColyseusReconnectPolicy(
  room: ColyseusReconnectTarget,
  policy: ReconnectPolicy = DEFAULT_RECONNECT_POLICY,
): void {
  room.reconnection.enabled = policy.enabled;
  room.reconnection.maxRetries = Math.max(0, Math.floor(policy.maxRetries));
  room.reconnection.maxDelay = Math.max(0, Math.floor(policy.maxDelayMs));
  room.reconnection.maxEnqueuedMessages = Math.max(0, Math.floor(policy.maxEnqueuedMessages));
}

export type MultiplayerConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "failed";

export interface RoomInvite {
  readonly roomCode: string;
  readonly playerName?: string;
}

export const FRIENDLY_INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createFriendlyInviteCode(
  length = 6,
  random: () => number = Math.random,
): string {
  const safeLength = Math.max(4, Math.min(12, Math.floor(length)));
  let code = "";
  for (let index = 0; index < safeLength; index += 1) {
    const sample = Math.max(0, Math.min(0.999999999999, random()));
    code += FRIENDLY_INVITE_ALPHABET[Math.floor(sample * FRIENDLY_INVITE_ALPHABET.length)];
  }
  return code;
}

export function normalizeInviteCode(value: string | undefined, label = "room code"): string {
  const normalized = normalizeRoomCode(value, label)
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
  if (!normalized) throw new Error(`Enter a valid ${label}.`);
  if (normalized.length > 64) throw new Error(`${label} is too long.`);
  return normalized;
}

export function connectionStateAfterDrop(
  reconnectEnabled: boolean,
  retriesRemaining: number,
): MultiplayerConnectionState {
  return reconnectEnabled && retriesRemaining > 0 ? "reconnecting" : "disconnected";
}

export type MultiplayerRoomPhase =
  | "lobby"
  | "starting"
  | "playing"
  | "finished";

export interface MultiplayerRoomLifecycle {
  readonly phase: MultiplayerRoomPhase;
  readonly playerCount: number;
  readonly minPlayers: number;
  readonly maxPlayers: number;
  readonly isHost: boolean;
}

export function canStartMultiplayerRoom(room: MultiplayerRoomLifecycle): boolean {
  return (
    room.phase === "lobby"
    && room.isHost
    && room.playerCount >= room.minPlayers
    && room.playerCount <= room.maxPlayers
  );
}

export function roomCapacityRemaining(room: Pick<MultiplayerRoomLifecycle, "playerCount" | "maxPlayers">): number {
  return Math.max(0, room.maxPlayers - room.playerCount);
}

export function multiplayerStatusLabel(
  state: MultiplayerConnectionState,
  phase: MultiplayerRoomPhase = "lobby",
): string {
  if (state === "connecting") return "Connecting…";
  if (state === "reconnecting") return "Reconnecting…";
  if (state === "disconnected") return "Disconnected";
  if (state === "failed") return "Connection failed";
  if (state !== "connected") return "Offline";
  if (phase === "starting") return "Starting…";
  if (phase === "playing") return "Playing";
  if (phase === "finished") return "Finished";
  return "Lobby";
}

/**
 * Transport choice stays outside the game rules. Colyseus is preferred for
 * authoritative simulation/state-sync games; Socket.IO is retained for
 * event-driven lobby/card/board games that already have stable transports.
 */
export type MultiplayerTransportKind = "colyseus" | "socket-io";

export interface MultiplayerTransportCapabilities {
  readonly kind: MultiplayerTransportKind;
  readonly authoritativeState: boolean;
  readonly automaticReconnect: boolean;
  readonly manualSessionResume: boolean;
}

export const MULTIPLAYER_TRANSPORT_CAPABILITIES: Readonly<
  Record<MultiplayerTransportKind, MultiplayerTransportCapabilities>
> = Object.freeze({
  colyseus: Object.freeze({
    kind: "colyseus",
    authoritativeState: true,
    automaticReconnect: true,
    manualSessionResume: true,
  }),
  "socket-io": Object.freeze({
    kind: "socket-io",
    authoritativeState: true,
    automaticReconnect: true,
    manualSessionResume: false,
  }),
});

export function transportSupportsManualResume(kind: MultiplayerTransportKind): boolean {
  return MULTIPLAYER_TRANSPORT_CAPABILITIES[kind].manualSessionResume;
}
