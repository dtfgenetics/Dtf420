# THC Living Plant Atlas — Semantic Proxy Hotspots

`semanticHotspots` in `model-manifest.json` is a fallback interaction map for production GLBs whose mesh/node names do not expose the canonical Atlas anatomy directly.

## Precedence

Real semantic meshes always win. If the loaded GLB contains a mesh that resolves through `semanticMeshes` for an Atlas entity, the runtime does **not** create proxy hit volumes for that entity.

Proxy hotspots are only created for missing semantic entities. They are invisible raycast targets and are not rendered as anatomical geometry.

## Coordinate system

Each hotspot uses:

```json
{
  "position": [0, 0.5, 0],
  "radius": 0.1
}
```

Coordinates are evaluated after the model is normalized and centered in the Atlas scene.

- `x`: `-1` to `1`, measured across half the final model width. `0` is the plant centerline.
- `y`: `0` to `1`, measured from the final model bottom to top.
- `z`: `-1` to `1`, measured across half the final model depth. `0` is the plant centerline.
- `radius`: fraction of final plant height. The verifier permits `0.02` through `0.25`.

Multiple regions may be supplied for one entity when the structure is distributed through the canopy, such as leaves, flowers, or nodes.

## Scientific interpretation

A semantic proxy is an interaction affordance, not an anatomical segmentation result. It must not be described to users as the exact boundary of a tissue or organ.

Use proxies to answer questions such as “tap this flowering region to open the Flowers system” when the source GLB is one generic mesh. Use real separated/named geometry for cutaways, isolation, transparency, precise highlighting, or any visualization that implies structural boundaries.

## Tuning workflow

1. Load the candidate GLB through the production runtime.
2. Confirm final orientation, root-to-canopy bounds, and scale.
3. Prefer real mesh names and update `semanticMeshes` first.
4. Add proxies only for canonical entities that remain unmapped.
5. Tune positions against desktop and mobile screenshots.
6. Keep proxy spheres as small as practical while still usable with touch.
7. Run Browser QA and verify that a real semantic mesh suppresses the proxy for the same entity.
8. Record the final mapping in `MODEL_PROVENANCE.md` when releasing the specimen.

The default proxy map is only a starting profile for a generally upright whole cannabis plant. A different cultivar form, training architecture, root presentation, or model orientation may require candidate-specific tuning before release.
