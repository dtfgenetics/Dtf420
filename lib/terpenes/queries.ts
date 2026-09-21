import { terpeneBySlug, terpeneFamilies, terpeneSeedCompounds } from "./data";
import type { TerpeneClassId } from "./types";

export function getTerpeneBySlug(slug: string) {
  return terpeneBySlug.get(slug) ?? null;
}

export function getTerpenesByFamily(family: TerpeneClassId) {
  return terpeneSeedCompounds.filter((compound) => compound.terpeneClass === family);
}

export function getFamilyLabel(family: TerpeneClassId) {
  return terpeneFamilies.find((item) => item.id === family)?.label ?? family;
}

export function getCannabisTerpenes() {
  return terpeneSeedCompounds.filter((compound) => compound.cannabisOccurrence !== "not-mapped");
}
