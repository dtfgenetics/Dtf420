import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const errors=[];
const fail=(m)=>errors.push(m);

const queuePath=path.join(root,"docs","CONSOLIDATION_MIGRATION_QUEUE.json");
if(!fs.existsSync(queuePath)) fail("missing consolidation migration queue");
let queue={};
try{queue=JSON.parse(fs.readFileSync(queuePath,"utf8"));}catch(e){fail("invalid migration queue: "+e.message);}

if(queue.repository!=="dtfgenetics/Dtf420") fail("migration queue repository mismatch");
if(queue.status!=="merge-candidate") fail("Dtf420 must remain merge-candidate until reviewed cutover");

for(const p of [
  "deployment/static-overlay.json",
  "public/data/terpenes/registry/unresolved-identity-sample.json",
  "components/education/EducationSearchLegacy.tsx",
  "docs/ATLAS_CONSOLIDATION_AUDIT_2026-09-02.md",
  "components/atlas/AtlasObservationNotebook.tsx",
  "components/atlas/AtlasObservationNotebook.module.css",
  "components/atlas/AtlasObservationCompare.tsx",
  "components/atlas/AtlasObservationCompare.module.css"
]){
  if(fs.existsSync(path.join(root,p))) fail("retired exact duplicate returned: "+p);
}

const expectedOwners=new Map([
  ["tools-and-atlas","dtfgenetics/Tools"],
  ["education","dtfgenetics/thc-grow-hub"],
  ["academy-certification","dtfgenetics/Thc-learning-courses-"],
  ["diagnostics","dtfgenetics/Thc-dataset"]
]);

const lanes=Array.isArray(queue.lanes)?queue.lanes:[];
const ids=new Set();
for(const lane of lanes){
  if(!lane.id||ids.has(lane.id)) fail("migration lane ids must be unique and non-empty");
  ids.add(lane.id);

  if(!Array.isArray(lane.sourcePrefixes)||lane.sourcePrefixes.length===0){
    fail("migration lane missing source prefixes: "+(lane.id||"unknown"));
  }
  if(!lane.canonicalRepository||!lane.disposition){
    fail("migration lane missing owner/disposition: "+(lane.id||"unknown"));
  }
  if(lane.canonicalRepository==="dtfgenetics/Dtf420"){
    fail("Dtf420 cannot declare itself canonical for an overlapping migration lane: "+(lane.id||"unknown"));
  }
}

for(const [id,owner] of expectedOwners){
  const lane=lanes.find((entry)=>entry.id===id);
  if(!lane) fail("missing required migration lane: "+id);
  else if(lane.canonicalRepository!==owner){
    fail(`${id}: canonical owner must be ${owner}`);
  }
}


const toolsLane=lanes.find((entry)=>entry.id==="tools-and-atlas");
const requiredToolsPrefixes=[
  "app/tools/",
  "app/learn/atlas/",
  "app/learn/terpenes/",
  "components/atlas/",
  "components/terpenes/",
  "lib/terpenes/",
  "public/data/terpenes/",
  "content/atlas-",
  "content/education-source-map-atlas-",
  "content/education-sources-atlas-",
  "data/terpenes/",
  "scripts/terpenes/",
  "public/atlas-3d/",
  ".github/workflows/refresh-terpene-"
];
const educationLane=lanes.find((entry)=>entry.id==="education");
if(educationLane){
  for(const prefix of ["app/learn/tools/","content/learning-tools.json"]){
    if(!educationLane.sourcePrefixes.includes(prefix)) fail("education migration lane missing printable-learning prefix: "+prefix);
  }
}

if(toolsLane){
  for(const prefix of requiredToolsPrefixes){
    if(!toolsLane.sourcePrefixes.includes(prefix)) fail("tools-and-atlas migration lane missing known duplicate prefix: "+prefix);
  }
  if(!toolsLane.inventory||toolsLane.inventory.matchedFileCount<300){
    fail("tools-and-atlas migration inventory must document the current duplicate footprint");
  }
}


const notebookCompat=fs.readFileSync(path.join(root,"app/learn/atlas/notebook/page.tsx"),"utf8");
if(!notebookCompat.includes('redirect("/atlas/notebook/")')) fail("legacy Atlas notebook route must redirect to canonical Tools route");

const compareCompat=fs.readFileSync(path.join(root,"app/learn/atlas/notebook/compare/page.tsx"),"utf8");
if(!compareCompat.includes('redirect("/atlas/notebook/compare/")')) fail("legacy Atlas observation compare route must redirect to canonical Tools route");

if(!lanes.some((lane)=>lane.id==="games")){
  fail("missing required migration lane: games");
}

if(errors.length){
  console.error("Consolidation guard failed:");
  for(const e of errors) console.error(" - "+e);
  process.exit(1);
}
console.log("Dtf420 consolidation guard passed; canonical domain ownership remains external until reviewed cutover.");
