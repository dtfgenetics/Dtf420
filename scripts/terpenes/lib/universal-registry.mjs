import crypto from "node:crypto";

const FAMILY_RULES = [
  ["hemiterpene", /\bhemiterpen(?:e|oid|es|oids)?\b/i],
  ["monoterpene", /\bmonoterpen(?:e|oid|es|oids)?\b/i],
  ["sesquiterpene", /\bsesquiterpen(?:e|oid|es|oids)?\b/i],
  ["diterpene", /\bditerpen(?:e|oid|es|oids)?\b/i],
  ["sesterterpene", /\bsesterterpen(?:e|oid|es|oids)?\b/i],
  ["triterpene", /\btriterpen(?:e|oid|es|oids)?\b/i],
  ["tetraterpene", /\btetraterpen(?:e|oid|es|oids)?\b|\bcarotenoid(?:s)?\b/i],
  ["polyterpene", /\bpolyterpen(?:e|oid|es|oids)?\b/i],
];

const CARBON_FAMILY = new Map([
  [5, "hemiterpene"],
  [10, "monoterpene"],
  [15, "sesquiterpene"],
  [20, "diterpene"],
  [25, "sesterterpene"],
  [30, "triterpene"],
  [40, "tetraterpene"],
]);

function clean(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

export function parseFormulaCarbonCount(formula) {
  const match = /^C(\d*)/i.exec(clean(formula) ?? "");
  if (!match) return null;
  if (match[1] === "") return 1;
  const count = Number.parseInt(match[1], 10);
  return Number.isInteger(count) && count > 0 ? count : null;
}

function classificationText(record) {
  const classification = record.classification ?? {};
  return [
    classification.npPathway,
    classification.npSuperClass,
    classification.npClass,
    classification.chemicalSuperClass,
    classification.chemicalClass,
    classification.chemicalSubClass,
    classification.directParent,
  ]
    .filter(Boolean)
    .join(" | ");
}

export function inferTerpeneFamily(record) {
  const text = classificationText(record);
  for (const [family, pattern] of FAMILY_RULES) {
    if (pattern.test(text)) {
      return {
        family,
        status: "classification-derived",
        confidence: "high",
        carbonCount: parseFormulaCarbonCount(record.formula),
      };
    }
  }

  const carbonCount = parseFormulaCarbonCount(record.formula);
  if (CARBON_FAMILY.has(carbonCount)) {
    return {
      family: CARBON_FAMILY.get(carbonCount),
      status: "exact-carbon-count-fallback",
      confidence: record.candidateConfidence === "high" ? "medium" : "low",
      carbonCount,
    };
  }

  if (carbonCount !== null && carbonCount > 40 && carbonCount % 5 === 0) {
    return {
      family: "polyterpene",
      status: "carbon-count-polyterpene-fallback",
      confidence: "low",
      carbonCount,
    };
  }

  return {
    family: null,
    status: "unresolved-family",
    confidence: "none",
    carbonCount,
  };
}

export function compactIdentity(record) {
  const inchiKey = clean(record.inchiKey)?.toUpperCase() ?? null;
  const canonicalSmiles = clean(record.canonicalSmiles);
  if (inchiKey && /^[A-Z]{14}-[A-Z]{10}-[A-Z]$/.test(inchiKey)) {
    return { type: "full-inchikey", value: inchiKey, key: `inchikey:${inchiKey}` };
  }
  if (canonicalSmiles) {
    return { type: "canonical-smiles", value: canonicalSmiles, key: `smiles:${canonicalSmiles}` };
  }
  return null;
}

export function stableRegistryId(identityKey) {
  return `trp-${crypto.createHash("sha256").update(identityKey).digest("hex").slice(0, 20)}`;
}

export function splitSynonyms(raw) {
  return [...new Set(
    String(raw ?? "")
      .split(/[;|\n]/g)
      .map((item) => item.trim())
      .filter(Boolean),
  )].slice(0, 25);
}

export function compactCandidate(record) {
  const identity = compactIdentity(record);
  const familyAssignment = inferTerpeneFamily(record);
  return {
    identity,
    familyAssignment,
    name: clean(record.name),
    formula: clean(record.formula),
    molecularWeight: Number.isFinite(record.molecularWeight) ? record.molecularWeight : null,
    sourceId: clean(record.sourceId),
    sourceRelease: clean(record.sourceRelease),
    sourceRecordId: clean(record.sourceRecordId),
    synonyms: splitSynonyms(record.synonymsRaw),
    sourceOrganismsRaw: clean(record.sourceOrganisms),
    classification: record.classification ?? {},
    candidateReason: clean(record.candidateReason),
    candidateConfidence: clean(record.candidateConfidence),
  };
}
