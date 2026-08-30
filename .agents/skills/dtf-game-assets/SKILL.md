---
name: dtf-game-assets
description: >
  Locate, validate, integrate, and repair game assets in DTF420. Use when boards, cards, sprites, icons, atlases, backgrounds, audio, fonts, or other game visuals are missing, broken, inconsistent, replaced by placeholders, or fail only in production.
---

# DTF Game Assets

The default assumption is that approved project assets should be found and reused before anything new is generated.

## Asset recovery workflow

1. Search the entire repository for likely filenames, game names, labels, dimensions, extensions, and prior implementations.
2. Inspect both active and legacy locations before concluding an asset is absent.
3. Trace every asset from source file -> public/build location -> manifest/import -> runtime key -> rendered object.
4. Check filename case exactly. Production Linux paths are case-sensitive.
5. Check spaces, punctuation, URL encoding, extension changes, and moved directories.
6. Confirm the deployed framework can actually serve the chosen path.
7. Only create or regenerate an asset after confirming no approved equivalent exists.

## Organization

Prefer predictable families such as:

- `characters/`
- `boards/`
- `cards/`
- `pieces/`
- `ui/`
- `fx/`
- `audio/`
- `backgrounds/`
- `data/`

For Phaser, expose assets through stable semantic keys. Gameplay code should request `weedopolis-board` or `high-land-token-green`, not know arbitrary file paths.

## Visual integrity

- Never silently substitute emoji, generic icons, CSS boxes, stock art, or placeholder gradients for approved game art.
- Preserve aspect ratio unless the design explicitly calls for cropping.
- Avoid browser scaling that makes text inside board/card images unreadable.
- Keep transparent assets transparent; do not add accidental matte backgrounds.
- When a family of assets is regenerated, maintain consistent scale, anchor/pivot, lighting, perspective, typography, and outline treatment.
- Verify images in the actual game context, not only as standalone files.

## Performance

- Do not ship giant source-resolution images when the game renders them at a fraction of that size.
- Prefer atlases/sprite sheets when they reduce many tiny network requests without making iteration painful.
- Preload only assets required for the first playable state; defer optional content when practical.
- Keep asset dimensions within browser/GPU limits and watch memory on mobile.

## Broken-production checklist

If an asset works locally but not on the live site, inspect:

- exact filename case
- public root versus imported module semantics
- `basePath` or asset prefix behavior
- relative paths from nested routes
- stale generated manifests
- cached old filenames
- ignored/untracked files
- build output excluding the asset

## Completion gate

A repaired asset is not complete until the runtime renders the intended asset on desktop and mobile-sized viewports with no 404s, console asset errors, or placeholder fallbacks.
