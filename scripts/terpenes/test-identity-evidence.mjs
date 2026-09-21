import fs from "node:fs";
import path from "node:path";
import { resolveIdentityRecords } from "./lib/identity.mjs";
import { validateEvidenceLedger } from "./validate-evidence-ledger.mjs";

const root = process.cwd();
const identityRows = fs
  .readFileSync(path.join(root, "scripts/terpenes/fixtures/identity-records.jsonl"), "utf8")
  .trim()
  .split("\n")
  .map(JSON.parse);

const result = resolveIdentityRecords(identityRows);

const mergedCluster = result.clusters.find((cluster) => cluster.sourceCount === 2);
if (!mergedCluster) throw new Error("Expected exact full-InChIKey duplicate records to cluster");

if (result.clusters.some((cluster) => cluster.records.some((r) => r.sourceRecordId === "c2") && cluster.records.some((r) => r.sourceRecordId === "c1"))) {
  throw new Error("Different full InChIKeys were incorrectly merged");
}

if (result.clusters.some((cluster) => cluster.records.some((r) => r.sourceRecordId === "c3") && cluster.records.some((r) => r.sourceRecordId === "c1"))) {
  throw new Error("Same/similar names must not drive identity merging");
}

if (!result.conflicts.some((conflict) => conflict.reason === "same-pubchem-cid-different-inchikey")) {
  throw new Error("Expected PubChem CID/InChIKey conflict was not quarantined");
}

if (!result.unresolved.some((record) => record.sourceRecordId === "c5")) {
  throw new Error("Name-only unresolved record was not preserved");
}

const registry = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/source-registry.json"), "utf8"));
const evidence = JSON.parse(fs.readFileSync(path.join(root, "scripts/terpenes/fixtures/evidence-ledger.json"), "utf8"));
const evidenceErrors = validateEvidenceLedger(evidence, registry);
if (evidenceErrors.length) throw new Error(evidenceErrors.join("\n"));

const invalid = structuredClone(evidence);
invalid.records.push({
  ...invalid.records[0],
  id: "fixture-invalid-effect",
  claimType: "biological-effect",
  studyType: "chemical-analysis",
});
const invalidErrors = validateEvidenceLedger(invalid, registry);
if (!invalidErrors.some((error) => error.includes("biological-effect cannot be supported only by chemical-analysis"))) {
  throw new Error("Evidence validator allowed chemical occurrence to stand in for biological-effect evidence");
}

console.log("Terpene identity and evidence validation passed.");
