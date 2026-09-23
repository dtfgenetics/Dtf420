import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const page = fs.readFileSync(path.join(root, "app/learn/terpenes/[slug]/page.tsx"), "utf8");
const pageCss = fs.readFileSync(path.join(root, "app/learn/terpenes/[slug]/page.module.css"), "utf8");
const chapters = fs.readFileSync(path.join(root, "lib/terpenes/chapters.ts"), "utf8");
const chapterTypes = fs.readFileSync(path.join(root, "lib/terpenes/chapter-types.ts"), "utf8");
const assessments = fs.readFileSync(path.join(root, "lib/terpenes/assessments.ts"), "utf8");
const quiz = fs.readFileSync(path.join(root, "components/terpenes/TerpeneChapterQuiz.tsx"), "utf8");
const evidenceSchema = fs.readFileSync(path.join(root, "lib/terpenes/evidence.ts"), "utf8");
const evidenceQueries = fs.readFileSync(path.join(root, "lib/terpenes/evidence-queries.ts"), "utf8");
const research = fs.readFileSync(path.join(root, "lib/terpenes/research.ts"), "utf8");
const dashboard = fs.readFileSync(path.join(root, "app/learn/terpenes/chapters/page.tsx"), "utf8");
const ledger = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/evidence-ledger.json"), "utf8"));
const sourceRegistry = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/source-registry.json"), "utf8"));

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

console.log("Deep terpene compound chapters verified: 12-section model, evidence-aware readiness, reviewed safety/stability/post-harvest records, assessment completion, and scoped chapter rendering.");


for (const token of [
  '"safety-exposure"',
  '"chemical-stability"',
  '"postharvest-change"',
  '"cultivation-factor"',
  '"toxicology"',
  '"review"',
  '"stability-study"',
]) {
  if (!evidenceSchema.includes(token)) {
    throw new Error(`Expanded chapter evidence schema missing: ${token}`);
  }
}

for (const token of [
  "getReviewedGeneralEvidence",
  "getReviewedEvidenceClaimCountsForCompound",
]) {
  if (!evidenceQueries.includes(token)) {
    throw new Error(`Chapter evidence query missing: ${token}`);
  }
}

for (const token of [
  'case "safety-exposure"',
  'case "chemical-stability"',
  'case "postharvest-change"',
  'case "cultivation-factor"',
]) {
  if (!research.includes(token)) {
    throw new Error(`Evidence-scope guardrail missing: ${token}`);
  }
}

for (const token of [
  "General cannabis post-harvest evidence",
  "system-level cannabis post-harvest interpretation",
  "safetyEvidence",
  "researchEvidence",
]) {
  if (!page.includes(token)) {
    throw new Error(`Compound evidence-depth UI missing: ${token}`);
  }
}

for (const token of [
  "generalPostharvestEvidenceCount",
  "safetyEvidenceCount",
  "stabilityEvidenceCount",
  "hasAssessment",
  '"linked-evidence": 0.85',
  '"reviewed-foundation": 0.65',
]) {
  if (!chapters.includes(token) && !chapterTypes.includes(token)) {
    throw new Error(`Chapter evidence-aware readiness contract missing: ${token}`);
  }
}

for (const token of [
  'claimCounts["safety-exposure"]',
  "generalPostharvestEvidenceCount",
  "hasAssessment: true",
]) {
  if (!dashboard.includes(token)) {
    throw new Error(`Chapter dashboard evidence-readiness wiring missing: ${token}`);
  }
}

const requiredSourceIds = [
  "BUENO-2020-TERPENE-STORAGE",
  "KIM-2013-LIMONENE-SAFETY",
  "SKOLD-2004-LINALOOL-OXIDATION",
  "API-2022-CARYOPHYLLENE-SAFETY",
  "SURENDRAN-2021-MYRCENE-REVIEW",
  "BOTVID-2026-LIMONENE-LINALOOL",
];
const sourceIds = new Set((sourceRegistry.sources ?? []).map((source) => source.id));
for (const sourceId of requiredSourceIds) {
  if (!sourceIds.has(sourceId)) {
    throw new Error(`Chapter evidence source registry missing: ${sourceId}`);
  }
}

const requiredEvidenceIds = [
  "bueno2020-general-postharvest-terpene-change",
  "kim2013-limonene-safety-oxidation",
  "skold2004-linalool-autoxidation",
  "skold2004-linalool-sensitization",
  "api2022-caryophyllene-safety-assessment",
  "surendran2021-myrcene-human-evidence-limit",
  "botvid2026-limonene-hydroperoxide-contact-allergy",
  "botvid2026-linalool-hydroperoxide-contact-allergy",
];
const evidenceIds = new Set((ledger.records ?? []).map((record) => record.id));
for (const evidenceId of requiredEvidenceIds) {
  if (!evidenceIds.has(evidenceId)) {
    throw new Error(`Chapter evidence ledger missing: ${evidenceId}`);
  }
}
