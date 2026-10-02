export const DUCK_RACE_PROTOCOL_VERSION = 1;

type DuckRaceOperationalMetrics = {
  roomsCreated: number;
  joins: number;
  reconnects: number;
  leaves: number;
  drops: number;
};

const metrics: DuckRaceOperationalMetrics = {
  roomsCreated: 0,
  joins: 0,
  reconnects: 0,
  leaves: 0,
  drops: 0,
};

export function duckRaceLiveOpsState() {
  return {
    maintenance: process.env.DUCK_RACE_MAINTENANCE_MODE === "true",
    multiplayerEnabled: process.env.DUCK_RACE_MULTIPLAYER_ENABLED !== "false",
  };
}

export function requireDuckRaceAvailable(): void {
  const state = duckRaceLiveOpsState();
  if (state.maintenance) throw new Error("Stoner Duck Race is temporarily under maintenance.");
  if (!state.multiplayerEnabled) throw new Error("Stoner Duck Race multiplayer is temporarily disabled.");
}

export function recordDuckRaceOperation(name: keyof DuckRaceOperationalMetrics): void {
  metrics[name] += 1;
}

export function duckRaceOperationalMetrics(): DuckRaceOperationalMetrics {
  return { ...metrics };
}
