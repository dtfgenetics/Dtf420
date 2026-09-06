# THC Living Plant Atlas — Asset Audit

Audit date: 2026-09-03  
Base commit: `f38c174dc3501f1423fff634998f0a9ca01e52c0`

## Scope

This audit reconciles the full Atlas asset/information system rather than only the 3D model lane:

- 100 lesson visual slots and learner-facing rendering;
- production-media overrides and files;
- code-native React teaching visuals;
- visual production briefs;
- Drive-approved educational source images;
- legacy placement/planning metadata;
- Three.js model runtime and desktop/mobile variants;
- 3D model candidates, rights evidence, acquisition state, performance budgets, semantic mesh requirements, and photorealism reviews;
- six required production specimen slots;
- documentation and CI parity.

## Corrected findings

### 1. Learner rendering was partly hidden in component code

`AtlasAssetSlot.tsx` previously maintained hard-coded sets for 60 specialized asset IDs. Production-media status lived in the registry, but learner-facing renderer availability did not.

Correction:

- added `content/atlas-code-native-visuals.json` as the auditable code-native renderer registry;
- added `learnerSurface` and `renderer` to derived Atlas asset records;
- changed `AtlasAssetSlot` to render from audited data rather than a second hard-coded asset-ID registry;
- browser QA now asserts `code-native` and `system-study-map` states explicitly.

### 2. A non-ready media path could become learner-facing

The old resolver preferred any non-null `path`, even if the production-media record was still `review` or `in_production`.

Correction:

- production media is learner-facing only when `status === "ready"` and a real path exists;
- CI now rejects public paths on non-ready records;
- CI still requires every ready path to resolve to a real supported image file.

### 3. Verifier/runtime override-manifest discovery could drift

The old verifier discovered every `atlas-asset-overrides*.json` file dynamically, while runtime imports were maintained manually.

Correction:

- `verify:atlas-assets` now compares the exact discovered manifest filenames with the runtime import list and fails if they diverge.

### 4. Approved Drive sources were not the same thing as published web assets

Ten approved educational images were recorded with target paths, but no `public/images/thc-project/` publication tree was present in the audited repository state.

Correction:

- intake now has explicit `publicationState`: `approved-source-only`, `published`, or `rejected`;
- all 10 audited records are currently `approved-source-only`;
- CI treats a missing approved-source-only target as pending publication, not as a false published asset;
- a record marked `published` becomes a hard failure if the target is missing or its byte signature does not match the recorded MIME type;
- `--verify-only` no longer writes a generated public manifest.

### 5. Drive display names and downloaded file identity were underspecified

Nine approved Drive entries have human-facing titles ending in `.png`, while Drive currently resolves them as JPEG payloads named `*.png.jpg`. The Leaf Anatomy file is a true PNG.

Correction:

Each intake record now preserves:

- Drive display title (`sourceName`);
- resolved download filename (`sourceResolvedName`);
- actual MIME type;
- byte size;
- source modification timestamp;
- audit verification date.

This prevents file-extension assumptions from overwriting actual source provenance.

### 6. Visual briefs were not validated against canonical routes

Five visual-brief files existed as planning JSON without a dedicated route-integrity gate.

Correction:

- `verify:atlas-visual-briefs` discovers all `atlas-*-visual-briefs.json` files;
- every route must resolve to one of the 100 canonical lessons;
- title/lesson labels must match the canonical lesson;
- duplicate brief routes are rejected;
- production briefs must be substantive.

### 7. 3D rights claims needed dated evidence outside candidate prose

The model candidate registry included rights classifications, but the public evidence was embedded only as narrative notes.

Correction:

- added `content/atlas-model-license-evidence.json`;
- added CI cross-checking candidate rights state against dated public evidence;
- a candidate with rights incompatible with a standalone browser-loaded GLB must be benchmark-only or rejected;
- a provisional package license cannot be release-eligible.

Current audited classifications:

- Meshy `meshy-cannabis-terracotta-019cfb59`: public model page currently labels the pre-made asset CC0; Meshy gallery documentation describes pre-made gallery assets as CC0 and GLB-capable. Rights are compatible in principle, but botanical/root/pot/mesh/performance review still blocks release.
- Sketchfab `zbrojmistrz-cannabis-sativa-2023`: listing-level attribution-license indication remains provisional until the downloaded package preserves the exact license/version and redistribution terms.
- A23D `a23d-cannabis-002707a`: benchmark-only. Current A23D terms prohibit raw/easily extractable redistribution, so a public standalone browser GLB is not an ordinary permitted release form.

### 8. Legacy placement-map status was misleading

`configuration/image-placement-map.csv` still contains historical `needed` values for assets whose lessons may already have complete code-native learner surfaces.

Correction:

- the map is explicitly classified as planning/placement metadata only;
- its legacy `status` column is non-authoritative;
- runtime/release decisions must use the canonical asset registries instead.

## Current authoritative asset hierarchy

1. **Lesson requirements:** `content/atlas-learning-modules.json`
2. **Code-native learner renderer:** `content/atlas-code-native-visuals.json`
3. **Production-media status/path:** `content/atlas-asset-overrides*.json`
4. **Derived learner surface:** `lib/atlas-assets.ts`
5. **Drive source intake/publication:** `content/thc-project-image-intake.json`
6. **Visual production briefs:** `content/atlas-*-visual-briefs.json`
7. **3D candidate/acquisition state:** `content/atlas-model-candidates.json`
8. **3D public license evidence:** `content/atlas-model-license-evidence.json`
9. **Six-specimen release slots:** `content/atlas-specimen-set.json`
10. **Photorealism review:** `content/atlas-model-photorealism-review.json`
11. **Public GLB release switch:** `public/atlas-3d/models/model-manifest.json`
12. **Legacy planning only:** `configuration/image-placement-map.csv`

## Intentionally unresolved production gaps

These are genuine missing assets, not metadata bugs:

- the 10 Drive-approved educational image binaries are not yet committed/published through a binary-capable repository intake path;
- all six required photorealistic specimen slots remain pending;
- the production GLB manifest must remain unavailable until all model rights, botanical, semantic-mesh, root/canopy, desktop/mobile, and photorealism gates pass.

The project-owned procedural Three.js specimen and accessible fallback remain valid functional teaching surfaces while premium specimen production continues.

## Release rule

Do not convert a missing premium asset into a green status merely to make the registry look complete. Functional learner coverage, production-media readiness, source approval, and photorealistic 3D release are separate dimensions and must remain separately auditable.
