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
  'id="game"',
  'id="jumpBtn"',
  'id="runBtn"',
  '/seed-ascent/levels.js',
  '/seed-ascent/engine.js',
]) {
  if (!launcher.includes(marker)) throw new Error(`Seed Ascent launcher missing: ${marker}`);
}

for (const marker of [
  "doubleUsed",
  "player.coyote",
  "player.jumpBuffer",
  "game.cameraX",
  "updateEnemies",
  "updateCheckpoints",
  "collectPower",
  "game.power==='RUSH'",
  "payload==='TRI'",
  "addEventListener('pointerdown'",
  "window.addEventListener('blur'",
]) {
  if (!engine.includes(marker)) throw new Error(`Seed Ascent engine missing mechanic: ${marker}`);
}

for (const forbidden of ["touchstart", "mousedown"]) {
  if (engine.includes(forbidden)) throw new Error(`Seed Ascent duplicate-input regression: ${forbidden}`);
}

new vm.Script(levelsSource, { filename: files.levels });
new vm.Script(engine, { filename: files.engine });
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(levelsSource, sandbox);
const levels = sandbox.window.SEED_ASCENT_LEVELS;
if (!Array.isArray(levels) || levels.length < 6) throw new Error("Seed Ascent requires at least six playable levels");
if (!levels.every((level) => level.width > 4000 && level.exit && level.checkpoints?.length)) throw new Error("Every Seed Ascent level must be a full side-scrolling stage with an exit and checkpoint");

if (!route.includes('src="/seed-ascent.html"')) throw new Error("Seed Ascent route is not wired to the launcher");
if (!library.includes('href="/games/seed-ascent"')) throw new Error("Seed Ascent is missing from the Games library");
if (!sitemap.includes('item("/games/seed-ascent"')) throw new Error("Seed Ascent is missing from the sitemap");

console.log(`Seed Ascent verification passed: ${levels.length} side-scrolling levels.`);
