import fs from "node:fs";
import path from "node:path";
import { summarizeMeasurements } from "./lib/cultivar-statistics.mjs";

export function buildCultivarIntelligenceIndex(input) {
  const publishable = (input.cultivars ?? []).filter((cultivar) => cultivar.publishable);
  const analytes = new Map();

  const cultivars = publishable
    .map((cultivar) => {
      const vector = {};
      for (const analyte of cultivar.analytes ?? []) {
        vector[analyte.normalizedKey] = analyte.median;

        if (!analytes.has(analyte.normalizedKey)) {
          analytes.set(analyte.normalizedKey, {
            normalizedKey: analyte.normalizedKey,
            canonicalSlug: analyte.canonicalSlug,
            measurementKind: analyte.measurementKind,
            cultivarMedians: [],
            measuredSamples: 0,
            multiLabCultivars: 0,
          });
        }

        const aggregate = analytes.get(analyte.normalizedKey);
        aggregate.cultivarMedians.push(analyte.median);
        aggregate.measuredSamples += analyte.n;
        if (analyte.labCount >= 2) aggregate.multiLabCultivars += 1;
      }

      return {
        cultivarSlug: cultivar.cultivarSlug,
        sampleCount: cultivar.sampleCount,
        labCount: cultivar.labCount,
        producerCount: cultivar.producerCount ?? 0,
        sampleDepthTier: cultivar.sampleDepthTier,
        totalTerpenesMedian: cultivar.totalTerpenes?.median ?? null,
        topTerpenes: (cultivar.topTerpenes ?? []).slice(0, 3),
        vector,
      };
    })
    .sort((a, b) => a.cultivarSlug.localeCompare(b.cultivarSlug));

  const analyteSummaries = [...analytes.values()]
    .map((analyte) => {
      const distribution = summarizeMeasurements(analyte.cultivarMedians);
      return {
        normalizedKey: analyte.normalizedKey,
        canonicalSlug: analyte.canonicalSlug,
        measurementKind: analyte.measurementKind,
        cultivarCount: analyte.cultivarMedians.length,
        cultivarShare: publishable.length
          ? analyte.cultivarMedians.length / publishable.length
          : 0,
        measuredSamples: analyte.measuredSamples,
        multiLabCultivars: analyte.multiLabCultivars,
        cultivarMedianDistribution: distribution,
      };
    })
    .sort((a, b) => b.cultivarCount - a.cultivarCount || a.normalizedKey.localeCompare(b.normalizedKey));

  return {
    schemaVersion: 1,
    status: "compiled",
    sourceId: input.sourceId,
    sourceSampleCount: input.sampleCount,
    cultivarCount: cultivars.length,
    analyteCount: analyteSummaries.length,
    generatedAt: new Date().toISOString(),
    interpretation:
      "Global index values summarize compiled cultivar-group chemistry. Similarity and prevalence are descriptive chemistry measures, not effect, quality, or genetic-identity scores.",
    analytes: analyteSummaries,
    cultivars,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , inputArg, outputArg] = process.argv;
  if (!inputArg || !outputArg) {
    console.error("Usage: node scripts/terpenes/build-cultivar-intelligence-index.mjs <cultivar-stats.json> <output.json>");
    process.exit(1);
  }

  const input = JSON.parse(fs.readFileSync(path.resolve(inputArg), "utf8"));
  const output = buildCultivarIntelligenceIndex(input);
  const outputPath = path.resolve(outputArg);
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.promises.writeFile(outputPath, JSON.stringify(output) + "\n", "utf8");

  console.log(JSON.stringify({
    cultivarCount: output.cultivarCount,
    analyteCount: output.analyteCount,
    outputPath,
  }, null, 2));
}
