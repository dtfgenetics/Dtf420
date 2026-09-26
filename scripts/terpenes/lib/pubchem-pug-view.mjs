const PUG_VIEW_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound";

export function normalizePugViewString(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function collectPugViewValueStrings(value) {
  const output = [];

  for (const item of value?.StringWithMarkup ?? []) {
    const text = normalizePugViewString(item?.String);
    if (text) output.push(text);
  }

  if (Array.isArray(value?.Number)) {
    const unit = normalizePugViewString(value?.Unit);
    const text = value.Number.map((item) => String(item)).join(", ");
    if (text) output.push(unit ? `${text} ${unit}` : text);
  }

  const directString = normalizePugViewString(value?.String);
  if (directString) output.push(directString);

  return [...new Set(output)];
}

export function buildPugViewReferenceMap(record) {
  return new Map(
    (record?.Reference ?? []).map((reference) => [
      reference.ReferenceNumber,
      {
        referenceNumber: reference.ReferenceNumber,
        sourceName: normalizePugViewString(reference.SourceName) || null,
        sourceId: normalizePugViewString(reference.SourceID) || null,
        name: normalizePugViewString(reference.Name) || null,
        description: normalizePugViewString(reference.Description) || null,
        url: normalizePugViewString(reference.URL) || null,
      },
    ]),
  );
}

export function findPugViewHeadingSections(sections, heading, output = []) {
  for (const section of sections ?? []) {
    if (section?.TOCHeading === heading) output.push(section);
    findPugViewHeadingSections(section?.Section, heading, output);
  }
  return output;
}

export function normalizePugViewEvidence(record, heading, limit = 25) {
  const references = buildPugViewReferenceMap(record);
  const entries = [];

  for (const section of findPugViewHeadingSections(record?.Section, heading)) {
    for (const information of section?.Information ?? []) {
      const strings = collectPugViewValueStrings(information?.Value);
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
          name: normalizePugViewString(information.Name) || null,
          description: normalizePugViewString(information.Description) || null,
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
    if (deduped.length >= limit) break;
  }

  return deduped;
}

async function fetchPugViewJson(url, userAgent) {
  return fetch(url, { headers: { "User-Agent": userAgent } });
}

export async function fetchPugViewRecord(
  cid,
  { userAgent = "DTF-Terpene-Atlas/2.0 (+https://dtfseeds.com)" } = {},
) {
  const url = `${PUG_VIEW_BASE}/${encodeURIComponent(cid)}/JSON`;
  const response = await fetchPugViewJson(url, userAgent);

  if (response.status === 404) {
    return { Record: { Section: [], Reference: [] } };
  }
  if (!response.ok) {
    throw new Error(
      `PubChem PUG-View full-record request failed for CID ${cid}: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

export async function fetchPugViewHeading(
  cid,
  heading,
  { userAgent = "DTF-Terpene-Atlas/2.0 (+https://dtfseeds.com)" } = {},
) {
  const url = `${PUG_VIEW_BASE}/${encodeURIComponent(cid)}/JSON?heading=${encodeURIComponent(heading)}`;
  const response = await fetchPugViewJson(url, userAgent);

  if (response.status === 404) {
    return { Record: { Section: [], Reference: [] } };
  }

  // PubChem can expose a valid TOC heading in the full record while rejecting
  // that same text in the heading-filter query. Preserve the evidence
  // semantics by falling back to the full record on a filtered 400 response;
  // normalizePugViewEvidence will locate the requested heading recursively.
  if (response.status === 400) {
    return fetchPugViewRecord(cid, { userAgent });
  }

  if (!response.ok) {
    throw new Error(
      `PubChem PUG-View request failed for CID ${cid}, ${heading}: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}
