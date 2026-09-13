export type GameReleaseStatus = "playable" | "preview";

export type GameCatalogEntry = {
  slug: string;
  title: string;
  strapline: string;
  heading: string;
  description: string;
  format: string;
  genre: "Board" | "Party" | "Arcade" | "RPG" | "Trivia" | "Cards" | "Strategy";
  status: GameReleaseStatus;
  features: readonly string[];
  actionLabel: string;
  actionAriaLabel: string;
  posterStyle?: "grid";
};

export const gameCatalog: readonly GameCatalogEntry[] = [
  {
    slug: "weedopolis",
    title: "Weedopolis",
    strapline: "Build the strain city",
    heading: "Own the strains. Build the city.",
    description: "Roll two dice, buy strain properties, collect Bud Bucks, draw High Chance and Community Stash cards, build Grow Tents, upgrade to Dispensaries, and avoid Trim Jail.",
    format: "Board game · 2–8 players",
    genre: "Board",
    status: "playable",
    features: ["2–8 local players", "40-space board", "Save + load", "Approved V1 board art"],
    actionLabel: "Play Weedopolis",
    actionAriaLabel: "Play Weedopolis",
  },
  {
    slug: "bud-or-bluff",
    title: "Bud or Bluff",
    strapline: "Real strain or fake name?",
    heading: "Call the name before it calls you.",
    description: "Decide whether each absurd strain name is documented or completely fabricated. Play solo or pass the device, build streaks, and chase the highest score.",
    format: "Party · 1–6 players",
    genre: "Party",
    status: "playable",
    features: ["Solo + party", "10–40 cards", "Optional timer", "Mobile friendly"],
    actionLabel: "Play Bud or Bluff",
    actionAriaLabel: "Play Bud or Bluff",
  },
  {
    slug: "stoner-duck-race",
    title: "Stoner Duck Race",
    strapline: "Fifty ducks. Three ways to race.",
    heading: "Derby, rally, or unleash the chaos.",
    description: "A shared 50-racer river engine for AI-driven Duck Derby events, direct-control River Rally races, and high-chaos party racing with deterministic seeds, ranking, and a multiplayer-ready architecture.",
    format: "River racing · 1–50 racers",
    genre: "Arcade",
    status: "preview",
    features: ["Up to 50 racers", "3 race modes", "Seeded simulation", "Multiplayer architecture"],
    actionLabel: "Test engine",
    actionAriaLabel: "Test Stoner Duck Race engine prototype",
  },
  {
    slug: "who-took-it",
    title: "Who Took It?",
    strapline: "Solve the missing stash case",
    heading: "Ask clean clues. Cross off suspects. Close the case.",
    description: "A mystery deduction party game with 25 suspects, five missing items, preset yes-or-no clues, solo play, group host mode, and pass-the-device duel mode.",
    format: "Mystery deduction · 1–4+ players",
    genre: "Party",
    status: "playable",
    features: ["25 suspects", "5 missing items", "Solo + group", "Preset clue engine"],
    actionLabel: "Play Who Took It?",
    actionAriaLabel: "Play Who Took It mystery deduction game",
  },
  {
    slug: "seed-ascent",
    title: "Seed Ascent",
    strapline: "Run the grow worlds",
    heading: "Run, jump, stomp pests, grow stronger.",
    description: "A cannabis-themed side-scrolling platform adventure with 12 stages across six grow worlds, running momentum, double jump, checkpoints, moving platforms, pest enemies, trichome collectibles, three power-up systems, and a final boss.",
    format: "Retro platformer · 1 player",
    genre: "Arcade",
    status: "playable",
    features: ["12 side-scrolling stages", "Double jump + run", "Power-ups + checkpoints", "Final boss"],
    actionLabel: "Play Seed Ascent",
    actionAriaLabel: "Play Seed Ascent",
  },
  {
    slug: "thc-rpg",
    title: "THC RPG",
    strapline: "Grow. Upgrade. Select.",
    heading: "Turn one seed into a genetics progression.",
    description: "Begin with Blue Mango, manage phenotype variation and room conditions, earn equipment upgrades, move into Blue Bubblegum, and hunt for an 80+ quality Mango Bubbles phenotype across three quest chapters.",
    format: "Cultivation RPG · 1 player",
    genre: "RPG",
    status: "playable",
    features: ["3 quest chapters", "Phenotype variation", "Equipment progression", "Autosave + recovery"],
    actionLabel: "Play THC RPG",
    actionAriaLabel: "Play THC RPG",
  },
  {
    slug: "high-iq",
    title: "High IQ",
    strapline: "Test higher cognition",
    heading: "Plant science gets a scoreboard.",
    description: "Answer reviewed-format questions across plant biology, genetics, environment, reproduction, chemistry, and cultivation science. Harder questions score more and streaks add bonuses.",
    format: "Educational trivia · 1 player",
    genre: "Trivia",
    status: "preview",
    features: ["24-question starter bank", "4 difficulty tiers", "Optional timer", "Mobile + keyboard"],
    actionLabel: "Test beta",
    actionAriaLabel: "Test High IQ beta",
  },
  {
    slug: "grower-conversations",
    title: "Grower Conversations",
    strapline: "Pass the device. Trade grow stories.",
    heading: "No scoreboard. Better grow-room conversations.",
    description: "Deal prompts about first grows, decisions, lessons, genetics, troubleshooting, and community. Filter the deck by topic or conversation depth, reveal optional follow-ups, and keep every player on equal turns.",
    format: "Conversation deck · 2–8 players",
    genre: "Party",
    status: "preview",
    features: ["48 starter prompts", "2–8 local players", "6 categories", "Mobile + keyboard"],
    actionLabel: "Test conversation beta",
    actionAriaLabel: "Test Grower Conversations beta",
  },
  {
    slug: "strain-showdown",
    title: "Strain Showdown",
    strapline: "Compare Power. Protect Vigor.",
    heading: "Build a matchup. Test the battle system.",
    description: "Match any two cards from the recovered 48-card Tier 1 set, compare Vigor and Power, trigger family effects, and inspect every step of the experimental battle resolver while the full TCG economy is finalized.",
    format: "Battle card game · rules lab",
    genre: "Cards",
    status: "preview",
    features: ["48 Tier 1 cards", "8 locked families", "Vigor + Power", "Experimental resolver"],
    actionLabel: "Test Battle Lab",
    actionAriaLabel: "Test Strain Showdown Battle Lab",
  },
  {
    slug: "phenoquest",
    title: "PhenoQuest",
    strapline: "Explore. Stabilize. Archive.",
    heading: "Build the Living Seed Vault.",
    description: "Choose a starter Pheno, explore Seedling Town and the Terp Fields in a real Three.js world, stabilize living samples through Resolve Trials, fill the PhenoLog, break Team Lockout’s barrier, and clear the first Garden Trial.",
    format: "3D exploration RPG · 1 player",
    genre: "RPG",
    status: "preview",
    features: ["3 explorable regions", "6 original Phenos", "Resolve Trials", "Keyboard + touch"],
    actionLabel: "Explore preview",
    actionAriaLabel: "Test PhenoQuest 3D preview",
  },
  {
    slug: "burn-buds",
    title: "Burn Buds",
    strapline: "Hide the fleet. Call the square.",
    heading: "Burn their board before they burn yours.",
    description: "Place a five-piece cannabis-themed fleet on a 15 × 15 grid, fire coordinate by coordinate, track hits and sunk pieces, and survive a hunt-and-target opponent that follows up on damage.",
    format: "Tactical fleet battle · 1 player",
    genre: "Strategy",
    status: "preview",
    features: ["15 × 15 battle grid", "Manual + auto placement", "Hunt + target AI", "Touch controls"],
    actionLabel: "Play beta",
    actionAriaLabel: "Play Burn Buds beta",
    posterStyle: "grid",
  },
] as const;

export const playableGameCount = gameCatalog.filter((game) => game.status === "playable").length;
export const previewGameCount = gameCatalog.length - playableGameCount;
