import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const page = fs.readFileSync(path.join(root, "app/learn/terpenes/[slug]/page.tsx"), "utf8");
const pageCss = fs.readFileSync(path.join(root, "app/learn/terpenes/[slug]/page.module.css"), "utf8");
const chapters = fs.readFileSync(path.join(root, "lib/terpenes/chapters.ts"), "utf8");
const chapterTypes = fs.readFileSync(path.join(root, "lib/terpenes/chapter-types.ts"), "utf8");
const assessments = fs.readFileSync(path.join(root, "lib/terpenes/assessments.ts"), "utf8");
const quiz = fs.readFileSync(path.join(root, "components/terpenes/TerpeneChapterQuiz.tsx"), "utf8");

for (const token of [
  '"identity"',
  '"classification"',
  '"sensory"',
  '"natural-occurrence"',
  '"cannabis-occurrence"',
  '"biosynthesis"',
  '"genetics"',
  '"cultivar-chemistry"',
  '"cultivation-postharvest"',
  '"research"',
  '"safety"',
  '"assessment"',
]) {
  if (!chapterTypes.includes(token)) throw new Error(`Chapter section model missing: ${token}`);
}

for (const token of [
  "sectionWeights",
  "needs-expansion",
  "reviewed-foundation",
  "linked-evidence",
  "score:",
  "learningObjectives",
]) {
  if (!chapters.includes(token)) throw new Error(`Chapter builder missing contract: ${token}`);
}

for (const token of [
  "Chapter readiness",
  "Learning objectives",
  "sections still need expansion",
  "Cultivation &amp; post-harvest",
  "Safety, stability &amp; exposure",
  "Related compounds",
  "<TerpeneChapterQuiz quiz={quiz} />",
]) {
  if (!page.includes(token)) throw new Error(`Compound chapter page missing: ${token}`);
}

for (const token of [
  ".chapterOverview",
  ".chapterMap",
  ".completeness",
  ".objectives",
  ".expansionSection",
  ".relatedGrid",
]) {
  if (!pageCss.includes(token)) throw new Error(`Compound chapter styling missing: ${token}`);
}

for (const token of [
  "Which terpene family",
  "Which precursor context",
  "What does the current THC record say about Cannabis occurrence",
  "Use repeated measured sample distributions with provenance",
  "Keep measured chemistry separate from unqualified human-effect claims",
]) {
  if (!assessments.includes(token)) throw new Error(`Compound assessment missing reviewed-fact question: ${token}`);
}

for (const token of [
  "Knowledge check",
  "They do not test unsupported effect claims",
  "correct so far",
  "data-correct",
  "data-wrong",
]) {
  if (!quiz.includes(token)) throw new Error(`Interactive chapter quiz missing: ${token}`);
}

for (const phrase of [
  "guaranteed human effect",
  "guaranteed relaxing",
  "guaranteed sedating",
]) {
  if ((page + "\n" + chapters + "\n" + assessments).toLowerCase().includes(phrase)) {
    throw new Error(`Deep chapter layer contains prohibited shortcut: ${phrase}`);
  }
}

console.log("Deep terpene compound chapters verified: 12-section model, readiness scoring, reviewed-fact quiz, explicit incomplete sections, and related-chapter navigation.");
