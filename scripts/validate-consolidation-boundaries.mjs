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
  "docs/ATLAS_CONSOLIDATION_AUDIT_2026-09-02.md"
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

if(!lanes.some((lane)=>lane.id==="games")){
  fail("missing required migration lane: games");
}

if(errors.length){
  console.error("Consolidation guard failed:");
  for(const e of errors) console.error(" - "+e);
  process.exit(1);
}
console.log("Dtf420 consolidation guard passed; canonical domain ownership remains external until reviewed cutover.");
