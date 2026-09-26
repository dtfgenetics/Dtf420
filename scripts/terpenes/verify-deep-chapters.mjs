import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const page = fs.readFileSync(path.join(root, "app/learn/terpenes/[slug]/page.tsx"), "utf8");
const dataSource = fs.readFileSync(path.join(root, "lib/terpenes/data.ts"), "utf8");
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
const analyticalMethods = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/analytical-methods.json"), "utf8"));
const ecologicalRoles = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/ecological-roles.json"), "utf8"));
const applications = JSON.parse(fs.readFileSync(path.join(root, "data/terpenes/applications.json"), "utf8"));
const analyticalQueries = fs.readFileSync(path.join(root, "lib/terpenes/analytical-methods.ts"), "utf8");
const ecologyQueries = fs.readFileSync(path.join(root, "lib/terpenes/ecology.ts"), "utf8");
const applicationQueries = fs.readFileSync(path.join(root, "lib/terpenes/applications.ts"), "utf8");
const sourceQueries = fs.readFileSync(path.join(root, "lib/terpenes/source-queries.ts"), "utf8");

for (const token of [
  '"identity"',
  '"classification"',
  '"physical-properties"',
  '"stereochemistry"',
  '"analytical-methods"',
  '"sensory"',
  '"natural-occurrence"',
  '"ecological-role"',
  '"cannabis-occurrence"',
  '"biosynthesis"',
  '"genetics"',
  '"cultivar-chemistry"',
  '"cultivation-postharvest"',
  '"research"',
  '"safety"',
  '"applications"',
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

console.log("Deep terpene compound chapters verified: 17-section model with analytical, ecological, application, evidence-aware readiness, assessment, and scoped rendering.");


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
  "IBRAHIM-2019-CANNABIS-GCMS",
  "MICALIZZI-2021-CANNABIS-ANALYTICS",
  "FARRE-2017-BETA-OCIMENE-ECOLOGY",
  "SHALU-2024-SQUALENE-INDUSTRY",
  "KLÄUI-1982-CAROTENOID-COLORANTS",
  "DEICAS-2021-CANNABIS-HSGCTOF",
  "MUDGE-2019-CANNABIS-TERPENE-METABOLOMICS",
  "LIU-1976-SQUALENE-GLC",
  "SCHIERLE-2004-BETA-CAROTENE-LC",
  "DEICAS-2021-CANNABIS-HSGCTOF",
  "MUDGE-2019-CANNABIS-TERPENE-METABOLOMICS",
  "LIU-1976-SQUALENE-GLC",
  "SCHIERLE-2004-BETA-CAROTENE-LC",
  "RASMANN-2005-CARYOPHYLLENE-ECOLOGY",
  "RAGUSO-2016-LINALOOL-ECOLOGY",
  "BEHR-2009-MYRCENE-SUSTAINABLE-CHEMISTRY",
  "CIRIMINNA-2014-LIMONENE-BIOECONOMY",
  "ALLENSPACH-2021-ALPHA-PINENE",
  "LETIZIA-2003-LINALOOL-FRAGRANCE",
  "KIM-2015-ALPHA-PINENE-MACROPHAGE",
  "PHILLIPS-2012-BETA-PINENE-VAPOR",
  "PEREIRA-2020-ALPHA-TERPINENE-TRACHEA",
  "LOU-BONAFONTE-2018-SQUALENE-BIOLOGY",
  "TANG-2003-BETA-CAROTENE-RETINOL",
  "NOOSHADOKHT-2022-GAMMA-TERPINENE",
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
  "mudge2019-e-beta-ocimene-cannabis-occurrence",
  "deicas2021-z-beta-ocimene-cannabis-occurrence",
  "mudge2019-alpha-terpinene-cannabis-occurrence",
  "mudge2019-gamma-terpinene-cannabis-occurrence",
  "mudge2019-e-beta-ocimene-sensory",
  "mudge2019-z-beta-ocimene-sensory",
  "mudge2019-alpha-terpinene-sensory",
  "mudge2019-gamma-terpinene-sensory",
  "kim2015-alpha-pinene-macrophage-inflammation",
  "phillips2012-beta-pinene-antimicrobial-vapor",
  "menezes2021-terpinolene-biological-review",
  "pereira2020-alpha-terpinene-tracheal-relaxation",
  "nooshadokht2022-gamma-terpinene-antileishmanial",
  "lou2018-squalene-biological-review",
  "tang2003-beta-carotene-retinol-conversion",
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


for (const token of [
  "analyticalMethodEvidenceCount",
  "exactEcologyEvidenceCount",
  "aggregateEcologyEvidenceCount",
  "applicationEvidenceCount",
]) {
  if (!chapterTypes.includes(token) || !chapters.includes(token) || !dashboard.includes(token)) {
    throw new Error(`Structured context readiness wiring missing: ${token}`);
  }
}

for (const token of [
  "Analytical methods &amp; identification",
  "Ecological role &amp; plant interactions",
  "Industrial &amp; application context",
  "generalAnalyticalMethods",
  "ecologyRecords",
  "applicationRecords",
]) {
  if (!page.includes(token)) {
    throw new Error(`Structured chapter context UI missing: ${token}`);
  }
}

for (const token of [
  ".contextSection",
  ".contextGrid",
  ".contextCard",
  ".generalContext",
  ".roleChips",
]) {
  if (!pageCss.includes(token)) {
    throw new Error(`Structured chapter context styling missing: ${token}`);
  }
}

for (const [name, dataset] of [
  ["analytical methods", analyticalMethods],
  ["ecological roles", ecologicalRoles],
  ["applications", applications],
]) {
  if (dataset.schemaVersion !== "1.0.0" || !Array.isArray(dataset.records)) {
    throw new Error(`Invalid structured ${name} dataset`);
  }
  if (!dataset.records.length) {
    throw new Error(`Structured ${name} dataset is empty`);
  }
}

for (const token of [
  "getReviewedAnalyticalMethodsForCompound",
  "getReviewedGeneralAnalyticalMethods",
]) {
  if (!analyticalQueries.includes(token)) throw new Error(`Analytical method query missing: ${token}`);
}

for (const token of [
  "getReviewedEcologyForCompound",
  "countExactEcologyEvidence",
  "countAggregateEcologyEvidence",
]) {
  if (!ecologyQueries.includes(token)) throw new Error(`Ecology query missing: ${token}`);
}

if (!applicationQueries.includes("getReviewedApplicationsForCompound")) {
  throw new Error("Application query missing");
}
if (!sourceQueries.includes("getTerpeneSourceById")) {
  throw new Error("Shared terpene source resolver missing");
}

const ocimeneEcology = (ecologicalRoles.records ?? []).find(
  (record) => record.id === "farre2017-beta-ocimene-plant-ecology",
);
if (
  !ocimeneEcology ||
  ocimeneEcology.identityResolution !== "isomer-unresolved" ||
  !ocimeneEcology.compoundSlugs.includes("e-beta-ocimene") ||
  !ocimeneEcology.compoundSlugs.includes("z-beta-ocimene")
) {
  throw new Error("β-ocimene ecological evidence must remain aggregate/isomer-unresolved");
}

const validatedMethod = (analyticalMethods.records ?? []).find(
  (record) => record.id === "ibrahim2019-cannabis-gcms-core-terpenes",
);
if (!validatedMethod || !validatedMethod.compoundSlugs.includes("beta-myrcene")) {
  throw new Error("Validated cannabis GC-MS method coverage is missing core analytes");
}

const squaleneApplication = (applications.records ?? []).find(
  (record) => record.id === "shalu2024-squalene-industrial-applications",
);
const caroteneApplication = (applications.records ?? []).find(
  (record) => record.id === "klaui1982-beta-carotene-food-colorant",
);
if (!squaleneApplication || !caroteneApplication) {
  throw new Error("Structured application coverage missing squalene or β-carotene");
}


if (!research.includes('record.studyType === "ex-vivo"')) {
  throw new Error("Biological evidence scope must distinguish ex-vivo isolated-tissue studies");
}

const biologicalCoverageSlugs = [
  "alpha-pinene",
  "beta-pinene",
  "terpinolene",
  "alpha-terpinene",
  "gamma-terpinene",
  "squalene",
  "beta-carotene",
];
for (const slug of biologicalCoverageSlugs) {
  const hasBiological = (ledger.records ?? []).some(
    (record) =>
      record.compoundSlug === slug &&
      record.claimType === "biological-effect" &&
      ["source-verified", "editorial-reviewed"].includes(record.reviewStatus),
  );
  if (!hasBiological) {
    throw new Error(`Second-wave biological evidence missing for ${slug}`);
  }
}

for (const ocimeneSlug of ["e-beta-ocimene", "z-beta-ocimene"]) {
  const hasBiological = (ledger.records ?? []).some(
    (record) =>
      record.compoundSlug === ocimeneSlug &&
      record.claimType === "biological-effect" &&
      ["source-verified", "editorial-reviewed"].includes(record.reviewStatus),
  );
  if (hasBiological) {
    throw new Error(`${ocimeneSlug} must remain without borrowed aggregate biological-effect evidence`);
  }
}


const requiredEcologyIds = [
  "rasmann2005-beta-caryophyllene-root-defense",
  "raguso2016-linalool-plant-ecology",
];
const ecologyIds = new Set((ecologicalRoles.records ?? []).map((record) => record.id));
for (const recordId of requiredEcologyIds) {
  if (!ecologyIds.has(recordId)) {
    throw new Error(`Expanded ecology record missing: ${recordId}`);
  }
}

const caryophylleneEcology = (ecologicalRoles.records ?? []).find(
  (record) => record.id === "rasmann2005-beta-caryophyllene-root-defense",
);
if (
  !caryophylleneEcology ||
  caryophylleneEcology.identityResolution !== "exact" ||
  !caryophylleneEcology.compoundSlugs.includes("beta-caryophyllene")
) {
  throw new Error("β-caryophyllene ecology must remain exact reviewed chapter evidence");
}

const linaloolEcology = (ecologicalRoles.records ?? []).find(
  (record) => record.id === "raguso2016-linalool-plant-ecology",
);
if (
  !linaloolEcology ||
  linaloolEcology.identityResolution !== "exact" ||
  !linaloolEcology.compoundSlugs.includes("linalool")
) {
  throw new Error("Linalool ecology record is missing exact chapter mapping");
}

const requiredApplicationIds = [
  "behr2009-myrcene-sustainable-chemistry",
  "ciriminna2014-limonene-bioeconomy",
  "allenspach2021-alpha-pinene-applications",
  "letizia2003-linalool-fragrance",
  "api2022-beta-caryophyllene-fragrance",
];
const applicationIds = new Set((applications.records ?? []).map((record) => record.id));
for (const recordId of requiredApplicationIds) {
  if (!applicationIds.has(recordId)) {
    throw new Error(`Expanded application record missing: ${recordId}`);
  }
}

for (const slug of ["beta-myrcene", "limonene", "alpha-pinene", "linalool", "beta-caryophyllene"]) {
  const hasApplication = (applications.records ?? []).some(
    (record) => record.compoundSlug === slug && record.reviewStatus === "source-verified",
  );
  if (!hasApplication) {
    throw new Error(`Expanded application coverage missing for ${slug}`);
  }
}


const requiredAnalyticalIds = [
  "deicas2021-z-beta-ocimene-hsgctof",
  "mudge2019-alpha-gamma-terpinene-gcms",
  "liu1976-squalene-glc-validation",
  "schierle2004-beta-carotene-lc-validation",
];
const analyticalIds = new Set((analyticalMethods.records ?? []).map((record) => record.id));
for (const recordId of requiredAnalyticalIds) {
  if (!analyticalIds.has(recordId)) {
    throw new Error(`Expanded analytical method record missing: ${recordId}`);
  }
}

const expectedAnalyticalCoverage = [
  "beta-myrcene",
  "limonene",
  "alpha-pinene",
  "beta-pinene",
  "terpinolene",
  "linalool",
  "beta-caryophyllene",
  "alpha-humulene",
  "z-beta-ocimene",
  "alpha-terpinene",
  "gamma-terpinene",
  "squalene",
  "beta-carotene",
];

for (const slug of expectedAnalyticalCoverage) {
  const covered = (analyticalMethods.records ?? []).some(
    (record) =>
      record.reviewStatus === "source-verified" &&
      (record.compoundSlugs ?? []).includes(slug),
  );
  if (!covered) {
    throw new Error(`Expected reviewed analytical method coverage missing for ${slug}`);
  }
}

const eOcimeneMethod = (analyticalMethods.records ?? []).some(
  (record) =>
    record.reviewStatus === "source-verified" &&
    (record.compoundSlugs ?? []).includes("e-beta-ocimene"),
);
if (eOcimeneMethod) {
  throw new Error("E-β-ocimene must remain without borrowed compound-specific analytical method coverage");
}

const zOcimeneMethod = (analyticalMethods.records ?? []).find(
  (record) => record.id === "deicas2021-z-beta-ocimene-hsgctof",
);
if (
  !zOcimeneMethod ||
  zOcimeneMethod.identityResolution !== "named-reference-standard" ||
  !zOcimeneMethod.notes.includes("does not establish E/trans-β-ocimene")
) {
  throw new Error("Z-β-ocimene analytical method must preserve cis/Z identity scope");
}

const nonCannabisMethods = [
  ["liu1976-squalene-glc-validation", "not Cannabis"],
  ["schierle2004-beta-carotene-lc-validation", "not Cannabis"],
];
for (const [recordId, requiredNote] of nonCannabisMethods) {
  const record = (analyticalMethods.records ?? []).find((item) => item.id === recordId);
  if (!record || !record.notes.includes(requiredNote)) {
    throw new Error(`Non-cannabis analytical method must declare matrix limitation: ${recordId}`);
  }
}


for (const token of [
  "curatedSensoryEvidence",
  "occurrenceEvidence",
  "Curated literature descriptors",
  "Reviewed Cannabis occurrence",
]) {
  if (!page.includes(token)) {
    throw new Error(`Curated occurrence/sensory rendering missing: ${token}`);
  }
}

for (const token of [
  'claimCounts["sensory-descriptor"]',
]) {
  if (!dashboard.includes(token)) {
    throw new Error(`Chapter readiness missing curated sensory count: ${token}`);
  }
}

const occurrenceSensoryExpectations = [
  ["e-beta-ocimene", "documented", ["citrus", "tropical"]],
  ["z-beta-ocimene", "documented", ["citrus", "tropical"]],
  ["alpha-terpinene", "documented", ["woody"]],
  ["gamma-terpinene", "documented", ["citrus"]],
];
for (const [slug, occurrence, descriptors] of occurrenceSensoryExpectations) {
  const start = dataSource.indexOf(`slug: "${slug}"`);
  if (start < 0) throw new Error(`Reviewed terpene seed missing: ${slug}`);
  const end = dataSource.indexOf("\n  },", start);
  const block = dataSource.slice(start, end);
  if (!block.includes(`cannabisOccurrence: "${occurrence}"`)) {
    throw new Error(`${slug} must be promoted to documented Cannabis occurrence`);
  }
  for (const descriptor of descriptors) {
    if (!block.includes(`"${descriptor}"`)) {
      throw new Error(`${slug} missing curated sensory descriptor: ${descriptor}`);
    }
  }
}

for (const slug of ["e-beta-ocimene", "z-beta-ocimene", "alpha-terpinene", "gamma-terpinene"]) {
  const hasOccurrence = (ledger.records ?? []).some(
    (record) =>
      record.compoundSlug === slug &&
      record.claimType === "cannabis-occurrence" &&
      ["source-verified", "editorial-reviewed"].includes(record.reviewStatus),
  );
  const hasSensory = (ledger.records ?? []).some(
    (record) =>
      record.compoundSlug === slug &&
      record.claimType === "sensory-descriptor" &&
      ["source-verified", "editorial-reviewed"].includes(record.reviewStatus),
  );
  if (!hasOccurrence || !hasSensory) {
    throw new Error(`Reviewed occurrence/sensory evidence incomplete for ${slug}`);
  }
}
