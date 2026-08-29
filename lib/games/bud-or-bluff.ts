export type BudOrBluffAnswer = "BUD" | "BLUFF";
export type BudOrBluffDifficulty = "Easy" | "Medium" | "Hard";

export type BudOrBluffCard = {
  id: string;
  name: string;
  answer: BudOrBluffAnswer;
  difficulty: BudOrBluffDifficulty;
  category: string;
  explanation: string;
  lineage?: string;
  sourceLabel: string;
};

const realCard = (
  id: string,
  name: string,
  difficulty: BudOrBluffDifficulty,
  category = "Real But Ridiculous",
  extra?: Pick<BudOrBluffCard, "lineage" | "explanation" | "sourceLabel">,
): BudOrBluffCard => ({
  id,
  name,
  answer: "BUD",
  difficulty,
  category,
  explanation: extra?.explanation ?? "Yes. This name is documented in the project's verified real-strain pool.",
  lineage: extra?.lineage,
  sourceLabel: extra?.sourceLabel ?? "Bud or Bluff verified strain database",
});

const bluffCard = (
  id: string,
  name: string,
  difficulty: BudOrBluffDifficulty,
  category = "Fake But Believable",
): BudOrBluffCard => ({
  id,
  name,
  answer: "BLUFF",
  difficulty,
  category,
  explanation: "No. This name belongs to Bud or Bluff's fabricated strain pool.",
  sourceLabel: "Bud or Bluff screened bluff-name database",
});

export const budOrBluffCards: readonly BudOrBluffCard[] = [
  realCard("BOB-001", "Purple Monkey Balls", "Hard"),
  realCard("BOB-002", "Cat Piss", "Medium"),
  realCard("BOB-003", "Crouching Tiger Hidden Alien", "Hard"),
  realCard("BOB-004", "Slap N Tickle", "Hard"),
  realCard("BOB-005", "Dog Shit", "Medium"),
  realCard("BOB-006", "Donkey Butter", "Medium"),
  realCard("BOB-007", "Meat Breath", "Hard"),
  realCard("BOB-008", "Unicorn Poop", "Hard"),
  realCard("BOB-009", "Peanut Butter Breath", "Easy"),
  realCard("BOB-010", "Garlic Breath", "Medium"),
  realCard("BOB-011", "Duct Tape", "Medium"),
  realCard("BOB-012", "Alaskan Thunder Fuck", "Easy"),
  realCard("BOB-014", "Jillybean", "Medium"),
  realCard("BOB-016", "Poochie Love", "Hard"),
  realCard("BOB-041", "Cheetah Piss", "Medium"),
  realCard("BOB-042", "Dr. Grinspoon", "Hard"),
  realCard("BOB-045", "Zombie Kush", "Medium"),
  realCard("BOB-046", "Cheese Quake", "Hard"),
  realCard("BOB-047", "Grease Monkey", "Easy"),
  realCard("BOB-049", "Moby Dick", "Medium"),
  realCard("BOB-081", "Super Boof", "Medium", "Real Name + Weird Lineage"),
  realCard("BOB-082", "Permanent Marker", "Medium", "Real Name + Weird Lineage"),
  realCard("BOB-087", "The Soap", "Hard", "Real Name + Weird Lineage"),
  realCard("BOB-088", "Bananaconda", "Hard", "Real Name + Weird Lineage"),
  realCard("BOB-121", "Dick Pix", "Hard", "No-Way Real", {
    lineage: "Pixy Drip × Moby Dick",
    explanation: "BUD. The supplied breeder pedigree documents Dick Pix as Pixy Drip × Moby Dick.",
    sourceLabel: "User-supplied breeder genetic pedigree, verified 2026-08-29",
  }),

  bluffCard("BOB-021", "Blueberry Parking Lot", "Medium"),
  bluffCard("BOB-022", "Grandma's Gas Tank", "Hard"),
  bluffCard("BOB-023", "Mango Court Date", "Hard"),
  bluffCard("BOB-024", "Lemon Divorce Cake", "Medium"),
  bluffCard("BOB-025", "Glitter Skunk 91", "Hard"),
  bluffCard("BOB-026", "Runtz of Evidence", "Medium"),
  bluffCard("BOB-027", "Banana Bail Money", "Hard"),
  bluffCard("BOB-028", "Cookies & Confusion", "Medium"),
  bluffCard("BOB-029", "Sour Tax Refund", "Medium"),
  bluffCard("BOB-030", "Pineapple Probation", "Medium"),
  bluffCard("BOB-031", "Diesel Pickle Breath", "Hard"),
  bluffCard("BOB-032", "Wedding Cake Wreck", "Hard"),
  bluffCard("BOB-033", "Blue Zaza Buffet", "Hard"),
  bluffCard("BOB-034", "Grape Custody Battle", "Hard"),
  bluffCard("BOB-035", "Cheeto Breath OG", "Hard"),
  bluffCard("BOB-036", "Strawberry Courtroom", "Hard"),
  bluffCard("BOB-037", "Midnight Snack Pack", "Medium"),
  bluffCard("BOB-038", "Turbo Grandpa Haze", "Hard"),
  bluffCard("BOB-039", "Cream Soda Felony", "Medium"),
  bluffCard("BOB-040", "Alien Lunch Money", "Hard"),
  bluffCard("BOB-061", "Blueberry Bootleg", "Medium"),
  bluffCard("BOB-072", "Gelato Tax Evasion", "Medium"),
  bluffCard("BOB-074", "Strawberry Search Warrant", "Hard"),
  bluffCard("BOB-091", "Blueberry Jury Duty", "Medium", "Fake Name + Believable Lineage"),
  bluffCard("BOB-119", "Pineapple Plea Deal", "Hard", "Strongest Bluff Trap"),
] as const;

export const budOrBluffPoolStats = {
  total: budOrBluffCards.length,
  bud: budOrBluffCards.filter((card) => card.answer === "BUD").length,
  bluff: budOrBluffCards.filter((card) => card.answer === "BLUFF").length,
};
