export type TerpeneMeasurement = {
  compoundSlug: string;
  value: number;
  unit: "percent";
};

export type TerpeneProfile = {
  id: string;
  label: string;
  measurements: TerpeneMeasurement[];
};

export type CompoundComparison = {
  compoundSlug: string;
  parentA: number;
  parentB: number;
  observedMidpoint: number;
  presence: "shared" | "parent-a-only" | "parent-b-only";
};

export type ProfileComparison = {
  parentATotal: number;
  parentBTotal: number;
  similarity: number | null;
  sharedCompounds: string[];
  parentAOnly: string[];
  parentBOnly: string[];
  comparisons: CompoundComparison[];
};

function cleanValue(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return value;
}

function toMap(profile: TerpeneProfile) {
  return new Map(
    profile.measurements
      .map((item) => [item.compoundSlug, cleanValue(item.value)] as const)
      .filter(([, value]) => value > 0),
  );
}

export function compareTerpeneProfiles(
  parentA: TerpeneProfile,
  parentB: TerpeneProfile,
): ProfileComparison {
  const a = toMap(parentA);
  const b = toMap(parentB);
  const slugs = [...new Set([...a.keys(), ...b.keys()])].sort();

  const sharedCompounds: string[] = [];
  const parentAOnly: string[] = [];
  const parentBOnly: string[] = [];

  const comparisons = slugs.flatMap<CompoundComparison>((compoundSlug) => {
    const parentAValue = a.get(compoundSlug) ?? 0;
    const parentBValue = b.get(compoundSlug) ?? 0;

    if (parentAValue > 0 && parentBValue > 0) sharedCompounds.push(compoundSlug);
    else if (parentAValue > 0) parentAOnly.push(compoundSlug);
    else if (parentBValue > 0) parentBOnly.push(compoundSlug);
    else return [];

    return [{
      compoundSlug,
      parentA: parentAValue,
      parentB: parentBValue,
      observedMidpoint: (parentAValue + parentBValue) / 2,
      presence:
        parentAValue > 0 && parentBValue > 0
          ? "shared"
          : parentAValue > 0
            ? "parent-a-only"
            : "parent-b-only",
    }];
  });

  const parentATotal = [...a.values()].reduce((sum, value) => sum + value, 0);
  const parentBTotal = [...b.values()].reduce((sum, value) => sum + value, 0);

  const dot = slugs.reduce((sum, slug) => sum + (a.get(slug) ?? 0) * (b.get(slug) ?? 0), 0);
  const normA = Math.sqrt(slugs.reduce((sum, slug) => sum + (a.get(slug) ?? 0) ** 2, 0));
  const normB = Math.sqrt(slugs.reduce((sum, slug) => sum + (b.get(slug) ?? 0) ** 2, 0));
  const similarity = normA > 0 && normB > 0 ? dot / (normA * normB) : null;

  return {
    parentATotal,
    parentBTotal,
    similarity,
    sharedCompounds,
    parentAOnly,
    parentBOnly,
    comparisons,
  };
}

export function profileFromValues(
  id: string,
  label: string,
  values: Record<string, number>,
): TerpeneProfile {
  return {
    id,
    label,
    measurements: Object.entries(values)
      .filter(([, value]) => Number.isFinite(value) && value > 0)
      .map(([compoundSlug, value]) => ({ compoundSlug, value, unit: "percent" as const })),
  };
}
