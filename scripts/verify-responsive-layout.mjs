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
