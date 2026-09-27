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
const layout=read("app/layout.tsx");
const docs=read("docs/RESPONSIVE_LAYOUT_STANDARD.md");
const atlasViewport = read("components/atlas/AtlasInteractiveViewport.module.css");
const livingAtlas = read("components/atlas/LivingPlantAtlas.module.css");
const terpeneAtlas = read("components/terpenes/TerpeneAtlasExplorer.module.css");
const terpeneCultivar = read("components/terpenes/TerpeneCultivarBrowser.module.css");
const atlasInteractive = read("components/atlas/AtlasInteractiveViewport.module.css");
const livingPlantAtlas = read("components/atlas/LivingPlantAtlas.module.css");
if (/\.titleBlock p\s*\{[^}]*font-size:\s*0\.4\drem/.test(livingAtlas) || /\.titleBlock > span\s*\{[^}]*font-size:\s*0\.6\drem/.test(livingAtlas)) {
  failures.push("Living Plant Atlas mobile title copy must remain readable and must not regress to micro-text.");
}
if (/100vh/.test(atlasViewport)) {
  failures.push("Atlas interactive fullscreen must use 100dvh so mobile browser chrome cannot clip the viewport.");
}
if (/\.layerPanel button\s*\{[^}]*min-height:\s*(?:3\d|4[0-3])px/.test(atlasViewport)) {
  failures.push("Atlas mobile layer controls must keep a minimum 44px touch target.");
}
for (const [label, source, legacy] of [
  ["Atlas interactive viewport", atlasInteractive, /max-width:\s*(?:620|1240)px/],
  ["Living Plant Atlas", livingPlantAtlas, /max-width:\s*760px/],
  ["Terpene cultivar browser", terpeneCultivar, /max-width:\s*(?:620|720|760|980|1050|1180)px/],
]) {
  if (legacy.test(source)) failures.push(`${label} reintroduced a legacy responsive breakpoint outside the shared 700/900/1120 bands.`);
}

if (/\.neighborControls select\s*\{[^}]*min-height:\s*(?:3\d|4[0-3])px/.test(terpeneCultivar)) {
  failures.push("Terpene browser selects must keep a minimum 44px touch target.");
}
if (/\.source a\s*\{[^}]*min-height:\s*(?:3\d|4[0-3])px/.test(terpeneCultivar)) {
  failures.push("Terpene browser source actions must keep a minimum 44px touch target.");
}
if (/max-width:\s*1160px/.test(terpeneAtlas)) {
  failures.push("Terpene Atlas must use the shared 1120px compact-desktop boundary instead of 1160px.");
}
if (/calc\(100% - 28px\)/.test(terpeneAtlas)) {
  failures.push("Terpene Atlas shell must use the shared page-gutter token instead of a hard-coded 28px width deduction.");
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

const whoTookItCss = read("app/games/who-took-it/page.module.css");
const highIqCss = read("app/games/high-iq/page.module.css");
const strainShowdownCss = read("app/games/strain-showdown/page.module.css");
const atlasMasteryQuizCss = read("components/atlas/AtlasPathMasteryQuiz.module.css");
const terpeneChapterQuizCss = read("components/terpenes/TerpeneChapterQuiz.module.css");
const budOrBluffCss = read("app/games/bud-or-bluff/page.module.css");
const growerConversationsCss = read("app/games/grower-conversations/page.module.css");
const duckRaceCss = read("components/game/StonerDuckRaceGame.module.css");

if (/@media\s*\(max-width:\s*(?:1050|640)px\)/.test(whoTookItCss)) {
  failures.push("Who Took It must use the canonical 1120/700 responsive bands instead of legacy 1050/640 breakpoints.");
}
if (!/max-height:\s*calc\(100dvh - 2rem\)/.test(whoTookItCss) || !/overscroll-behavior:\s*contain/.test(whoTookItCss)) {
  failures.push("Who Took It fixed result/age overlays must remain bounded and scrollable within 100dvh.");
}
if (!/min-height:\s*min\(620px,\s*calc\(100dvh - 120px\)\)/.test(highIqCss)) {
  failures.push("High IQ play stage must remain bounded to the dynamic viewport height.");
}
if (!/min-height:\s*min\(440px,\s*calc\(100dvh - 180px\)\)/.test(strainShowdownCss)) {
  failures.push("Strain Showdown arena cards/console must remain bounded to the dynamic viewport height.");
}

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

if (/@media\s*\(max-width:\s*720px\)/.test(atlasMasteryQuizCss) || /@media\s*\(max-width:\s*720px\)/.test(terpeneChapterQuizCss)) {
  failures.push("Assessment quiz layouts must use the canonical 700px phone band instead of the legacy 720px breakpoint.");
}
if (!/\.quizOptions label\s*\{[^}]*min-height:\s*48px/.test(atlasMasteryQuizCss)) {
  failures.push("Atlas mastery answer choices must keep an explicit 48px hit area.");
}
if (!/\.options button\s*\{[^}]*min-height:44px/.test(terpeneChapterQuizCss)) {
  failures.push("Terpene knowledge-check answer buttons must keep a minimum 44px touch target.");
}
const terpeneChapterQuizTsx = read("components/terpenes/TerpeneChapterQuiz.tsx");
if (!/const \[submitted, setSubmitted\]/.test(terpeneChapterQuizTsx) || !/submitted && answeredQuestion/.test(terpeneChapterQuizTsx)) {
  failures.push("Terpene knowledge check must grade and reveal explanations only after explicit submission.");
}
if (/correct so far/.test(terpeneChapterQuizTsx)) {
  failures.push("Terpene knowledge check must not expose running correctness during an active assessment.");
}
if (!/@media\s*\(orientation:\s*landscape\)\s*and\s*\(max-height:\s*560px\)/.test(highIqCss)) {
  failures.push("High IQ must keep a constrained-height landscape layout.");
}
if (!/@media\s*\(orientation:\s*landscape\)\s*and\s*\(max-height:\s*560px\)/.test(strainShowdownCss)) {
  failures.push("Strain Showdown must keep a constrained-height landscape layout.");
}

const toolsPageTsx = read("app/tools/page.tsx");
for (const requiredHref of ["/learn/atlas", "/learn/terpenes", "/learn/tools/ppfd-mapping-grid", "/learn/tools/vpd-environment-log", "/learn/tools/ph-ec-calibration-log"]) {
  if (!toolsPageTsx.includes(requiredHref)) failures.push(`Tools hub is missing required connected tool route: ${requiredHref}`);
}

const geneticsCss = read("app/seeds/genetics.module.css");
if (!/\.breadcrumb a\s*\{[^}]*min-height:\s*var\(--touch-target\)/.test(geneticsCss)) {
  failures.push("Genetics breadcrumb links must retain the shared touch-target floor.");
}
if (!/\.lineage\s*\{[^}]*overflow-wrap:\s*anywhere/.test(geneticsCss)) {
  failures.push("Genetics lineage strings must remain overflow-safe on narrow screens.");
}

const learnToolsCss = read("app/learn/tools/page.module.css");
if (!/@media\s*\(min-width:\s*701px\)\s*and\s*\(max-width:\s*900px\)[\s\S]*?\.grid\s*\{\s*grid-template-columns:\s*repeat\(2/.test(learnToolsCss)) {
  failures.push("Printable learning tools must retain a deliberate two-column tablet layout.");
}
if (!/\.relatedLinks a\s*\{[^}]*min-height:\s*var\(--touch-target\)/.test(learnToolsCss)) {
  failures.push("Printable learning-tool related links must retain the shared touch-target floor.");
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
need(globals,/\.site-footer__column a\s*\{[^}]*min-height:\s*var\(--touch-target\)/,"Footer links must retain the shared touch-target floor.");
need(globals,/:where\(h1, h2, h3, h4, p, li, a, button, label, summary\)\s*\{[^}]*overflow-wrap:\s*break-word/,"Shared typography must retain safe wrapping for long labels and content.");
need(globals,/@media\s*\(min-width:\s*701px\)\s*and\s*\(max-width:\s*900px\)/,"globals.css must keep the deliberate 701–900px tablet band.");
need(globals,/@media\s*\(max-width:\s*700px\)/,"globals.css must keep the canonical phone breakpoint.");
need(globals,/@media\s*\(max-width:\s*520px\)/,"globals.css must keep the narrow-phone composition breakpoint.");
need(globals,/minmax\(0\s*,\s*1fr\)/,"globals.css must retain shrink-safe grid columns.");
need(globals,/min-width\s*:\s*0/,"globals.css must retain min-width:0 overflow protection.");
need(globals,/overflow-x\s*:\s*auto/,"globals.css must retain local horizontal scrolling.");
need(globals,/100dvh/,"globals.css must account for dynamic mobile viewport height.");

if (/home-mobile\.css/.test(layout)) {
  failures.push("Root layout must not load a second global mobile stylesheet; responsive shell rules belong in globals.css.");
}
need(globals,/--content-readable\s*:\s*760px/,"globals.css must retain a dedicated readable-content width.");
need(globals,/--content-workspace\s*:\s*1440px/,"globals.css must retain a wider application workspace width.");
need(globals,/--space-9\s*:\s*96px/,"globals.css must retain the shared spacing scale.");

need(
  globals,
  /@media\s*\(max-width:\s*520px\)[\s\S]*?\.home-discovery\s*\{[\s\S]*?grid-template-columns\s*:\s*1fr/,
  "Small-phone homepage discovery must collapse to one column."
);

need(docs,/360\s*[×x]\s*800/,"Responsive standard must retain the phone QA matrix.");
need(docs,/768\s*[×x]\s*1024/,"Responsive standard must retain the tablet QA matrix.");
need(docs,/1440\s*[×x]\s*900/,"Responsive standard must retain the desktop QA matrix.");
need(docs,/844\s*[×x]\s*390/,"Responsive standard must retain the landscape-phone QA case.");

const learnResponsiveFiles = {
  "Atlas landing": read("app/learn/atlas/AtlasPage.module.css"),
  "Atlas practice": read("app/learn/atlas/practice/page.module.css"),
  "Glossary": read("app/learn/glossary/page.module.css"),
  "Plant health": read("app/learn/plant-health/page.module.css"),
  "Terpene detail": read("app/learn/terpenes/[slug]/page.module.css"),
  "Terpene chapters": read("app/learn/terpenes/chapters/page.module.css"),
  "Terpene genetics": read("app/learn/terpenes/genetics/page.module.css"),
  "Terpene research": read("app/learn/terpenes/research/page.module.css"),
};
for (const [label, source] of Object.entries(learnResponsiveFiles)) {
  if (/@media\s*\([^)]*max-width:\s*(?:560|600|620|680|720|760|820|850)px/.test(source)) {
    failures.push(`${label} reintroduced a legacy breakpoint outside the shared 700/900 responsive bands.`);
  }
}
if (/calc\(100% - 28px\)/.test(learnResponsiveFiles["Terpene detail"])) {
  failures.push("Terpene detail page must use the shared page-gutter token instead of a hard-coded 28px width deduction.");
}

const atlasResponsiveFiles = {
  "Atlas lesson": read("app/learn/atlas/[system]/[lesson]/page.module.css"),
  "Atlas interactive lab": read("components/atlas/AtlasInteractiveLab.module.css"),
  "Atlas core lab": read("components/atlas/AtlasCoreInteractiveLab.module.css"),
  "Atlas compare lab": read("components/atlas/AtlasCompareLab.module.css"),
  "Atlas diagnostic case lab": read("components/atlas/AtlasDiagnosticCaseLab.module.css"),
  "Atlas review lab": read("components/atlas/AtlasReviewLab.module.css"),
};
for (const [label, source] of Object.entries(atlasResponsiveFiles)) {
  if (/@media\s*\([^)]*max-width:\s*(?:560|620|820|980)px/.test(source)) {
    failures.push(`${label} reintroduced a legacy breakpoint outside the shared responsive bands.`);
  }
}
if (/\.caseRail button\s*\{[^}]*min-height:\s*auto/.test(atlasResponsiveFiles["Atlas diagnostic case lab"])) {
  failures.push("Atlas diagnostic case buttons must keep an explicit mobile touch-target height.");
}
const atlasMasteryCss = read("components/atlas/AtlasMastery.module.css");
if (/@media\s*\([^)]*max-width:\s*720px/.test(atlasMasteryCss)) failures.push("Atlas mastery UI must use the shared 700px phone breakpoint.");
if (!/\.options button\s*\{[^}]*min-height:\s*var\(--touch-target\)/.test(atlasMasteryCss)) {
  failures.push("Atlas knowledge-check answer buttons must retain the shared touch-target floor.");
}
if (!/\.breadcrumb a\s*\{[^}]*min-height:\s*var\(--touch-target\)/.test(atlasResponsiveFiles["Atlas lesson"])) {
  failures.push("Atlas lesson breadcrumb links must retain the shared touch-target floor.");
}

if(failures.length){
  console.error("Responsive layout verification failed:");
  failures.forEach(x=>console.error(`- ${x}`));
  process.exit(1);
}
console.log("Responsive layout contract verified.");
