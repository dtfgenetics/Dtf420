# THC Search Architecture

## Decision

Use **Pagefind** as the preferred production search index for the public Teaching Healthy Cultivation corpus.

The existing `components/education/EducationSearch.tsx` currently imports Academy, Atlas, plant-health, cultivation-science, symptom, tool, evidence, glossary, and SOP JSON into a client component and then performs a custom in-memory ranking pass. That approach was useful while the corpus was small, but it makes the search route carry content data that already exists on generated pages.

Pagefind is a better fit for the production architecture because the Dtf420 static overlay already produces generated HTML. Pagefind runs after that static generation step and produces a segmented static index that can be fetched only when a user searches.

## Preserve

Do not replace the branded search experience with a generic third-party page.

Preserve:
- the existing THC search route and visual design;
- content-type filters;
- result cards;
- examples / suggested queries;
- the "search is for discovery, not diagnosis" warning;
- accessible status updates;
- canonical DTF navigation.

Replace only the indexing and ranking backend.

## Target release flow

```
Next static overlay build
        ↓
generated HTML
        ↓
Pagefind indexing
        ↓
pagefind/ static index assets
        ↓
static-overlay verification
        ↓
deployment package
```

## Indexing contract

Index public educational content only.

Required result metadata:
- title
- content type
- category/context
- canonical href
- short description
- optional image
- optional learning level

Initial content types:
- Academy course
- Atlas lesson
- Plant health
- Cultivation science
- Symptom differential
- Printable tool
- Evidence source
- Glossary term
- SOP

Future types:
- Terpene Atlas compound
- Genetics reference
- GrowLens help
- Diagnostic education

## Exclusions

Do not index:
- private learner progress;
- assessment answers;
- account pages;
- checkout/cart;
- draft or unreleased material;
- internal production notes;
- duplicate print/export versions where a canonical public page exists.

## Migration steps

1. Add Pagefind as a pinned development dependency with the lockfile updated by npm.
2. Run Pagefind only after the static export/overlay output exists.
3. Add semantic metadata/filters to generated public pages.
4. Create a small client adapter that exposes Pagefind results in the existing `EducationSearch` result shape.
5. Remove bulk content JSON imports from `EducationSearch.tsx`.
6. Keep content-type filtering and examples.
7. Extend deterministic QA to assert that the generated search index exists and includes representative routes from every required content family.
8. Compare result quality using a fixed query fixture set before release.

## Acceptance queries

The verification fixture should cover at least:
- VPD
- root-zone hypoxia
- edema
- pH meter
- PPFD
- breeding
- yellow lower leaves
- water activity
- HLVd
- rhizosphere

For each fixture, QA should assert that at least one known canonical result is returned and that no private/draft route enters the index.

## Why not primary MiniSearch

MiniSearch remains a good MIT-licensed in-memory library for bounded datasets. It is not the preferred whole-corpus architecture here because the current problem is not the ranking function alone: the search client imports much of the source corpus into the browser. Pagefind moves that work to the build and serves segmented search assets on demand.

## Why not hosted search yet

A hosted search service adds deployment, privacy, cost, synchronization and operational dependencies that are unnecessary for the current public corpus. Revisit only if the static index becomes inadequate for scale, personalized/private search, or real-time content requirements.
