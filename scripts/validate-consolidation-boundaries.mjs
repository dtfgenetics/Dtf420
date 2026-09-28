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
  "public/data/terpenes/registry/unresolved-identity-sample.json"
]){
  if(fs.existsSync(path.join(root,p))) fail("retired exact duplicate returned: "+p);
}
for(const lane of queue.lanes??[]){
  if(!lane.canonicalRepository||!lane.disposition) fail("migration lane missing owner/disposition: "+(lane.id||"unknown"));
}
if(errors.length){
  console.error("Consolidation guard failed:");
  for(const e of errors) console.error(" - "+e);
  process.exit(1);
}
console.log("Dtf420 consolidation guard passed.");
