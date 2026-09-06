import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const candidates = JSON.parse(fs.readFileSync(path.join(root, "content", "atlas-model-candidates.json"), "utf8"));
const licenseEvidence = JSON.parse(fs.readFileSync(path.join(root, "content", "atlas-model-license-evidence.json"), "utf8"));
const errors = [];

if (licenseEvidence.schemaVersion !== 1) errors.push("Atlas model license evidence schemaVersion must be 1.");
if (typeof licenseEvidence.verifiedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(licenseEvidence.verifiedAt)) {
  errors.push("Atlas model license evidence needs verifiedAt YYYY-MM-DD.");
}
if (!Array.isArray(licenseEvidence.evidence)) errors.push("Atlas model license evidence must define evidence[].");

const candidateMap = new Map((candidates.candidates || []).map((candidate) => [candidate.id, candidate]));
const evidenceMap = new Map();
const allowedCompatibility = new Set([
  "compatible-standalone-browser-glb",
  "pending-package-license-verification",
  "incompatible-standalone-browser-glb",
]);

for (const record of licenseEvidence.evidence || []) {
  if (!candidateMap.has(record.candidateId)) errors.push(`License evidence references unknown candidate: ${record.candidateId}`);
  if (evidenceMap.has(record.candidateId)) errors.push(`Duplicate license evidence for candidate: ${record.candidateId}`);
  evidenceMap.set(record.candidateId, record);
  if (!allowedCompatibility.has(record.distributionCompatibility)) {
    errors.push(`${record.candidateId} has invalid distributionCompatibility: ${record.distributionCompatibility}`);
  }
  if (!Array.isArray(record.evidenceUrls) || record.evidenceUrls.length < 1 || record.evidenceUrls.some((url) => typeof url !== "string" || !url.startsWith("https://"))) {
    errors.push(`${record.candidateId} needs HTTPS license evidence URLs.`);
  }
  if (typeof record.finding !== "string" || record.finding.trim().length < 80) errors.push(`${record.candidateId} needs a substantive rights finding.`);
  if (typeof record.releaseCaveat !== "string" || record.releaseCaveat.trim().length < 80) errors.push(`${record.candidateId} needs a substantive release caveat.`);
}

for (const candidate of candidateMap.values()) {
  const evidence = evidenceMap.get(candidate.id);
  if (!evidence) {
    errors.push(`Missing dated license evidence for Atlas model candidate: ${candidate.id}`);
    continue;
  }
  if (evidence.expectedRightsState !== candidate.rights?.state) {
    errors.push(`${candidate.id} rights drift: candidate=${candidate.rights?.state}, evidence=${evidence.expectedRightsState}`);
  }
  if (candidate.rights?.state === "verified-for-public-web" && evidence.distributionCompatibility !== "compatible-standalone-browser-glb") {
    errors.push(`${candidate.id} cannot remain verified-for-public-web without standalone-browser-GLB-compatible evidence.`);
  }
  if (evidence.distributionCompatibility === "incompatible-standalone-browser-glb" && candidate.role !== "quality-benchmark" && candidate.status !== "rejected") {
    errors.push(`${candidate.id} has incompatible standalone-browser-GLB rights and must be benchmark-only or rejected.`);
  }
  if (evidence.distributionCompatibility === "pending-package-license-verification" && candidate.releaseEligible === true) {
    errors.push(`${candidate.id} cannot be releaseEligible while package license verification is pending.`);
  }
}

if (evidenceMap.size !== candidateMap.size) {
  errors.push(`Atlas model candidate/license evidence count mismatch: ${candidateMap.size} candidates vs ${evidenceMap.size} evidence records.`);
}

if (errors.length) {
  console.error("Atlas model license evidence verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Atlas model license evidence verified: ${evidenceMap.size} candidates checked on ${licenseEvidence.verifiedAt}.`);
