import { createRaceConfig } from "../../../game/stoner-duck-race/config.js";
import { RaceSimulation } from "../../../game/stoner-duck-race/simulation.js";
import type { TrackId } from "../../../game/stoner-duck-race/types.js";
import {
  DUCK_RACE_PROTOCOL_VERSION,
  duckRaceLiveOpsState,
  duckRaceOperationalMetrics,
  recordDuckRaceOperation,
  requireDuckRaceAvailable,
} from "./liveops.js";

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

const RACERS = 50;
const MAX_TICKS = 6_000;

type FinishRecord = {
  id: string;
  rank: number;
  finishTick: number | null;
};

function runRace(trackId: TrackId, seed: string): FinishRecord[] {
  const simulation = new RaceSimulation(createRaceConfig("derby", RACERS, seed, trackId));
  let steps = 0;

  while (simulation.state.phase !== "finished" && steps < MAX_TICKS) {
    simulation.step();
    steps += 1;
  }

  if (simulation.state.phase !== "finished") {
    throw new Error(`${trackId} failed to finish ${RACERS} racers within ${MAX_TICKS} ticks.`);
  }

  if (simulation.state.ducks.some((duck) => !duck.finished || duck.finishTick === null)) {
    throw new Error(`${trackId} reported a finished race with unfinished ducks.`);
  }

  return [...simulation.state.ducks]
    .sort((left, right) => left.rank - right.rank)
    .map((duck) => ({ id: duck.id, rank: duck.rank, finishTick: duck.finishTick }));
}

for (const trackId of TRACK_IDS) {
  const seed = `SMOKE-${trackId}-420`;
  const first = runRace(trackId, seed);
  const second = runRace(trackId, seed);

  if (JSON.stringify(first) !== JSON.stringify(second)) {
    throw new Error(`${trackId} produced different deterministic results for the same seed.`);
  }

  if (first.length !== RACERS || first[0]?.rank !== 1 || first.at(-1)?.rank !== RACERS) {
    throw new Error(`${trackId} produced an invalid 50-racer ranking.`);
  }

  console.log(`${trackId}: deterministic ${RACERS}-duck finish verified (${first[0]?.id} won).`);
}

if (DUCK_RACE_PROTOCOL_VERSION !== 1) throw new Error("Duck Race protocol version drifted.");
if (duckRaceLiveOpsState().maintenance || !duckRaceLiveOpsState().multiplayerEnabled) {
  throw new Error("Duck Race live-ops defaults must allow multiplayer.");
}
recordDuckRaceOperation("roomsCreated");
if (duckRaceOperationalMetrics().roomsCreated < 1) throw new Error("Duck Race operational metrics did not increment.");
process.env.DUCK_RACE_MAINTENANCE_MODE = "true";
try {
  requireDuckRaceAvailable();
  throw new Error("Duck Race maintenance mode failed open.");
} catch (error) {
  if (!String(error).includes("maintenance")) throw error;
}
delete process.env.DUCK_RACE_MAINTENANCE_MODE;
process.env.DUCK_RACE_MULTIPLAYER_ENABLED = "false";
try {
  requireDuckRaceAvailable();
  throw new Error("Duck Race multiplayer kill switch failed open.");
} catch (error) {
  if (!String(error).includes("disabled")) throw error;
}
delete process.env.DUCK_RACE_MULTIPLAYER_ENABLED;
requireDuckRaceAvailable();

console.log(`Duck Race smoke passed: ${TRACK_IDS.length} tracks × ${RACERS} racers × 2 deterministic runs plus live-ops contract.`);
