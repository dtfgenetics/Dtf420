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

export function buildCultivarProfileSummaries(samples, { minimumSamples = 3 } = {}) {
  const cultivars = new Map();

  for (const sample of samples) {
    if (!sample.cultivarSlug) continue;
    if (!cultivars.has(sample.cultivarSlug)) {
      cultivars.set(sample.cultivarSlug, {
        cultivarSlug: sample.cultivarSlug,
        sampleIds: new Set(),
        labIds: new Set(),
        analytes: new Map(),
      });
    }

    const cultivar = cultivars.get(sample.cultivarSlug);
    cultivar.sampleIds.add(sample.sampleId);
    if (sample.labId) cultivar.labIds.add(sample.labId);

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

      return {
        cultivarSlug: cultivar.cultivarSlug,
        sampleCount: cultivar.sampleIds.size,
        labCount: cultivar.labIds.size,
        minimumSamples,
        analytes,
        publishable: cultivar.sampleIds.size >= minimumSamples && analytes.length > 0,
      };
    })
    .sort((a, b) => b.sampleCount - a.sampleCount || a.cultivarSlug.localeCompare(b.cultivarSlug));
}
