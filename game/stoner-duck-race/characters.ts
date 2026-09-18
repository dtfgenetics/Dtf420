export interface DuckCharacterDefinition {
  id: string;
  name: string;
  tagline: string;
  bodyColor: number;
  headColor: number;
  billColor: number;
  accentColor: number;
}

export const DUCK_CHARACTERS: readonly DuckCharacterDefinition[] = [
  { id: "mellow-mallard", name: "Mellow Mallard", tagline: "Cruises clean and keeps it smooth.", bodyColor: 0xe9c440, headColor: 0xf4d35e, billColor: 0xf28c28, accentColor: 0x4f772d },
  { id: "dab-duck", name: "Dab Duck", tagline: "Fast starts, loud finishes.", bodyColor: 0xf3c969, headColor: 0xffdd88, billColor: 0xf57c2a, accentColor: 0x8e44ad },
  { id: "hippie-quacker", name: "Hippie Quacker", tagline: "Floats with the current until it matters.", bodyColor: 0xf1d66d, headColor: 0xffe88e, billColor: 0xeb7f25, accentColor: 0x2a9d8f },
  { id: "grower-goose", name: "Grower Goose", tagline: "Reads every lane like a canopy.", bodyColor: 0xe7c75f, headColor: 0xf9dd7b, billColor: 0xe76f51, accentColor: 0x2f6f3e },
  { id: "rosin-runner", name: "Rosin Runner", tagline: "Sticky lines, sharp turns.", bodyColor: 0xe8b84f, headColor: 0xfbd675, billColor: 0xf18f01, accentColor: 0x9c6644 },
  { id: "cloud-nine", name: "Cloud Nine", tagline: "Hard to see, harder to catch.", bodyColor: 0xe9d8a6, headColor: 0xf6e7bd, billColor: 0xee9b00, accentColor: 0x577590 },
  { id: "science-duck", name: "Science Duck", tagline: "Calculates the fastest water.", bodyColor: 0xd7c96f, headColor: 0xf1e59b, billColor: 0xe07a5f, accentColor: 0x3d5a80 },
  { id: "old-school-quack", name: "Old School Quack", tagline: "No gimmicks. Just river sense.", bodyColor: 0xd9b650, headColor: 0xf0d36b, billColor: 0xd97706, accentColor: 0x6b4f3a },
] as const;

export function getDuckCharacter(characterId: string): DuckCharacterDefinition {
  return DUCK_CHARACTERS.find((character) => character.id === characterId) ?? DUCK_CHARACTERS[0];
}
