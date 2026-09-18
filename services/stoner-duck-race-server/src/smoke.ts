import { createRaceConfig } from "../../../game/stoner-duck-race/config.js";
import { RaceSimulation } from "../../../game/stoner-duck-race/simulation.js";
import type { TrackId } from "../../../game/stoner-duck-race/types.js";

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

console.log(`Duck Race smoke passed: ${TRACK_IDS.length} tracks × ${RACERS} racers × 2 deterministic runs.`);
