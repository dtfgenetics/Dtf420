import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const failures=[];

function read(rel){
  const p=path.join(root,rel);
  if(!fs.existsSync(p)){
    failures.push(`Missing required responsive file: ${rel}`);
    return "";
  }
  return fs.readFileSync(p,"utf8");
}
function need(content,re,msg){ if(!re.test(content)) failures.push(msg); }

const globals=read("app/globals.css");
const mobile=read("app/home-mobile.css");
const docs=read("docs/RESPONSIVE_LAYOUT_STANDARD.md");
const atlasViewport = read("components/atlas/AtlasInteractiveViewport.module.css");
const livingAtlas = read("components/atlas/LivingPlantAtlas.module.css");
const terpeneAtlas = read("components/terpenes/TerpeneAtlasExplorer.module.css");
const terpeneCultivar = read("components/terpenes/TerpeneCultivarBrowser.module.css");
if (/100vh/.test(atlasViewport)) {
  failures.push("Atlas interactive fullscreen must use 100dvh so mobile browser chrome cannot clip the viewport.");
}
if (/\.layerPanel button\s*\{[^}]*min-height:\s*(?:3\d|4[0-3])px/.test(atlasViewport)) {
  failures.push("Atlas mobile layer controls must keep a minimum 44px touch target.");
}
if (/\.neighborControls select\s*\{[^}]*min-height:\s*(?:3\d|4[0-3])px/.test(terpeneCultivar)) {
  failures.push("Terpene browser selects must keep a minimum 44px touch target.");
}
if (/\.source a\s*\{[^}]*min-height:\s*(?:3\d|4[0-3])px/.test(terpeneCultivar)) {
  failures.push("Terpene browser source actions must keep a minimum 44px touch target.");
}
if (/(?:\.segmented button|\.viewTabs button)[\s\S]{0,180}min-height:\s*(?:3\d|4[0-3])px/.test(terpeneAtlas)) {
  failures.push("Terpene Atlas view controls must keep a minimum 44px touch target.");
}
if (/\.detailActions a\s*\{[^}]*min-height:\s*(?:3\d|4[0-3])px/.test(terpeneAtlas)) {
  failures.push("Terpene Atlas detail actions must keep a minimum 44px touch target.");
}
if (!/max-height:min\(780px,calc\(100dvh - 64px\)\)/.test(terpeneCultivar)) {
  failures.push("Terpene result panel must remain bounded by dynamic viewport height.");
}
if (!/max-height:min\(680px,calc\(100dvh - 180px\)\)/.test(terpeneCultivar)) {
  failures.push("Terpene prevalence panel must remain bounded by dynamic viewport height.");
}
if (!/max-height:\s*min\(470px,\s*calc\(100dvh - 210px\)\)/.test(livingAtlas)) {
  failures.push("Living Plant Atlas mobile inspector must remain bounded by dynamic viewport height.");
}

const budOrBluffCss = read("app/games/bud-or-bluff/page.module.css");
const growerConversationsCss = read("app/games/grower-conversations/page.module.css");
const duckRaceCss = read("components/game/StonerDuckRaceGame.module.css");

for (const [label, source, patterns] of [
  ["Bud or Bluff", budOrBluffCss, [/\.quitConfirm button[^}]*min-height:\s*(?:3\d|4[0-3])px/, /\.textButton[^}]*min-height:\s*(?:3\d|4[0-3])px/]],
  ["Grower Conversations", growerConversationsCss, [/\.removeButton[^}]*min-height:\s*(?:3\d|4[0-3])px/]],
  ["Stoner Duck Race", duckRaceCss, [
    /\.sourceSwitch button[^}]*min-height:\s*(?:3\d|4[0-3])px/,
    /\.field input[^}]*min-height:\s*(?:3\d|4[0-3])px/,
    /\.startButton[^}]*min-height:\s*(?:3\d|4[0-3])px/,
    /\.backButton[^}]*min-height:\s*(?:3\d|4[0-3])px/,
    /\.inviteBar input[^}]*min-height:\s*(?:3\d|4[0-3])px/,
  ]],
]) {
  for (const pattern of patterns) {
    if (pattern.test(source)) failures.push(`${label} contains an interactive control below the 44px touch-target floor.`);
  }
}

const routeCss = {
  learn: read("app/learn/page.module.css"),
  tools: read("app/tools/page.module.css"),
  academy: read("app/learn/academy/page.module.css"),
  course: read("app/learn/academy/[course]/page.module.css"),
  atlasSystem: read("app/learn/atlas/[system]/page.module.css"),
};

const forbiddenLegacyBreakpoints = [
  ["learn", /max-width:\s*720px/],
  ["tools", /max-width:\s*720px/],
  ["academy", /max-width:\s*760px/],
  ["academy", /min-width:\s*761px/],
  ["academy", /max-width:\s*1050px/],
  ["course", /max-width:\s*860px/],
  ["course", /max-width:\s*620px/],
  ["atlasSystem", /max-width:\s*980px/],
  ["atlasSystem", /max-width:\s*680px/],
];
for (const [name, re] of forbiddenLegacyBreakpoints) {
  if (re.test(routeCss[name])) {
    failures.push(`Route CSS ${name} reintroduced a legacy breakpoint outside the canonical shared bands.`);
  }
}

need(globals,/--page-gutter\s*:\s*clamp\(/,"globals.css must keep a fluid page gutter token.");
need(globals,/--touch-target\s*:\s*44px/,"globals.css must keep a 44px touch-target token.");
need(globals,/@media\s*\(min-width:\s*721px\)\s*and\s*\(max-width:\s*900px\)/,"globals.css must keep the deliberate 721–900px tablet band.");
need(globals,/@media\s*\(max-width:\s*720px\)/,"globals.css must keep the phone breakpoint.");
need(globals,/@media\s*\(max-width:\s*520px\)/,"globals.css must keep the narrow-phone composition breakpoint.");
need(globals,/minmax\(0\s*,\s*1fr\)/,"globals.css must retain shrink-safe grid columns.");
need(globals,/min-width\s*:\s*0/,"globals.css must retain min-width:0 overflow protection.");
need(globals,/overflow-x\s*:\s*auto/,"globals.css must retain local horizontal scrolling.");
need(globals,/100dvh/,"globals.css must account for dynamic mobile viewport height.");

const smallPhoneBlocks=[globals,mobile].join("\n");
need(
  smallPhoneBlocks,
  /@media\s*\(max-width:\s*520px\)[\s\S]*?\.home-discovery\s*\{[\s\S]*?grid-template-columns\s*:\s*1fr/,
  "Small-phone homepage discovery must collapse to one column."
);

need(docs,/360\s*[×x]\s*800/,"Responsive standard must retain the phone QA matrix.");
need(docs,/768\s*[×x]\s*1024/,"Responsive standard must retain the tablet QA matrix.");
need(docs,/1440\s*[×x]\s*900/,"Responsive standard must retain the desktop QA matrix.");

if(failures.length){
  console.error("Responsive layout verification failed:");
  failures.forEach(x=>console.error(`- ${x}`));
  process.exit(1);
}
console.log("Responsive layout contract verified.");
