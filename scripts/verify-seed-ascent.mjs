import fs from "node:fs";
import vm from "node:vm";

const gamePath = "public/seed-ascent.html";
const routePath = "app/games/seed-ascent/page.tsx";
const libraryPath = "app/games/page.tsx";
const sitemapPath = "app/sitemap.ts";

for (const path of [gamePath, routePath, libraryPath, sitemapPath]) {
  if (!fs.existsSync(path)) throw new Error(`Missing Seed Ascent package file: ${path}`);
}

const game = fs.readFileSync(gamePath, "utf8");
const route = fs.readFileSync(routePath, "utf8");
const library = fs.readFileSync(libraryPath, "utf8");
const sitemap = fs.readFileSync(sitemapPath, "utf8");

const requiredGameMarkers = [
  'id="gameCanvas"',
  'id="startBtn"',
  'id="strainBtn"',
  'id="mobileJump"',
  "const targetCam = H * 0.55 - player.y;",
  "if (targetCam > cameraY)",
  "platforms = platforms.filter(p => p.y < cleanupY);",
  "game.score = game.heightScore + game.bonusScore;",
  "canvas.addEventListener('pointerdown'",
  "window.addEventListener('blur'",
];

for (const marker of requiredGameMarkers) {
  if (!game.includes(marker)) throw new Error(`Seed Ascent missing required marker: ${marker}`);
}

const forbiddenGameMarkers = [
  "const targetCam = player.y - H * 0.55;",
  "platforms = platforms.filter(p => p.y > player.y - H * 1.5);",
  "canvas.addEventListener('touchstart'",
];

for (const marker of forbiddenGameMarkers) {
  if (game.includes(marker)) throw new Error(`Seed Ascent regression detected: ${marker}`);
}

const scriptMatch = game.match(/<script>([\s\S]*?)<\/script>/i);
if (!scriptMatch) throw new Error("Seed Ascent script block not found");
new vm.Script(scriptMatch[1], { filename: gamePath });

if (!route.includes('src="/seed-ascent.html"')) throw new Error("Seed Ascent route is not wired to the packaged game");
if (!library.includes('href="/games/seed-ascent"')) throw new Error("Seed Ascent is missing from the Games library");
if (!sitemap.includes('item("/games/seed-ascent"')) throw new Error("Seed Ascent is missing from the sitemap");

console.log("Seed Ascent verification passed.");
