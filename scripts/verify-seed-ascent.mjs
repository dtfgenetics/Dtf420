import fs from "node:fs";
import vm from "node:vm";

const files = {
  launcher: "public/seed-ascent.html",
  styles: "public/seed-ascent/styles.css",
  levels: "public/seed-ascent/levels.js",
  engine: "public/seed-ascent/engine.js",
  route: "app/games/seed-ascent/page.tsx",
  library: "app/games/page.tsx",
  sitemap: "app/sitemap.ts",
};

for (const path of Object.values(files)) {
  if (!fs.existsSync(path)) throw new Error(`Missing Seed Ascent package file: ${path}`);
}

const launcher = fs.readFileSync(files.launcher, "utf8");
const styles = fs.readFileSync(files.styles, "utf8");
const levelsSource = fs.readFileSync(files.levels, "utf8");
const engine = fs.readFileSync(files.engine, "utf8");
const route = fs.readFileSync(files.route, "utf8");
const library = fs.readFileSync(files.library, "utf8");
const sitemap = fs.readFileSync(files.sitemap, "utf8");

for (const marker of [
  'id="game"', 'id="jumpBtn"', 'id="runBtn"',
  '/seed-ascent/levels.js', '/seed-ascent/engine.js',
]) {
  if (!launcher.includes(marker)) throw new Error(`Seed Ascent launcher missing: ${marker}`);
}

if (!styles.includes("touch-action:none")) {
  throw new Error("Seed Ascent controls must disable browser touch gestures with touch-action:none");
}

for (const marker of [
  "doubleUsed", "player.coyote", "player.jumpBuffer", "game.cameraX",
  "MAX_SAFE_PIT", "buildGrounds", "resolvePlayerX", "resolvePlayerY",
  "prevBottom<=s.y+LANDING_SLOP&&nextBottom>=s.y", "snapPlayerToFloor",
  "objectLand", "supportAhead", "player.surface==='ice'", "updateEnemies",
  "updateHazards", "updateCheckpoints", "updateBoss", "bossShots",
  "collectPower", "game.power==='RUSH'", "payload==='TRI'", "payload==='BREAK'",
  "SIM_STEP_MS", "MAX_STEPS_PER_FRAME", "while(accumulator>=SIM_STEP_MS",
  "clearInput", "if(e.repeat)return", "activePointers", "pointercancel",
  "const wasActive=activePointers.delete(e.pointerId);if(!wasActive)return",
  "for(const b of blocks)if(b.bump>0)b.bump--;",
  "function canSelectLevel(){return game.mode==='title'||game.mode==='gameOver'}",
  "if(!canSelectLevel())return;game.selectedLevel=",
  "document.addEventListener('visibilitychange'", "window.__seedAscentDebug",
  "addEventListener('pointerdown'", "window.addEventListener('blur'",
]) {
  if (!engine.includes(marker)) throw new Error(`Seed Ascent engine missing mechanic: ${marker}`);
}

for (const forbidden of [
  "touchstart",
  "mousedown",
  "function collideWorld",
  "function loop(){step();draw();requestAnimationFrame(loop)}",
]) {
  if (engine.includes(forbidden)) throw new Error(`Seed Ascent regression detected: ${forbidden}`);
}

const bumpUpdates = engine.match(/for\(const b of blocks\)if\(b\.bump>0\)b\.bump--;/g) || [];
if (bumpUpdates.length !== 1) {
  throw new Error(`Seed Ascent block bump state must advance exactly once in the fixed simulation; found ${bumpUpdates.length} update sites`);
}

new vm.Script(levelsSource, { filename: files.levels });
new vm.Script(engine, { filename: files.engine });

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(levelsSource, sandbox);
const levels = sandbox.window.SEED_ASCENT_LEVELS;

if (!Array.isArray(levels) || levels.length < 12) {
  throw new Error("Seed Ascent requires at least 12 playable side-scrolling stages");
}

const pitMatch = engine.match(/MAX_SAFE_PIT\s*=\s*(\d+)/);
const maxSafePit = pitMatch ? Number(pitMatch[1]) : NaN;
if (!Number.isFinite(maxSafePit) || maxSafePit > 180) {
  throw new Error(`Seed Ascent safe pit width must be <= 180px; got ${maxSafePit}`);
}

const simMatch = engine.match(/SIM_STEP_MS\s*=\s*1000\s*\/\s*(\d+)/);
const simulationHz = simMatch ? Number(simMatch[1]) : NaN;
if (simulationHz !== 60) {
  throw new Error(`Seed Ascent physics must use a fixed 60Hz timestep; got ${simulationHz}`);
}

let widestRawPit = 0;
const geometryErrors = [];
const supportedByGround = (grounds, point) => grounds.some(([x, w]) => point >= x && point <= x + w);

for (const level of levels) {
  if (level.width <= 4000) geometryErrors.push(`${level.world}: stage is too short for the side-scrolling campaign`);
  if (!level.exit) geometryErrors.push(`${level.world}: missing grow gate`);
  if (!Array.isArray(level.checkpoints) || level.checkpoints.length === 0) geometryErrors.push(`${level.world}: missing checkpoint`);
  if (!Array.isArray(level.platforms) || level.platforms.length < 8) geometryErrors.push(`${level.world}: needs more platforming structure`);
  if (!Array.isArray(level.enemies) || level.enemies.length < 5) geometryErrors.push(`${level.world}: needs more pest encounters`);

  const grounds = [...level.grounds].sort((a, b) => a[0] - b[0]);
  const first = grounds[0];
  if (!first || !(first[0] <= 96 && first[0] + first[1] >= 130)) {
    geometryErrors.push(`${level.world}: spawn is not supported by solid ground`);
  }

  for (let i = 0; i < grounds.length - 1; i++) {
    const gap = grounds[i + 1][0] - (grounds[i][0] + grounds[i][1]);
    widestRawPit = Math.max(widestRawPit, gap);
    if (gap > 300) geometryErrors.push(`${level.world}: raw pit ${i + 1} is unreasonably wide (${gap}px)`);
  }

  const hasOpeningStep = level.platforms.some(([x, y]) => x < 900 && y >= 320);
  if (!hasOpeningStep) geometryErrors.push(`${level.world}: lacks a forgiving first platform approach`);

  if (level.exit) {
    const exitX = level.exit[0] + level.exit[2] / 2;
    if (!supportedByGround(grounds, exitX)) {
      geometryErrors.push(`${level.world}: grow gate center x=${exitX} is not supported by raw ground`);
    }
  }

  for (const [index, checkpoint] of (level.checkpoints || []).entries()) {
    const checkpointCenter = checkpoint[0] + 15;
    if (!supportedByGround(grounds, checkpointCenter)) {
      geometryErrors.push(`${level.world}: checkpoint ${index + 1} center x=${checkpointCenter} is positioned over a gap`);
    }
  }
}

if (geometryErrors.length) {
  throw new Error(`Seed Ascent geometry audit failed:\n- ${geometryErrors.join("\n- ")}`);
}

const advanced = levels.slice(1);
if (!advanced.every((level) => level.blocks.some((block) => block[2] === "BREAK"))) {
  throw new Error("Every advanced Seed Ascent stage must contain breakable-route gameplay");
}
if (!advanced.every((level) => Array.isArray(level.hazards) && level.hazards.length > 0)) {
  throw new Error("Every advanced Seed Ascent stage must contain an environmental hazard");
}
if (!levels.at(-1)?.boss) throw new Error("The final Seed Ascent stage must contain a boss encounter");
if (!route.includes('src="/seed-ascent.html"')) throw new Error("Seed Ascent route is not wired to the launcher");
if (!library.includes('href="/games/seed-ascent"')) throw new Error("Seed Ascent is missing from the Games library");
if (!sitemap.includes('item("/games/seed-ascent"')) throw new Error("Seed Ascent is missing from the sitemap");

console.log(`Seed Ascent verification passed: ${levels.length} stages, swept floor collision, ${simulationHz}Hz fixed physics, ${maxSafePit}px effective pit cap, raw max ${widestRawPit}px, supported checkpoints/exits, platform approach checks, idempotent pointer release, safe menu-state level selection, fixed-step block animations, power-ups, hazards, checkpoints, and boss.`);