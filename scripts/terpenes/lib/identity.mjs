function clean(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export function normalizeInchiKey(value) {
  const key = clean(value)?.toUpperCase() ?? null;
  if (!key) return null;
  return /^[A-Z]{14}-[A-Z]{10}-[A-Z]$/.test(key) ? key : null;
}

export function normalizePubchemCid(value) {
  if (value === null || value === undefined || value === "") return null;
  const cid = Number.parseInt(String(value), 10);
  return Number.isInteger(cid) && cid > 0 ? cid : null;
}

export function normalizeStructure(value) {
  return clean(value);
}

export function identitySignals(record) {
  return {
    inchiKey: normalizeInchiKey(record.inchiKey ?? record.pubchem?.InChIKey),
    pubchemCid: normalizePubchemCid(record.pubchemCid ?? record.pubchem?.CID),
    canonicalSmiles: normalizeStructure(
      record.canonicalSmiles ??
      record.pubchem?.ConnectivitySMILES ??
      record.pubchem?.CanonicalSMILES,
    ),
  };
}

export function identityKey(record) {
  const signals = identitySignals(record);
  if (signals.inchiKey) return { strength: "inchi-key", key: `inchikey:${signals.inchiKey}` };
  if (signals.pubchemCid) return { strength: "pubchem-cid", key: `pubchem:${signals.pubchemCid}` };
  if (signals.canonicalSmiles) return { strength: "canonical-smiles", key: `smiles:${signals.canonicalSmiles}` };
  return null;
}

function conflictReason(left, right) {
  const a = identitySignals(left);
  const b = identitySignals(right);

  if (a.pubchemCid && b.pubchemCid && a.pubchemCid === b.pubchemCid && a.inchiKey && b.inchiKey && a.inchiKey !== b.inchiKey) {
    return "same-pubchem-cid-different-inchikey";
  }
  if (a.inchiKey && b.inchiKey && a.inchiKey === b.inchiKey && a.pubchemCid && b.pubchemCid && a.pubchemCid !== b.pubchemCid) {
    return "same-inchikey-different-pubchem-cid";
  }
  return null;
}

export function resolveIdentityRecords(records) {
  const conflicts = [];
  const grouped = new Map();
  const unresolved = [];

  const cidOwners = new Map();
  const keyOwners = new Map();

  for (const record of records) {
    const signals = identitySignals(record);

    if (signals.pubchemCid) {
      const prior = cidOwners.get(signals.pubchemCid);
      if (prior) {
        const reason = conflictReason(prior, record);
        if (reason) {
          conflicts.push({ reason, records: [prior, record] });
          continue;
        }
      } else {
        cidOwners.set(signals.pubchemCid, record);
      }
    }

    if (signals.inchiKey) {
      const prior = keyOwners.get(signals.inchiKey);
      if (prior) {
        const reason = conflictReason(prior, record);
        if (reason) {
          conflicts.push({ reason, records: [prior, record] });
          continue;
        }
      } else {
        keyOwners.set(signals.inchiKey, record);
      }
    }

    const key = identityKey(record);
    if (!key) {
      unresolved.push(record);
      continue;
    }

    if (!grouped.has(key.key)) {
      grouped.set(key.key, { identity: key, records: [] });
    }
    grouped.get(key.key).records.push(record);
  }

  const clusters = [...grouped.values()].map((cluster) => {
    const sourceRefs = cluster.records.map((record) => ({
      sourceId: record.sourceId ?? null,
      sourceRecordId: record.sourceRecordId ?? record.id ?? null,
    }));

    const names = [...new Set(cluster.records.map((record) => clean(record.name)).filter(Boolean))];
    const formulas = [...new Set(cluster.records.map((record) => clean(record.formula)).filter(Boolean))];

    return {
      identity: cluster.identity,
      canonicalName: names[0] ?? null,
      names,
      formulas,
      sourceRefs,
      sourceCount: sourceRefs.length,
      records: cluster.records,
      reviewStatus: "identity-cluster-unreviewed",
    };
  });

  return { clusters, conflicts, unresolved };
}
