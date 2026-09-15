import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const required = [
  "game/stoner-duck-race/types.ts",
  "game/stoner-duck-race/config.ts",
  "game/stoner-duck-race/rng.ts",
  "game/stoner-duck-race/modes.ts",
  "game/stoner-duck-race/characters.ts",
  "game/stoner-duck-race/tracks.ts",
  "game/stoner-duck-race/simulation.ts",
  "game/stoner-duck-race/network.ts",
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
for (const relativePath of required) if (!existsSync(resolve(root, relativePath))) failures.push(`missing ${relativePath}`);

const types = readFileSync(resolve(root, "game/stoner-duck-race/types.ts"), "utf8");
const config = readFileSync(resolve(root, "game/stoner-duck-race/config.ts"), "utf8");
const modes = readFileSync(resolve(root, "game/stoner-duck-race/modes.ts"), "utf8");
const characters = readFileSync(resolve(root, "game/stoner-duck-race/characters.ts"), "utf8");
const tracks = readFileSync(resolve(root, "game/stoner-duck-race/tracks.ts"), "utf8");
const simulation = readFileSync(resolve(root, "game/stoner-duck-race/simulation.ts"), "utf8");
const network = readFileSync(resolve(root, "game/stoner-duck-race/network.ts"), "utf8");
const main = readFileSync(resolve(root, "game/stoner-duck-race/main.ts"), "utf8");
const scene = readFileSync(resolve(root, "game/stoner-duck-race/scenes/RaceScene.ts"), "utf8");
const wrapper = readFileSync(resolve(root, "components/game/StonerDuckRaceGame.tsx"), "utf8");
const server = readFileSync(resolve(root, "services/stoner-duck-race-server/src/rooms/RaceRoom.ts"), "utf8");
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const serverPackage = JSON.parse(readFileSync(resolve(root, "services/stoner-duck-race-server/package.json"), "utf8"));

if (!/massRaceMax:\s*50\b/.test(config)) failures.push("massRaceMax must remain 50");
for (const mode of ["derby", "rally", "chaos"]) {
  if (!new RegExp(`\\b${mode}:\\s*\\{`).test(modes)) failures.push(`missing ${mode} mode profile`);
  if (!wrapper.includes(`id: "${mode}"`)) failures.push(`lobby is missing ${mode} selection`);
}

for (const trackId of ["kush-creek", "munchie-marsh", "cloud-9-canal", "rosin-river"]) {
  if (!tracks.includes(`id: "${trackId}"`)) failures.push(`missing ${trackId} track definition`);
  if (!types.includes(`"${trackId}"`)) failures.push(`TrackId is missing ${trackId}`);
}

for (const hazard of ["log", "mud", "whirlpool", "reeds", "sprinkler", "fan", "barrel", "waterfall"]) {
  if (!tracks.includes(`"${hazard}"`)) failures.push(`hazard catalog is missing ${hazard}`);
}

for (const powerup of ["munchie-rush", "dab-blast", "cloud-screen", "bubble-shield", "feather-boost", "snack-magnet", "mega-quack", "super-duck"]) {
  if (!tracks.includes(`"${powerup}"`)) failures.push(`powerup catalog is missing ${powerup}`);
  if (!simulation.includes(`"${powerup}"`)) failures.push(`simulation is missing ${powerup} behavior`);
}

for (const characterId of ["mellow-mallard", "dab-duck", "hippie-quacker", "grower-goose", "rosin-runner", "cloud-nine", "science-duck", "old-school-quack"]) {
  if (!characters.includes(`id: "${characterId}"`)) failures.push(`character catalog is missing ${characterId}`);
}

if (simulation.includes("Math.random(")) failures.push("shared simulation must not use Math.random()");
if (!simulation.includes("DeterministicRng")) failures.push("shared simulation must use deterministic RNG");
if (!simulation.includes("currentZoneAt")) failures.push("simulation must consume track current data");
if (!simulation.includes("resolveTrackInteractions")) failures.push("simulation must resolve track hazards and pickups");
if (!simulation.includes("shieldCharges")) failures.push("simulation must support shield gameplay");
if (!simulation.includes("maybeTriggerChaosEvent")) failures.push("Chaos Derby must apply deterministic chaos events");

if (!scene.includes("touchState")) failures.push("Rally/Chaos must retain touch controls");
if (!scene.includes("KeyCodes.E")) failures.push("keyboard powerup control is missing");
if (!scene.includes("this.track.length")) failures.push("scene must derive scrolling course width from track data");
if (!scene.includes("updateCamera()")) failures.push("race camera follow logic is missing");
if (!scene.includes("setScrollFactor(0)")) failures.push("HUD must remain fixed while the river scrolls");
if (!scene.includes("LEADER CAM")) failures.push("Derby spectator leader camera feedback is missing");
if (!scene.includes("networkConnection")) failures.push("scene must support synchronized online state");

if (!types.includes("DuckRaceLaunchOptions")) failures.push("shared launch-options contract is missing");
if (!types.includes("trackId: TrackId")) failures.push("launch options must carry trackId");
if (!main.includes("Math.max(1, Math.min(50")) failures.push("game launch must clamp racers to 1–50");
if (!main.includes("networkConnection")) failures.push("Phaser launch must accept online room connection");
if (!wrapper.includes("connectDuckRaceRoom")) failures.push("online lobby must call the room adapter");
if (!wrapper.includes("NEXT_PUBLIC_DUCK_RACE_SERVER_URL")) failures.push("online lobby must use an explicit public server endpoint");
if (!wrapper.includes('type="range"') || !wrapper.includes("max={50}")) failures.push("lobby must expose a 1–50 racer control");
if (!wrapper.includes("Create room") || !wrapper.includes("Join room") || !wrapper.includes("Start online race")) failures.push("online room controls are incomplete");
if (!wrapper.includes("Race setup")) failures.push("running game must provide a return-to-lobby control");

if (!packageJson.dependencies?.["@colyseus/sdk"]) failures.push("browser multiplayer SDK must be locked in root dependencies");
if (!serverPackage.dependencies?.colyseus) failures.push("multiplayer server must declare Colyseus");
if (!network.includes("client.create") || !network.includes("client.joinById")) failures.push("room adapter must support create and join-by-id");
if (!network.includes("room.onStateChange")) failures.push("room adapter must subscribe to authoritative state");
if (!server.includes('this.onMessage("start-race"')) failures.push("server must gate race start through host action");
if (!server.includes("hostSessionId")) failures.push("server must track room host ownership");
if (!server.includes("trackId")) failures.push("server must synchronize selected track");

if (failures.length) {
  console.error("Stoner Duck Race verification failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("Stoner Duck Race verification passed: four tracks, eight duck identities, eight power-ups, expanded hazards, deterministic 1–50 racer simulation, local/online lobby, authoritative room flow, touch/keyboard controls, scrolling cameras, and locked Colyseus client/server support are present.");
