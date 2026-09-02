# THC Living Plant Atlas — Production 3D Model Contract

The interactive Atlas must remain functional when the final photorealistic model is unavailable. The current project-owned procedural Three.js plant is the guaranteed fallback and must not be described as the final photorealistic asset.

## Production asset

Preferred path after static-runtime preparation:

`/learn/atlas/atlas-3d/models/cannabis-plant.glb`

Source path in this repository:

`public/atlas-3d/models/cannabis-plant.glb`

## Required visual scope

- One complete mature female *Cannabis sativa* plant.
- Full canopy through exposed root tips; no cropped root system.
- Botanically plausible stem, branching, nodes, fan leaves, flowers, and fibrous roots.
- Natural green botanical color; no yellow cast.
- Physically based textures/materials suitable for neutral scientific lighting.
- No baked text, labels, UI, diagnostic marks, or educational arrows in the mesh or textures.
- Pot, soil, room, lights, and decorative scenery should not be fused into the plant mesh.

## Browser budget

- Preferred render mesh budget: roughly 40k–150k visible triangles for the default desktop/mobile asset.
- Higher-resolution source models should be retopologized or decimated before shipping.
- Prefer 2K textures for default delivery; use 4K only where the close inspection benefit is material.
- Prefer compressed textures/geometry when the runtime gains a tested KTX2/Draco/Meshopt pipeline.
- Keep the GLB self-contained where practical.
- Model must render acceptably with device pixel ratio capped by the Atlas runtime.

## Coordinate and framing contract

- Y axis is up.
- Center the shoot near world X/Z = 0.
- Root crown should sit near the Atlas ground transition.
- The entire plant should fit inside a normalized height of approximately 5.2 world units after runtime normalization.
- Camera focus targets remain owned by `content/atlas-entities.json`, not baked into the asset.

## Recommended mesh names

If the asset author can provide semantic mesh names, prefer:

- `root_system`
- `stem_main`
- `nodes`
- `fan_leaves`
- `flowers`
- `trichomes`
- `reproductive`

The runtime must not require all of these names in order to render. Named meshes may enhance direct picking/highlighting, while the React hotspot/inspector layer remains the accessible canonical navigation path.

## Licensing and provenance

Every production model must have documented rights allowing public website use and modification. Store attribution/license details beside the asset before release. Do not ship extracted game assets, unknown-license downloads, or assets whose redistribution rights are unclear.

## Fallback rule

Failure to fetch, parse, or render the production GLB must never make the Atlas unusable. The project-owned procedural Three.js plant and the accessible React/SVG fallback remain available so lessons, hotspots, camera controls, overlays, and inspector navigation still function.
