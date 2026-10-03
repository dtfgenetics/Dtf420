import fs from "node:fs";
const required=[
  "lib/terpenes/promotion.ts",
  "app/learn/terpenes/promotion/page.tsx",
  "app/learn/terpenes/promotion/page.module.css",
];
for(const file of required) if(!fs.existsSync(file)) throw new Error("Missing terpene promotion governance file: "+file);
const builder=fs.readFileSync("lib/terpenes/promotion.ts","utf8");
for(const token of [
  "nameSimilarityEstablishesIdentity:false",
  "aggregateIsomersCountAsExactCompound:false",
  "tentativeTpsProductsCountAsPromotionReady:false",
  "reviewedRecordRequiresExactChemicalIdentity:true",
  "reviewedRecordRequiresEvidenceScopedClaims:true",
  "terpeneSeedCompounds",
  "majorProducts",
  "measurementKind",
  "reviewStatus",
]) if(!builder.includes(token)) throw new Error("Promotion builder missing safety/data token: "+token);
const page=fs.readFileSync("app/learn/terpenes/promotion/page.tsx","utf8");
for(const token of ["Terpene Review Promotion Queue","Exact evidence outranks name similarity.","Current review queue","A high score prioritizes review work"]) if(!page.includes(token)) throw new Error("Promotion page missing governance token: "+token);
const explorer=fs.readFileSync("components/terpenes/TerpeneAtlasExplorer.tsx","utf8");
if(!explorer.includes('href="/learn/terpenes/promotion"')||!explorer.includes("Open review promotion")) throw new Error("Terpene Atlas explorer missing promotion navigation");
const sitemap=fs.readFileSync("app/sitemap.ts","utf8");
if(!sitemap.includes('item("/learn/terpenes/promotion"')) throw new Error("Sitemap missing terpene promotion route");
console.log("Terpene promotion governance: PASS");
