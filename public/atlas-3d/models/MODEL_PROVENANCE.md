# THC Living Plant Atlas — Production Model Provenance

## Release state

No photorealistic production GLB is released in this repository yet. `model-manifest.json` therefore keeps `available` set to `false`, and the Atlas intentionally uses the project-owned procedural Three.js teaching specimen.

Do not change `available` to `true` until every release field below is complete and the final GLB passes the repository verification and browser QA.

## Required release record

When `cannabis-plant.glb` is added, record:

- Asset title and model version
- Creator / generating system / post-processing author
- Creation date
- Source reference images or prompts, when applicable
- License or rights basis permitting public website use, modification, and redistribution through dtfseeds.com
- Any required attribution text
- Original source file location
- Final GLB SHA-256
- File size
- Triangle count / render mesh count
- Texture count and maximum texture dimensions
- Confirmation that the full canopy and exposed root tips are present
- Confirmation that text, arrows, UI, pots, room scenery, and diagnostic markings are not baked into the plant asset
- Semantic mesh names supplied by the model, if any
- Reviewer notes for botanical plausibility and visual defects

## Acceptance rule

A generated or downloaded model is a **candidate** until its rights, geometry, browser budget, full-plant framing, and botanical plausibility have been reviewed. AI generation provenance alone is not evidence that a model is anatomically correct.
