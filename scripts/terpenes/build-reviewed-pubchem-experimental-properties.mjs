import fs from "node:fs/promises";
import path from "node:path";

const PUG_VIEW_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound";
const manifestPath = path.resolve(process.argv[2] ?? "data/terpenes/reviewed-pubchem-manifest.json");
const outputPath = path.resolve(process.argv[3] ?? "data/terpenes/reviewed-pubchem-experimental-properties.json");

const headings = [
  "Boiling Point",
  "Melting Point",
  "Vapor Pressure",
  "Density",
  "Flash Point",
  "Refractive Index",
];

const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
if (!Array.isArray(manifest.compounds) || manifest.compounds.length === 0) {
  throw new Error("Reviewed PubChem manifest has no compounds.");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeString(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function collectValueStrings(value) {
  const output = [];

  for (const item of value?.StringWithMarkup ?? []) {
    const text = normalizeString(item?.String);
    if (text) output.push(text);
  }

  if (Array.isArray(value?.Number)) {
    const unit = normalizeString(value?.Unit);
    const text = value.Number.map((item) => String(item)).join(", ");
    if (text) output.push(unit ? `${text} ${unit}` : text);
  }

  const directString = normalizeString(value?.String);
  if (directString) output.push(directString);

  return [...new Set(output)];
}

function buildReferenceMap(record) {
  return new Map(
    (record?.Reference ?? []).map((reference) => [
      reference.ReferenceNumber,
      {
        referenceNumber: reference.ReferenceNumber,
        sourceName: normalizeString(reference.SourceName) || null,
        sourceId: normalizeString(reference.SourceID) || null,
        name: normalizeString(reference.Name) || null,
        description: normalizeString(reference.Description) || null,
        url: normalizeString(reference.URL) || null,
      },
    ]),
  );
}

function findHeadingSections(sections, heading, output = []) {
  for (const section of sections ?? []) {
    if (section?.TOCHeading === heading) output.push(section);
    findHeadingSections(section?.Section, heading, output);
  }
  return output;
}

function normalizeEvidence(record, heading) {
  const references = buildReferenceMap(record);
  const entries = [];

  for (const section of findHeadingSections(record?.Section, heading)) {
    for (const information of section?.Information ?? []) {
      const strings = collectValueStrings(information?.Value);
      if (!strings.length) continue;

      const referenceNumbers = Array.isArray(information.ReferenceNumber)
        ? information.ReferenceNumber
        : information.ReferenceNumber
          ? [information.ReferenceNumber]
          : [];

      const resolvedReferences = referenceNumbers
        .map((number) => references.get(number))
        .filter(Boolean);

      for (const reportedValue of strings) {
        entries.push({
          reportedValue,
          name: normalizeString(information.Name) || null,
          description: normalizeString(information.Description) || null,
          references: resolvedReferences,
        });
      }
    }
  }

  const deduped = [];
  const seen = new Set();
  for (const entry of entries) {
    const refKey = entry.references.map((ref) => ref.referenceNumber).join(",");
    const key = `${entry.reportedValue}|${refKey}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(entry);
    if (deduped.length >= 25) break;
  }
  return deduped;
}

async function fetchHeading(cid, heading) {
  const url = `${PUG_VIEW_BASE}/${encodeURIComponent(cid)}/JSON?heading=${encodeURIComponent(heading)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "DTF-Terpene-Atlas/2.0 (+https://dtfseeds.com)" },
  });
  if (!response.ok) {
    throw new Error(`PubChem PUG-View request failed for CID ${cid}, ${heading}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

const compounds = [];
for (const item of manifest.compounds) {
  const properties = {};

  for (const heading of headings) {
    const payload = await fetchHeading(item.pubchemCid, heading);
    properties[heading] = normalizeEvidence(payload?.Record, heading);
    await sleep(180);
  }

  compounds.push({
    slug: item.slug,
    pubchemCid: item.pubchemCid,
    sourceId: "PUBCHEM-PUG-VIEW",
    fetchedAt: new Date().toISOString(),
    properties,
  });
}

const output = {
  schemaVersion: "1.0.0",
  status: "compiled",
  sourceId: "PUBCHEM-PUG-VIEW",
  generatedAt: new Date().toISOString(),
  headings,
  compounds,
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(output, null, 2) + "\n", "utf8");

const evidenceCount = compounds.reduce(
  (sum, compound) =>
    sum + Object.values(compound.properties).reduce((inner, entries) => inner + entries.length, 0),
  0,
);

console.log(
  `Compiled ${evidenceCount} reported experimental-property entries across ${compounds.length} reviewed compounds.`,
);
