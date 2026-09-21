import type { ProfileComparison, TerpeneProfile } from "./profiles";
import { compareTerpeneProfiles } from "./profiles";

export type SelectionTarget = {
  compoundSlug: string;
  parentAObserved: number;
  parentBObserved: number;
  availability: "both-parents" | "parent-a" | "parent-b" | "not-observed";
  interpretation: string;
};

export type BreedingSelectionHypothesis = {
  comparison: ProfileComparison;
  targets: SelectionTarget[];
  guardrails: string[];
};

export function buildBreedingSelectionHypothesis(
  parentA: TerpeneProfile,
  parentB: TerpeneProfile,
  targetSlugs: string[],
): BreedingSelectionHypothesis {
  const comparison = compareTerpeneProfiles(parentA, parentB);
  const bySlug = new Map(comparison.comparisons.map((item) => [item.compoundSlug, item]));

  const targets = targetSlugs.map<SelectionTarget>((compoundSlug) => {
    const observed = bySlug.get(compoundSlug);
    const parentAObserved = observed?.parentA ?? 0;
    const parentBObserved = observed?.parentB ?? 0;

    const availability =
      parentAObserved > 0 && parentBObserved > 0
        ? "both-parents"
        : parentAObserved > 0
          ? "parent-a"
          : parentBObserved > 0
            ? "parent-b"
            : "not-observed";

    const interpretation =
      availability === "both-parents"
        ? "Observed in both entered parent profiles. This supports prioritizing the compound during offspring screening, but does not guarantee its level in progeny."
        : availability === "parent-a"
          ? "Observed only in Parent A in the entered profiles. Screen offspring rather than assuming transmission or dominance."
          : availability === "parent-b"
            ? "Observed only in Parent B in the entered profiles. Screen offspring rather than assuming transmission or dominance."
            : "Not observed in either entered profile. Do not treat the target as supported until better parent data or offspring measurements show it.";

    return {
      compoundSlug,
      parentAObserved,
      parentBObserved,
      availability,
      interpretation,
    };
  });

  return {
    comparison,
    targets,
    guardrails: [
      "This tool compares measured parent chemistry; it does not predict exact offspring terpene percentages.",
      "A single COA may not represent a stable parent chemotype. Replicate samples, environment, maturity, and laboratory method matter.",
      "The arithmetic midpoint is shown only as a descriptive reference between entered parents, not as an inheritance forecast.",
      "Offspring measurements should replace parent-only assumptions as soon as progeny data exist.",
    ],
  };
}
