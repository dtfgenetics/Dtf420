import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

const required = [
  "game/stoner-duck-race/types.ts",
  "game/stoner-duck-race/config.ts",
  "game/stoner-duck-race/rng.ts",
  "game/stoner-duck-race/modes.ts",
  "game/stoner-duck-race/tracks.ts",
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
  if (!existsSync(resolve(root, relativePath))) failures.push(`missing ${relativePath}`);
}

const config = readFileSync(resolve(root, "game/stoner-duck-race/config.ts"), "utf8");
const modes = readFileSync(resolve(root, "game/stoner-duck-race/modes.ts"), "utf8");
const tracks = readFileSync(resolve(root, "game/stoner-duck-race/tracks.ts"), "utf8");
const simulation = readFileSync(resolve(root, "game/stoner-duck-race/simulation.ts"), "utf8");
const scene = readFileSync(resolve(root, "game/stoner-duck-race/scenes/RaceScene.ts"), "utf8");
const serverPackage = JSON.parse(readFileSync(resolve(root, "services/stoner-duck-race-server/package.json"), "utf8"));

if (!/massRaceMax:\s*50\b/.test(config)) failures.push("massRaceMax must remain 50");
for (const mode of ["derby", "rally", "chaos"]) {
  if (!new RegExp(`\\b${mode}:\\s*\\{`).test(modes)) failures.push(`missing ${mode} mode profile`);
}

if (!tracks.includes('id: "kush-creek"')) failures.push("Kush Creek track definition is missing");
for (const hazard of ["log", "mud", "whirlpool"]) {
  if (!tracks.includes(`type: "${hazard}"`)) failures.push(`Kush Creek is missing ${hazard} hazard data`);
}
for (const powerup of ["munchie-rush", "dab-blast"]) {
  if (!tracks.includes(`powerup: "${powerup}"`)) failures.push(`Kush Creek is missing ${powerup} pickup data`);
}

if (simulation.includes("Math.random(")) failures.push("shared simulation must not use Math.random()");
if (!simulation.includes("DeterministicRng")) failures.push("shared simulation must use deterministic RNG");
if (!simulation.includes("currentZoneAt")) failures.push("simulation must consume track current data");
if (!simulation.includes("resolveTrackInteractions")) failures.push("simulation must resolve track hazards and pickups");
if (!simulation.includes("activatePowerup")) failures.push("simulation must activate collected powerups");
if (!scene.includes("touchState")) failures.push("Rally/Chaos must retain touch controls");
if (!scene.includes("KeyCodes.E")) failures.push("keyboard powerup control is missing");
if (!serverPackage.dependencies?.colyseus) failures.push("multiplayer server must declare Colyseus");

if (failures.length) {
  console.error("Stoner Duck Race verification failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("Stoner Duck Race verification passed: 50 racers, three modes, Kush Creek currents/hazards/pickups, deterministic simulation, touch controls, route, docs, and multiplayer scaffold are present.");
