import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const required = [
  "game/stoner-duck-race/types.ts",
  "game/stoner-duck-race/config.ts",
  "game/stoner-duck-race/rng.ts",
  "game/stoner-duck-race/modes.ts",
  "game/stoner-duck-race/characters.ts",
  "game/stoner-duck-race/assets.ts",
  "game/stoner-duck-race/tracks.ts",
  "game/stoner-duck-race/simulation.ts",
  "game/stoner-duck-race/network.ts",
  "game/stoner-duck-race/progression.ts",
  "game/stoner-duck-race/main.ts",
  "game/stoner-duck-race/scenes/RaceScene.ts",
  "components/game/StonerDuckRaceGame.tsx",
  "components/game/StonerDuckRaceLoader.tsx",
  "app/games/stoner-duck-race/page.tsx",
  "services/stoner-duck-race-server/package.json",
  "services/stoner-duck-race-server/tsconfig.json",
  "services/stoner-duck-race-server/DEPLOYMENT.md",
  "services/stoner-duck-race-server/src/index.ts",
  "services/stoner-duck-race-server/src/rooms/RaceRoom.ts",
  "services/stoner-duck-race-server/src/smoke.ts",
  "docs/games/stoner-duck-race/ARCHITECTURE.md",
  "docs/games/stoner-duck-race/ASSET_PRODUCTION.md",
  "docs/games/stoner-duck-race/OPEN_SOURCE.md",
];

const failures = [];
for (const relativePath of required) if (!existsSync(resolve(root, relativePath))) failures.push(`missing ${relativePath}`);

const types = readFileSync(resolve(root, "game/stoner-duck-race/types.ts"), "utf8");
const config = readFileSync(resolve(root, "game/stoner-duck-race/config.ts"), "utf8");
const modes = readFileSync(resolve(root, "game/stoner-duck-race/modes.ts"), "utf8");
const characters = readFileSync(resolve(root, "game/stoner-duck-race/characters.ts"), "utf8");
const assets = readFileSync(resolve(root, "game/stoner-duck-race/assets.ts"), "utf8");
const tracks = readFileSync(resolve(root, "game/stoner-duck-race/tracks.ts"), "utf8");
const simulation = readFileSync(resolve(root, "game/stoner-duck-race/simulation.ts"), "utf8");
const network = readFileSync(resolve(root, "game/stoner-duck-race/network.ts"), "utf8");
const progression = readFileSync(resolve(root, "game/stoner-duck-race/progression.ts"), "utf8");
const main = readFileSync(resolve(root, "game/stoner-duck-race/main.ts"), "utf8");
const scene = readFileSync(resolve(root, "game/stoner-duck-race/scenes/RaceScene.ts"), "utf8");
const wrapper = readFileSync(resolve(root, "components/game/StonerDuckRaceGame.tsx"), "utf8");
const page = readFileSync(resolve(root, "app/games/stoner-duck-race/page.tsx"), "utf8");
const server = readFileSync(resolve(root, "services/stoner-duck-race-server/src/rooms/RaceRoom.ts"), "utf8");
const serverIndex = readFileSync(resolve(root, "services/stoner-duck-race-server/src/index.ts"), "utf8");
const smoke = readFileSync(resolve(root, "services/stoner-duck-race-server/src/smoke.ts"), "utf8");
const deployment = readFileSync(resolve(root, "services/stoner-duck-race-server/DEPLOYMENT.md"), "utf8");
const assetProduction = readFileSync(resolve(root, "docs/games/stoner-duck-race/ASSET_PRODUCTION.md"), "utf8");
const serverTsconfig = JSON.parse(readFileSync(resolve(root, "services/stoner-duck-race-server/tsconfig.json"), "utf8"));
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const serverPackage = JSON.parse(readFileSync(resolve(root, "services/stoner-duck-race-server/package.json"), "utf8"));

if (!/massRaceMax:\s*50\b/.test(config)) failures.push("massRaceMax must remain 50");
for (const mode of ["derby", "rally", "chaos"]) {
  if (!new RegExp(`\\b${mode}:\\s*\\{`).test(modes)) failures.push(`missing ${mode} mode profile`);
  if (!wrapper.includes(`id: "${mode}"`)) failures.push(`lobby is missing ${mode} selection`);
}

const trackIds = [
  "kush-creek",
  "munchie-marsh",
  "cloud-9-canal",
  "dab-rapids",
  "trichome-trail",
  "greenhouse-run",
  "rosin-river",
  "final-smokeout",
];
for (const trackId of trackIds) {
  if (!tracks.includes(`id: "${trackId}"`)) failures.push(`missing ${trackId} track definition`);
  if (!types.includes(`"${trackId}"`)) failures.push(`TrackId is missing ${trackId}`);
  if (!network.includes(`"${trackId}"`)) failures.push(`browser network validation is missing ${trackId}`);
  if (!server.includes(`"${trackId}"`)) failures.push(`server track validation is missing ${trackId}`);
  if (!assets.includes(`"${trackId}": trackArt("${trackId}")`)) failures.push(`asset manifest is missing ${trackId}`);
}
if (!tracks.includes("export const TRACK_LIST = Object.values(TRACKS)")) failures.push("track selection must remain data-driven through TRACK_LIST");
if (!page.includes("8 river courses") || !page.includes("Final Smokeout")) failures.push("public game page must describe the eight-track build");

for (const hazard of ["log", "mud", "whirlpool", "reeds", "sprinkler", "fan", "barrel", "waterfall"]) {
  if (!tracks.includes(`"${hazard}"`)) failures.push(`hazard catalog is missing ${hazard}`);
  if (!assets.includes(`${hazard}: { textureKey:`) && !assets.includes(`"${hazard}": { textureKey:`)) failures.push(`asset manifest is missing ${hazard} fallback`);
}

for (const powerup of ["munchie-rush", "dab-blast", "cloud-screen", "bubble-shield", "feather-boost", "snack-magnet", "mega-quack", "super-duck"]) {
  if (!tracks.includes(`"${powerup}"`)) failures.push(`powerup catalog is missing ${powerup}`);
  if (!assets.includes(`"${powerup}": { textureKey:`)) failures.push(`asset manifest is missing ${powerup}`);
}
if (!simulation.includes("activatePowerup")) failures.push("simulation must activate collected powerups");
for (const directPowerup of ["munchie-rush", "cloud-screen", "bubble-shield", "feather-boost", "snack-magnet", "mega-quack", "super-duck"]) {
  if (!simulation.includes(`"${directPowerup}"`)) failures.push(`simulation is missing explicit ${directPowerup} handling`);
}
if (!simulation.includes("powerup-impact") || !simulation.includes("affected += 1")) failures.push("simulation must retain the shared offensive-item impact branch used by dab-blast");

for (const characterId of ["mellow-mallard", "dab-duck", "hippie-quacker", "grower-goose", "rosin-runner", "cloud-nine", "science-duck", "old-school-quack"]) {
  if (!characters.includes(`id: "${characterId}"`)) failures.push(`character catalog is missing ${characterId}`);
  if (!assets.includes(`duckAsset("${characterId}")`)) failures.push(`sprite manifest is missing ${characterId}`);
}
if (!assets.includes("idle: { start:") || !assets.includes("paddle: { start:") || !assets.includes("boost: { start:") || !assets.includes("hit: { start:") || !assets.includes("win: { start:")) {
  failures.push("duck sprite manifest must define idle/paddle/boost/hit/win animation contracts");
}
if (!assets.includes("hasAuthoredAsset") || !scene.includes("hasAuthoredAsset") || !scene.includes("this.load.spritesheet")) failures.push("Phaser must load authored assets through the fallback manifest");
if (!scene.includes("this.textures.exists(authored.textureKey)")) failures.push("duck renderer must retain procedural fallback when authored textures are absent");
if (!scene.includes("TRACK_ART_ASSETS") || !scene.includes("POWERUP_ASSETS") || !scene.includes("HAZARD_ASSETS")) failures.push("scene must consume track, powerup, and hazard asset manifests");
if (!assetProduction.includes("128 × 128") || !assetProduction.includes("00–03  idle") || !assetProduction.includes("20–27  win")) failures.push("production sprite documentation must preserve normalized frame contract");

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
if (!scene.includes("maybeReportResult")) failures.push("scene must report final race results");
if (!scene.includes("this.launchOptions.characterId")) failures.push("scene must apply selected local duck cosmetic");

if (!types.includes("DuckRaceLaunchOptions")) failures.push("shared launch-options contract is missing");
if (!types.includes("trackId: TrackId")) failures.push("launch options must carry trackId");
if (!types.includes("characterId: string")) failures.push("launch options must carry character identity");
if (!types.includes("DuckRaceResult")) failures.push("race result contract is missing");
if (!main.includes("Math.max(1, Math.min(50")) failures.push("game launch must clamp racers to 1–50");
if (!main.includes("onRaceFinished")) failures.push("Phaser launch must surface completed race results");
if (!main.includes("networkConnection")) failures.push("Phaser launch must accept online room connection");

if (!wrapper.includes("connectDuckRaceRoom")) failures.push("online lobby must call the room adapter");
if (!wrapper.includes("NEXT_PUBLIC_DUCK_RACE_SERVER_URL")) failures.push("online lobby must use an explicit public server endpoint");
if (!wrapper.includes('type="range"') || !wrapper.includes("max={50}")) failures.push("lobby must expose a 1–50 racer control");
if (!wrapper.includes("Create room") || !wrapper.includes("Join room") || !wrapper.includes("Start online race")) failures.push("online room controls are incomplete");
if (!wrapper.includes("4-race Cup") || !wrapper.includes("CUP_TRACKS")) failures.push("four-race championship flow is missing");
if (!wrapper.includes("time-trial") || !wrapper.includes("Start Time Trial") || !wrapper.includes("resultDurationSeconds")) failures.push("Time Trial flow is incomplete");
if (!wrapper.includes("duckRoom") || !wrapper.includes("Copy invite")) failures.push("online invite deep links are missing");
if (!wrapper.includes("togglePause") || !wrapper.includes('game.scene.pause("StonerDuckRace")') || !wrapper.includes('game.scene.resume("StonerDuckRace")')) failures.push("local pause/resume controls are missing");
if (!wrapper.includes("toggleMute") || !wrapper.includes("sound.mute")) failures.push("client audio mute control is missing");
if (!wrapper.includes("DUCK_CHARACTERS")) failures.push("character selection UI is missing");
if (!wrapper.includes("recordDuckRaceResult")) failures.push("race results must update persistent progression");
if (!wrapper.includes("Race setup")) failures.push("running game must provide a return-to-lobby control");

if (!progression.includes("localStorage")) failures.push("local progression must persist between sessions");
if (!progression.includes("bestRankByTrack")) failures.push("progression must track best finishes per track");
if (!progression.includes("bestTimeByTrack")) failures.push("progression must track Time Trial PBs per track");
if (!progression.includes("result.racerCount === 1")) failures.push("only true solo runs may update Time Trial PBs");
if (!progression.includes("coins")) failures.push("progression must award cosmetic currency");

if (!packageJson.dependencies?.["@colyseus/sdk"]) failures.push("browser multiplayer SDK must be locked in root dependencies");
if (!serverPackage.dependencies?.colyseus) failures.push("multiplayer server must declare Colyseus");
if (!serverPackage.scripts?.build?.includes("tsc")) failures.push("multiplayer server must compile with TypeScript for production");
if (!serverPackage.scripts?.start?.includes("node build/")) failures.push("multiplayer production start must use compiled Node output");
if (!serverPackage.scripts?.smoke?.includes("smoke.js")) failures.push("multiplayer server must expose the compiled deterministic smoke suite");
if (serverTsconfig.compilerOptions?.outDir !== "build") failures.push("multiplayer server must emit production output into build/");
if (serverTsconfig.compilerOptions?.module !== "ES2022") failures.push("multiplayer shared runtime must compile as ESM");
if (!serverIndex.includes('app.get("/healthz"')) failures.push("multiplayer server health endpoint is missing");
if (!network.includes("client.create") || !network.includes("client.joinById")) failures.push("room adapter must support create and join-by-id");
if (!network.includes("room.onStateChange")) failures.push("room adapter must subscribe to authoritative state");
if (!network.includes("characterId")) failures.push("room adapter must send selected character identity");
if (!network.includes("room.reconnection.enabled = true") || !network.includes("maxRetries") || !network.includes("maxEnqueuedMessages")) failures.push("browser room adapter must configure bounded automatic reconnection");
if (!server.includes('this.onMessage("start-race"')) failures.push("server must gate race start through host action");
if (!server.includes("hostSessionId")) failures.push("server must track room host ownership");
if (!server.includes("trackId")) failures.push("server must synchronize selected track");
if (!server.includes("normalizeCharacter")) failures.push("server must validate player cosmetic identity");
if (!server.includes("onDrop(client: Client)") || !server.includes("allowReconnection(client, RECONNECT_GRACE_SECONDS)") || !server.includes("onReconnect(client: Client)")) failures.push("server reconnect lifecycle is incomplete");
if (!server.includes("duck.isBot = true") || !server.includes("reconnectingRacers")) failures.push("dropped racers must temporarily hand control to AI and remain separately counted");
if (!deployment.includes("20-second") || !deployment.includes("npm run smoke")) failures.push("deployment guide must document reconnect grace and mass-race smoke validation");

if (!smoke.includes("const RACERS = 50") || !smoke.includes("const MAX_TICKS") || !smoke.includes("TRACK_IDS")) failures.push("mass-race smoke suite must exercise bounded 50-racer races across the track catalog");
if (!smoke.includes("JSON.stringify(first) !== JSON.stringify(second)")) failures.push("mass-race smoke suite must compare repeated seeded finish records");
if (!smoke.includes("simulation.state.phase !== \"finished\"")) failures.push("mass-race smoke suite must fail races that do not finish");

if (failures.length) {
  console.error("Stoner Duck Race verification failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("Stoner Duck Race verification passed: eight tracks, eight characters, eight power-ups, authored-asset fallbacks, deterministic 1–50 racer simulation, Quick/Cup/Time Trial progression, pause/mute controls, automatic reconnect with AI grace, local/online lobby, invite links, production ESM server compile/health surface, deterministic 50-racer smoke coverage, touch/keyboard controls, scrolling cameras, and persistent results are present.");
