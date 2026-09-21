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
