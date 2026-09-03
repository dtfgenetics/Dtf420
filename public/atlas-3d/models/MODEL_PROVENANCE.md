# THC Living Plant Atlas — Production Model Provenance

## Release state

No photorealistic production specimen set is released in this repository yet. `model-manifest.json` therefore keeps `available` set to `false`, `specimenSet.enabled` remains `false`, and the Atlas intentionally uses the project-owned procedural Three.js teaching specimen.

Do not change `available` or `specimenSet.enabled` to `true` until every required specimen slot is complete and the full set passes repository verification, the blocking photorealism reviews, and browser QA.

## Required specimen set

The production Atlas requires six distinct photorealistic cannabis specimen states:

1. **Seedling** — juvenile scale, cotyledon/early true-leaf morphology, no mature flowers.
2. **Vegetative** — established fan leaves, nodes/internodes, branching, developed stem/root architecture, no mature flower clusters.
3. **Flowering** — mature whole-plant flowering silhouette with believable inflorescences, bracts, sugar leaves, and resin/trichome character.
4. **Male** — recognizable staminate reproductive structures and realistic pollen-sac clustering without fake female bud masses.
5. **Female** — recognizable pistillate structures, bracts/stigmas where developmentally appropriate, and female floral architecture distinct from the male specimen.
6. **Hermaphrodite / intersex** — recognizable male and female reproductive expression on the same specimen, with plausible mixed-structure placement. AI deformation or ambiguous geometry must never be presented as intersex biology.

A single generic cannabis model cannot satisfy these six slots merely by changing labels or camera position.

## Hard visual requirement

Photorealism is a release requirement, not a preference. Every released specimen must plausibly read as a real photographed/scanned living cannabis plant appropriate to its declared stage or reproductive phenotype under neutral studio lighting.

Reject a specimen if it presents any of the following in the delivered desktop or mobile asset:

- low-poly, cartoon, game-prop, generic “weed leaf,” or cardboard/billboard appearance;
- plastic, rubber, metallic, waxy, or otherwise implausible plant materials;
- missing or visibly simplified cannabis leaflet serration and natural curvature;
- implausible nodes, internodes, branch origins, taper, or stem texture;
- stage-inappropriate mature flowers on seedling/vegetative specimens;
- generic flower blobs, missing sugar-leaf integration, or implausible mature inflorescence structure where flowering is expected;
- male specimens with fake female bud masses or female specimens with unexplained staminate clusters;
- hermaphrodite/intersex specimens represented by melted or ambiguous geometry instead of identifiable mixed reproductive structures;
- painted glitter/noise standing in for resin or trichome character;
- decorative, spaghetti-like, or structurally implausible exposed roots;
- fused leaves, melted flowers, floating branches, impossible intersections, duplicated motifs, or other obvious AI/generation deformation;
- mobile optimization that destroys the realistic cannabis silhouette, stage/sex identity, branch continuity, leaf serration read, or root-system identity.

The authoritative specimen definitions live in `content/atlas-specimen-set.json`. The blocking visual criteria and evidence views live in `content/atlas-model-photorealism-review.json`.

## Required release record

For every released specimen slot, record:

- specimen id and label;
- source asset/candidate id;
- asset title and version;
- creator / generating system / post-processing author;
- creation date;
- source reference images or prompts, when applicable;
- license or rights basis permitting public website use, modification, and redistribution through dtfseeds.com;
- any required attribution text;
- original source file location;
- final desktop GLB SHA-256;
- final mobile GLB SHA-256, or explicit evidence that the desktop GLB satisfies the stricter mobile budget and is reused for mobile;
- desktop and mobile file sizes;
- desktop and mobile triangle counts / render mesh counts;
- texture count and maximum texture dimensions for both variants;
- confirmation that the appropriate canopy/stage form and exposed root tips are present;
- confirmation that text, arrows, UI, pots, room scenery, and diagnostic markings are not baked into the plant asset;
- semantic mesh names supplied by the model, if any;
- mapping of model meshes to the canonical Atlas entities where applicable;
- reviewer notes for botanical plausibility, reproductive/stage accuracy, and visual defects;
- required evidence renders: front, rear, left, right, canopy top, exposed roots, leaf macro, node/stem macro, reproductive-or-stage macro, and mobile-LOD comparison;
- desktop screenshot QA and mobile screenshot QA using the released files.

## Performance contract

The release registry in `content/atlas-model-candidates.json` is authoritative for current browser budgets. Production specimens may use separate desktop and mobile model assets. A released slot must either:

1. provide a measured mobile LOD that passes the mobile triangle, byte, and texture budgets; or
2. prove the desktop model itself passes those stricter mobile limits and reuse that same GLB for mobile.

Do not create a nominal “mobile” copy that is merely renamed. The mobile evidence must be measured from the actual delivered binary.

Optimization is allowed underneath each specimen, but fidelity is not negotiable: the optimized result must still pass every blocking photorealism criterion and retain its correct growth-stage or reproductive identity.

## Acceptance rule

A generated or downloaded model is a **candidate** until its rights, geometry, browser budget, full-plant framing, botanical plausibility, anatomical mapping, stage/sex accuracy, and photorealistic fidelity have all been reviewed. AI generation provenance alone is not evidence that a model is anatomically correct or visually realistic.
