# THC Living Plant Atlas — Visual Asset Pipeline

The Atlas treats lesson visuals as replaceable, versioned assets instead of hard-coded page content.

## Source of truth

- `content/atlas-learning-modules.json` defines the 50 lesson slots and each lesson's visual requirement.
- `lib/atlas-assets.ts` derives one asset record for every lesson automatically.
- `content/atlas-asset-overrides.json` stores production metadata for assets that have moved beyond the default `needed` state.
- Production files live under `public/atlas/...` and are referenced with root-relative paths such as `/atlas/roots/root-architecture-v1.webp`.

A new lesson automatically receives an asset slot even when no override has been written yet.

## Statuses

- `needed` — visual requirement exists but has no custom production brief yet.
- `brief_ready` — production brief, alt text, asset ID, and version are ready.
- `in_production` — asset is being created or revised.
- `review` — asset exists but is awaiting scientific/visual QA.
- `ready` — approved production asset. A `ready` record must include a real path under `public/`.

## Replacing a visual

1. Create the new visual without changing the lesson URL.
2. Add the file under `public/atlas/<system>/`.
3. Update or add the lesson entry in `content/atlas-asset-overrides.json`.
4. Increase `version` when replacing an approved asset.
5. Set `path`, accurate `altText`, and the appropriate status.
6. Run `npm run verify`.
7. Open a pull request and merge only after CI passes.

The lesson page consumes the registry, so no page component rewrite is required when a visual changes.

## Automated safeguards

`npm run verify:atlas-assets` fails when:

- an override references a lesson that does not exist;
- duplicate override keys or asset IDs are present;
- a `ready` asset has no path;
- a referenced asset file is missing from `public/`;
- alt text or a production brief is missing.

This check is part of the normal `npm run verify` CI path.

## Initial priority production set

The first five academic visuals with custom briefs are:

1. Seed anatomy cutaway.
2. Root architecture cutaway.
3. Healthy fan-leaf baseline reference plate.
4. Female flower anatomy plate.
5. Glandular trichome type microscope comparison.

These are intentionally foundational reference visuals. Diagnostic comparison plates should be produced after healthy anatomy baselines are approved so abnormal examples have a consistent reference standard.

## Visual QA rules

- Botanical structures must be anatomically defensible.
- Labels must use precise terminology.
- Avoid implying that one visible feature proves a diagnosis.
- Avoid arbitrary nutrient ranges or calendar-week claims inside anatomy images.
- Neutral color balance; no yellow cast.
- Academic studio, microscope, or scientific illustration quality depending on subject.
- No decorative branding that competes with the teaching content.
- Alt text must describe the educational information, not just the appearance.
