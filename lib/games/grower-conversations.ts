import promptData from "@/data/games/grower-conversations/prompts.json";

export type GrowerConversationDepth = "Chill" | "Reflect" | "Debate";

export type GrowerConversationPrompt = {
  id: string;
  category: string;
  depth: GrowerConversationDepth;
  prompt: string;
  followUp: string;
};

export type GrowerConversationFilters = {
  category: string;
  depth: GrowerConversationDepth | "All";
};

export const growerConversationPrompts = promptData as GrowerConversationPrompt[];

export const growerConversationCategories = Array.from(
  new Set(growerConversationPrompts.map((prompt) => prompt.category)),
).sort((left, right) => left.localeCompare(right));

export const growerConversationDepths: GrowerConversationDepth[] = ["Chill", "Reflect", "Debate"];

function hashSeed(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function filterGrowerConversationPrompts(
  prompts: GrowerConversationPrompt[],
  filters: GrowerConversationFilters,
) {
  return prompts.filter((prompt) => {
    const categoryMatches = filters.category === "All" || prompt.category === filters.category;
    const depthMatches = filters.depth === "All" || prompt.depth === filters.depth;
    return categoryMatches && depthMatches;
  });
}

export function buildGrowerConversationDeck(
  prompts: GrowerConversationPrompt[],
  count: number,
  filters: GrowerConversationFilters,
  seed: string,
) {
  const filtered = filterGrowerConversationPrompts(prompts, filters);
  const random = mulberry32(hashSeed(seed));
  const shuffled = [...filtered];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, Math.max(0, Math.min(count, shuffled.length)));
}

export function growerConversationPoolStats() {
  const byCategory = Object.fromEntries(
    growerConversationCategories.map((category) => [
      category,
      growerConversationPrompts.filter((prompt) => prompt.category === category).length,
    ]),
  );
  const byDepth = Object.fromEntries(
    growerConversationDepths.map((depth) => [
      depth,
      growerConversationPrompts.filter((prompt) => prompt.depth === depth).length,
    ]),
  );

  return {
    total: growerConversationPrompts.length,
    byCategory,
    byDepth,
  };
}
