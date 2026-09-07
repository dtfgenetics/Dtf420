import fs from "node:fs";
import vm from "node:vm";

const launcherPath="public/seed-ascent.html";
const manifestPath="public/seed-ascent/animation-manifest.js";

for(const path of [launcherPath,manifestPath]){
  if(!fs.existsSync(path))throw new Error(`Missing Seed Ascent animation file: ${path}`);
}

const launcher=fs.readFileSync(launcherPath,"utf8");
const source=fs.readFileSync(manifestPath,"utf8");
if(!launcher.includes('/seed-ascent/animation-manifest.js'))throw new Error("Seed Ascent launcher must load the animation manifest");

new vm.Script(source,{filename:manifestPath});
const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(source,sandbox);
const manifest=sandbox.window.SEED_ASCENT_ANIMATIONS;
if(!manifest)throw new Error("Seed Ascent animation manifest did not register");

const requiredStates=['idle','run','jump','fall','land','hurt','fireAttack','electricAttack','iceAttack','transform','revert'];
for(const name of requiredStates){
  const state=manifest.states?.[name];
  if(!state)throw new Error(`Missing Seed Man animation state: ${name}`);
  if(!Array.isArray(state.frames)||state.frames.length===0)throw new Error(`Animation ${name} has no fallback frames`);
  if(!Number.isFinite(state.fps)||state.fps<1||state.fps>30)throw new Error(`Animation ${name} has invalid fps: ${state.fps}`);
  if(!Array.isArray(state.anchor)||state.anchor.length!==2)throw new Error(`Animation ${name} requires a shared 2D anchor`);
}

if(manifest.fallback?.src!=='/seed-ascent/assets/seed-man-sprites.webp')throw new Error("Animation fallback must preserve the approved Seed Man sheet");
if(manifest.fallback?.frameWidth!==222||manifest.fallback?.frameHeight!==222)throw new Error("Fallback Seed Man frames must remain 222x222");

for(const power of ['fire','electric','ice']){
  const target=manifest.authoredTargets?.[power];
  if(!target?.src?.endsWith('-animations.webp'))throw new Error(`Missing authored ${power} animation target`);
  if(target.frameWidth!==222||target.frameHeight!==222)throw new Error(`${power} animation target must preserve the 222px production frame grid`);
}

const worlds=Object.keys(manifest.worldMotion||{});
if(worlds.length!==12)throw new Error(`Expected 12 world motion profiles; found ${worlds.length}`);
for(const world of worlds){
  if(!/^\d-\d$/.test(world))throw new Error(`Invalid world animation key: ${world}`);
  if(!Array.isArray(manifest.worldMotion[world])||manifest.worldMotion[world].length<2)throw new Error(`${world} needs layered world motion`);
}

const attackMap={FIRE:'fireAttack',ELECTRIC:'electricAttack',ICE:'iceAttack'};
for(const [power,state] of Object.entries(attackMap)){
  if(manifest.resolveAttack(power)!==state)throw new Error(`Attack resolver mismatch for ${power}`);
}

console.log(`Seed Ascent animation verification passed: ${requiredStates.length} character states, 3 phenotype attack families, ${worlds.length} world motion profiles, approved-sheet fallback.`);
