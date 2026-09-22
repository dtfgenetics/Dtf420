import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import {
  compactCandidate,
  stableRegistryId,
} from "./lib/universal-registry.mjs";

async function writeJson(filePath, value) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, JSON.stringify(value) + "\n", "utf8");
}

function mergeCluster(existing, candidate) {
  if (!existing) {
    return {
      id: stableRegistryId(candidate.identity.key),
      identity: candidate.identity,
      canonicalName: candidate.name,
      names: candidate.name ? [candidate.name] : [],
      synonyms: candidate.synonyms,
      formula: candidate.formula,
      molecularWeight: candidate.molecularWeight,
      family: candidate.familyAssignment.family,
      familyAssignment: candidate.familyAssignment,
      classification: candidate.classification,
      candidateReasons: candidate.candidateReason ? [candidate.candidateReason] : [],
      candidateConfidences: candidate.candidateConfidence ? [candidate.candidateConfidence] : [],
      sourceRefs: candidate.sourceRecordId
        ? [{ sourceId: candidate.sourceId, sourceRelease: candidate.sourceRelease, sourceRecordId: candidate.sourceRecordId }]
        : [],
      sourceOrganisms: candidate.sourceOrganismsRaw ? [candidate.sourceOrganismsRaw] : [],
      reviewStatus: "unreviewed-source-candidate",
    };
  }

  if (candidate.name && !existing.names.includes(candidate.name)) existing.names.push(candidate.name);
  for (const synonym of candidate.synonyms) {
    if (!existing.synonyms.includes(synonym) && existing.synonyms.length < 50) existing.synonyms.push(synonym);
  }
  if (!existing.canonicalName && candidate.name) existing.canonicalName = candidate.name;
  if (!existing.formula && candidate.formula) existing.formula = candidate.formula;
  if (!existing.molecularWeight && candidate.molecularWeight) existing.molecularWeight = candidate.molecularWeight;
  if (!existing.family && candidate.familyAssignment.family) {
    existing.family = candidate.familyAssignment.family;
    existing.familyAssignment = candidate.familyAssignment;
  }
  if (candidate.candidateReason && !existing.candidateReasons.includes(candidate.candidateReason)) {
    existing.candidateReasons.push(candidate.candidateReason);
  }
  if (candidate.candidateConfidence && !existing.candidateConfidences.includes(candidate.candidateConfidence)) {
    existing.candidateConfidences.push(candidate.candidateConfidence);
  }
  if (candidate.sourceRecordId) {
    existing.sourceRefs.push({
      sourceId: candidate.sourceId,
      sourceRelease: candidate.sourceRelease,
      sourceRecordId: candidate.sourceRecordId,
    });
  }
  if (
    candidate.sourceOrganismsRaw &&
    !existing.sourceOrganisms.includes(candidate.sourceOrganismsRaw) &&
    existing.sourceOrganisms.length < 20
  ) {
    existing.sourceOrganisms.push(candidate.sourceOrganismsRaw);
  }
  return existing;
}

function chunks(items, size) {
  const output = [];
  for (let index = 0; index < items.length; index += size) {
    output.push(items.slice(index, index + size));
  }
  return output;
}

export async function buildUniversalRegistry({
  inputPath,
  outputDir,
  release = "unknown",
  shardSize = 5000,
}) {
  const clusters = new Map();
  const unresolvedIdentity = [];
  let inputRecords = 0;

  const input = readline.createInterface({
    input: fs.createReadStream(inputPath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  for await (const line of input) {
    if (!line.trim()) continue;
    inputRecords += 1;
    const candidate = compactCandidate(JSON.parse(line));

    if (!candidate.identity) {
      if (unresolvedIdentity.length < 5000) {
        unresolvedIdentity.push({
          sourceId: candidate.sourceId,
          sourceRelease: candidate.sourceRelease,
          sourceRecordId: candidate.sourceRecordId,
          name: candidate.name,
          formula: candidate.formula,
          familyAssignment: candidate.familyAssignment,
          reason: "missing-exact-identity-signal",
        });
      }
      continue;
    }

    clusters.set(candidate.identity.key, mergeCluster(clusters.get(candidate.identity.key), candidate));
  }

  const records = [...clusters.values()].sort((a, b) =>
    (a.canonicalName ?? a.id).localeCompare(b.canonicalName ?? b.id),
  );

  const families = [
    "hemiterpene",
    "monoterpene",
    "sesquiterpene",
    "diterpene",
    "sesterterpene",
    "triterpene",
    "tetraterpene",
    "polyterpene",
    "unresolved",
  ];

  const familyCounts = Object.fromEntries(families.map((family) => [family, 0]));
  const familyFiles = [];

  for (const family of families) {
    const matching = records.filter((record) =>
      family === "unresolved" ? !record.family : record.family === family,
    );
    familyCounts[family] = matching.length;

    const familyChunks = chunks(matching, shardSize);
    if (!familyChunks.length) {
      const filename = `registry-${family}-01.json`;
      await writeJson(path.join(outputDir, filename), []);
      familyFiles.push({ family, filename, count: 0, part: 1 });
      continue;
    }

    for (let index = 0; index < familyChunks.length; index += 1) {
      const filename = `registry-${family}-${String(index + 1).padStart(2, "0")}.json`;
      await writeJson(path.join(outputDir, filename), familyChunks[index]);
      familyFiles.push({
        family,
        filename,
        count: familyChunks[index].length,
        part: index + 1,
      });
    }
  }

  const manifest = {
    schemaVersion: 1,
    sourceId: "COCONUT",
    sourceRelease: release,
    generatedAt: new Date().toISOString(),
    inputCandidateRecords: inputRecords,
    resolvedIdentityRecords: records.length,
    unresolvedIdentityCount: Math.max(0, inputRecords - records.reduce((sum, record) => sum + record.sourceRefs.length, 0)),
    unresolvedIdentitySampleCount: unresolvedIdentity.length,
    familyCounts,
    shardSize,
    reviewStatus: "unreviewed-source-candidates",
    identityPolicy: ["full-inchikey", "canonical-smiles", "never-name-only"],
    familyPolicy: ["explicit-classification-first", "exact-carbon-count-fallback", "unresolved-preserved"],
    shards: familyFiles,
  };

  await writeJson(path.join(outputDir, "manifest.json"), manifest);
  await writeJson(path.join(outputDir, "unresolved-identity-sample.json"), unresolvedIdentity);

  return manifest;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , inputArg, outputDirArg, releaseArg = "unknown"] = process.argv;
  if (!inputArg || !outputDirArg) {
    console.error("Usage: node scripts/terpenes/build-universal-registry.mjs <normalized.jsonl> <output-dir> [release]");
    process.exit(1);
  }
  const manifest = await buildUniversalRegistry({
    inputPath: path.resolve(inputArg),
    outputDir: path.resolve(outputDirArg),
    release: releaseArg,
  });
  console.log(JSON.stringify(manifest, null, 2));
}
