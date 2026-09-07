import fs from "node:fs";
import vm from "node:vm";

const launcherPath="public/seed-ascent.html";
const manifestPath="public/seed-ascent/animation-manifest.js";
const loaderPath="public/seed-ascent/authored-sprite-loader.js";
const controllerPath="public/seed-ascent/player-animation-controller.js";
const runtimePath="public/seed-ascent/player-animation-runtime.js";

for(const path of [launcherPath,manifestPath,loaderPath,controllerPath,runtimePath]){
  if(!fs.existsSync(path))throw new Error(`Missing Seed Ascent animation file: ${path}`);
}

const launcher=fs.readFileSync(launcherPath,"utf8");
const source=fs.readFileSync(manifestPath,"utf8");
const loaderSource=fs.readFileSync(loaderPath,"utf8");
const controllerSource=fs.readFileSync(controllerPath,"utf8");
const runtimeSource=fs.readFileSync(runtimePath,"utf8");
if(!launcher.includes('/seed-ascent/animation-manifest.js'))throw new Error("Seed Ascent launcher must load the animation manifest");
if(!launcher.includes('/seed-ascent/authored-sprite-loader.js'))throw new Error("Seed Ascent launcher must load the authored sprite loader");
if(!launcher.includes('/seed-ascent/player-animation-controller.js'))throw new Error("Seed Ascent launcher must load the player animation controller");
if(!launcher.includes('/seed-ascent/player-animation-runtime.js'))throw new Error("Seed Ascent launcher must load the player animation runtime bridge");
const scriptOrder=[
  launcher.indexOf('/seed-ascent/animation-manifest.js'),
  launcher.indexOf('/seed-ascent/authored-sprite-loader.js'),
  launcher.indexOf('/seed-ascent/player-animation-controller.js'),
  launcher.indexOf('/seed-ascent/engine.js'),
  launcher.indexOf('/seed-ascent/player-animation-runtime.js'),
];
if(!scriptOrder.every((value,index)=>index===0||value>scriptOrder[index-1]))throw new Error("Seed Ascent animation scripts must load manifest -> authored loader -> controller -> engine -> runtime");

new vm.Script(source,{filename:manifestPath});
new vm.Script(loaderSource,{filename:loaderPath});
new vm.Script(controllerSource,{filename:controllerPath});
new vm.Script(runtimeSource,{filename:runtimePath});

class FakeImage{
  constructor(){this.listeners=new Map();this._src='';}
  addEventListener(name,fn){this.listeners.set(name,fn);}
  set src(value){this._src=value;}
  get src(){return this._src;}
}

const sandbox={window:{},Image:FakeImage};
vm.createContext(sandbox);
vm.runInContext(source,sandbox);
vm.runInContext(loaderSource,sandbox);
vm.runInContext(controllerSource,sandbox);
const manifest=sandbox.window.SEED_ASCENT_ANIMATIONS;
const authoredApi=sandbox.window.SEED_ASCENT_AUTHORED_SPRITES;
const controllerApi=sandbox.window.SEED_ASCENT_PLAYER_ANIMATION;
if(!manifest)throw new Error("Seed Ascent animation manifest did not register");
if(!authoredApi?.getTarget||!authoredApi?.keyForState)throw new Error("Seed Ascent authored sprite loader did not register");
if(!controllerApi?.createController)throw new Error("Seed Ascent player animation controller did not register");

const requiredStates=['idle','run','jump','fall','land','hurt','fireAttack','electricAttack','iceAttack','transform','revert'];
for(const name of requiredStates){
  const state=manifest.states?.[name];
  if(!state)throw new Error(`Missing Seed Man animation state: ${name}`);
  if(!Array.isArray(state.frames)||state.frames.length===0)throw new Error(`Animation ${name} has no fallback frames`);
  if(!Number.isFinite(state.fps)||state.fps<1||state.fps>30)throw new Error(`Animation ${name} has invalid fps: ${state.fps}`);
  if(!Array.isArray(state.anchor)||state.anchor.length!==2)throw new Error(`Animation ${name} requires a shared 2D anchor`);
  if(!Number.isInteger(state.targetFrames)||state.targetFrames<4||state.targetFrames>12)throw new Error(`Animation ${name} needs a practical authored frame budget`);
}

if(manifest.fallback?.src!=='/seed-ascent/assets/seed-man-sprites.webp')throw new Error("Animation fallback must preserve the approved Seed Man sheet");
if(manifest.fallback?.frameWidth!==222||manifest.fallback?.frameHeight!==222)throw new Error("Fallback Seed Man frames must remain 222x222");

for(const power of ['fire','electric','ice']){
  const target=manifest.authoredTargets?.[power];
  if(!target?.src?.endsWith('-animations.webp'))throw new Error(`Missing authored ${power} animation target`);
  if(target.frameWidth!==222||target.frameHeight!==222)throw new Error(`${power} animation target must preserve the 222px production frame grid`);
}

const authoredRouting=[
  ['idle','NONE','base'],
  ['run','NONE','base'],
  ['jump','FIRE','base'],
  ['transform','FIRE','fire'],
  ['fireAttack','FIRE','fire'],
  ['transform','ELECTRIC','electric'],
  ['electricAttack','ELECTRIC','electric'],
  ['transform','ICE','ice'],
  ['iceAttack','ICE','ice'],
];
for(const [state,power,expected] of authoredRouting){
  const actual=authoredApi.keyForState(state,power);
  if(actual!==expected)throw new Error(`Authored sprite routing mismatch for ${state}/${power}: ${actual} !== ${expected}`);
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

const controller=controllerApi.createController();
if(controller.snapshot().state!=='idle')throw new Error("Animation controller must initialize idle");
if(controller.update(1/60,{grounded:true,vx:4,vy:0}).state!=='run')throw new Error("Animation controller must resolve running movement");
if(controller.update(1/60,{grounded:false,vx:4,vy:-5}).state!=='jump')throw new Error("Animation controller must resolve jump ascent");
if(controller.update(1/60,{grounded:false,vx:4,vy:5}).state!=='fall')throw new Error("Animation controller must resolve falling movement");
controller.trigger('attack',{power:'FIRE'});
if(controller.snapshot().state!=='fireAttack')throw new Error("Animation controller must route FIRE attacks");
controller.update(1/60,{grounded:true,vx:0,vy:0});
if(controller.snapshot().state!=='fireAttack')throw new Error("Movement cannot interrupt a forced attack animation");
controller.trigger('hurt');
if(controller.snapshot().state!=='hurt')throw new Error("Hurt must override lower-priority animation states");
controller.reset();
if(controller.authoredFrame()!==0)throw new Error("Animation controller reset must return to frame zero");

for(const marker of [
  "window.__seedAscentDebug",
  "controller.trigger('hurt')",
  "controller.trigger('transform')",
  "controller.trigger('revert')",
  "controller.trigger('attack',{power:current.power})",
  "canvas.dataset.playerAnimation",
  "canvas.dataset.playerAnimationFrame",
  "canvas.dataset.playerAuthoredFrame",
  "canvas.dataset.playerAnimationSheet",
  "canvas.dataset.playerAnimationSheetStatus",
  "canvas.dataset.playerAnimationUsingAuthored",
  "window.__seedAscentAnimation",
  "authoredAssets",
]){
  if(!runtimeSource.includes(marker))throw new Error(`Animation runtime bridge missing integration marker: ${marker}`);
}

console.log(`Seed Ascent animation verification passed: ${requiredStates.length} character states, authored sheet routing/fallback, controller priority/state timing, runtime gameplay bridge, 3 phenotype attack families, ${worlds.length} world motion profiles.`);
