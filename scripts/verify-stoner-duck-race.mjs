import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

const required = [
  "game/stoner-duck-race/types.ts",
  "game/stoner-duck-race/config.ts",
  "game/stoner-duck-race/rng.ts",
  "game/stoner-duck-race/modes.ts",
  "game/stoner-duck-race/simulation.ts",
  "game/stoner-duck-race/main.ts",
  "game/stoner-duck-race/scenes/RaceScene.ts",
  "components/game/StonerDuckRaceGame.tsx",
  "components/game/StonerDuckRaceLoader.tsx",
  "app/games/stoner-duck-race/page.tsx",
  "services/stoner-duck-race-server/package.json",
  "services/stoner-duck-race-server/src/index.ts",
  "services/stoner-duck-race-server/src/rooms/RaceRoom.ts",
  "docs/games/stoner-duck-race/ARCHITECTURE.md",
  "docs/games/stoner-duck-race/OPEN_SOURCE.md",
];

const failures = [];

for (const relativePath of required) {
  if (!existsSync(resolve(root, relativePath))) {
    failures.push(`missing ${relativePath}`);
  }
}

const config = readFileSync(resolve(root, "game/stoner-duck-race/config.ts"), "utf8");
const modes = readFileSync(resolve(root, "game/stoner-duck-race/modes.ts"), "utf8");
const simulation = readFileSync(resolve(root, "game/stoner-duck-race/simulation.ts"), "utf8");
const serverPackage = JSON.parse(readFileSync(resolve(root, "services/stoner-duck-race-server/package.json"), "utf8"));

if (!/massRaceMax:\s*50\b/.test(config)) failures.push("massRaceMax must remain 50");
for (const mode of ["derby", "rally", "chaos"]) {
  if (!new RegExp(`\\b${mode}:\\s*\\{`).test(modes)) failures.push(`missing ${mode} mode profile`);
}

if (simulation.includes("Math.random(")) failures.push("shared simulation must not use Math.random()");
if (!simulation.includes("DeterministicRng")) failures.push("shared simulation must use deterministic RNG");
if (!serverPackage.dependencies?.colyseus) failures.push("multiplayer server must declare Colyseus");

if (failures.length) {
  console.error("Stoner Duck Race verification failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("Stoner Duck Race verification passed: 50-racer cap, three modes, deterministic simulation, route, docs, and multiplayer scaffold are present.");
