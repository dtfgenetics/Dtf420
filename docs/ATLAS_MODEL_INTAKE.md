# THC Living Plant Atlas model intake

The public Atlas must never publish a newly acquired GLB directly from a download folder. Every candidate passes through the repository intake gate before botanical or photorealism review.

## 1. Acquire into a private/local intake location

Keep downloaded candidate binaries outside `public/atlas-3d/models/` until the candidate passes intake and release review. Preserve the source listing and license evidence with the candidate record.

The current primary candidate is `meshy-cannabis-terracotta-019cfb59`. Its registry record controls whether public website use, modification, and redistribution are approved.

## 2. Stage the desktop binary

```bash
npm run stage:atlas-model -- meshy-cannabis-terracotta-019cfb59 path/to/candidate.glb --out=reports/atlas-model-intake/meshy-cannabis-terracotta-019cfb59.json
```

The gate verifies:

- the candidate exists in `content/atlas-model-candidates.json`;
- public website use, modification, redistribution, and a license label are explicitly approved;
- GLB 2.0 structure and declared file length;
- triangle, byte, and texture budgets;
- SHA-256 and geometry/material/texture inventory;
- semantic mesh-name hints;
- whether the desktop file is also small enough to satisfy the stricter mobile budget when no dedicated mobile GLB is supplied.

## 3. Stage a dedicated mobile LOD when needed

```bash
npm run stage:atlas-model -- meshy-cannabis-terracotta-019cfb59 path/to/desktop.glb --mobile=path/to/mobile.glb --out=reports/atlas-model-intake/meshy-cannabis-terracotta-019cfb59.json
```

Use `--require-semantics` only after mesh naming has intentionally been prepared for Atlas anatomy mapping:

```bash
npm run stage:atlas-model -- <candidate-id> <desktop.glb> --mobile=<mobile.glb> --require-semantics
```

## 4. Intake pass is not release approval

`result: "intake-pass"` means only that the binary and candidate rights cleared the mechanical intake gate. It must still pass all blocking repository reviews for:

- botanical plausibility;
- correct growth-stage or reproductive identity;
- exposed-root and whole-plant framing requirements;
- pot/scenery removal or separation;
- semantic anatomy mapping;
- photorealistic materials and morphology;
- desktop and mobile screenshot evidence;
- provenance completion.

Only after those gates pass may the approved asset be copied into `public/atlas-3d/models/` and `model-manifest.json` be changed through review. Never flip `available` or `specimenSet.enabled` merely because a GLB passes this intake command.
