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

for (const marker of [
  "doubleUsed", "player.coyote", "player.jumpBuffer", "game.cameraX",
  "MAX_SAFE_PIT", "buildGrounds", "resolvePlayerX", "resolvePlayerY",
  "prevBottom<=s.y+LANDING_SLOP&&nextBottom>=s.y", "snapPlayerToFloor",
  "objectLand", "supportAhead", "player.surface==='ice'", "updateEnemies",
  "updateHazards", "updateCheckpoints", "updateBoss", "bossShots",
  "collectPower", "game.power==='RUSH'", "payload==='TRI'", "payload==='BREAK'",
  "window.__seedAscentDebug", "addEventListener('pointerdown'", "window.addEventListener('blur'",
]) {
  if (!engine.includes(marker)) throw new Error(`Seed Ascent engine missing mechanic: ${marker}`);
}

for (const forbidden of ["touchstart", "mousedown", "function collideWorld"]) {
  if (engine.includes(forbidden)) throw new Error(`Seed Ascent regression detected: ${forbidden}`);
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

let widestRawPit = 0;
for (const level of levels) {
  if (level.width <= 4000) throw new Error(`${level.world} is too short for the side-scrolling campaign`);
  if (!level.exit) throw new Error(`${level.world} is missing its grow gate`);
  if (!Array.isArray(level.checkpoints) || level.checkpoints.length === 0) throw new Error(`${level.world} is missing a checkpoint`);
  if (!Array.isArray(level.platforms) || level.platforms.length < 8) throw new Error(`${level.world} needs more platforming structure`);
  if (!Array.isArray(level.enemies) || level.enemies.length < 5) throw new Error(`${level.world} needs more pest encounters`);

  const grounds = [...level.grounds].sort((a, b) => a[0] - b[0]);
  const first = grounds[0];
  if (!(first[0] <= 96 && first[0] + first[1] >= 130)) {
    throw new Error(`${level.world} does not provide a solid spawn floor`);
  }

  for (let i = 0; i < grounds.length - 1; i++) {
    const gap = grounds[i + 1][0] - (grounds[i][0] + grounds[i][1]);
    widestRawPit = Math.max(widestRawPit, gap);
    if (gap > 300) throw new Error(`${level.world} contains an unreasonably wide raw pit (${gap}px)`);
  }

  const hasOpeningStep = level.platforms.some(([x, y]) => x < 900 && y >= 320);
  if (!hasOpeningStep) throw new Error(`${level.world} lacks a forgiving first platform approach`);

  const exitX = level.exit[0] + level.exit[2] / 2;
  if (!grounds.some(([x, w]) => exitX >= x && exitX <= x + w)) {
    throw new Error(`${level.world} grow gate is not supported by ground`);
  }
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

console.log(`Seed Ascent verification passed: ${levels.length} stages, swept floor collision, ${maxSafePit}px effective pit cap, raw max ${widestRawPit}px, platform approach checks, power-ups, hazards, checkpoints, and boss.`);
