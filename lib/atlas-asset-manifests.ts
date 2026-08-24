import baseOverrides from "@/content/atlas-asset-overrides.json";
import coreOverrides from "@/content/atlas-asset-overrides-core-structure.json";
import growthDiagnosticOverrides from "@/content/atlas-asset-overrides-growth-diagnostic.json";

export const atlasAssetOverrides = [
  ...baseOverrides,
  ...coreOverrides,
  ...growthDiagnosticOverrides,
];
