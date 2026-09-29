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
