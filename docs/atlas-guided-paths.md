# Atlas Guided Learning Paths

The THC Living Plant Atlas guided paths are curated sequences built entirely from the canonical 50 Atlas lesson routes.

## Rules

- A guided path never duplicates lesson content.
- Completion is read from the same `dtf420.atlas.progress.v1` local progress record used by individual Atlas lessons.
- Completing a lesson once counts in every path containing that lesson.
- A path resumes at its first unfinished lesson.
- `scripts/verify-atlas-guided-paths.mjs` rejects duplicate path IDs, duplicate steps within a path, malformed routes, and routes that do not exist in the current Atlas curriculum.
- Browser QA verifies navigation, every path view, every lesson URL, responsive layout, and shared progress behavior.

## Initial paths

1. Plant Foundations
2. Water & Transport
3. Diagnostic Reasoning
4. Canopy Architecture
5. Reproduction & Breeding Biology
6. Flower & Trichome Observation
