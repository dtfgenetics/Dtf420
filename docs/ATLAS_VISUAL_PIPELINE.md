# THC Living Plant Atlas — Visual Asset Pipeline

The Atlas treats lesson visuals as replaceable, versioned teaching surfaces instead of hard-coded page content. A lesson must remain visually useful even when a future photorealistic or illustration asset is still in production.

## Source of truth

The asset system deliberately separates **curriculum**, **learner-facing rendering**, **production-media workflow**, **approved source intake**, and **3D specimen release**.

- `content/atlas-learning-modules.json` defines the canonical **100 lesson slots** across 10 Atlas systems and each lesson's visual requirement.
- `content/atlas-code-native-visuals.json` is the canonical mapping of lesson asset IDs to first-party React learner renderers.
- `content/atlas-asset-overrides*.json` defines production-media planning/review metadata and approved media paths.
- `lib/atlas-asset-manifests.ts` must import the exact same override files that `verify:atlas-assets` discovers.
- `lib/atlas-assets.ts` derives one complete asset record for every lesson and explicitly reports its `learnerSurface`.
- `components/atlas/AtlasAssetSlot.tsx` renders from the audited `learnerSurface` / `renderer` fields; it must not maintain a second hard-coded asset-ID registry.
- Approved static media lives under `public/atlas/...` and is learner-facing only when its override is `status: "ready"` and the referenced file exists.
- `content/thc-project-image-intake.json` records Drive-approved source imagery separately from publication state.
- `configuration/image-placement-map.csv` is a **legacy planning/placement map only**. Its `status` column is not release truth and must not be consumed by runtime or release logic.
- 3D candidate, license, specimen, photorealism, and public manifest records own whole-plant model release state independently from lesson visuals.

A new lesson automatically receives an asset slot even when no override has been written yet. It must not render as an empty box or expose an internal production prompt to learners.

## Learner-facing rendering contract

Visual availability and production-media status are related but separate concerns. Every asset record resolves to one of three learner surfaces:

1. **`code-native`** — a specialized first-party scientific React visual registered in `atlas-code-native-visuals.json`.
2. **`production-media`** — approved static media; requires `status: "ready"`, a public path, and a real file.
3. **`system-study-map`** — the lesson-specific whole-system fallback used when neither an approved specialized renderer nor approved media exists.

The public lesson page must never use an internal `productionBrief`, review label, missing-file path, or unapproved media file as the primary learner-facing visual.

At the current implementation level, 60 canonical lesson asset IDs resolve to specialized code-native visuals. Remaining lessons retain the system study-map surface unless approved production media or a new audited code-native renderer is added.

## Production-media statuses

These statuses describe the **production media pipeline**, not whether the lesson page is usable:

- `needed` — visual requirement exists but has no custom production brief yet.
- `brief_ready` — production brief, alt text, asset ID, and version are ready.
- `in_production` — external or static production media is being created or revised.
- `review` — production media or replacement work is awaiting scientific/visual QA.
- `ready` — approved production media. A `ready` record must include a real path under `public/`.

A lesson in `needed`, `brief_ready`, `in_production`, or `review` can still have a complete code-native teaching surface. Conversely, a non-ready production file must not become learner-facing merely because a path was entered.

## Drive-approved source imagery

`content/thc-project-image-intake.json` distinguishes source approval from website publication:

- `approved-source-only` — the Drive source has been identified/reviewed, but the target file is not shipped in `public/` yet.
- `published` — the reviewed bytes exist at the declared public target and pass MIME/signature verification.
- `rejected` — the source is retained as audit history but must not be imported.

Drive `sourceName` is the human-facing title. `sourceResolvedName`, MIME type, byte size, and modification timestamp record the actual downloadable object. This distinction is important because several approved Drive titles end in `.png` while Drive currently serves JPEG files named `*.png.jpg`.

`npm run assets:thc:verify` is read-only. It may report approved-source-only assets as pending publication, but a record marked `published` is a hard failure if its target is missing or its byte signature does not match the recorded MIME type.

## Visual briefs

`content/atlas-*-visual-briefs.json` files are production planning records. CI validates that every brief route still resolves to a canonical Atlas lesson, that lesson labels remain aligned, and that no route is duplicated across brief files. Visual briefs do not themselves make an asset learner-facing.

## Replacing or upgrading a visual

1. Keep the lesson URL and registry key stable.
2. For a code-native visual, add the implementation and register the asset ID in `atlas-code-native-visuals.json`.
3. For static production media, add the file under `public/atlas/<system>/` or the approved public asset lane.
4. Update the appropriate `content/atlas-asset-overrides*.json` record.
5. Increase `version` when replacing approved production media.
6. Set accurate `altText`, `productionBrief`, and `assetType`.
7. Set `path` only in the same reviewed change that sets production-media status to `ready`.
8. Confirm `AtlasAssetSlot` resolves the lesson to the intended learner surface.
9. Run `npm run verify` and Atlas browser tests.
10. Merge only after exact-SHA CI passes.

## Automated safeguards

`npm run verify:atlas-assets` fails when:

- an override references a lesson that does not exist;
- duplicate override keys or asset IDs are present;
- verifier-discovered override manifests and runtime-imported manifests differ;
- the code-native renderer registry references a noncanonical or duplicate asset ID;
- the code-native visual count drifts from the established 60-renderer contract without an intentional contract update;
- a `ready` production-media record has no path;
- a non-ready production-media record declares a public path;
- a referenced public asset file is missing or has an unsupported media extension;
- alt text or a production brief is missing/insubstantial;
- `AtlasAssetSlot` reintroduces a second hard-coded asset-ID registry;
- the canonical lesson count drifts away from the Atlas completion contract.

Additional asset gates validate visual briefs, Drive intake provenance/publication state, model candidate rights evidence, GLB candidate policy, and the six-specimen photorealism contract.

The full `npm run verify` path also validates the 100-lesson curriculum, evidence, guided paths, knowledge checks, mastery, diagnostics, system connections, visual practice, TypeScript, lint, and production build.

## 3D specimen release is a separate hard gate

The whole-plant Three.js viewer always retains the project-owned procedural and accessible fallbacks. The production GLB manifest must remain disabled until the required specimen set and photorealism review pass.

Required production specimens are:

- seedling;
- vegetative;
- flowering;
- male;
- female;
- hermaphrodite / intersex.

Do not substitute one generic cannabis mesh for those growth-stage and reproductive-phenotype requirements. Licensing, dated license evidence, package provenance, botanical plausibility, root/canopy completeness, semantic anatomy mapping, desktop/mobile performance, and photorealism review must all be documented before enabling the production model manifest.

## Visual QA rules

- Botanical structures must be anatomically defensible.
- Labels must use precise terminology.
- Avoid implying that one visible feature proves a diagnosis.
- Avoid arbitrary nutrient ranges or calendar-week claims inside anatomy images.
- Neutral color balance; no yellow cast.
- Academic studio, microscope, or scientific illustration quality depending on subject.
- No decorative branding that competes with the teaching content.
- Alt text must describe the educational information, not just the appearance.
- Mobile layouts must keep the primary visual, controls, labels, and inspector within the viewport without horizontal overflow.
