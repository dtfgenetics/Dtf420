---
name: dtf-game-asset-qa
description: Validate generated DTF420 game sprites, atlases, backgrounds, and effects before integrating or releasing them. Use when an image was generated, converted, optimized, or added to a game runtime.
---

# DTF Game Asset QA

Treat an image preview as a design review, not technical proof that the file is shippable.

## Required workflow

1. Preserve the generated source outside the runtime asset path.
2. Inspect the actual file metadata. Confirm format, dimensions, color channels, and byte size.
3. For cutouts and atlases, require a real alpha channel. A visible checkerboard inside an RGB image is a failed export.
4. For atlases, normalize the canvas so its width and height divide evenly by the declared columns and rows. Use a shared cell size and bottom-center anchor.
5. If generation repeatedly fakes transparency, regenerate against one flat chroma color absent from the subjects. Remove that color, inspect edges, then validate the resulting alpha file. Never chroma-key a color present in the art.
6. Optimize a validated source into the shipped format at the smallest resolution that preserves in-game readability. Keep the source recoverable until the optimized output passes.
7. Add the asset through a stable runtime path or semantic manifest key. Do not commit unused generated files.
8. Run `scripts/validate-game-asset.mjs` on every shipped generated asset.
9. Render the asset in the actual game at desktop and phone sizes. Check anchors, scale, clipping, matte fringes, animation consistency, missing requests, and console errors.
10. Add or update verification so missing files, wrong paths, and invalid atlas geometry fail CI.

## Validation examples

```bash
node .agents/skills/dtf-game-asset-qa/scripts/validate-game-asset.mjs \
  --asset public/game/characters/hero.webp \
  --alpha --cols 4 --rows 2 --max-bytes 500000 \
  --runtime public/game/engine.js
```

For an opaque background, omit `--alpha` and atlas geometry when they do not apply.

When a generated atlas uses the approved pure-green recovery background and green is absent from every subject, use the bundled deterministic converter:

```bash
node .agents/skills/dtf-game-asset-qa/scripts/prepare-green-screen-atlas.mjs \
  --input output/generated/fire-family.png \
  --output public/game/assets/fire-family.webp \
  --width 888 --height 444 --cols 2 --rows 1 --max-bytes 250000
```

The converter refuses to overwrite an existing output unless `--force` is explicitly supplied. Its pass result covers file structure only; inspect the resulting image for edge contamination before runtime integration.

## Stop conditions

Do not integrate or publish an asset when any of these are true:

- transparency is simulated by checkerboard pixels
- atlas dimensions do not divide into equal cells
- edge matte or chroma contamination is visible
- the runtime never references the asset
- the optimized file is larger than its use justifies
- the sprite is not readable at its actual rendered size
- Browser QA has not rendered the changed game asset
