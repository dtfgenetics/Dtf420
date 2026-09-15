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

const types = readFileSync(resolve(root, "game/stoner-duck-race/types.ts"), "utf8");
const config = readFileSync(resolve(root, "game/stoner-duck-race/config.ts"), "utf8");
const modes = readFileSync(resolve(root, "game/stoner-duck-race/modes.ts"), "utf8");
const tracks = readFileSync(resolve(root, "game/stoner-duck-race/tracks.ts"), "utf8");
const simulation = readFileSync(resolve(root, "game/stoner-duck-race/simulation.ts"), "utf8");
const main = readFileSync(resolve(root, "game/stoner-duck-race/main.ts"), "utf8");
const scene = readFileSync(resolve(root, "game/stoner-duck-race/scenes/RaceScene.ts"), "utf8");
const wrapper = readFileSync(resolve(root, "components/game/StonerDuckRaceGame.tsx"), "utf8");
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
if (!scene.includes("COURSE_WIDTH = 5_200")) failures.push("Kush Creek must render as a full scrolling course");
if (!scene.includes("updateCamera()")) failures.push("race camera follow logic is missing");
if (!scene.includes("setScrollFactor(0)")) failures.push("HUD must remain fixed while the river scrolls");
if (!scene.includes("LEADER CAM")) failures.push("Derby spectator leader camera feedback is missing");

if (!types.includes("DuckRaceLaunchOptions")) failures.push("shared launch-options contract is missing");
if (!main.includes("Math.max(1, Math.min(50")) failures.push("game launch must clamp racers to 1–50");
if (!scene.includes("this.launchOptions.racerCount")) failures.push("scene must honor lobby racer count");
if (!scene.includes("this.launchOptions.playerName")) failures.push("scene must honor lobby player name");
if (!wrapper.includes("setLaunchOptions")) failures.push("pre-race lobby launch state is missing");
if (!wrapper.includes('type="range"') || !wrapper.includes("max={50}")) failures.push("lobby must expose a 1–50 racer control");
for (const mode of ["derby", "rally", "chaos"]) {
  if (!wrapper.includes(`id: "${mode}"`)) failures.push(`lobby is missing ${mode} selection`);
}
if (!wrapper.includes("Race setup")) failures.push("running game must provide a return-to-lobby control");
if (!serverPackage.dependencies?.colyseus) failures.push("multiplayer server must declare Colyseus");

if (failures.length) {
  console.error("Stoner Duck Race verification failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("Stoner Duck Race verification passed: 50 racers, three modes, configurable lobby, scrolling Kush Creek, currents/hazards/pickups, deterministic simulation, touch controls, fixed HUD, spectator camera, route, docs, and multiplayer scaffold are present.");
