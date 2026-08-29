import baseOverrides from "@/content/atlas-asset-overrides.json";
import coreOverrides from "@/content/atlas-asset-overrides-core-structure.json";
import growthDiagnosticOverrides from "@/content/atlas-asset-overrides-growth-diagnostic.json";
import finalAOverrides from "@/content/atlas-asset-overrides-final-a.json";
import finalBOverrides from "@/content/atlas-asset-overrides-final-b.json";
import seedCorrectionOverrides from "@/content/atlas-asset-overrides-seed-correction.json";

export const atlasAssetOverrides = [
  ...baseOverrides,
  ...coreOverrides,
  ...growthDiagnosticOverrides,
  ...finalAOverrides,
  ...finalBOverrides,
  ...seedCorrectionOverrides,
];