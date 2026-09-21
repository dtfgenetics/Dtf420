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

export function summarizeCategories(map, sampleCount) {
  return [...map.entries()]
    .map(([value, n]) => ({
      value,
      n,
      share: sampleCount > 0 ? n / sampleCount : 0,
    }))
    .sort((a, b) => b.n - a.n || a.value.localeCompare(b.value));
}

export function buildCultivarProfileSummaries(samples, { minimumSamples = 5 } = {}) {
  const cultivars = new Map();

  for (const sample of samples) {
    if (!sample.cultivarSlug) continue;
    if (!cultivars.has(sample.cultivarSlug)) {
      cultivars.set(sample.cultivarSlug, {
        cultivarSlug: sample.cultivarSlug,
        sampleIds: new Set(),
        labIds: new Set(),
        producerIds: new Set(),
        totalTerpeneValues: [],
        regions: new Map(),
        productCategories: new Map(),
        chemotypes: new Map(),
        topTerpenes: new Map(),
        analytes: new Map(),
      });
    }

    const cultivar = cultivars.get(sample.cultivarSlug);
    cultivar.sampleIds.add(sample.sampleId);
    if (sample.labId) cultivar.labIds.add(sample.labId);
    if (sample.producerId) cultivar.producerIds.add(sample.producerId);
    if (Number.isFinite(sample.totalTerpenes)) cultivar.totalTerpeneValues.push(sample.totalTerpenes);

    addCategory(cultivar.regions, sample.region);
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
        });
      }
      const analyte = cultivar.analytes.get(measurement.normalizedKey);
      analyte.values.push(measurement.value);
      if (sample.labId) analyte.labIds.add(sample.labId);
    }
  }

  return [...cultivars.values()]
    .map((cultivar) => {
      const analytes = [...cultivar.analytes.values()]
        .map((analyte) => ({
          normalizedKey: analyte.normalizedKey,
          canonicalSlug: analyte.canonicalSlug,
          measurementKind: analyte.measurementKind,
          labCount: analyte.labIds.size,
          ...summarizeMeasurements(analyte.values),
        }))
        .filter((analyte) => analyte.n >= minimumSamples)
        .sort((a, b) => (b.median ?? 0) - (a.median ?? 0));

      const sampleCount = cultivar.sampleIds.size;
      const labCount = cultivar.labIds.size;
      return {
        cultivarSlug: cultivar.cultivarSlug,
        sampleCount,
        labCount,
        producerCount: cultivar.producerIds.size,
        sampleDepthTier: sampleDepthTier(sampleCount, labCount),
        minimumSamples,
        totalTerpenes: summarizeMeasurements(cultivar.totalTerpeneValues),
        regions: summarizeCategories(cultivar.regions, sampleCount),
        productCategories: summarizeCategories(cultivar.productCategories, sampleCount),
        chemotypes: summarizeCategories(cultivar.chemotypes, sampleCount),
        topTerpenes: summarizeCategories(cultivar.topTerpenes, sampleCount),
        analytes,
        publishable: sampleCount >= minimumSamples && analytes.length > 0,
      };
    })
    .sort((a, b) => b.sampleCount - a.sampleCount || a.cultivarSlug.localeCompare(b.cultivarSlug));
}
