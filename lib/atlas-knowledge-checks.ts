import coreChecks from "@/content/atlas-knowledge-checks.json";
import expansionOneChecks from "@/content/atlas-knowledge-checks-expansion-01.json";

export type AtlasKnowledgeCheck = {
  id: string;
  route: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const rawChecks = [...coreChecks, ...expansionOneChecks] as AtlasKnowledgeCheck[];

function balanceAnswerPosition(check: AtlasKnowledgeCheck, index: number): AtlasKnowledgeCheck {
  const targetIndex = index % check.options.length;
  const correctOption = check.options[check.correctIndex];
  const distractors = check.options.filter((_, optionIndex) => optionIndex !== check.correctIndex);
  const options = [...distractors];
  options.splice(targetIndex, 0, correctOption);

  return {
    ...check,
    options,
    correctIndex: targetIndex,
  };
}

export const atlasKnowledgeChecks: AtlasKnowledgeCheck[] = rawChecks.map((check, index) =>
  balanceAnswerPosition(check, index),
);

export function getAtlasKnowledgeCheck(route: string) {
  return atlasKnowledgeChecks.find((check) => check.route === route);
}
