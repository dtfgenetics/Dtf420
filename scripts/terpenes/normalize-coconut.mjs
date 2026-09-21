import fs from "node:fs";
import path from "node:path";
import { once } from "node:events";
import { parseCsvRows, headerIndex, valueFor } from "./lib/csv-stream.mjs";

const FIELD_ALIASES = {
  id: ["coconut_id", "identifier", "id", "unique_id"],
  name: ["name", "compound_name", "iupac_name", "title"],
  canonicalSmiles: ["canonical_smiles", "canonical_smiles_rdkit", "smiles"],
  inchi: ["inchi", "standard_inchi"],
  inchiKey: ["inchikey", "inchi_key", "standard_inchi_key"],
  formula: ["molecular_formula", "mol_formula", "formula"],
  molecularWeight: ["molecular_weight", "mol_weight", "exact_mass"],
  npPathway: ["np_classifier_pathway", "np_pathway", "pathway", "npclassification_pathway"],
  npSuperClass: ["np_classifier_superclass", "np_superclass", "np_super_class", "npclassification_superclass"],
  npClass: ["np_classifier_class", "np_class", "npclassification_class"],
  chemicalSuperClass: ["chemical_super_class", "chemical_superclass", "super_class", "superclass"],
  chemicalClass: ["chemical_class", "class"],
  chemicalSubClass: ["chemical_sub_class", "chemical_subclass", "sub_class", "subclass"],
  directParent: ["direct_parent", "chemical_direct_parent"],
  organisms: ["organisms", "organism", "source_organisms"],
  synonyms: ["synonyms", "synonym"],
};

function cleanNumber(value) {
  if (value === null) return null;
  const parsed = Number.parseFloat(String(value).replace(/[^0-9.+-Ee]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function textBlob(record) {
  return [
    record.npPathway,
    record.npSuperClass,
    record.npClass,
    record.chemicalSuperClass,
    record.chemicalClass,
    record.chemicalSubClass,
    record.directParent,
  ]
    .filter(Boolean)
    .join(" | ")
    .toLowerCase();
}

export function classifyTerpenoidCandidate(record) {
  const blob = textBlob(record);

  if (/\bterpenoids?\b/.test(String(record.npPathway ?? "").toLowerCase())) {
    return { isCandidate: true, reason: "np-pathway-terpenoids", confidence: "high" };
  }
  if (/\bterpen(e|oid|oids|es|ic)\b|terpene/.test(blob)) {
    return { isCandidate: true, reason: "classification-terpene-term", confidence: "high" };
  }
  if (/\bprenol lipids?\b|\bisoprenoids?\b|\bcarotenoids?\b/.test(blob)) {
    return { isCandidate: true, reason: "broader-isoprenoid-classification", confidence: "medium" };
  }

  return { isCandidate: false, reason: "no-terpenoid-classification-signal", confidence: "none" };
}

export function normalizeCoconutRow(row, indexes, release) {
  const record = Object.fromEntries(
    Object.entries(FIELD_ALIASES).map(([key, aliases]) => [key, valueFor(row, indexes, aliases)]),
  );

  const classification = classifyTerpenoidCandidate(record);
  if (!classification.isCandidate) return null;

  return {
    sourceId: "COCONUT",
    sourceRelease: release,
    sourceRecordId: record.id,
    name: record.name,
    canonicalSmiles: record.canonicalSmiles,
    inchi: record.inchi,
    inchiKey: record.inchiKey,
    formula: record.formula,
    molecularWeight: cleanNumber(record.molecularWeight),
    classification: {
      npPathway: record.npPathway,
      npSuperClass: record.npSuperClass,
      npClass: record.npClass,
      chemicalSuperClass: record.chemicalSuperClass,
      chemicalClass: record.chemicalClass,
      chemicalSubClass: record.chemicalSubClass,
      directParent: record.directParent,
    },
    sourceOrganisms: record.organisms,
    synonymsRaw: record.synonyms,
    candidateReason: classification.reason,
    candidateConfidence: classification.confidence,
    reviewStatus: "unreviewed-source-candidate",
  };
}

async function writeLine(stream, object) {
  if (!stream.write(JSON.stringify(object) + "\n")) await once(stream, "drain");
}

export async function normalizeCoconutCsv({ inputPath, outputPath, release }) {
  const rows = parseCsvRows(inputPath);
  const first = await rows.next();
  if (first.done) throw new Error("COCONUT CSV is empty");

  const headers = first.value;
  const indexes = headerIndex(headers);
  const output = fs.createWriteStream(outputPath, { encoding: "utf8" });

  let scanned = 0;
  let candidates = 0;
  const reasons = new Map();

  for await (const row of rows) {
    scanned += 1;
    const normalized = normalizeCoconutRow(row, indexes, release);
    if (!normalized) continue;

    candidates += 1;
    reasons.set(normalized.candidateReason, (reasons.get(normalized.candidateReason) ?? 0) + 1);
    await writeLine(output, normalized);
  }

  output.end();
  await once(output, "finish");

  return {
    release,
    scanned,
    candidates,
    reasons: Object.fromEntries([...reasons.entries()].sort()),
    outputPath,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , inputArg, outputArg, releaseArg = "unknown"] = process.argv;
  if (!inputArg || !outputArg) {
    console.error("Usage: node scripts/terpenes/normalize-coconut.mjs <input.csv> <output.jsonl> [release]");
    process.exit(1);
  }

  const inputPath = path.resolve(inputArg);
  const outputPath = path.resolve(outputArg);
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  const summary = await normalizeCoconutCsv({ inputPath, outputPath, release: releaseArg });
  console.log(JSON.stringify(summary, null, 2));
}
