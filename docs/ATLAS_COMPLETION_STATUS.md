# THC Living Plant Atlas — Completion Contract

This document separates what the Atlas can ship reliably today from the higher-fidelity specimen work that is still intentionally gated. It exists to prevent the project from calling a page complete merely because it renders, or blocking useful education because a future photorealistic asset is not ready yet.

## Product goal

The Living Plant Atlas is a visually cohesive, evidence-backed, interactive plant-science experience that lets a learner move from the whole cannabis plant to systems, structures, processes, observations, diagnostics, and mastery without losing anatomical context.

A complete Atlas must satisfy all of these dimensions:

1. whole-plant navigation and structure selection;
2. 10 canonical plant systems;
3. 100 canonical lessons;
4. a learner-facing visual surface for every lesson;
5. a knowledge check for every lesson;
6. evidence sources for every lesson;
7. guided paths, mastery, diagnostics, system connections, and visual-practice activities;
8. responsive desktop/mobile behavior with no horizontal overflow;
9. resilient 3D and accessible fallback behavior;
10. fail-closed photorealistic specimen release rules.

## Current implementation contract

### Whole-plant experience

- The Atlas opens in a dedicated whole-plant camera mode so the complete specimen is the visual hierarchy anchor.
- Selecting a structure changes to its entity camera for close inspection.
- Returning to Overview restores the whole-plant camera.
- The Three.js runtime remains interactive when production GLBs are unavailable.
- The accessible React/SVG plant fallback remains available if the WebGL runtime fails.

### Curriculum

- 10 systems × 10 lessons = 100 canonical lesson routes.
- Every lesson has a summary, visual specification, observation context, knowledge check, progress integration, whole-plant context, and evidence-source surface.
- Every lesson resolves to at least two known evidence sources through direct route mappings and/or system-level defaults.

### Visual coverage

- 60 lesson IDs currently resolve to specialized code-native interactive scientific visuals.
- The remaining 40 lessons render a lesson-specific system study map rather than an empty state or internal production brief.
- Approved production images/media can replace or augment these teaching surfaces without changing the lesson route.
- Internal production prompts, review labels, and asset workflow language must not appear as the learner's primary visual.

### Responsive experience

- Desktop uses the immersive three-column Atlas workspace.
- Mobile collapses to a contained viewer with a responsive inspector sheet.
- Browser QA verifies desktop and phone behavior, interactive state changes, visual coverage, WebGL availability, and horizontal-overflow containment.

## Photorealistic specimen gate

Photorealistic production 3D is **not** considered complete until six distinct specimen slots are approved:

1. seedling;
2. vegetative;
3. flowering;
4. male;
5. female;
6. hermaphrodite / intersex.

Each specimen must satisfy the documented licensing, provenance, geometry, botanical-realism, material, root/canopy, browser-performance, and review requirements. A single generic cannabis mesh cannot satisfy all six states.

Until those assets pass review:

- `public/atlas-3d/models/model-manifest.json` must remain unavailable for production GLB release;
- the project-owned procedural Three.js specimen remains the resilient teaching runtime;
- the public Atlas must not describe the procedural specimen as photorealistic.

## Verification gates

The repository must remain fail-closed. The main `npm run verify` gate covers:

- interactive Atlas structure;
- production model runtime contract;
- model candidate licensing/acquisition metadata;
- photorealism release criteria;
- 100-lesson completion;
- 100 lesson visual slots;
- all-lesson evidence coverage;
- guided learning paths;
- 100 knowledge checks;
- mastery and badges;
- diagnostic cases;
- system connections;
- visual-identification practice;
- broader education content/source/link checks;
- lint, TypeScript, and production build.

Browser QA separately validates the rendered user experience and stores screenshot/test evidence.

## Definition of done

### Functional Atlas done

The functional Atlas can be called established when all repository and browser checks pass on the same commit and the learner can move through the complete 100-lesson experience with working visuals, evidence, checks, navigation, responsive layouts, 3D interaction, and fallbacks.

### Photorealistic Atlas done

The photorealistic Atlas can be called complete only when all six production specimens are acquired or authored, legally documented, optimized, reviewed, integrated, and the production model manifest is enabled without bypassing any verifier.

These are intentionally separate milestones. Functional completeness must not be held hostage by missing premium media, and premium-media incompleteness must not be hidden behind a green application build.
