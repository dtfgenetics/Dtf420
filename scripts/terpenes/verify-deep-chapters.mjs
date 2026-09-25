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
  '"physical-properties"',
  '"stereochemistry"',
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

console.log("Deep terpene compound chapters verified: 14-section model, evidence-aware readiness, reviewed safety/stability/post-harvest records, physical/stereochemical coverage, assessment completion, and scoped chapter rendering.");


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
  "NTP-2026-ALPHA-PINENE-INHALATION",
  "MENEZES-2021-TERPINOLENE-REVIEW",
  "WEI-2006-PINENE-DERMAL",
  "BORGES-2026-HUMULENE-ZEBRAFISH",
  "MORELLO-2022-CANNABIS-LIGHT",
  "REICHEL-2022-LIGHT-FLOWER-POSITION",
  "HOLWEG-2024-CANNABIS-LIGHT",
  "BIRENBOIM-2024-CANNABIS-DRYING",
  "GOFFMAN-2025-IRRADIATION-STORAGE",
  "WOJTUNIK-2022-ALPHA-TERPINENE-TOX",
  "ALVES-2025-GAMMA-TERPINENE-TOX",
  "CHO-2009-SQUALENE-HIGH-DOSE",
  "EFSA-2024-BETA-CAROTENE-UL",
  "RIFM-2021-BETA-OCIMENE-UNRESOLVED",
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
  "ntp2026-alpha-pinene-chronic-inhalation",
  "menezes2021-terpinolene-safety-gap",
  "wei2006-beta-pinene-dermal-irritation",
  "borges2026-humulene-acute-zebrafish",
  "morello2022-myrcene-light-spectrum",
  "morello2022-limonene-light-spectrum",
  "morello2022-beta-pinene-light-spectrum",
  "morello2022-linalool-light-spectrum",
  "reichel2022-alpha-pinene-light-strain-position",
  "reichel2022-humulene-light-strain-position",
  "reichel2022-caryophyllene-light-strain-position",
  "reichel2022-linalool-light-strain-position",
  "birenboim2024-myrcene-drying",
  "birenboim2024-alpha-pinene-drying",
  "birenboim2024-beta-pinene-drying",
  "holweg2024-total-terpenoid-light-ppfd",
  "goffman2025-myrcene-postharvest",
  "goffman2025-limonene-postharvest",
  "goffman2025-terpinolene-postharvest",
  "goffman2025-alpha-pinene-postharvest",
  "goffman2025-beta-pinene-postharvest",
  "goffman2025-caryophyllene-postharvest",
  "goffman2025-linalool-postharvest",
  "goffman2025-humulene-postharvest",
  "wojtunik2022-alpha-terpinene-toxicity-review",
  "alves2025-gamma-terpinene-toxicogenetic",
  "cho2009-squalene-high-dose-adverse-effects",
  "efsa2024-beta-carotene-supplement-risk",
  "rifm2021-beta-ocimene-unresolved-safety",
];
const evidenceIds = new Set((ledger.records ?? []).map((record) => record.id));
for (const evidenceId of requiredEvidenceIds) {
  if (!evidenceIds.has(evidenceId)) {
    throw new Error(`Chapter evidence ledger missing: ${evidenceId}`);
  }
}


for (const token of [
  "cultivationEvidence",
  'evidenceClaimCounts["cultivation-factor"]',
  'evidenceClaimCounts["postharvest-change"]',
]) {
  if (!page.includes(token)) {
    throw new Error(`Compound cultivation evidence UI missing: ${token}`);
  }
}

for (const token of [
  "cultivationEvidenceCount",
  "postharvestEvidenceCount",
]) {
  if (!chapterTypes.includes(token) || !chapters.includes(token) || !dashboard.includes(token)) {
    throw new Error(`Cultivation readiness wiring missing: ${token}`);
  }
}


for (const token of [
  "biologicalEvidenceCount",
  "Biological research evidence",
  'claimCounts["biological-effect"]',
]) {
  const haystack = chapters + "\n" + chapterTypes + "\n" + dashboard + "\n" + page;
  if (!haystack.includes(token)) {
    throw new Error(`Biological chapter readiness contract missing: ${token}`);
  }
}


for (const token of [
  "getReviewedAggregateIdentityEvidenceForCompound",
  "_beta-ocimene-unresolved",
]) {
  if (!evidenceQueries.includes(token)) {
    throw new Error(`Aggregate identity evidence query missing: ${token}`);
  }
}

for (const token of [
  "Identity-unresolved related evidence",
  "Not counted as isomer-specific readiness",
  "aggregateIdentityEvidence",
]) {
  if (!page.includes(token)) {
    throw new Error(`Aggregate identity evidence UI missing: ${token}`);
  }
}

for (const token of [
  ".aggregateEvidence",
  ".aggregateEvidenceHeading",
]) {
  if (!pageCss.includes(token)) {
    throw new Error(`Aggregate identity evidence styling missing: ${token}`);
  }
}

const unresolvedOcimene = (ledger.records ?? []).find(
  (record) => record.id === "rifm2021-beta-ocimene-unresolved-safety",
);
if (!unresolvedOcimene || unresolvedOcimene.compoundSlug !== "_beta-ocimene-unresolved") {
  throw new Error("β-ocimene safety evidence must remain attached to the unresolved identity scope");
}
