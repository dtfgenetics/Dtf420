import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const files = {
  route: path.join(root, "app/games/grower-conversations/page.tsx"),
  component: path.join(root, "app/games/grower-conversations/GrowerConversationsGame.tsx"),
  css: path.join(root, "app/games/grower-conversations/page.module.css"),
  engine: path.join(root, "lib/games/grower-conversations.ts"),
  data: path.join(root, "data/games/grower-conversations/prompts.json"),
  hub: path.join(root, "app/games/page.tsx"),
};

const [route, component, css, engine, dataText, hub] = await Promise.all(
  Object.values(files).map((file) => fs.readFile(file, "utf8")),
);

const prompts = JSON.parse(dataText);
const errors = [];
const allowedDepths = new Set(["Chill", "Reflect", "Debate"]);

function requireText(source, text, label) {
  if (!source.includes(text)) errors.push(`${label}: missing ${JSON.stringify(text)}`);
}

if (!Array.isArray(prompts) || prompts.length !== 48) {
  errors.push(`data: expected exactly 48 starter prompts, got ${prompts?.length ?? "missing"}`);
}

const ids = new Set();
const normalizedPrompts = new Set();
const categories = new Map();
const depths = new Map();
for (const [index, prompt] of (prompts || []).entries()) {
  if (!/^gc-\d{3}$/.test(prompt.id ?? "")) errors.push(`data: prompt ${index + 1} has invalid id`);
  if (ids.has(prompt.id)) errors.push(`data: duplicate id ${prompt.id}`);
  ids.add(prompt.id);

  const normalized = String(prompt.prompt ?? "").trim().toLowerCase();
  if (normalized.length < 24) errors.push(`data: ${prompt.id} prompt is too short`);
  if (normalizedPrompts.has(normalized)) errors.push(`data: duplicate prompt text at ${prompt.id}`);
  normalizedPrompts.add(normalized);

  if (!String(prompt.followUp ?? "").trim() || String(prompt.followUp).trim().length < 12) {
    errors.push(`data: ${prompt.id} is missing a useful follow-up`);
  }
  if (!String(prompt.category ?? "").trim()) errors.push(`data: ${prompt.id} has no category`);
  if (!allowedDepths.has(prompt.depth)) errors.push(`data: ${prompt.id} has invalid depth ${prompt.depth}`);

  categories.set(prompt.category, (categories.get(prompt.category) ?? 0) + 1);
  depths.set(prompt.depth, (depths.get(prompt.depth) ?? 0) + 1);
}

if (categories.size !== 6) errors.push(`data: expected 6 categories, got ${categories.size}`);
for (const [category, count] of categories) {
  if (count !== 8) errors.push(`data: ${category} should contain 8 prompts, got ${count}`);
}
if ((depths.get("Chill") ?? 0) < 12 || (depths.get("Reflect") ?? 0) < 12 || (depths.get("Debate") ?? 0) < 10) {
  errors.push(`data: depth distribution is too narrow (${JSON.stringify(Object.fromEntries(depths))})`);
}

requireText(route, "Grower Conversations", "route title");
requireText(route, "Development preview", "route status");
requireText(route, "<GrowerConversationsGame />", "route game mount");
requireText(component, "2–8 local players", "player range");
requireText(component, "buildGrowerConversationDeck", "data-driven deck construction");
requireText(component, "Math.floor(capped / players.length) * players.length", "fair turn distribution");
requireText(component, "PASS THE DEVICE", "pass-device privacy screen");
requireText(component, "Show follow-up", "follow-up control");
requireText(component, "Skip", "skip control");
requireText(component, "60-second conversation timer", "optional timer");
requireText(component, "event.key.toLowerCase() === \"s\"", "keyboard skip");
requireText(component, "event.key.toLowerCase() === \"f\"", "keyboard follow-up");
requireText(component, "There is no winner here", "no-score session design");
requireText(engine, "hashSeed", "seeded shuffle hashing");
requireText(engine, "mulberry32", "seeded shuffle generator");
requireText(engine, "filterGrowerConversationPrompts", "prompt filters");
requireText(css, "@media (max-width: 430px)", "phone layout");
requireText(css, "@media (prefers-reduced-motion: reduce)", "reduced-motion support");
requireText(hub, 'href="/games/grower-conversations"', "games hub route");
requireText(hub, "Grower Conversations", "games hub title");

const forbiddenScoreLanguage = ["leaderboard", "highest score", "points awarded", "winner takes"];
for (const phrase of forbiddenScoreLanguage) {
  if (component.toLowerCase().includes(phrase)) errors.push(`game design: score/winner language found: ${phrase}`);
}

if (errors.length) {
  console.error("Grower Conversations verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Grower Conversations verified: ${prompts.length} prompts, ${categories.size} categories, ` +
  `depths Chill=${depths.get("Chill")}, Reflect=${depths.get("Reflect")}, Debate=${depths.get("Debate")}.`,
);
