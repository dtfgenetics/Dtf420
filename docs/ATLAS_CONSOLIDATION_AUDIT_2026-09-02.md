# THC Living Plant Atlas — Consolidation Audit

Date: 2026-09-02

## Decision

The canonical long-term Plant Atlas is **Dtf420 `/learn/atlas/`**.

Do not create another parallel Atlas implementation.

- `dtfgenetics/Dtf420` owns the Atlas product: curriculum, canonical entities, lesson routes, 3D runtime, model contract, search, progress, mastery, notebook, diagnostics, growth-stage/micro/environment experiences, tests, and future model assets.
- `dtfgenetics/Thc` remains the production/publishing authority for dtfseeds.com and the WordPress-owned `/learn/` discovery surface.
- The existing `Thc /atlas/` V4 implementation is a **feature donor and temporary compatibility surface**, not a second source of truth.
- `legacy/atlas-static/` is **archive/reference only** and receives no new product work.

The next phase is consolidation and visual/scientific interaction depth, not more curriculum expansion.

## Current canonical Dtf420 Atlas

Current audited main at start of this ledger: `1f9d35197ac04e8e35aabffcb13013fcbe86a3dc`.

### Content and learning systems

| Area | Status | Action |
| --- | --- | --- |
| 100 canonical lessons / 10 systems | Working | Keep; stop expanding lesson count until product consolidation is complete |
| Scholarly evidence/source maps | Working | Keep |
| Knowledge checks | Working | Keep |
| Mastery badges/passport/review | Working | Keep |
| Guided paths | Working | Keep |
| Atlas search | Working | Keep |
| Dashboard / Continue Learning | Working | Keep |
| Observation notebook | Working, device-local | Keep; cloud/account sync is later work |
| Observation comparison | Working | Keep |
| Diagnostic cases | Working | Keep; deepen 3D integration |
| System connections / compare labs | Working | Keep |
| Lesson visual components | Working, mixed visual quality | Keep; progressively upgrade the weakest visuals |

Canonical route families include the Atlas hub, system pages, lesson pages, dashboard, paths, practice, mastery, review, notebook, observation comparison, diagnostic cases, compare, and search.

### Canonical systems

1. Seed & Germination
2. Root System
3. Stem & Vascular System
4. Nodes & Branching
5. Leaves
6. Flowers
7. Trichomes & Resin
8. Sex, Pollen & Seeds
9. Environment Overlay
10. Diagnostic Overlay

Each system currently has 10 canonical lessons.

## Dtf420 3D state

| Area | Status | Action |
| --- | --- | --- |
| Interactive Atlas shell | Working | Keep |
| Three.js/WebGL runtime | Working | Keep |
| Rotate / zoom / reset / fullscreen | Working | Keep |
| Hotspot selection | Working | Keep |
| Info / Micro / Data / Notes inspector | Working | Keep |
| Layer switching | Working | Keep and deepen |
| Procedural teaching specimen | Working fallback | Keep only as guaranteed fallback |
| Real GLTFLoader production path | Working and browser-tested | Keep |
| Semantic model mapping contract | Working contract | Populate with final specimen meshes |
| Model normalization / anchoring | Working | Keep |
| Model loading/failure reporting | Working | Keep |
| WebGL context recovery / cleanup | Working | Keep |
| Final photorealistic production GLB | **Not released** | Build/acquire/review before manifest release |
| Mobile model LOD | Not released | Build with final specimen |

`public/atlas-3d/models/model-manifest.json` intentionally remains `available: false` until a model passes rights, geometry, botanical, semantic, desktop, and mobile release gates.

## Model intake/release QA

The current model intake system is working and must remain fail-closed.

Desktop budget:
- <= 250,000 triangles
- <= 20 MB GLB
- <= 4096 texture edge

Mobile budget:
- <= 90,000 triangles
- <= 10 MB GLB
- <= 2048 texture edge

A released specimen must have:
- verified public-web rights
- modification and redistribution rights
- final SHA-256
- measured geometry and texture QA
- full canopy
- exposed roots
- no baked pot/scenery/UI
- botanical review approval
- semantic anatomy mapping
- a passing mobile variant when required

Current registry candidates are research/acquisition targets only. None is release eligible yet.

## Existing `Thc /atlas/` V4 — feature donor

The separate V4 is a real tested implementation and contains visual/runtime work that should be ported into Dtf420 rather than rebuilt.

Useful donor features:
- built-in high-detail procedural PBR Cannabis specimen
- exposed branching roots and root tips
- serrated leaf geometry
- modeled leaf venation
- female flower clusters
- bracts
- sugar leaves
- stigmas
- visible glandular-trichome geometry
- 14 inspectable anatomy regions
- raycast anatomy inspection
- animated camera focus
- persistent in-scene anatomy labels
- anatomical isolation/cutaway behavior
- wheel/pinch/keyboard navigation
- reduced-motion behavior
- WebGL fallback handling
- offscreen render pausing
- mobile quality reduction/performance governor
- V3 emergency fallback

Do **not** port its duplicate educational library wholesale. Dtf420's 100-lesson/evidence system is canonical and richer.

### Donor anatomy regions

1. Root system
2. Root tips
3. Stem / vascular system
4. Nodes / branching
5. Shoot apex
6. Fan leaves
7. Petioles
8. Leaf venation
9. Flowers / inflorescences
10. Bracts
11. Sugar leaves
12. Reproductive structures
13. Stigmas
14. Glandular trichomes

These should map into Dtf420 `AtlasEntity` IDs instead of becoming another entity schema.

## Legacy Atlas

`legacy/atlas-static/` is obsolete/reference-only.

Action:
- no new features
- no publication ownership
- retain temporarily for comparison/history
- archive/remove from active build ownership only after canonical parity and redirects are verified

## Production state

### Dtf420 child-route deployment

The reviewed Dtf420 static overlay and live acceptance system has previously verified the Atlas child route and nested Three.js runtime through the protected `Thc` production lane.

### Learn discoverability

The WordPress-owned `/learn/` parent is still a P0 reliability concern. A fresh public crawl on 2026-09-02 returned the retired library copy and did not expose the Atlas CTA, despite earlier cache-busted recovery workflow acceptance.

Therefore classify public discovery as **partially verified / not durable** until the current public owner remains stable across repeated independent checks.

Do not confuse a healthy `/learn/atlas/` child route with a healthy `/learn/` discovery surface.

## What is genuinely unfinished

The Atlas is not missing basic curriculum. It is missing consolidation and higher-fidelity spatial teaching.

### P0 — consolidate ownership and public discovery

1. Keep Dtf420 `/learn/atlas/` as the only canonical Atlas.
2. Freeze feature development on `Thc /atlas/`.
3. Fix the durable WordPress `/learn/` owner/discovery regression.
4. Add stable Atlas sitemap/canonical/navigation checks.
5. After parity, redirect `/atlas/` to `/learn/atlas/`.
6. Retire legacy static ownership.

### P1 — port the best V4 renderer work into Dtf420

Port, using existing Dtf420 entity IDs:
- exposed roots/root tips
- modeled venation
- PBR material/lighting pattern
- detailed flower/bract/stigma/trichome procedural geometry
- raycast focus behavior
- anatomical isolation/cutaway
- persistent labels
- performance governor
- offscreen pause
- mobile quality reduction

This gives Dtf420 a much better project-owned specimen immediately while the external photorealistic GLB remains under review.

### P2 — release a real photorealistic specimen

1. Acquire/generate a rights-safe candidate.
2. Inspect binary using `inspect:atlas-glb`.
3. Remove pot/scenery.
4. Supply botanically plausible exposed roots.
5. Split/rename semantic anatomy meshes.
6. Perform botanical review.
7. Optimize desktop variant.
8. Build mobile LOD.
9. Record provenance/SHA/attribution.
10. Pass candidate-policy + runtime + Browser QA.
11. Flip candidate and public manifest in one reviewed release.

### P3 — true 3D growth stages

Implement stable entity IDs through:
seed -> germination -> seedling -> vegetative -> preflower -> early flower -> mid flower -> late flower -> senescence -> seed maturation.

This must become a spatial/model state system, not just lesson text.

### P4 — anatomy and physiology layers

Build true selectable layers for:
- surface anatomy
- internal anatomy
- vascular tissues
- root system
- reproductive anatomy
- microscopic structures

Then animate conceptual teaching flows:
- roots -> xylem -> leaves -> transpiration
- leaves -> phloem -> sinks
- pollination -> fertilization -> seed development
- photosynthesis/resource flow

Animations must be labeled as conceptual when they are not measured plant data.

### P5 — progressive microscopy

Implement spatial zoom paths such as:
- plant -> flower -> bract -> trichome -> gland head -> secretory cells
- plant -> leaf -> epidermis -> stomata
- plant -> root -> young absorption zone -> root hair
- plant -> stem -> vascular bundle -> xylem/phloem

### P6 — diagnostics + environment in the 3D plant

Connect selectable plant regions to:
- symptom zones
- diagnostic cases
- differential diagnosis
- pH / EC / root moisture
- air temperature / leaf temperature / RH / VPD
- PPFD / DLI / CO2 / airflow

Visual symptoms remain clues, never automatic causal diagnosis.

### P7 — persistence/account layer

Current learning state is primarily device-local. Later, add optional durable account sync for:
- progress
- quiz history
- notes
- observations/photos
- bookmarks
- unfinished paths

## Explicit stop-doing list

- Do not build another separate Atlas app.
- Do not expand lesson count merely to create more content.
- Do not treat procedural PBR as the final photorealistic GLB.
- Do not ship third-party 3D assets without explicit rights/provenance.
- Do not duplicate the Dtf420 100-lesson library into `Thc /atlas/`.
- Do not let `/atlas/`, `/learn/atlas/`, and legacy static evolve independently.
- Do not call Learn discoverability fixed solely because a one-time deployment verifier passed.

## Definition of finished

The Living Plant Atlas is finished when:

1. `/learn/atlas/` is the only canonical product.
2. `/atlas/` redirects/aliases without a second feature implementation.
3. `/learn/` durably links to the Atlas.
4. All 100 lessons remain source-backed and routable.
5. One production specimen is rights-cleared, botanically reviewed, semantically mapped, desktop/mobile optimized, and released through the manifest gate.
6. Growth stages, anatomy layers, physiology flows, micro zoom, diagnostics, and environment modes work in the same 3D entity system.
7. Desktop/mobile/reduced-motion/accessibility fallbacks pass automated QA.
8. One protected deployment lane publishes and independently live-verifies the canonical route.
9. Legacy/duplicate Atlas surfaces are frozen and retired after parity.

## Immediate execution order

1. **Port V4 renderer strengths into Dtf420 canonical Atlas.**
2. **Repair durable `/learn/` discovery ownership in `Thc`.** These may proceed in parallel because they touch different repos/owners.
3. Build/acquire and review the final GLB after the canonical fallback reaches V4 visual parity.
4. Implement growth-stage 3D states.
5. Implement anatomy/physiology/micro spatial modes.
6. Deepen diagnostic/environment overlays.
7. Consolidate routes and retire duplicates.
