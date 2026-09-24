import fs from "node:fs";
import path from "node:path";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function reviewedSlugsFromDataSource(source) {
  return new Set([...source.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]));
}

function majorTpsProducts(tpsData) {
  const map = new Map();
  for (const gene of tpsData.genes ?? []) {
    for (const product of gene.majorProducts ?? []) {
      if (!map.has(product.slug)) map.set(product.slug, []);
      map.get(product.slug).push({
        geneId: gene.id,
        strainOrigin: gene.strainOrigin,
        sourceLocator: gene.sourceLocator,
        evidenceId: product.evidenceId ?? null,
        label: product.label,
      });
    }
  }
  return map;
}

function exactCultivarAnalytes(index) {
  return new Map(
    (index.analytes ?? [])
      .filter((item) => item.canonicalSlug && item.measurementKind === "compound")
      .map((item) => [item.canonicalSlug, item]),
  );
}

function evidenceByCompound(ledger) {
  const map = new Map();
  for (const record of ledger.records ?? []) {
    if (!record.compoundSlug || record.compoundSlug.startsWith("_")) continue;
    if (!["source-verified", "editorial-reviewed"].includes(record.reviewStatus)) continue;
    if (!map.has(record.compoundSlug)) map.set(record.compoundSlug, []);
    map.get(record.compoundSlug).push(record);
  }
  return map;
}

export function buildPromotionQueue({
  reviewedSource,
  evidenceLedger,
  tpsGenes,
  cultivarIndex,
}) {
  const reviewed = reviewedSlugsFromDataSource(reviewedSource);
  const tps = majorTpsProducts(tpsGenes);
  const cultivar = exactCultivarAnalytes(cultivarIndex);
  const evidence = evidenceByCompound(evidenceLedger);
  const candidateSlugs = new Set([...tps.keys(), ...cultivar.keys(), ...evidence.keys()]);

  const candidates = [...candidateSlugs]
    .filter((slug) => !reviewed.has(slug))
    .map((slug) => {
      const tpsMatches = tps.get(slug) ?? [];
      const cultivarRecord = cultivar.get(slug) ?? null;
      const evidenceRecords = evidence.get(slug) ?? [];
      const claimTypes = [...new Set(evidenceRecords.map((record) => record.claimType))].sort();
      const sourceIds = [...new Set(evidenceRecords.map((record) => record.sourceId))].sort();

      let score = 0;
      if (tpsMatches.length) score += 5;
      if (cultivarRecord) score += 5;
      score += Math.min(3, evidenceRecords.length);
      if (cultivarRecord?.multiLabCultivars >= 100) score += 1;
      if (cultivarRecord?.measuredSamples >= 1000) score += 1;

      const status =
        tpsMatches.length && cultivarRecord
          ? "promotion-ready"
          : tpsMatches.length
            ? "needs-exact-cultivar-or-occurrence-review"
            : cultivarRecord
              ? "needs-biological-identity-review"
              : "evidence-review";

      return {
        slug,
        score,
        status,
        exactTpsMajorProduct: tpsMatches.length > 0,
        tpsMatches,
        exactCultivarAnalyte: Boolean(cultivarRecord),
        cultivar: cultivarRecord
          ? {
              measurementKind: cultivarRecord.measurementKind,
              cultivarCount: cultivarRecord.cultivarCount,
              measuredSamples: cultivarRecord.measuredSamples,
              multiLabCultivars: cultivarRecord.multiLabCultivars,
              positiveMedianShare: cultivarRecord.positiveMedianShare,
            }
          : null,
        reviewedEvidenceCount: evidenceRecords.length,
        claimTypes,
        sourceIds,
        nextActions:
          status === "promotion-ready"
            ? [
                "verify exact chemical identity and identifiers",
                "add reviewed compound record",
                "refresh PubChem property/sensory/occurrence caches",
                "verify chapter readiness and source links",
              ]
            : status === "needs-exact-cultivar-or-occurrence-review"
              ? [
                  "verify exact chemical identity and identifiers",
                  "resolve exact Cannabis occurrence/analyte evidence without collapsing isomers",
                  "add reviewed compound record only after exact occurrence review",
                ]
              : [
                  "verify exact chemical identity",
                  "review Cannabis occurrence and genetics evidence",
                ],
      };
    })
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    policy: {
      nameSimilarityEstablishesIdentity: false,
      aggregateIsomersCountAsExactCompound: false,
      tentativeTpsProductsCountAsPromotionReady: false,
      reviewedRecordRequiresExactChemicalIdentity: true,
      reviewedRecordRequiresEvidenceScopedClaims: true,
    },
    reviewedCompoundCount: reviewed.size,
    candidateCount: candidates.length,
    promotionReadyCount: candidates.filter((item) => item.status === "promotion-ready").length,
    candidates,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.cwd();
  const output = buildPromotionQueue({
    reviewedSource: fs.readFileSync(path.join(root, "lib/terpenes/data.ts"), "utf8"),
    evidenceLedger: readJson(path.join(root, "data/terpenes/evidence-ledger.json")),
    tpsGenes: readJson(path.join(root, "data/terpenes/tps-genes.json")),
    cultivarIndex: readJson(path.join(root, "public/data/terpenes/cultivars/index.json")),
  });

  const outputPath = path.join(root, "data/terpenes/review-promotion-queue.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");
  console.log(
    `Promotion queue built: ${output.candidateCount} candidates, ${output.promotionReadyCount} promotion-ready.`,
  );
}
