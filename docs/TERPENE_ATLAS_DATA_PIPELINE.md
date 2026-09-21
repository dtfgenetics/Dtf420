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
