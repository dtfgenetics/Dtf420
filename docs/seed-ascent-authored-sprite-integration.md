# Seed Ascent authored sprite integration

This branch follows the merged Seed Ascent animation/runtime work and tracks the next production step: replacing legacy hard-coded player-frame selection with manifest-driven authored animation sheets while preserving the verified fallback sheet.

## Runtime contract

- The animation controller is authoritative for visual state selection only.
- Gameplay physics, collision, combat damage, cooldowns, phenotype duration, and enemy AI remain authoritative in `engine.js`.
- Authored animation sheets are optional at runtime until each asset passes QA; the existing `seed-man-sprites.webp` remains the fallback.
- Player rendering must use the animation manifest for state, authored frame index, frame dimensions, and anchor.
- Missing authored assets must fall back without console errors or blank frames.

## Integration order

1. Add authored-sheet loader/availability tracking.
2. Route `drawPlayer()` through active animation state instead of local movement frame math.
3. Map movement states to base sheet rows.
4. Map Fire/Electric/Ice attack and transform/revert states to phenotype sheets.
5. Preserve current hue-based fallback when authored phenotype sheets are unavailable.
6. Expose active sheet, state, and frame through debug state.
7. Extend Browser QA for authored/fallback behavior.
8. Run `verify:seed-ascent`, animation verifier, full verify, static overlay, and Browser QA before merge.
