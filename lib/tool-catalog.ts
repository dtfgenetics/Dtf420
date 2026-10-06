export type ToolOwner = "next" | "learning";
export type ToolRole = "primary" | "reference";

export type ToolCatalogEntry = {
  id: string;
  title: string;
  description: string;
  href: string;
  role: ToolRole;
  owner: ToolOwner;
  eyebrow?: string;
  action?: string;
  variant?: "records" | "diagnostic";
};

export const toolCatalog: readonly ToolCatalogEntry[] = [
  {
    id: "growlens",
    eyebrow: "Grow records workspace",
    title: "GrowLens",
    description:
      "Organize plants, spaces, environmental readings, irrigation, feeding, canopy observations, photos, and harvest records around a repeatable grow log.",
    href: "/tools/growlens",
    action: "Open GrowLens guide",
    variant: "records",
    role: "primary",
    owner: "next",
  },
  {
    id: "grow-doc",
    eyebrow: "Observation-first diagnostics",
    title: "Grow Doc",
    description:
      "Work from symptom location, progression, environment, root-zone context, and visible evidence toward a ranked differential instead of a one-photo certainty claim.",
    href: "/tools/grow-doc",
    action: "Open Grow Doc guide",
    variant: "diagnostic",
    role: "primary",
    owner: "next",
  },
  {
    id: "printable-field-tools",
    title: "Printable field tools",
    description:
      "Calibration logs, scouting maps, propagation records, environmental logs, observation sheets, and other downloadable records.",
    href: "/learn/tools",
    role: "reference",
    owner: "learning",
  },
  {
    id: "diagnostic-case-lab",
    title: "Diagnostic case lab",
    description:
      "Practice combining measurements and observations into evidence for and against multiple plausible causes.",
    href: "/learn/atlas/cases",
    role: "reference",
    owner: "learning",
  },
  {
    id: "symptom-differentials",
    title: "Symptom differentials",
    description:
      "Compare yellowing, spotting, curling, wilting, bleaching, pigmentation, root decline, stem lesions, and flower damage.",
    href: "/learn/symptoms",
    role: "reference",
    owner: "learning",
  },
  {
    id: "evidence-sources",
    title: "Evidence & sources",
    description:
      "Check the peer-reviewed research, extension material, and technical references connected to the education system.",
    href: "/learn/sources",
    role: "reference",
    owner: "learning",
  },
  {
    id: "living-plant-atlas",
    title: "Living Plant Atlas",
    description:
      "Move from a measurement or symptom into the underlying anatomy, physiology, environment, and diagnostic context.",
    href: "/learn/atlas",
    role: "reference",
    owner: "learning",
  },
  {
    id: "search-thc",
    title: "Search THC",
    description:
      "Search the connected education system when you know the question but not which library contains the answer.",
    href: "/learn/search",
    role: "reference",
    owner: "learning",
  },
] as const;

export const primaryTools = toolCatalog.filter((tool) => tool.role === "primary");
export const supportingTools = toolCatalog.filter((tool) => tool.role === "reference");
export const liveToolCount = toolCatalog.filter((tool) => tool.owner === "next").length;
export const connectedReferenceCount = supportingTools.length;
