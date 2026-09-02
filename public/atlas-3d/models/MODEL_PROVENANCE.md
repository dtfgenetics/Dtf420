# THC Living Plant Atlas — Production Model Provenance

## Release state

No photorealistic production GLB is released in this repository yet. `model-manifest.json` therefore keeps `available` set to `false`, and the Atlas intentionally uses the project-owned procedural Three.js teaching specimen.

Do not change `available` to `true` until every release field below is complete and the final GLB passes the repository verification and browser QA.

## Required release record

When the production specimen is added, record:

- Asset title and model version
- Creator / generating system / post-processing author
- Creation date
- Source reference images or prompts, when applicable
- License or rights basis permitting public website use, modification, and redistribution through dtfseeds.com
- Any required attribution text
- Original source file location
- Final desktop GLB SHA-256
- Final mobile GLB SHA-256, or explicit evidence that the desktop GLB satisfies the stricter mobile budget and is reused for mobile
- Desktop and mobile file sizes
- Desktop and mobile triangle counts / render mesh counts
- Texture count and maximum texture dimensions for both variants
- Confirmation that the full canopy and exposed root tips are present
- Confirmation that text, arrows, UI, pots, room scenery, and diagnostic markings are not baked into the plant asset
- Semantic mesh names supplied by the model, if any
- Mapping of model meshes to the canonical Atlas entities: roots, stem/vascular, nodes/branching, leaves, flowers, trichomes/resin, and sex/pollen/seed
- Reviewer notes for botanical plausibility and visual defects
- Desktop screenshot QA and mobile screenshot QA using the released files

## Performance contract

The release registry in `content/atlas-model-candidates.json` is authoritative for current browser budgets. The public manifest supports separate desktop and mobile model slots. A release must either:

1. provide a measured mobile LOD that passes the mobile triangle, byte, and texture budgets; or
2. prove the desktop model itself passes those stricter mobile limits and use the same GLB for both manifest variants.

Do not create a nominal “mobile” copy that is merely renamed. The mobile evidence must be measured from the actual delivered binary.

## Acceptance rule

A generated or downloaded model is a **candidate** until its rights, geometry, browser budget, full-plant framing, and botanical plausibility have been reviewed. AI generation provenance alone is not evidence that a model is anatomically correct.
