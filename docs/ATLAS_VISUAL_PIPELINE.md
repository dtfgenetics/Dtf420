# THC Living Plant Atlas — Visual Asset Pipeline

The Atlas treats lesson visuals as replaceable, versioned teaching surfaces instead of hard-coded page content. A lesson must remain visually useful even when a future photorealistic or illustration asset is still in production.

## Source of truth

- `content/atlas-learning-modules.json` defines the canonical **100 lesson slots** across 10 Atlas systems and each lesson's visual requirement.
- `lib/atlas-assets.ts` derives one asset record for every lesson automatically.
- `lib/atlas-asset-manifests.ts` combines the hand-authored asset override manifests.
- `components/atlas/AtlasAssetSlot.tsx` resolves each lesson to its best available teaching surface.
- Production image/media files live under `public/atlas/...` and are referenced with root-relative paths such as `/atlas/roots/root-architecture-v1.webp`.

A new lesson automatically receives an asset slot even when no override has been written yet. It must not render as an empty box or expose an internal production prompt to learners.

## Learner-facing rendering contract

Visual availability and production-media status are related but separate concerns:

1. **Specialized code-native interactive visual** — preferred when the project already has a scientifically scoped React visual for that asset ID.
2. **Approved production media** — used when an asset has a valid `path` and has passed the applicable review/release checks.
3. **System study-map fallback** — used for lessons that do not yet have a specialized visual or approved media file. It keeps the lesson visual, system-linked, and educational while production work continues.

The public lesson page must never use the internal `productionBrief` as the primary learner-facing visual. Production briefs are planning metadata for asset authors and reviewers.

At the current implementation level, 60 lesson IDs resolve to specialized code-native visuals, while the remaining lessons retain the system study-map fallback until more specialized media or interactive visuals are approved.

## Statuses

These statuses describe the **production media pipeline**, not whether the lesson page is usable:

- `needed` — visual requirement exists but has no custom production brief yet.
- `brief_ready` — production brief, alt text, asset ID, and version are ready.
- `in_production` — external or static production media is being created or revised.
- `review` — the planned production asset or code-native teaching implementation is awaiting scientific/visual QA or replacement-media review.
- `ready` — approved production media. A `ready` record must include a real path under `public/`.

A lesson in `needed`, `brief_ready`, `in_production`, or `review` state can still have a complete code-native teaching visual. Do not infer learner-facing completeness from media-production status alone.

## Replacing or upgrading a visual

1. Keep the lesson URL and registry key stable.
2. Create the specialized interactive visual or production media.
3. For production files, add the file under `public/atlas/<system>/`.
4. Update or add the lesson entry in the appropriate `content/atlas-asset-overrides*.json` manifest.
5. Increase `version` when replacing an approved production asset.
6. Set accurate `altText`, `productionBrief`, `assetType`, and status; set `path` only for a real shipped file.
7. Confirm `AtlasAssetSlot` resolves the lesson to the intended teaching surface.
8. Run `npm run verify` and the Atlas browser tests.
9. Merge only after CI passes.

The lesson page consumes the registry, so ordinary media replacement does not require a page-route rewrite.

## Automated safeguards

`npm run verify:atlas-assets` fails when:

- an override references a lesson that does not exist;
- duplicate override keys or asset IDs are present;
- a `ready` asset has no path;
- a referenced asset file is missing from `public/`;
- alt text or a production brief is missing;
- the canonical lesson count drifts away from the Atlas completion contract.

The full `npm run verify` path also validates the 100-lesson curriculum, Atlas runtime, model candidates, photorealism gate, guided paths, knowledge checks, mastery, diagnostics, system connections, visual identification, TypeScript, lint, and production build.

## 3D specimen release is a separate hard gate

The whole-plant Three.js viewer always retains the project-owned procedural and accessible fallbacks. The production GLB manifest must remain disabled until the required specimen set and photorealism review pass.

Required production specimens are:

- seedling;
- vegetative;
- flowering;
- male;
- female;
- hermaphrodite / intersex.

Do not substitute one generic cannabis mesh for those growth-stage and reproductive-phenotype requirements. Licensing, provenance, botanical plausibility, browser performance, and the photorealism review must all be documented before enabling the production model manifest.

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
