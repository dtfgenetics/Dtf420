import type { TerpeneCompound } from "./types";

export type TerpeneQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type TerpeneQuiz = {
  compoundSlug: string;
  title: string;
  questions: TerpeneQuizQuestion[];
};

export function buildTerpeneQuiz(compound: TerpeneCompound): TerpeneQuiz {
  const family = compound.terpeneClass.replaceAll("-", " ");
  const occurrenceCorrect =
    compound.cannabisOccurrence === "documented"
      ? "Documented in the reviewed Cannabis evidence layer"
      : compound.cannabisOccurrence === "reported"
        ? "Reported, but not yet at the strongest reviewed occurrence state"
        : "Not mapped in the reviewed Cannabis occurrence layer";

  return {
    compoundSlug: compound.slug,
    title: `${compound.name} chapter knowledge check`,
    questions: [
      {
        id: "family",
        prompt: `Which terpene family is ${compound.name} assigned to in the reviewed chapter?`,
        options: [
          family,
          family === "monoterpene" ? "sesquiterpene" : "monoterpene",
          family === "triterpene" ? "diterpene" : "triterpene",
          "It is not assigned to any terpene family",
        ],
        correctIndex: 0,
        explanation: `${compound.name} is classified here as a ${family}, with formula ${compound.formula}.`,
      },
      {
        id: "precursor",
        prompt: `Which precursor context is linked to ${compound.name} in this chapter?`,
        options: [
          compound.biosyntheticPrecursor,
          "No biosynthetic precursor is known",
          "Only cannabinoid decarboxylation",
          "Only chlorophyll degradation",
        ],
        correctIndex: 0,
        explanation: `The current reviewed record links ${compound.name} to ${compound.biosyntheticPrecursor}.`,
      },
      {
        id: "occurrence",
        prompt: `What does the current THC record say about Cannabis occurrence for ${compound.name}?`,
        options: [
          occurrenceCorrect,
          "Every cultivar contains the same amount",
          "The compound name alone proves cultivar identity",
          "Occurrence automatically predicts a human effect",
        ],
        correctIndex: 0,
        explanation:
          "Occurrence status describes what the reviewed evidence layer establishes. It is not a fixed cultivar percentage or an effect prediction.",
      },
      {
        id: "cultivar",
        prompt: "Which is the strongest way to interpret cultivar terpene chemistry?",
        options: [
          "Use repeated measured sample distributions with provenance",
          "Treat a strain name as a permanent terpene percentage",
          "Use aroma labels as a substitute for laboratory chemistry",
          "Assume one certificate of analysis represents every future sample",
        ],
        correctIndex: 0,
        explanation: compound.cultivarContext,
      },
      {
        id: "evidence",
        prompt: `Which statement best follows the research guardrail for ${compound.name}?`,
        options: [
          "Keep measured chemistry separate from unqualified human-effect claims",
          "A terpene percentage guarantees a specific experience",
          "Aroma descriptors prove receptor activity",
          "A gene name guarantees final flower abundance",
        ],
        correctIndex: 0,
        explanation: compound.researchGuardrail,
      },
    ],
  };
}
