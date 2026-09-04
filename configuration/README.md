# Configuration asset maps

## `image-placement-map.csv`

`image-placement-map.csv` is a legacy **visual planning and placement inventory**. It records where a future or historical static visual was intended to appear, along with style and priority guidance.

Its `status` column is **not an operational release status** and may remain `needed` even when the live Atlas lesson already has a complete first-party interactive React teaching surface.

Do not use this CSV to decide whether an Atlas lesson is visually complete, whether media is approved, or whether a file should be shipped.

Current operational sources of truth are:

- canonical lesson slots: `content/atlas-learning-modules.json`
- code-native learner visuals: `content/atlas-code-native-visuals.json`
- production-media workflow and approved public paths: `content/atlas-asset-overrides*.json`
- Drive source approval/publication state: `content/thc-project-image-intake.json`
- 3D candidate rights/acquisition: `content/atlas-model-candidates.json` + `content/atlas-model-license-evidence.json`
- six-specimen 3D release slots: `content/atlas-specimen-set.json`
- production GLB runtime release: `public/atlas-3d/models/model-manifest.json`

The runtime must not import `image-placement-map.csv`.
