# THC Terpene Atlas Data Pipeline

## Purpose

The Terpene Atlas must support a global terpene/terpenoid registry while keeping cannabis-specific claims, cultivar chemistry, breeding records, and educational interpretation traceable to evidence.

The public UI must never depend on live upstream API calls. External sources are ingested, versioned, normalized, validated, and compiled into DTF-owned runtime datasets.

## Data zones

1. **Raw** — immutable source snapshots exactly as acquired.
2. **Normalized** — common identifiers, units, names, stereochemistry, and provenance.
3. **Evidence** — cannabis occurrence, TPS genetics, cultivar/sample chemistry, sensory studies, and biological claims.
4. **Editorial** — reviewed THC explanations and teaching guardrails.
5. **Runtime** — optimized records consumed by the Next.js app and search index.

Do not hand-edit raw snapshots or generated runtime files.

## Identity key

Prefer identity matching in this order:

1. Standard InChIKey plus stereochemistry
2. PubChem CID when verified
3. canonical InChI/SMILES plus manual review
4. source-specific identifier with unresolved-identity status

Do not collapse stereoisomers, alpha/beta structural isomers, cis/trans forms, or different oxidation products into one record merely because a common name is similar.

## Core entities

- terpene compounds
- compound synonyms
- terpene classifications
- structures and identifiers
- measured physical properties
- sensory descriptors
- natural occurrences
- cannabis occurrence evidence
- cannabis samples
- sample terpene measurements
- cultivars and aliases
- cultivar profile statistics
- terpene-synthase genes
- gene products
- biosynthetic pathways
- breeding lines
- pedigree edges
- breeding samples
- breeding target profiles
- evidence claims
- research sources
- import runs
- source versions
- review state

## Cultivar rules

A cultivar name is a label, not a chemical constant.

Store individual sample measurements first. Derived cultivar summaries may include sample count, laboratory count, median, quartiles, observed range, units, time window, and confidence. Never publish one fixed terpene percentage as an inherent property of a cultivar.

## Breeding rules

Parent A × Parent B output is a selection hypothesis, not a guaranteed offspring formula.

The breeding engine may calculate:

- shared compounds
- parent-specific compounds
- measured parental ranges
- chemical-profile similarity
- TPS evidence
- target compounds
- phenotype/chemotype selection priorities
- offspring measurements by generation

Once DTF offspring COAs exist, measured offspring data supersede generic prediction.

## Evidence rules

Every biological/effect claim must point to evidence records that identify study type. Recommended evidence labels:

- human clinical
- human observational
- animal
- in vitro
- mechanistic
- traditional/anecdotal
- insufficient evidence

Chemical occurrence alone is never evidence of a human effect.

## Update process

SOURCE → RAW SNAPSHOT → NORMALIZE → DEDUPLICATE → CLASSIFY → LINK EVIDENCE → REVIEW → COMPILE RUNTIME → SEARCH INDEX → VERIFY → PUBLISH

Every compiled record must retain enough provenance to trace a public statement back to its underlying source record.


## Identity resolution states

Normalized source records move through identity resolution before they can become canonical compounds.

- **identity-cluster-unreviewed** — records share a strong exact identifier and have been clustered, but the cluster has not completed editorial/chemical review.
- **identity conflict** — strong identifiers disagree, such as the same PubChem CID paired with different full InChIKeys. Conflicts are quarantined and never auto-published.
- **unresolved identity** — no full InChIKey, verified PubChem CID, or exact canonical structure is available. A common name is not enough to merge the record.

The resolver uses the complete InChIKey. It must not reduce the key to the connectivity block when that would erase stereochemical distinction.

## Evidence ledger states

Evidence is stored separately from compound identity. Each record identifies its compound, claim type, source, exact source locator, study type, material/population, analytical method when applicable, quantitative value/unit when applicable, and review state.

Review states:

- **draft** — entered but not source-verified.
- **source-verified** — source and locator have been checked.
- **editorial-reviewed** — approved for public educational use and timestamped.
- **rejected** — retained for audit history but excluded from public claims.

Chemical occurrence evidence cannot be promoted into a biological-effect claim. Biological claims require evidence whose study type actually evaluates the biological question.


## Cultivar sample statistics

Cultivar chemistry is built from sample records, not from a single value attached to a strain name.

For the published commercial U.S. dataset, the importer preserves the dataset sample ID, laboratory, normalized `strain_slug`, producer ID, region, product category, chemotype, total terpene value, source analyte names, and each available terpene measurement.

Important analyte rules:

- `tot_ocimene` remains an aggregate-isomer measurement. It is not silently mapped to α-, β-, cis-, or trans-ocimene.
- `tot_nerolidol_ct` remains a cis/trans aggregate. It is not silently mapped to one nerolidol stereoisomer.
- source fields with unspecified stereochemistry or isomer identity carry that uncertainty forward.

Cultivar summary records expose sample count, lab count, minimum publication threshold, sample-depth tier, and per-analyte minimum, Q1, median, Q3, maximum, mean, and analyte-level sample/lab counts.

The default public compilation threshold is 5 samples. This is a display threshold, not proof that a cultivar name represents a genetically uniform population. Sample depth and laboratory diversity are shown separately from genetic certainty.

Publishable cultivar summaries are compiled into letter shards for lazy loading. The source sample dataset remains separate from the browser runtime.


## Terpene synthase genetics

The genetics layer distinguishes three different kinds of evidence that must not be conflated:

1. **Functional enzyme evidence** — a characterized CsTPS enzyme produced identified compound(s) from a tested substrate in an enzyme assay.
2. **Expression/correlation evidence** — transcript abundance or genotype is associated with chemistry in plant material.
3. **Sequence annotation** — a gene is predicted or annotated as a terpene synthase from sequence/genomic context.

Only functional enzyme evidence can populate the current `majorProducts` list in the public TPS genetics view. Correlation and annotation records may be displayed later, but they must retain their different evidence type.

Multiproduct enzymes remain multiproduct. For example, CsTPS9FN retains both β-caryophyllene and α-humulene as major products; CsTPS5FN retains both β-myrcene and α-pinene. Minor and tentatively identified products are kept distinct from major products.

A functional enzyme result establishes biochemical capability under the assay conditions. It does not establish a fixed terpene percentage, dominance relationship, or guaranteed offspring phenotype in a living plant. Plant abundance additionally depends on genotype, expression, tissue, developmental stage, precursor supply, environment, and post-harvest handling.

Every major product displayed in the genetics UI must resolve to a source-verified or editorial-reviewed `terpene-synthase-function` record in the production evidence ledger.


## Public research ledger

The public Research Ledger is a transparency surface over reviewed evidence records. It is not a marketing bibliography.

Every visible evidence record exposes:

- the exact claim being supported;
- compound or analyte identity;
- claim type;
- study type;
- material or population tested;
- analytical or experimental method when available;
- exact source locator such as table, figure, dataset row family, or section;
- review state;
- genetics metadata when relevant;
- a plain-language statement of what that evidence can and cannot establish.

Reviewed public records must resolve to a registered source with a navigable locator such as a source URL, DOI, public repository, or dataset path.

Study types are not collapsed into a single universal score. Chemical analysis, functional enzyme assays, genomics/expression, animal studies, in-vitro work, observational studies, and human clinical studies answer different questions. The UI explains those boundaries rather than pretending all evidence is interchangeable.

Draft and rejected records may remain in the audit ledger, but public educational claims should be driven by source-verified or editorial-reviewed evidence.


## Terpene Atlas visual mockup contract

The public Atlas must preserve the approved scientific-wheel hierarchy rather than reverting to a decorative circle of disconnected buttons.

The wheel is organized as:

- **center** — “Terpenes & Terpenoids” with the teaching rule “Aroma ≠ effect prediction”;
- **inner ring** — chemical class / carbon-family organization;
- **middle ring** — individual terpene or terpenoid compounds;
- **outer ring** — aroma associations for the selected compound.

Chemical class and aroma association must stay visually and semantically separate. Aroma language is not an effect score.

The wheel uses botanical/scientific visual styling: near-black forest-green surfaces, botanical green chemical-class cues, warm-gold compound cues, muted warm aroma cues, fine radial separators, clear labels, and restrained decoration. Non-terpene aroma chemistry such as sulfur compounds, esters, aldehydes, ketones, and other VOCs must be identified separately rather than forced into terpene families.

Desktop keeps the wheel as the primary visual with classification controls and a linked detail panel. Mobile keeps the full radial wheel available through horizontal swipe/tap interaction and moves the information panel below it as a readable drawer.

Compound detail pages must remain in the same visual family and link directly to mapped TPS genetics plus reviewed evidence records when those records exist.


## Cultivar distribution browser

The public cultivar browser consumes only compiled runtime summaries. It never downloads the raw laboratory dataset in the visitor's browser.

The browser exposes:

- normalized cultivar label;
- total sample count;
- laboratory count;
- producer count;
- sample-depth tier;
- total-terpene minimum, Q1, median, Q3, maximum, and mean when available;
- region distribution;
- product-category distribution;
- chemotype-label distribution;
- reported top-terpene frequency;
- analyte identity and whether that identity is exact, aggregate, or stereochemically/isomerically unresolved;
- minimum, Q1, median, Q3, maximum, analyte sample count, and analyte laboratory count;
- filterable/sortable analyte distributions;
- a visual min-to-max range with interquartile range and median;
- descriptive two-cultivar comparison using compiled median terpene vectors and shared analyte counts.

Cultivar comparison is never a best/worst ranking, quality score, effect score, genetic identity test, or prediction for an individual sample. Median-vector similarity only describes the shape of the compiled median chemistry vectors.

Search lazy-loads one alphabetical shard at a time. The runtime manifest is allowed to remain in the explicit `not-generated` bootstrap state until a refresh workflow has compiled real data. The UI must never fabricate placeholder cultivar chemistry.

### Automated runtime refresh

`.github/workflows/refresh-terpene-cultivars.yml` downloads the registered CC0 dataset into runner temporary storage, validates expected columns and minimum source size, normalizes sample-level terpene records, compiles cultivar distributions with the five-sample public threshold, and writes only compact static shards beneath `public/data/terpenes/cultivars`.

The raw CSV is never committed to DTF420. Generated runtime commits do not retrigger the refresh because the workflow's push paths exclude the public runtime directory.

The refresh runs when its pipeline code changes, can be dispatched manually, and is scheduled monthly. The generated manifest records source bytes and SHA-256 so a published runtime can be traced to the exact downloaded source file.


### Cultivar runtime schema v2

The expanded cultivar intelligence workspace uses runtime schema v2. In addition to analyte distributions, v2 cultivar summaries carry producer count, total-terpene distribution, region mix, product-category mix, chemotype-label mix, and reported top-terpene frequency.

The browser temporarily normalizes v1 runtime shards by supplying empty/default context fields, so a deployment cannot crash between application merge and generated-data refresh. The runtime builder now emits schema v2, and the refresh workflow rejects any newly generated manifest that is not v2.

After the expansion merges, the existing data-refresh workflow is expected to regenerate the checked-in cultivar shards from the registered source dataset. The generated v2 data supersedes transitional v1 normalization.


### Global cultivar chemistry intelligence index

The cultivar runtime also compiles a compact global index at `public/data/terpenes/cultivars/index.json`. This exists so whole-corpus questions do not require loading all alphabetical cultivar shards.

The index contains only derived public summary fields:

- cultivar slug;
- sample, laboratory, and producer depth;
- sample-depth tier;
- total-terpene median;
- top-terpene frequency summary;
- median terpene vector;
- per-analyte measurement coverage;
- per-analyte positive-median cultivar count/share;
- per-analyte measured-sample depth;
- per-analyte multi-laboratory cultivar count;
- distribution of cultivar-group medians.

The index does not contain raw laboratory rows or private identifiers.

**Measurement coverage** and **positive-median prevalence** are separate metrics. A compound can be measured in a cultivar group while having a compiled median of zero. The UI must not call measurement coverage “prevalence.”

Nearest-profile results use cosine similarity on compiled median terpene vectors. They are descriptive chemistry neighbors only. They are not quality rankings, effect predictions, proof of shared genetics, or predictions for an individual sample.

The global index is lazy-loaded on demand. Normal cultivar search continues to use alphabetical shards so visitors who do not request global analysis do not pay the index payload cost.


### Cultivar runtime schema v3: data-quality factors

Schema v3 adds source-breadth and analyte-breadth diagnostics to each compiled cultivar group. These are contextual factors, not a single confidence score.

Cultivar-level diagnostics include:

- laboratory sample concentration without exposing laboratory identity;
- producer sample concentration without exposing producer identity;
- largest represented-source share;
- Herfindahl concentration index for represented laboratories and producers;
- effective source count, calculated as the inverse Herfindahl concentration index;
- total-terpene measurement coverage;
- region-field coverage;
- product-category-field coverage;
- chemotype-field coverage;
- largest region, product-category, and chemotype shares.

Analyte-level diagnostics include:

- sample coverage within the cultivar group;
- relative interquartile range, calculated as `(Q3 - Q1) / median` when the median is greater than zero;
- the distribution of laboratory-level medians when more than one laboratory contributes measurements.

Laboratory and producer identifiers are not published in these diagnostics. The runtime exposes only aggregate concentration and breadth measures.

A high source concentration does not establish poor laboratory quality, bad genetics, or unreliable chemistry. It means the compiled distribution is more dependent on a smaller share of represented sources. Likewise, a broad across-lab median range is descriptive variation in the source data and is not a laboratory-performance ranking.

The public UI must present these factors separately. It must not collapse them into a universal confidence, quality, or cultivar score.

The browser remains backward-compatible with prior v1/v2 shards during deployment transitions by deriving safe default diagnostics where possible. The runtime builder emits schema v3, and the refresh workflow rejects newly generated cultivar manifests that are not schema v3.


### Cultivar runtime schema v4: regional source strata

Schema v4 adds minimum-depth regional sub-distributions inside each compiled cultivar label.

A regional stratum is created only when the region contains at least the configured `minimumRegionSamples`. Production defaults this threshold to the same five-sample minimum used for public cultivar summaries. Regional analytes must independently meet that subgroup sample threshold before they appear in the stratum.

Each regional stratum contains only derived summary data:

- source region label;
- sample count;
- represented laboratory count;
- represented producer count;
- sample-depth tier;
- total-terpene distribution when available;
- per-analyte minimum, Q1, median, Q3, maximum, mean, and sample count.

Laboratory and producer identities remain excluded.

Regional comparisons are descriptive and strongly confounded. A difference between regional subgroups does not establish that geography caused the chemistry. Potential confounders include laboratory, producer, product mix, time, genetics, cultivation practices, maturity, storage, and sampling.

If fewer than two regional strata meet the minimum depth, the public UI must not manufacture a between-region comparison. It may show the qualifying subgroup and explain that no valid between-region comparison is available.

The browser remains compatible with earlier runtime schemas by treating missing `regionStrata` as an empty collection until the post-merge refresh generates schema v4 data.


## Whole-corpus chemistry explorer

The route `/learn/terpenes/corpus` uses the compact global cultivar intelligence index to filter the full public cultivar-group corpus without loading all alphabetical runtime shards.

The corpus explorer can filter by:

- normalized cultivar label;
- minimum sample count;
- minimum laboratory count;
- minimum producer count;
- represented source region;
- represented source chemotype;
- most frequently reported top-terpene field;
- selected analyte median threshold;
- minimum total-terpene median;
- descriptive sort modes such as sample depth, laboratory breadth, producer breadth, total-terpene median, selected-analyte median, or name.

Global intelligence schema v2 adds compact context and source-breadth fields per cultivar group: dominant region, dominant chemotype, dominant product category, top region/chemotype/product distributions, effective laboratory count, effective producer count, total-terpene coverage, region coverage, chemotype coverage, and concentration indicators.

The corpus is limited by the analytes present in the published source dataset. Its measured analyte channels must never be presented as the complete universe of known terpenes or terpenoids.

Filtering answers descriptive corpus questions. It does not establish genetic identity, superiority, therapeutic effects, or future sample chemistry.


## Universal terpene and terpenoid registry

The route `/learn/terpenes/registry` exposes the broad source-candidate registry separately from the smaller reviewed THC teaching dataset.

### Primary bulk source

The first production registry feed is the versioned **COCONUT September 2026 CSV-lite release**. The monthly refresh workflow downloads the archive to runner-temporary storage, records archive size and SHA-256, extracts the CSV, inspects the source header, normalizes only terpene/terpenoid/isoprenoid candidates, and never commits the source ZIP, CSV, or normalized JSONL.

LOTUS is registered as a secondary open natural-product occurrence source for future occurrence cross-checking and provenance expansion. It is not yet used as an automatic identity merge source.

### Identity policy

Universal registry identity is intentionally stricter than common-name matching:

1. valid full InChIKey;
2. exact canonical SMILES fallback;
3. otherwise unresolved identity.

Common names and synonym similarity never establish compound identity. Unresolved identities are retained for review rather than discarded or merged by name.

### Family assignment policy

Family assignment uses:

1. explicit natural-product / chemical classification terms first;
2. exact carbon-count fallback for recognized C5/C10/C15/C20/C25/C30/C40 patterns;
3. cautious low-confidence polyterpene fallback for >C40 multiples of five;
4. unresolved family when the evidence is insufficient.

Carbon count is a fallback rather than a universal rule because modified terpenoids can deviate from idealized isoprene counts.

### Runtime structure

The compiler streams normalized candidate JSONL and keeps compact identity clusters in memory rather than retaining the full bulk source records. Public runtime records are sharded by terpene family in bounded chunks of 5,000 records. Each public record can retain:

- stable registry ID;
- exact identity signal;
- canonical/source names and bounded synonyms;
- formula and molecular weight;
- family assignment + assignment method/confidence;
- upstream source classifications;
- candidate reason/confidence;
- bounded occurrence/source-organism text;
- exact source record references;
- explicit review state.

The public runtime also includes a manifest with source release, candidate count, resolved identity count, unresolved identity count, family counts, identity policy, family policy, source checksum, and shard inventory.

### Review-state separation

A COCONUT source candidate is **not automatically**:

- documented in Cannabis;
- an aroma driver;
- a TPS product in Cannabis;
- a cultivar marker;
- a breeding-selection marker;
- evidence of a human biological effect.

Promotion path:

`source candidate → identity reviewed → occurrence/evidence linked → THC editorial reviewed`

Only reviewed records should populate definitive THC teaching claims. The universal registry exists to maximize chemical coverage while making uncertainty and review status visible.


## Deep reviewed compound chapters

Reviewed terpene records use a standardized 12-section educational chapter model:

1. chemical identity;
2. family and structural classification;
3. sensory and aroma science;
4. natural occurrence;
5. Cannabis occurrence;
6. biosynthesis and plant biology;
7. genetics and terpene synthases;
8. cultivar chemistry;
9. cultivation and post-harvest;
10. research and biological evidence;
11. safety, stability, and exposure;
12. knowledge check and applied interpretation.

Every section carries an explicit readiness state: `complete`, `reviewed-foundation`, `linked-evidence`, or `needs-expansion`. Chapter readiness is a weighted editorial completeness measure, not a scientific confidence score.

The compound page exposes the chapter map, learning objectives, evidence/genetics-linked content, intentionally incomplete sections, related reviewed compounds, and an interactive five-question knowledge check generated only from reviewed record facts and interpretation guardrails.

The route `/learn/terpenes/chapters` provides a cross-compound readiness dashboard so missing editorial work remains measurable. Safety and compound-specific cultivation/post-harvest content remain visibly incomplete until source-backed evidence is added rather than being filled with generic claims.


## Chapter evidence-depth expansion

The reviewed compound chapter model now supports evidence categories that were previously forced into generic research:

- `safety-exposure` — irritation, sensitization, toxicology, risk assessment, exposure-route limitations;
- `chemical-stability` — oxidation, degradation, transformation, and compound stability;
- `postharvest-change` — storage, packaging, drying, curing, handling, and other post-harvest chemistry changes;
- `cultivation-factor` — source-backed relationships between cultivation variables and measured chemistry.

Additional study types include `toxicology`, `review`, and `stability-study`.

### General versus compound-specific evidence

System-level Cannabis storage evidence is stored under the reserved compound key `_general-terpene`. It can establish a reviewed post-harvest foundation for the chapters, but it must not be converted into a compound-specific loss rate or universal storage rule.

Compound-specific safety/stability records remain attached to their exact compound slug. The compound chapter renders those records in the Safety, Stability & Exposure section rather than duplicating them in the generic Research section.

### First evidence-depth wave

The first reviewed evidence wave adds:

- Cannabis inflorescence storage/post-harvest terpene evidence;
- d-limonene safety/oxidation review evidence;
- linalool autoxidation chemistry and sensitization evidence;
- β-caryophyllene fragrance-use safety assessment evidence;
- β-myrcene evidence-gap/toxicology review context;
- human patch-testing evidence for hydroperoxides formed from oxidized limonene and linalool.

Each record remains scoped to the population, route, material, method, and endpoints evaluated by its source. Contact allergy does not become an inhalation claim; fragrance-use risk assessment does not become blanket cannabis safety; storage studies do not become universal cultivar-specific rates.

### Readiness behavior

Chapter readiness now responds to evidence depth:

- reviewed safety/stability records promote the Safety section from `needs-expansion` to `linked-evidence`;
- reviewed general Cannabis post-harvest evidence establishes a `reviewed-foundation` for the cultivation/post-harvest section;
- interactive reviewed-fact assessments mark the Assessment section `complete`;
- `linked-evidence` carries more readiness weight than `reviewed-foundation`, so adding stronger sourcing cannot reduce chapter readiness.

The readiness dashboard uses the same claim-specific evidence counts as the compound pages.


### Second compound-safety evidence wave

A second reviewed safety wave expands the Safety, Stability & Exposure section for additional core reviewed terpenes:

- **α-pinene** — 2026 National Toxicology Program subchronic/chronic inhalation hazard evidence in rats and mice;
- **β-pinene** — concentration-specific dermal irritation evidence from controlled animal testing;
- **terpinolene** — systematic-review evidence documenting limited in-vivo and clinical safety characterization;
- **α-humulene** — acute zebrafish toxicity data from an intraperitoneal animal model.

These records are deliberately heterogeneous because the underlying evidence is heterogeneous. The chapter UI must preserve route, model, concentration, and study design rather than flattening them into a single safety score.

The NTP α-pinene inhalation report is animal hazard evidence, not a human cannabis-use threshold. β-Pinene dermal irritation does not establish inhalation risk. Terpinolene's review record documents an evidence gap rather than proving safety or harm. α-Humulene's zebrafish LD50 is an acute animal-model result and must not be interpreted as a human exposure limit.


### Cultivation-factor and drying evidence wave

The chapter evidence model now includes compound-level Cannabis cultivation and post-harvest records from controlled peer-reviewed experiments.

Added cultivation-factor evidence covers:

- **β-myrcene, limonene, β-pinene, and linalool** under multiple controlled light spectra in the Babbas Erkle Cookies accession;
- **α-pinene, α-humulene, β-caryophyllene, and linalool** in a three-strain greenhouse experiment showing spectrum × genotype and/or flower-position interactions;
- a general medical-cannabis light-spectrum/PPFD record showing that total terpenoid response can depend on the tested spectrum/intensity combination.

Added post-harvest evidence covers:

- **β-myrcene, α-pinene, and β-pinene** under controlled-atmosphere versus traditional drying in medicinal cannabis chemovars.

These records intentionally preserve genotype, flower position, light treatment, chemovar, and drying-condition context. They are evidence that cultivation and post-harvest conditions can affect measured chemistry under specific experimental conditions—not universal recipes for maximizing a terpene.

Chapter readiness treats compound-specific `cultivation-factor` or `postharvest-change` records as `linked-evidence`. General Cannabis storage/light evidence remains a lower-level `reviewed-foundation`.
