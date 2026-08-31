import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const files = {
  route: path.join(root, "app/games/dtf-world-lab/page.tsx"),
  html: path.join(root, "public/dtf-world-lab/index.html"),
  css: path.join(root, "public/dtf-world-lab/world.css"),
  world: path.join(root, "public/dtf-world-lab/world.js"),
  hub: path.join(root, "app/games/page.tsx"),
};

const [route, html, css, world, hub] = await Promise.all(
  Object.values(files).map((file) => fs.readFile(file, "utf8")),
);

const errors = [];

function requireText(source, text, label) {
  if (!source.includes(text)) errors.push(`${label}: missing ${JSON.stringify(text)}`);
}

requireText(route, 'src="/dtf-world-lab/index.html"', "route");
requireText(route, "Development preview", "route status copy");
requireText(hub, 'href="/games/dtf-world-lab"', "game hub route");
requireText(hub, "DTF World Lab", "game hub card");
requireText(hub, "Development preview", "game hub status");

requireText(html, "https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js", "pinned Three.js runtime");
requireText(html, 'id="move-pad"', "touch movement control");
requireText(html, 'id="look-pad"', "touch look control");
requireText(html, 'id="jump-button"', "touch jump control");
requireText(html, 'id="interact-button"', "touch interaction control");
requireText(html, 'id="error-panel"', "startup error surface");

requireText(world, 'const WORLD_VERSION = "0.1.0"', "runtime version");
requireText(world, "new THREE.WebGLRenderer", "WebGL renderer");
requireText(world, "renderer.setPixelRatio", "pixel-ratio management");
requireText(world, "ResizeObserver", "responsive resize handling");
requireText(world, "playerCollides", "world collision system");
requireText(world, "attemptMove", "collision-aware movement");
requireText(world, "function jump()", "jump system");
requireText(world, "function interact()", "interaction system");
requireText(world, "updateDiagnostics", "performance diagnostics");
requireText(world, "window.__DTF_WORLD_LAB__", "browser test hook");
requireText(world, "renderer.dispose()", "renderer cleanup");
requireText(world, "cameraYaw = 0", "initial camera faces the greenhouse objective");

requireText(css, "@media (pointer: coarse)", "touch-specific layout");
requireText(css, "env(safe-area-inset", "mobile safe-area handling");
requireText(css, "touch-action: none", "gesture isolation");

const sanitizedWorld = world.replace("export async function startWorldLab", "async function startWorldLab");
try {
  new Function(sanitizedWorld);
} catch (error) {
  errors.push(`world.js syntax check failed: ${error instanceof Error ? error.message : String(error)}`);
}

const forbidden = [
  "TODO: build 3d",
  "placeholder cube",
  "coming soon",
];
for (const phrase of forbidden) {
  if (`${route}\n${html}\n${world}\n${hub}`.toLowerCase().includes(phrase)) {
    errors.push(`forbidden placeholder language found: ${phrase}`);
  }
}

if (errors.length) {
  console.error("DTF World Lab verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("DTF World Lab verified: route, 3D renderer, movement, collision, interaction, touch controls, diagnostics, cleanup, and preview status are present.");
