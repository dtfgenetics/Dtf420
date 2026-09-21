export function quantile(sortedValues, q) {
  if (!sortedValues.length) return null;
  if (sortedValues.length === 1) return sortedValues[0];

  const position = (sortedValues.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sortedValues[lower];

  const weight = position - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

export function summarizeMeasurements(values) {
  const clean = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!clean.length) return null;

  const sum = clean.reduce((total, value) => total + value, 0);
  return {
    n: clean.length,
    min: clean[0],
    q1: quantile(clean, 0.25),
    median: quantile(clean, 0.5),
    q3: quantile(clean, 0.75),
    max: clean[clean.length - 1],
    mean: sum / clean.length,
  };
}

export function sampleDepthTier(sampleCount, labCount) {
  if (sampleCount < 5) return "insufficient";
  if (sampleCount < 10) return labCount >= 2 ? "limited-multi-lab" : "limited-single-lab";
  if (sampleCount < 30) return labCount >= 2 ? "moderate-multi-lab" : "moderate-single-lab";
  return labCount >= 2 ? "high-depth-multi-lab" : "high-depth-single-lab";
}

function addCategory(map, value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return;
  map.set(normalized, (map.get(normalized) ?? 0) + 1);
}

function addMeasurementByKey(map, key, value) {
  const normalized = String(key ?? "").trim();
  if (!normalized || !Number.isFinite(value)) return;
  if (!map.has(normalized)) map.set(normalized, []);
  map.get(normalized).push(value);
}

export function summarizeCategories(map, sampleCount) {
  return [...map.entries()]
    .map(([value, n]) => ({
      value,
      n,
      share: sampleCount > 0 ? n / sampleCount : 0,
    }))
    .sort((a, b) => b.n - a.n || a.value.localeCompare(b.value));
}

export function summarizeConcentration(map) {
  const counts = [...map.values()].filter((value) => Number.isFinite(value) && value > 0);
  const knownCount = counts.reduce((sum, value) => sum + value, 0);
  if (!knownCount) {
    return {
      knownCount: 0,
      distinctCount: 0,
      largestShare: null,
      concentrationIndex: null,
      effectiveCount: null,
    };
  }

  const shares = counts.map((value) => value / knownCount);
  const concentrationIndex = shares.reduce((sum, share) => sum + share ** 2, 0);
  return {
    knownCount,
    distinctCount: counts.length,
    largestShare: Math.max(...shares),
    concentrationIndex,
    effectiveCount: concentrationIndex > 0 ? 1 / concentrationIndex : null,
  };
}

function categoryCoverage(map, sampleCount) {
  const known = [...map.values()].reduce((sum, value) => sum + value, 0);
  return sampleCount > 0 ? known / sampleCount : 0;
}

function createRegionalAccumulator(region) {
  return {
    region,
    sampleIds: new Set(),
    labIds: new Set(),
    producerIds: new Set(),
    totalTerpeneValues: [],
    analytes: new Map(),
  };
}

function addRegionalSample(regionGroup, sample) {
  regionGroup.sampleIds.add(sample.sampleId);
  if (sample.labId) regionGroup.labIds.add(sample.labId);
  if (sample.producerId) regionGroup.producerIds.add(sample.producerId);
  if (Number.isFinite(sample.totalTerpenes)) regionGroup.totalTerpeneValues.push(sample.totalTerpenes);

  for (const measurement of sample.measurements ?? []) {
    if (!regionGroup.analytes.has(measurement.normalizedKey)) {
      regionGroup.analytes.set(measurement.normalizedKey, {
        normalizedKey: measurement.normalizedKey,
        canonicalSlug: measurement.canonicalSlug,
        measurementKind: measurement.measurementKind,
        values: [],
      });
    }
    regionGroup.analytes.get(measurement.normalizedKey).values.push(measurement.value);
  }
}

export function buildCultivarProfileSummaries(
  samples,
  { minimumSamples = 5, minimumRegionSamples = minimumSamples } = {},
) {
  const cultivars = new Map();

  for (const sample of samples) {
    if (!sample.cultivarSlug) continue;
    if (!cultivars.has(sample.cultivarSlug)) {
      cultivars.set(sample.cultivarSlug, {
        cultivarSlug: sample.cultivarSlug,
        sampleIds: new Set(),
        labIds: new Set(),
        producerIds: new Set(),
        labCounts: new Map(),
        producerCounts: new Map(),
        totalTerpeneValues: [],
        regions: new Map(),
        productCategories: new Map(),
        chemotypes: new Map(),
        topTerpenes: new Map(),
        analytes: new Map(),
        regionGroups: new Map(),
      });
    }

    const cultivar = cultivars.get(sample.cultivarSlug);
    cultivar.sampleIds.add(sample.sampleId);
    if (sample.labId) {
      cultivar.labIds.add(sample.labId);
      addCategory(cultivar.labCounts, sample.labId);
    }
    if (sample.producerId) {
      cultivar.producerIds.add(sample.producerId);
      addCategory(cultivar.producerCounts, sample.producerId);
    }
    if (Number.isFinite(sample.totalTerpenes)) cultivar.totalTerpeneValues.push(sample.totalTerpenes);

    addCategory(cultivar.regions, sample.region);
    const region = String(sample.region ?? "").trim();
    if (region) {
      if (!cultivar.regionGroups.has(region)) {
        cultivar.regionGroups.set(region, createRegionalAccumulator(region));
      }
      addRegionalSample(cultivar.regionGroups.get(region), sample);
    }

    addCategory(cultivar.productCategories, sample.productCategory);
    addCategory(cultivar.chemotypes, sample.chemotype);
    addCategory(cultivar.topTerpenes, sample.topTerpeneSourceField);

    for (const measurement of sample.measurements ?? []) {
      if (!cultivar.analytes.has(measurement.normalizedKey)) {
        cultivar.analytes.set(measurement.normalizedKey, {
          normalizedKey: measurement.normalizedKey,
          canonicalSlug: measurement.canonicalSlug,
          measurementKind: measurement.measurementKind,
          values: [],
          labIds: new Set(),
          labValues: new Map(),
        });
      }
      const analyte = cultivar.analytes.get(measurement.normalizedKey);
      analyte.values.push(measurement.value);
      if (sample.labId) {
        analyte.labIds.add(sample.labId);
        addMeasurementByKey(analyte.labValues, sample.labId, measurement.value);
      }
    }
  }

  return [...cultivars.values()]
    .map((cultivar) => {
      const sampleCount = cultivar.sampleIds.size;
      const labCount = cultivar.labIds.size;
      const producerCount = cultivar.producerIds.size;
      const regionStats = summarizeCategories(cultivar.regions, sampleCount);
      const productStats = summarizeCategories(cultivar.productCategories, sampleCount);
      const chemotypeStats = summarizeCategories(cultivar.chemotypes, sampleCount);
      const topTerpeneStats = summarizeCategories(cultivar.topTerpenes, sampleCount);
      const totalTerpenes = summarizeMeasurements(cultivar.totalTerpeneValues);

      const analytes = [...cultivar.analytes.values()]
        .map((analyte) => {
          const summary = summarizeMeasurements(analyte.values);
          const labMedians = [...analyte.labValues.values()]
            .map((values) => summarizeMeasurements(values)?.median)
            .filter(Number.isFinite);

          return {
            normalizedKey: analyte.normalizedKey,
            canonicalSlug: analyte.canonicalSlug,
            measurementKind: analyte.measurementKind,
            labCount: analyte.labIds.size,
            ...summary,
            sampleCoverage: summary && sampleCount > 0 ? summary.n / sampleCount : 0,
            relativeIqr:
              summary && summary.median > 0
                ? (summary.q3 - summary.q1) / summary.median
                : null,
            labMedianDistribution: summarizeMeasurements(labMedians),
          };
        })
        .filter((analyte) => analyte.n >= minimumSamples)
        .sort((a, b) => (b.median ?? 0) - (a.median ?? 0));

      const regionStrata = [...cultivar.regionGroups.values()]
        .map((regionGroup) => {
          const regionSampleCount = regionGroup.sampleIds.size;
          if (regionSampleCount < minimumRegionSamples) return null;

          const regionAnalytes = [...regionGroup.analytes.values()]
            .map((analyte) => ({
              normalizedKey: analyte.normalizedKey,
              canonicalSlug: analyte.canonicalSlug,
              measurementKind: analyte.measurementKind,
              ...summarizeMeasurements(analyte.values),
            }))
            .filter((analyte) => analyte.n >= minimumRegionSamples)
            .sort((a, b) => (b.median ?? 0) - (a.median ?? 0));

          return {
            region: regionGroup.region,
            sampleCount: regionSampleCount,
            labCount: regionGroup.labIds.size,
            producerCount: regionGroup.producerIds.size,
            sampleDepthTier: sampleDepthTier(regionSampleCount, regionGroup.labIds.size),
            totalTerpenes: summarizeMeasurements(regionGroup.totalTerpeneValues),
            analytes: regionAnalytes,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.sampleCount - a.sampleCount || a.region.localeCompare(b.region));

      return {
        cultivarSlug: cultivar.cultivarSlug,
        sampleCount,
        labCount,
        producerCount,
        sampleDepthTier: sampleDepthTier(sampleCount, labCount),
        minimumSamples,
        totalTerpenes,
        regions: regionStats,
        productCategories: productStats,
        chemotypes: chemotypeStats,
        topTerpenes: topTerpeneStats,
        regionStrata,
        dataQuality: {
          labs: summarizeConcentration(cultivar.labCounts),
          producers: summarizeConcentration(cultivar.producerCounts),
          totalTerpeneCoverage:
            sampleCount > 0 ? cultivar.totalTerpeneValues.length / sampleCount : 0,
          regionCoverage: categoryCoverage(cultivar.regions, sampleCount),
          productCategoryCoverage: categoryCoverage(cultivar.productCategories, sampleCount),
          chemotypeCoverage: categoryCoverage(cultivar.chemotypes, sampleCount),
          largestRegionShare: regionStats[0]?.share ?? null,
          largestProductCategoryShare: productStats[0]?.share ?? null,
          largestChemotypeShare: chemotypeStats[0]?.share ?? null,
        },
        analytes,
        publishable: sampleCount >= minimumSamples && analytes.length > 0,
      };
    })
    .sort((a, b) => b.sampleCount - a.sampleCount || a.cultivarSlug.localeCompare(b.cultivarSlug));
}
