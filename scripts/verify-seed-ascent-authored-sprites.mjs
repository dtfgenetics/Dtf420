import fs from "node:fs";
import vm from "node:vm";

const files={
  launcher:"public/seed-ascent.html",
  manifest:"public/seed-ascent/animation-manifest.js",
  loader:"public/seed-ascent/authored-sprite-loader.js",
  runtime:"public/seed-ascent/player-animation-runtime.js",
};

for(const path of Object.values(files)){
  if(!fs.existsSync(path))throw new Error(`Missing authored sprite integration file: ${path}`);
}

const launcher=fs.readFileSync(files.launcher,"utf8");
const manifestSource=fs.readFileSync(files.manifest,"utf8");
const loaderSource=fs.readFileSync(files.loader,"utf8");
const runtimeSource=fs.readFileSync(files.runtime,"utf8");

for(const marker of [
  '/seed-ascent/animation-manifest.js',
  '/seed-ascent/authored-sprite-loader.js',
  '/seed-ascent/player-animation-controller.js',
  '/seed-ascent/engine.js',
  '/seed-ascent/player-animation-runtime.js',
]){
  if(!launcher.includes(marker))throw new Error(`Seed Ascent launcher missing authored sprite integration marker: ${marker}`);
}

const order=[
  launcher.indexOf('/seed-ascent/animation-manifest.js'),
  launcher.indexOf('/seed-ascent/authored-sprite-loader.js'),
  launcher.indexOf('/seed-ascent/player-animation-controller.js'),
  launcher.indexOf('/seed-ascent/engine.js'),
  launcher.indexOf('/seed-ascent/player-animation-runtime.js'),
];
if(!order.every((value,index)=>index===0||value>order[index-1]))throw new Error('Authored sprite scripts must load manifest -> loader -> controller -> engine -> runtime');

new vm.Script(manifestSource,{filename:files.manifest});
new vm.Script(loaderSource,{filename:files.loader});
new vm.Script(runtimeSource,{filename:files.runtime});

class FakeImage{
  constructor(){this.listeners=new Map();this._src='';}
  addEventListener(name,fn){this.listeners.set(name,fn);}
  set src(value){this._src=value;}
  get src(){return this._src;}
}

const sandbox={window:{},Image:FakeImage};
vm.createContext(sandbox);
vm.runInContext(manifestSource,sandbox);
vm.runInContext(loaderSource,sandbox);

const authored=sandbox.window.SEED_ASCENT_AUTHORED_SPRITES;
if(!authored?.getTarget||!authored?.keyForState)throw new Error('Authored sprite loader did not register');

const cases=[
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
for(const [state,power,expected] of cases){
  const actual=authored.keyForState(state,power);
  if(actual!==expected)throw new Error(`Authored sprite routing mismatch for ${state}/${power}: ${actual} !== ${expected}`);
}

for(const key of ['base','fire','electric','ice']){
  const target=authored.getTarget(key==='base'?'idle':`${key}Attack`,key.toUpperCase());
  if(!target?.target?.src?.endsWith('-animations.webp'))throw new Error(`Missing authored animation target for ${key}`);
  if(target.status!=='loading')throw new Error(`New authored sprite target ${key} should begin in loading state`);
}

for(const marker of [
  'playerAnimationSheet',
  'playerAnimationSheetStatus',
  'playerAnimationUsingAuthored',
  'authoredAssets',
  "target?.status==='ready'",
]){
  if(!runtimeSource.includes(marker))throw new Error(`Animation runtime missing authored sprite fallback marker: ${marker}`);
}

console.log('Seed Ascent authored sprite integration verification passed: loader routing, script order, runtime status publication, and fallback contract.');
