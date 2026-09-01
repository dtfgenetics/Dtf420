import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const files = {
  route: path.join(root, "app/games/phenoquest/page.tsx"),
  html: path.join(root, "public/phenoquest/index.html"),
  css: path.join(root, "public/phenoquest/styles.css"),
  runtime: path.join(root, "public/phenoquest/game.js"),
  data: path.join(root, "public/phenoquest/game-data.json"),
  hub: path.join(root, "app/games/page.tsx"),
};

const [route, html, css, runtime, dataText, hub] = await Promise.all(
  Object.values(files).map((file) => fs.readFile(file, "utf8")),
);

const data = JSON.parse(dataText);
const errors = [];

function requireText(source, text, label) {
  if (!source.includes(text)) errors.push(`${label}: missing ${JSON.stringify(text)}`);
}

requireText(route, 'src="/phenoquest/index.html"', "route iframe");
requireText(route, "Development preview", "route status");
requireText(hub, 'href="/games/phenoquest"', "games hub route");
requireText(hub, "PhenoQuest", "games hub title");
requireText(hub, "Development preview", "games hub preview status");
requireText(html, "three@0.185.1", "pinned Three.js runtime");
requireText(html, 'id="starter-panel"', "starter selection UI");
requireText(html, 'id="battle-panel"', "Resolve Trial UI");
requireText(html, 'id="log-panel"', "PhenoLog UI");
requireText(html, 'id="move-pad"', "touch movement control");
requireText(html, 'id="look-pad"', "touch look control");
requireText(html, 'id="jump-button"', "touch jump control");
requireText(html, 'id="interact-button"', "touch interaction control");

requireText(runtime, 'const GAME_VERSION = "0.1.0"', "runtime version");
requireText(runtime, "new THREE.WebGLRenderer", "3D renderer");
requireText(runtime, "localStorage.setItem", "local save");
requireText(runtime, "function chooseStarter", "starter flow");
requireText(runtime, "function startBattle", "Resolve Trial flow");
requireText(runtime, "function useBattleAction", "battle actions");
requireText(runtime, "function updateGate", "Team Lockout progression gate");
requireText(runtime, "gardenTrialComplete", "Garden Trial progression");
requireText(runtime, "function renderLog", "PhenoLog");
requireText(runtime, "function playerCollides", "collision system");
requireText(runtime, "function jump()", "jump system");
requireText(runtime, "window.__PHENOQUEST__", "browser test hook");
requireText(runtime, "renderer.dispose()", "renderer cleanup");
requireText(runtime, "ResizeObserver", "responsive rendering");
requireText(css, "@media (pointer: coarse)", "touch layout");
requireText(css, "env(safe-area-inset", "safe-area support");
requireText(css, "touch-action: none", "gesture isolation");

if (!Array.isArray(data.phenos) || data.phenos.length !== 6) errors.push(`data: expected exactly 6 MVP Phenos, got ${data.phenos?.length ?? "missing"}`);
const phenoIds = new Set();
for (const [index, pheno] of (data.phenos || []).entries()) {
  if (!pheno.id || !pheno.name || !pheno.affinity) errors.push(`data: Pheno ${index + 1} is missing id/name/affinity`);
  if (phenoIds.has(pheno.id)) errors.push(`data: duplicate Pheno id ${pheno.id}`);
  phenoIds.add(pheno.id);
  for (const stat of ["resolve", "power", "guard", "speed", "focus"]) {
    if (!Number.isFinite(pheno.stats?.[stat]) || pheno.stats[stat] <= 0) errors.push(`data: ${pheno.id} has invalid ${stat}`);
  }
  if (!pheno.signature?.name || !Number.isFinite(pheno.signature?.power)) errors.push(`data: ${pheno.id} has invalid signature`);
}

if (!Array.isArray(data.starters) || data.starters.length !== 3) errors.push("data: expected exactly 3 starter ids");
for (const id of data.starters || []) if (!phenoIds.has(id)) errors.push(`data: starter ${id} does not reference a Pheno`);

if (!Array.isArray(data.encounters) || data.encounters.length !== 6) errors.push(`data: expected 6 field encounters, got ${data.encounters?.length ?? "missing"}`);
const encounterIds = new Set();
for (const encounter of data.encounters || []) {
  if (encounterIds.has(encounter.id)) errors.push(`data: duplicate encounter id ${encounter.id}`);
  encounterIds.add(encounter.id);
  if (!phenoIds.has(encounter.phenoId)) errors.push(`data: encounter ${encounter.id} references unknown Pheno ${encounter.phenoId}`);
  if (!Array.isArray(encounter.position) || encounter.position.length !== 3 || encounter.position.some((value) => !Number.isFinite(value))) errors.push(`data: encounter ${encounter.id} has invalid position`);
}

if (!Number.isInteger(data.progression?.samplesBeforeLockout) || data.progression.samplesBeforeLockout < 2 || data.progression.samplesBeforeLockout > 6) errors.push("data: invalid Team Lockout threshold");
if (!phenoIds.has(data.progression?.gardenTrialBoss)) errors.push("data: Garden Trial boss must reference a canonical Pheno");

const sanitizedRuntime = runtime.replace("export async function startPhenoQuest", "async function startPhenoQuest");
try {
  new Function(sanitizedRuntime);
} catch (error) {
  errors.push(`runtime syntax check failed: ${error instanceof Error ? error.message : String(error)}`);
}

const forbidden = ["pokemon", "pokémon", "pokeball", "pokéball", "placeholder game", "coming soon"];
for (const phrase of forbidden) {
  if (`${route}\n${html}\n${runtime}\n${dataText}`.toLowerCase().includes(phrase)) errors.push(`forbidden derivative/placeholder language found: ${phrase}`);
}

if (errors.length) {
  console.error("PhenoQuest verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`PhenoQuest verified: ${data.phenos.length} Phenos, ${data.starters.length} starters, ${data.encounters.length} field encounters, Team Lockout threshold ${data.progression.samplesBeforeLockout}, Garden Trial boss ${data.progression.gardenTrialBoss}.`);
