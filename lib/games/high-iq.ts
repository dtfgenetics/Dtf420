import rawQuestions from "@/data/games/high-iq/questions.json";

export const highIqDifficulties = ["Easy", "Medium", "Hard", "Expert"] as const;
export type HighIqDifficulty = (typeof highIqDifficulties)[number];
export type HighIqDifficultyFilter = HighIqDifficulty | "All";

export type HighIqQuestion = {
  id: string;
  category: string;
  difficulty: HighIqDifficulty;
  prompt: string;
  choices: [string, string, string, string];
  correctIndex: number;
  explanation: string;
};

export const highIqQuestions = rawQuestions as HighIqQuestion[];

const difficultyPoints: Record<HighIqDifficulty, number> = {
  Easy: 100,
  Medium: 125,
  Hard: 175,
  Expert: 250,
};

function hashSeed(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildHighIqDeck(
  questions: HighIqQuestion[],
  count: number,
  difficulty: HighIqDifficultyFilter,
  seed = `${Date.now()}`,
) {
  const filtered = questions.filter(
    (question) => difficulty === "All" || question.difficulty === difficulty,
  );
  const random = mulberry32(hashSeed(seed));
  const shuffled = [...filtered];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }

  return shuffled.slice(0, Math.max(0, Math.min(count, shuffled.length)));
}

export function scoreHighIqAnswer(
  question: HighIqQuestion,
  correct: boolean,
  currentStreak: number,
) {
  if (!correct) {
    return { points: 0, nextStreak: 0 };
  }

  const nextStreak = currentStreak + 1;
  const streakBonus = Math.min((nextStreak - 1) * 20, 160);
  return {
    points: difficultyPoints[question.difficulty] + streakBonus,
    nextStreak,
  };
}

export function validateHighIqQuestionBank(questions: HighIqQuestion[]) {
  const issues: string[] = [];
  const ids = new Set<string>();

  questions.forEach((question, index) => {
    const label = question.id || `index ${index}`;

    if (!question.id.trim()) issues.push(`${label}: missing id`);
    if (ids.has(question.id)) issues.push(`${label}: duplicate id`);
    ids.add(question.id);

    if (!question.category.trim()) issues.push(`${label}: missing category`);
    if (!highIqDifficulties.includes(question.difficulty)) {
      issues.push(`${label}: invalid difficulty`);
    }
    if (!question.prompt.trim()) issues.push(`${label}: missing prompt`);
    if (!Array.isArray(question.choices) || question.choices.length !== 4) {
      issues.push(`${label}: must have exactly four choices`);
    } else {
      const normalizedChoices = question.choices.map((choice) => choice.trim().toLowerCase());
      if (new Set(normalizedChoices).size !== 4) {
        issues.push(`${label}: choices must be unique`);
      }
      if (question.choices.some((choice) => !choice.trim())) {
        issues.push(`${label}: choices cannot be blank`);
      }
    }
    if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex > 3) {
      issues.push(`${label}: correctIndex must be 0-3`);
    }
    if (!question.explanation.trim()) issues.push(`${label}: missing explanation`);
  });

  return issues;
}
