# THC Living Plant Atlas — Asset & Information Audit — 2026-09-03

## Scope

This audit reconciles the current Atlas lesson-visual inventory, production briefs, code-native teaching surfaces, 3D model candidate metadata, six-specimen acquisition planning, public runtime assets, and verification contracts against current `main` after the visual-cohesion release.

## Corrected findings

- The canonical curriculum remains 10 systems × 10 lessons = 100 lesson visual slots.
- 60 lessons already resolve to specialized code-native scientific visuals. Ten of those advanced visuals were still implicit `v0` records and are now explicit production-review records.
- 36 later lesson-specific production briefs existed in standalone JSON files but were not consumed by the live asset registry. They are now normalized through `lib/atlas-visual-brief-manifests.ts`.
- Four Stem & Vascular expansion lessons had no dedicated production brief. Dedicated briefs were added for vascular cambium, bast fibers, cohesion-tension/water potential, and embolism/hydraulic disruption.
- The resulting production metadata contract is now 60 explicit interactive/media records + 40 detailed brief-ready records = all 100 lessons, with zero unplanned `needed` slots.
- Runtime manifest imports and verifier discovery are now cross-checked so adding an override/brief file without wiring it into the runtime fails CI.
- No static lesson media is currently shipped under `public/atlas/`; this is consistent with the fact that no lesson-media record is currently `ready` with a public file path. Learners remain covered by specialized interactive visuals or the system study-map fallback.
- The `public/atlas-3d/` runtime contains the procedural/runtime code and model contracts, but no production cannabis GLB binary is released. This remains intentionally fail-closed.
- The six required photoreal specimens remain seedling, vegetative, flowering, male, female, and hermaphrodite/intersex. All six release slots remain pending.
- The previously separate six-specimen acquisition plan was replayed onto current main as audited research metadata rather than merging its stale branch.

## External source recheck

Current public source pages were rechecked before updating acquisition/candidate metadata:

- Meshy pre-made gallery licensing currently describes gallery assets as CC0 and supports downloadable 3D formats; individual cannabis leads used by the queue are currently marked CC0.
- BlendSwap `Hemp, Weed, Cannabis Sativa` remains listed as CC0.
- Sketchfab `Cannabis Sativa plant` by Zbrojmistrz remains listed under Creative Commons Attribution and reports 40.8k triangles / 27.5k vertices with separate plant and bucket objects. The exact attribution-license version still must be preserved from the acquired package before public redistribution.
- A23D asset `002707A` remains a commercial benchmark with 2 meshes, 859,344 vertices, 418,384 faces, PBR metallic/roughness materials, and 4K/2K/1K textures; it is not authorized for production redistribution by this audit.
- Male/female Wikimedia morphology references used by the acquisition queue currently carry public-domain or CC0 terms on their file pages.
- Punja & Holmes (2020) remains an open-access CC BY morphology reference for Cannabis intersex/anther expression.

## Release boundary

This audit does not release a photorealistic GLB, does not populate any six-specimen production slot, and does not label the procedural Three.js plant as photorealistic. Candidate listings remain research/acquisition inputs until a binary passes rights, provenance, geometry, botanical review, semantic mapping, desktop/mobile budgets, photorealism review, and browser QA.
